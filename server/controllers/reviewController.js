const { getDb } = require('../config/database');

exports.create = (req, res) => {
  try {
    const db = getDb();
    const { request_id, rating, comment } = req.body;

    const request = db.prepare('SELECT * FROM borrow_requests WHERE id = ?').get(request_id);
    if (!request) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Borrow request not found' } });
    }

    const reviewed_user_id = request.requester_id === req.user.id ? request.lender_id : request.requester_id;

    const result = db.prepare(
      'INSERT INTO reviews (reviewer_id, reviewed_user_id, request_id, rating, comment) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, reviewed_user_id, request_id, rating, comment || '');

    // Update user rating
    const avgRating = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE reviewed_user_id = ?').get(reviewed_user_id);
    db.prepare('UPDATE users SET rating = ? WHERE id = ?').run(Math.round(avgRating.avg * 10) / 10, reviewed_user_id);

    // Notification
    db.prepare('INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)')
      .run(reviewed_user_id, 'new_review', 'New Review', `You received a ${rating}-star review`, result.lastInsertRowid);

    const review = db.prepare(
      `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getForUser = (req, res) => {
  try {
    const db = getDb();
    const reviews = db.prepare(
      `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r JOIN users u ON r.reviewer_id = u.id
       WHERE r.reviewed_user_id = ? ORDER BY r.created_at DESC`
    ).all(req.params.userId);

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
