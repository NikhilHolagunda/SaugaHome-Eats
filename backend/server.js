// server.js — SaugaHomeEats Express API (Sprint 2)
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('./database');
const app = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Multer — file upload config ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `seller_${req.user.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ── Auth Middleware ───────────────────────────────────────────────────────────
// Attaches req.user and req.userType to the request.
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.slice(7);
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) return res.status(401).json({ error: 'Invalid or expired token' });

  const table = session.user_type === 'buyer' ? 'buyers' : 'sellers';
  const user = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(session.user_id);
  if (!user) return res.status(401).json({ error: 'User not found' });

  req.user = user;
  req.userType = session.user_type;
  next();
}

// Helper: reject buyers on seller-only routes
function requireSeller(req, res, next) {
  if (req.userType !== 'seller') return res.status(403).json({ error: 'Sellers only' });
  next();
}

// Helper: reject sellers on buyer-only routes
function requireBuyer(req, res, next) {
  if (req.userType !== 'buyer') return res.status(403).json({ error: 'Buyers only' });
  next();
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─────────────────────────────────────────────────────────────────────────────
// SELLER AUTH
// ─────────────────────────────────────────────────────────────────────────────

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });

    const existing = db.prepare('SELECT id FROM sellers WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO sellers (email, password) VALUES (?, ?)').run(email, hash);
    const token = uuidv4();
    db.prepare('INSERT INTO sessions (token, user_id, user_type) VALUES (?, ?, ?)').run(token, result.lastInsertRowid, 'seller');

    res.json({ id: result.lastInsertRowid, email, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const seller = db.prepare('SELECT * FROM sellers WHERE email = ?').get(email);
    if (!seller) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, seller.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = uuidv4();
    db.prepare('INSERT INTO sessions (token, user_id, user_type) VALUES (?, ?, ?)').run(token, seller.id, 'seller');

    res.json({ id: seller.id, email: seller.email, token, hasListing: seller.name !== null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', authMiddleware, (req, res) => {
  const token = req.headers['authorization'].slice(7);
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.json({ success: true });
});

app.get('/api/me', authMiddleware, requireSeller, (req, res) => {
  const { password, ...safe } = req.user;
  res.json(safe);
});

// ─────────────────────────────────────────────────────────────────────────────
// BUYER AUTH
// ─────────────────────────────────────────────────────────────────────────────

app.post('/api/buyer/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });

    const existing = db.prepare('SELECT id FROM buyers WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO buyers (email, password, name) VALUES (?, ?, ?)').run(email, hash, name || null);
    const token = uuidv4();
    db.prepare('INSERT INTO sessions (token, user_id, user_type) VALUES (?, ?, ?)').run(token, result.lastInsertRowid, 'buyer');

    res.json({ id: result.lastInsertRowid, email, name: name || null, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/buyer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const buyer = db.prepare('SELECT * FROM buyers WHERE email = ?').get(email);
    if (!buyer) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, buyer.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = uuidv4();
    db.prepare('INSERT INTO sessions (token, user_id, user_type) VALUES (?, ?, ?)').run(token, buyer.id, 'buyer');

    res.json({ id: buyer.id, email: buyer.email, name: buyer.name, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/buyer/me', authMiddleware, requireBuyer, (req, res) => {
  const { password, ...safe } = req.user;
  res.json(safe);
});

// ─────────────────────────────────────────────────────────────────────────────
// SELLER LISTINGS (Sprint 1 endpoints — updated to use req.user)
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/sellers', (req, res) => {
  const { search, cuisine, neighbourhood, dietary } = req.query;

  const conditions = ['name IS NOT NULL'];
  const params = [];

  // Search across name, cuisine, description
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push('(name LIKE ? OR cuisine LIKE ? OR description LIKE ?)');
    params.push(term, term, term);
  }

  // Filter by exact cuisine (case-insensitive)
  if (cuisine && cuisine.trim()) {
    conditions.push('LOWER(cuisine) = LOWER(?)');
    params.push(cuisine.trim());
  }

  // Filter by exact neighbourhood (case-insensitive)
  if (neighbourhood && neighbourhood.trim()) {
    conditions.push('LOWER(neighbourhood) = LOWER(?)');
    params.push(neighbourhood.trim());
  }

  // Filter by dietary tags — comma-separated, all must be present
  if (dietary && dietary.trim()) {
    const tags = dietary.split(',').map(t => t.trim()).filter(Boolean);
    for (const tag of tags) {
      conditions.push('LOWER(dietary_tags) LIKE LOWER(?)');
      params.push(`%${tag}%`);
    }
  }

  const sql = `
    SELECT id, name, cuisine, neighbourhood, dietary_tags, description, photo_url
    FROM sellers
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
  `;

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// Public: list of distinct cuisines and neighbourhoods (for filter dropdowns)
app.get('/api/filters', (req, res) => {
  const cuisines = db.prepare(`
    SELECT DISTINCT cuisine FROM sellers
    WHERE cuisine IS NOT NULL AND cuisine != ''
    ORDER BY cuisine ASC
  `).all().map(r => r.cuisine);

  const neighbourhoods = db.prepare(`
    SELECT DISTINCT neighbourhood FROM sellers
    WHERE neighbourhood IS NOT NULL AND neighbourhood != ''
    ORDER BY neighbourhood ASC
  `).all().map(r => r.neighbourhood);

  res.json({ cuisines, neighbourhoods });
});

app.get('/api/sellers/:id', (req, res) => {
  const row = db.prepare(`
    SELECT id, name, cuisine, neighbourhood, dietary_tags, description, photo_url
    FROM sellers WHERE id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Seller not found' });
  res.json(row);
});

app.post('/api/sellers', authMiddleware, requireSeller, upload.single('photo'), (req, res) => {
  try {
    const { name, cuisine, neighbourhood, dietary_tags, description } = req.body;
    if (!name || !cuisine || !neighbourhood || !description) {
      return res.status(400).json({ error: 'All fields except dietary tags are required' });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.user.photo_url;

    db.prepare(`
      UPDATE sellers
      SET name = ?, cuisine = ?, neighbourhood = ?, dietary_tags = ?, description = ?, photo_url = ?
      WHERE id = ?
    `).run(name, cuisine, neighbourhood, dietary_tags || '', description, photoUrl, req.user.id);

    const updated = db.prepare(`
      SELECT id, name, cuisine, neighbourhood, dietary_tags, description, photo_url
      FROM sellers WHERE id = ?
    `).get(req.user.id);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save listing' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MENU ITEMS
// ─────────────────────────────────────────────────────────────────────────────

// Public: view a seller's menu
app.get('/api/sellers/:id/menu', (req, res) => {
  const items = db.prepare(`
    SELECT id, seller_id, name, description, price, available
    FROM menu_items
    WHERE seller_id = ?
    ORDER BY created_at ASC
  `).all(req.params.id);
  res.json(items);
});

// Seller: add a menu item
app.post('/api/menu', authMiddleware, requireSeller, (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    if (isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }

    const result = db.prepare(`
      INSERT INTO menu_items (seller_id, name, description, price, available)
      VALUES (?, ?, ?, ?, 1)
    `).run(req.user.id, name, description || '', Number(price));

    const created = db.prepare(`
      SELECT id, seller_id, name, description, price, available
      FROM menu_items WHERE id = ?
    `).get(result.lastInsertRowid);

    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Seller: update a menu item (must own it)
app.patch('/api/menu/:id', authMiddleware, requireSeller, (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    if (item.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your menu item' });

    const name = req.body.name ?? item.name;
    const description = req.body.description ?? item.description;
    const price = req.body.price != null ? Number(req.body.price) : item.price;
    const available = req.body.available != null ? (req.body.available ? 1 : 0) : item.available;

    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }

    db.prepare(`
      UPDATE menu_items
      SET name = ?, description = ?, price = ?, available = ?
      WHERE id = ?
    `).run(name, description, price, available, req.params.id);

    const updated = db.prepare(`
      SELECT id, seller_id, name, description, price, available
      FROM menu_items WHERE id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Seller: delete a menu item (must own it)
app.delete('/api/menu/:id', authMiddleware, requireSeller, (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  if (item.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your menu item' });

  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

// Buyer: place an order
// Body: { seller_id, items: [{ menu_item_id, quantity }], notes }
app.post('/api/orders', authMiddleware, requireBuyer, (req, res) => {
  try {
    const { seller_id, items, notes } = req.body;
    if (!seller_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'seller_id and at least one item are required' });
    }

    const seller = db.prepare('SELECT id FROM sellers WHERE id = ?').get(seller_id);
    if (!seller) return res.status(400).json({ error: 'Seller not found' });

    // Look up each menu item's real price from the DB (never trust client prices).
    const resolvedItems = [];
    let totalPrice = 0;
    for (const it of items) {
      if (!it.menu_item_id || !it.quantity || it.quantity < 1) {
        return res.status(400).json({ error: 'Each item needs menu_item_id and quantity >= 1' });
      }
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(it.menu_item_id);
      if (!menuItem) return res.status(400).json({ error: `Menu item ${it.menu_item_id} not found` });
      if (menuItem.seller_id !== seller_id) {
        return res.status(400).json({ error: 'All items must belong to the same seller' });
      }
      if (!menuItem.available) {
        return res.status(400).json({ error: `${menuItem.name} is not available` });
      }
      resolvedItems.push({
        menu_item_id: menuItem.id,
        item_name: menuItem.name,
        quantity: Math.floor(it.quantity),
        unit_price: menuItem.price,
      });
      totalPrice += menuItem.price * Math.floor(it.quantity);
    }

    // Insert order + items atomically
    const insertOrder = db.prepare(`
      INSERT INTO orders (buyer_id, seller_id, status, total_price, notes)
      VALUES (?, ?, 'Placed', ?, ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      const result = insertOrder.run(req.user.id, seller_id, totalPrice, notes || null);
      const orderId = result.lastInsertRowid;
      for (const ri of resolvedItems) {
        insertItem.run(orderId, ri.menu_item_id, ri.item_name, ri.quantity, ri.unit_price);
      }
      return orderId;
    });

    const orderId = tx();
    const created = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const createdItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    res.json({ ...created, items: createdItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Helper to attach items + counterparty info to a list of orders
function hydrateOrders(orders, counterparty) {
  // counterparty is 'buyer' or 'seller' — the OTHER party to attach
  return orders.map(o => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    let other = null;
    if (counterparty === 'buyer') {
      other = db.prepare('SELECT id, email, name FROM buyers WHERE id = ?').get(o.buyer_id);
    } else {
      other = db.prepare('SELECT id, name, cuisine, neighbourhood, photo_url FROM sellers WHERE id = ?').get(o.seller_id);
    }
    return { ...o, items, [counterparty]: other };
  });
}

// Seller: list my incoming orders (newest first)
app.get('/api/orders/seller', authMiddleware, requireSeller, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE seller_id = ? ORDER BY created_at DESC
  `).all(req.user.id);
  res.json(hydrateOrders(orders, 'buyer'));
});

// Buyer: list my past orders
app.get('/api/orders/buyer', authMiddleware, requireBuyer, (req, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC
  `).all(req.user.id);
  res.json(hydrateOrders(orders, 'seller'));
});

// Seller: accept or decline an order
// Body: { status: 'Accepted' | 'Declined' }
app.patch('/api/orders/:id/status', authMiddleware, requireSeller, (req, res) => {
  const { status } = req.body;
  const allowed = ['Accepted', 'Declined'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.status !== 'Placed') {
    return res.status(400).json({ error: `Order is already ${order.status}` });
  }

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});