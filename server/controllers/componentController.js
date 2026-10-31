const { getDb } = require('../config/database');

exports.getAll = (req, res) => {
  try {
    const db = getDb();
    const { search, category, condition, listing_type, location, status, sort, order, page = 1, limit = 20 } = req.query;

    let query = `SELECT c.*, u.full_name as owner_name, u.avatar_url as owner_avatar, u.rating as owner_rating,
                 cat.name as category_name, cat.icon as category_icon
                 FROM components c
                 JOIN users u ON c.owner_id = u.id
                 JOIN categories cat ON c.category_id = cat.id WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.brand LIKE ? OR c.model_number LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (category) { query += ` AND c.category_id = ?`; params.push(category); }
    if (condition) { query += ` AND c.condition = ?`; params.push(condition); }
    if (listing_type) { query += ` AND c.listing_type = ?`; params.push(listing_type); }
    if (location) { query += ` AND c.location LIKE ?`; params.push(`%${location}%`); }
    if (status) { query += ` AND c.status = ?`; params.push(status); }

    // Count total
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const total = db.prepare(countQuery).get(...params).total;

    // Sort
    const sortMap = { date: 'c.created_at', price: 'c.price_per_day', views: 'c.views_count', title: 'c.title' };
    const sortCol = sortMap[sort] || 'c.created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortCol} ${sortOrder}`;

    // Paginate
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const components = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: {
        components: components.map(c => ({ ...c, tags: JSON.parse(c.tags || '[]'), image_urls: JSON.parse(c.image_urls || '[]') })),
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getById = (req, res) => {
  try {
    const db = getDb();
    const component = db.prepare(
      `SELECT c.*, u.full_name as owner_name, u.avatar_url as owner_avatar, u.email as owner_email,
       u.phone as owner_phone, u.rating as owner_rating, u.bio as owner_bio, u.location as owner_location,
       cat.name as category_name, cat.icon as category_icon
       FROM components c
       JOIN users u ON c.owner_id = u.id
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = ?`
    ).get(req.params.id);

    if (!component) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Component not found' } });
    }

    // Increment views
    db.prepare('UPDATE components SET views_count = views_count + 1 WHERE id = ?').run(req.params.id);

    // Get similar components
    const similar = db.prepare(
      `SELECT c.*, cat.name as category_name FROM components c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.category_id = ? AND c.id != ? AND c.status = 'available' LIMIT 4`
    ).all(component.category_id, component.id);

    res.json({
      success: true,
      data: {
        ...component,
        tags: JSON.parse(component.tags || '[]'),
        image_urls: JSON.parse(component.image_urls || '[]'),
        similar: similar.map(s => ({ ...s, tags: JSON.parse(s.tags || '[]'), image_urls: JSON.parse(s.image_urls || '[]') }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.create = (req, res) => {
  try {
    const db = getDb();
    const { category_id, title, description, brand, model_number, condition, listing_type, price_per_day, quantity, tags, location, lab_name } = req.body;

    let image_urls = [];
    if (req.files && req.files.length > 0) {
      image_urls = req.files.map(f => '/uploads/' + f.filename);
    }

    const parsedTags = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
    const availQty = parseInt(quantity) || 1;

    const result = db.prepare(
      `INSERT INTO components (owner_id, category_id, title, description, brand, model_number, condition, listing_type,
       price_per_day, quantity, available_quantity, tags, image_urls, location, lab_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.user.id, category_id, title, description, brand || null, model_number || null,
      condition || 'good', listing_type || 'lend', price_per_day || null,
      availQty, availQty, parsedTags, JSON.stringify(image_urls),
      location || null, lab_name || null
    );

    // Log activity
    db.prepare('INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'create_component', 'component', result.lastInsertRowid, JSON.stringify({ title }));

    const component = db.prepare('SELECT * FROM components WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: { ...component, tags: JSON.parse(component.tags || '[]'), image_urls: JSON.parse(component.image_urls || '[]') }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.update = (req, res) => {
  try {
    const db = getDb();
    const component = db.prepare('SELECT * FROM components WHERE id = ?').get(req.params.id);

    if (!component) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Component not found' } });
    }
    if (component.owner_id !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to edit this component' } });
    }

    const { category_id, title, description, brand, model_number, condition, listing_type, price_per_day, quantity, available_quantity, tags, location, lab_name, status } = req.body;

    let image_urls = component.image_urls;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => '/uploads/' + f.filename);
      const existing = JSON.parse(component.image_urls || '[]');
      image_urls = JSON.stringify([...existing, ...newImages]);
    }

    const parsedTags = tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : component.tags;

    db.prepare(
      `UPDATE components SET category_id = COALESCE(?, category_id), title = COALESCE(?, title),
       description = COALESCE(?, description), brand = COALESCE(?, brand), model_number = COALESCE(?, model_number),
       condition = COALESCE(?, condition), listing_type = COALESCE(?, listing_type),
       price_per_day = COALESCE(?, price_per_day), quantity = COALESCE(?, quantity),
       available_quantity = COALESCE(?, available_quantity), tags = ?, image_urls = ?,
       location = COALESCE(?, location), lab_name = COALESCE(?, lab_name),
       status = COALESCE(?, status), updated_at = datetime('now') WHERE id = ?`
    ).run(
      category_id, title, description, brand, model_number, condition, listing_type,
      price_per_day, quantity, available_quantity, parsedTags, image_urls,
      location, lab_name, status, req.params.id
    );

    const updated = db.prepare('SELECT * FROM components WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      data: { ...updated, tags: JSON.parse(updated.tags || '[]'), image_urls: JSON.parse(updated.image_urls || '[]') }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.remove = (req, res) => {
  try {
    const db = getDb();
    const component = db.prepare('SELECT * FROM components WHERE id = ?').get(req.params.id);

    if (!component) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Component not found' } });
    }
    if (component.owner_id !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to delete this component' } });
    }

    db.prepare('DELETE FROM components WHERE id = ?').run(req.params.id);

    db.prepare('INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, 'delete_component', 'component', req.params.id, JSON.stringify({ title: component.title }));

    res.json({ success: true, data: { message: 'Component deleted successfully' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getMyListings = (req, res) => {
  try {
    const db = getDb();
    const components = db.prepare(
      `SELECT c.*, cat.name as category_name FROM components c
       JOIN categories cat ON c.category_id = cat.id WHERE c.owner_id = ? ORDER BY c.created_at DESC`
    ).all(req.user.id);

    res.json({
      success: true,
      data: components.map(c => ({ ...c, tags: JSON.parse(c.tags || '[]'), image_urls: JSON.parse(c.image_urls || '[]') }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.getCategories = (req, res) => {
  try {
    const db = getDb();
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    const counts = db.prepare(
      'SELECT category_id, COUNT(*) as count FROM components GROUP BY category_id'
    ).all();
    const countMap = {};
    counts.forEach(c => { countMap[c.category_id] = c.count; });

    res.json({
      success: true,
      data: categories.map(c => ({ ...c, component_count: countMap[c.id] || 0 }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

exports.autocomplete = (req, res) => {
  try {
    const db = getDb();
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const results = db.prepare(
      `SELECT id, title, brand FROM components WHERE title LIKE ? OR brand LIKE ? LIMIT 8`
    ).all(`%${q}%`, `%${q}%`);

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
