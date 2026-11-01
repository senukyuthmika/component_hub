const { getDb } = require('../config/database');

exports.create = (req, res) => {
  try {
    const db = getDb();
    const { component_id, request_message, borrow_date, return_date } = req.body;

    const component = db.prepare('SELECT * FROM components WHERE id = ?').get(component_id);
    if (!component) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Component not found' } });
    }
    if (component.owner_id === req.user.id) {
      return res.status(400).json({ success: false, error: { code: 'OWN_COMPONENT', message: 'Cannot borrow your own component' } });
    }
    if (component.available_quantity < 1) {
      return res.status(400).json({ success: false, error: { code: 'UNAVAILABLE', message: 'Component not available' } });
    }

    const existing = db.prepare(
      `SELECT id FROM borrow_requests WHERE component_id = ? AND requester_id = ? AND status = 'pending'`
    ).get(component_id, req.user.id);
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE', message: 'You already have a pending request for this component' } });
    }

    const result = db.prepare(
      `INSERT INTO borrow_requests (component_id, requester_id, lender_id, request_message, borrow_date, return_date)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(component_id, req.user.id, component.owner_id, request_message || '', borrow_date, return_date);

    // Create notification for lender
    db.prepare(
      `INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)`
    ).run(component.owner_id, 'request_received', 'New Borrow Request',
      `${req.user.full_name} wants to borrow "${component.title}"`, result.lastInsertRowid);

    // Also notify lab coordinators (lab_admin / superadmin) if they are not already the lender or requester
    const coordinators = db.prepare("SELECT id FROM users WHERE role IN ('lab_admin', 'superadmin')").all();
    for (const coord of coordinators) {
      if (coord.id !== component.owner_id && coord.id !== req.user.id) {
        db.prepare(
          `INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)`
        ).run(coord.id, 'request_received', 'New Campus Borrow Request',
          `${req.user.full_name} requested "${component.title}" (${component.location || 'Campus'})`, result.lastInsertRowid);
      }
    }

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'create_request', 'borrow_request', result.lastInsertRowid,
        JSON.stringify({ component_title: component.title }));

    const request = db.prepare('SELECT * FROM borrow_requests WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getIncoming = (req, res) => {
  try {
    const db = getDb();
    const isCoordinator = req.user.role === 'lab_admin' || req.user.role === 'superadmin';

    // Lab coordinators oversee all campus and lab requests; standard students see requests where they are the lender
    const query = isCoordinator
      ? `SELECT br.*, c.title as component_title, c.image_urls, c.condition, c.location as component_location,
         u.full_name as requester_name, u.avatar_url as requester_avatar, u.rating as requester_rating,
         lend.full_name as lender_name, lend.avatar_url as lender_avatar
         FROM borrow_requests br
         JOIN components c ON br.component_id = c.id
         JOIN users u ON br.requester_id = u.id
         JOIN users lend ON br.lender_id = lend.id
         ORDER BY br.created_at DESC`
      : `SELECT br.*, c.title as component_title, c.image_urls, c.condition, c.location as component_location,
         u.full_name as requester_name, u.avatar_url as requester_avatar, u.rating as requester_rating,
         lend.full_name as lender_name, lend.avatar_url as lender_avatar
         FROM borrow_requests br
         JOIN components c ON br.component_id = c.id
         JOIN users u ON br.requester_id = u.id
         JOIN users lend ON br.lender_id = lend.id
         WHERE br.lender_id = ?
         ORDER BY br.created_at DESC`;

    const requests = isCoordinator ? db.prepare(query).all() : db.prepare(query).all(req.user.id);

    res.json({
      success: true,
      data: requests.map(r => ({ ...r, image_urls: JSON.parse(r.image_urls || '[]') }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getOutgoing = (req, res) => {
  try {
    const db = getDb();
    const requests = db.prepare(
      `SELECT br.*, c.title as component_title, c.image_urls, c.condition, c.location as component_location,
       u.full_name as lender_name, u.avatar_url as lender_avatar
       FROM borrow_requests br
       JOIN components c ON br.component_id = c.id
       JOIN users u ON br.lender_id = u.id
       WHERE br.requester_id = ? ORDER BY br.created_at DESC`
    ).all(req.user.id);

    res.json({
      success: true,
      data: requests.map(r => ({ ...r, image_urls: JSON.parse(r.image_urls || '[]') }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const db = getDb();
    const { status, response_message } = req.body;
    const request = db.prepare('SELECT * FROM borrow_requests WHERE id = ?').get(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }

    const isCoordinator = req.user.role === 'lab_admin' || req.user.role === 'superadmin';

    if (status === 'approved' || status === 'denied') {
      if (request.lender_id !== req.user.id && !isCoordinator) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the lender or lab coordinator can approve/deny' } });
      }
    }

    if (status === 'returned') {
      if (request.lender_id !== req.user.id && request.requester_id !== req.user.id && !isCoordinator) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to mark returned' } });
      }
    }

    db.prepare(
      `UPDATE borrow_requests SET status = ?, response_message = COALESCE(?, response_message),
       actual_return_date = CASE WHEN ? = 'returned' THEN datetime('now') ELSE actual_return_date END,
       updated_at = datetime('now') WHERE id = ?`
    ).run(status, response_message, status, req.params.id);

    // Update component availability
    if (status === 'approved') {
      db.prepare('UPDATE components SET available_quantity = available_quantity - 1, status = CASE WHEN available_quantity - 1 = 0 THEN \'borrowed\' ELSE status END WHERE id = ?')
        .run(request.component_id);
    } else if (status === 'returned') {
      db.prepare('UPDATE components SET available_quantity = available_quantity + 1, status = \'available\' WHERE id = ?')
        .run(request.component_id);
    }

    // Notifications
    const component = db.prepare('SELECT title FROM components WHERE id = ?').get(request.component_id);
    const notifType = status === 'approved' ? 'request_approved' : status === 'denied' ? 'request_denied' : 'item_returned';
    const notifTitle = status === 'approved' ? 'Request Approved' : status === 'denied' ? 'Request Denied' : 'Item Returned';

    // Notify requester
    db.prepare('INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)')
      .run(request.requester_id, notifType, notifTitle,
        `"${component.title}" request has been ${status}`, req.params.id);

    // If approved/denied by lab coordinator and coordinator is not the direct lender, also notify the owner/lender
    if (request.lender_id !== req.user.id) {
      db.prepare('INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)')
        .run(request.lender_id, notifType, notifTitle,
          `"${component.title}" borrow request was ${status} by Lab Coordinator`, req.params.id);
    }

    const updated = db.prepare('SELECT * FROM borrow_requests WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.cancel = (req, res) => {
  try {
    const db = getDb();
    const request = db.prepare('SELECT * FROM borrow_requests WHERE id = ?').get(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }
    const isCoordinator = req.user.role === 'lab_admin' || req.user.role === 'superadmin';
    if (request.requester_id !== req.user.id && !isCoordinator) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the requester or coordinator can cancel' } });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Can only cancel pending requests' } });
    }

    db.prepare('UPDATE borrow_requests SET status = \'cancelled\', updated_at = datetime(\'now\') WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'Request cancelled' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getAll = (req, res) => {
  try {
    const db = getDb();
    const requests = db.prepare(
      `SELECT br.*, c.title as component_title, c.location as component_location,
       req.full_name as requester_name, lend.full_name as lender_name
       FROM borrow_requests br
       JOIN components c ON br.component_id = c.id
       JOIN users req ON br.requester_id = req.id
       JOIN users lend ON br.lender_id = lend.id
       ORDER BY br.created_at DESC`
    ).all();
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
