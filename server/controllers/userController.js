const { getDb } = require('../config/database');

exports.getUser = (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, full_name, email, avatar_url, phone, location, bio, role, is_verified, rating, created_at FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const components = db.prepare(
      `SELECT c.*, cat.name as category_name FROM components c
       JOIN categories cat ON c.category_id = cat.id WHERE c.owner_id = ? ORDER BY c.created_at DESC`
    ).all(req.params.id);

    const reviews = db.prepare(
      `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r JOIN users u ON r.reviewer_id = u.id
       WHERE r.reviewed_user_id = ? ORDER BY r.created_at DESC`
    ).all(req.params.id);

    res.json({
      success: true,
      data: {
        ...user,
        components: components.map(c => ({ ...c, tags: JSON.parse(c.tags || '[]'), image_urls: JSON.parse(c.image_urls || '[]') })),
        reviews
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getAllUsers = (req, res) => {
  try {
    const db = getDb();
    const users = db.prepare(
      'SELECT id, full_name, email, avatar_url, location, role, is_verified, rating, created_at FROM users ORDER BY created_at DESC'
    ).all();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.updateUserRole = (req, res) => {
  try {
    const db = getDb();
    const { role, is_verified } = req.body;
    db.prepare('UPDATE users SET role = COALESCE(?, role), is_verified = COALESCE(?, is_verified), updated_at = datetime(\'now\') WHERE id = ?')
      .run(role, is_verified, req.params.id);
    const user = db.prepare('SELECT id, full_name, email, role, is_verified FROM users WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const db = getDb();
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, error: { code: 'SELF_DELETE', message: 'Cannot delete yourself' } });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
