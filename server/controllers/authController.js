const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'componenthub_secret';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.register = (req, res) => {
  try {
    const db = getDb();
    const { full_name, email, password, phone, location, bio } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (full_name, email, password_hash, phone, location, bio) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(full_name, email, password_hash, phone || null, location || null, bio || null);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(user.id, 'register', 'user', user.id, JSON.stringify({ email }));

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    res.status(201).json({ success: true, data: { user: safeUser, token } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.login = (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const validPass = bcrypt.compareSync(password, user.password_hash);
    if (!validPass) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    res.json({ success: true, data: { user: safeUser, token } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getProfile = (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    const { password_hash: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.updateProfile = (req, res) => {
  try {
    const db = getDb();
    const { full_name, phone, location, bio } = req.body;
    let avatar_url = req.body.avatar_url;

    if (req.file) {
      avatar_url = '/uploads/' + req.file.filename;
    }

    db.prepare(
      `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone),
       location = COALESCE(?, location), bio = COALESCE(?, bio),
       avatar_url = COALESCE(?, avatar_url), updated_at = datetime('now') WHERE id = ?`
    ).run(full_name, phone, location, bio, avatar_url, req.user.id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const { password_hash: _, ...safeUser } = user;

    res.json({ success: true, data: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.deleteAccount = (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ success: true, data: { message: 'Account deleted successfully' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
