const { getDb } = require('../config/database');

exports.send = (req, res) => {
  try {
    const db = getDb();
    const { receiver_id, component_id, content } = req.body;

    if (receiver_id === req.user.id) {
      return res.status(400).json({ success: false, error: { code: 'SELF_MESSAGE', message: 'Cannot message yourself' } });
    }

    const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(receiver_id);
    if (!receiver) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Receiver not found' } });
    }

    const result = db.prepare(
      'INSERT INTO messages (sender_id, receiver_id, component_id, content) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, receiver_id, component_id || null, content);

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getConversations = (req, res) => {
  try {
    const db = getDb();
    const conversations = db.prepare(`
      SELECT DISTINCT
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
        (SELECT full_name FROM users WHERE id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) as other_user_name,
        (SELECT avatar_url FROM users WHERE id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) as other_user_avatar,
        (SELECT content FROM messages WHERE
          ((sender_id = ? AND receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) OR
           (receiver_id = ? AND sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END))
          ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE
          ((sender_id = ? AND receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) OR
           (receiver_id = ? AND sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END))
          ORDER BY created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages WHERE sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AND receiver_id = ? AND is_read = 0) as unread_count
      FROM messages m
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY last_message_at DESC
    `).all(
      req.user.id, req.user.id, req.user.id, req.user.id, req.user.id,
      req.user.id, req.user.id, req.user.id, req.user.id, req.user.id,
      req.user.id, req.user.id, req.user.id, req.user.id, req.user.id
    );

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getThread = (req, res) => {
  try {
    const db = getDb();
    const { userId } = req.params;

    const messages = db.prepare(
      `SELECT m.*, s.full_name as sender_name, s.avatar_url as sender_avatar,
       c.title as component_title
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       LEFT JOIN components c ON m.component_id = c.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`
    ).all(req.user.id, userId, userId, req.user.id);

    // Mark as read
    db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?').run(userId, req.user.id);

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.remove = (req, res) => {
  try {
    const db = getDb();
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } });
    }
    if (message.sender_id !== req.user.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Can only delete your own messages' } });
    }
    db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'Message deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
