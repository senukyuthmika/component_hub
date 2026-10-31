const { getDb } = require('../config/database');

exports.getStats = (req, res) => {
  try {
    const db = getDb();
    const totalComponents = db.prepare('SELECT COUNT(*) as count FROM components').get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const activeRequests = db.prepare("SELECT COUNT(*) as count FROM borrow_requests WHERE status IN ('pending','approved')").get().count;
    const totalBorrowed = db.prepare("SELECT COUNT(*) as count FROM borrow_requests WHERE status = 'returned'").get().count;

    res.json({ success: true, data: { totalComponents, totalUsers, activeRequests, totalBorrowed } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getUserStats = (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const myListings = db.prepare('SELECT COUNT(*) as count FROM components WHERE owner_id = ?').get(userId).count;
    const myRequests = db.prepare('SELECT COUNT(*) as count FROM borrow_requests WHERE requester_id = ?').get(userId).count;
    const incomingRequests = db.prepare("SELECT COUNT(*) as count FROM borrow_requests WHERE lender_id = ? AND status = 'pending'").get(userId).count;
    const totalViews = db.prepare('SELECT COALESCE(SUM(views_count),0) as count FROM components WHERE owner_id = ?').get(userId).count;

    res.json({ success: true, data: { myListings, myRequests, incomingRequests, totalViews } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getChartData = (req, res) => {
  try {
    const db = getDb();

    // Requests over last 6 months
    const requestsByMonth = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM borrow_requests
      WHERE created_at >= datetime('now', '-6 months')
      GROUP BY month ORDER BY month
    `).all();

    // Components by category
    const byCategory = db.prepare(`
      SELECT cat.name, COUNT(*) as count FROM components c
      JOIN categories cat ON c.category_id = cat.id
      GROUP BY cat.name ORDER BY count DESC
    `).all();

    // Listing type distribution
    const byListingType = db.prepare(`
      SELECT listing_type as name, COUNT(*) as value FROM components GROUP BY listing_type
    `).all();

    // Activity over time
    const activityByMonth = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM activity_log
      WHERE created_at >= datetime('now', '-6 months')
      GROUP BY month ORDER BY month
    `).all();

    // Top locations
    const topLocations = db.prepare(`
      SELECT location as name, COUNT(*) as count FROM components
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location ORDER BY count DESC LIMIT 8
    `).all();

    // Request status breakdown
    const requestStatus = db.prepare(`
      SELECT status as name, COUNT(*) as value FROM borrow_requests GROUP BY status
    `).all();

    res.json({
      success: true,
      data: { requestsByMonth, byCategory, byListingType, activityByMonth, topLocations, requestStatus }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getRecentActivity = (req, res) => {
  try {
    const db = getDb();
    const activities = db.prepare(
      `SELECT al.*, u.full_name FROM activity_log al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT 20`
    ).all();

    res.json({
      success: true,
      data: activities.map(a => ({ ...a, details: JSON.parse(a.details || '{}') }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.exportBorrowHistory = (req, res) => {
  try {
    const db = getDb();
    const history = db.prepare(`
      SELECT br.id, c.title as component, req.full_name as requester, lend.full_name as lender,
             br.status, br.borrow_date, br.return_date, br.actual_return_date, br.created_at
      FROM borrow_requests br
      JOIN components c ON br.component_id = c.id
      JOIN users req ON br.requester_id = req.id
      JOIN users lend ON br.lender_id = lend.id
      ORDER BY br.created_at DESC
    `).all();

    // Generate CSV
    const headers = 'ID,Component,Requester,Lender,Status,Borrow Date,Return Date,Actual Return,Created At\n';
    const rows = history.map(h =>
      `${h.id},"${h.component}","${h.requester}","${h.lender}",${h.status},${h.borrow_date || ''},${h.return_date || ''},${h.actual_return_date || ''},${h.created_at}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=borrow_history.csv');
    res.send(headers + rows);
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
