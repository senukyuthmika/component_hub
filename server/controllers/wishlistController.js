const { getDb } = require('../config/database');

exports.toggle = (req, res) => {
  try {
    const db = getDb();
    const { component_id } = req.body;

    const existing = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND component_id = ?')
      .get(req.user.id, component_id);

    if (existing) {
      db.prepare('DELETE FROM wishlists WHERE id = ?').run(existing.id);
      return res.json({ success: true, data: { wishlisted: false } });
    }

    db.prepare('INSERT INTO wishlists (user_id, component_id) VALUES (?, ?)').run(req.user.id, component_id);
    res.json({ success: true, data: { wishlisted: true } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getAll = (req, res) => {
  try {
    const db = getDb();
    const items = db.prepare(
      `SELECT w.*, c.title, c.image_urls, c.price_per_day, c.status, c.condition, c.listing_type,
       cat.name as category_name, u.full_name as owner_name
       FROM wishlists w
       JOIN components c ON w.component_id = c.id
       JOIN categories cat ON c.category_id = cat.id
       JOIN users u ON c.owner_id = u.id
       WHERE w.user_id = ? ORDER BY w.created_at DESC`
    ).all(req.user.id);

    res.json({
      success: true,
      data: items.map(i => ({ ...i, image_urls: JSON.parse(i.image_urls || '[]') }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.remove = (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM wishlists WHERE user_id = ? AND component_id = ?')
      .run(req.user.id, req.params.componentId);
    res.json({ success: true, data: { message: 'Removed from wishlist' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.check = (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND component_id = ?')
      .get(req.user.id, req.params.componentId);
    res.json({ success: true, data: { wishlisted: !!existing } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
