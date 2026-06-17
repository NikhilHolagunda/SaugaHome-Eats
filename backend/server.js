// server.js — SaugaHomeEats Express API
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

// Serve uploaded photos as static files
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
    cb(null, `seller_${req.seller.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Auth Middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.slice(7);
  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
  if (!session) return res.status(401).json({ error: 'Invalid or expired token' });

  const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(session.seller_id);
  if (!seller) return res.status(401).json({ error: 'Seller not found' });

  req.seller = seller;
  next();
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── POST /api/signup ──────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Check duplicate
    const existing = db.prepare('SELECT id FROM sellers WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'An account with this email already exists' });

    // Hash & insert
    const hashed = await bcrypt.hash(password, 10);
    const insert = db.prepare('INSERT INTO sellers (email, password) VALUES (?, ?)');
    const result = insert.run(email, hashed);
    const id = Number(result.lastInsertRowid);

    // Create session
    const token = uuidv4();
    db.prepare('INSERT INTO sessions (token, seller_id) VALUES (?, ?)').run(token, id);

    res.status(201).json({ id, email, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ── POST /api/login ───────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const seller = db.prepare('SELECT * FROM sellers WHERE email = ?').get(email);
    if (!seller) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, seller.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = uuidv4();
    db.prepare('INSERT INTO sessions (token, seller_id) VALUES (?, ?)').run(token, seller.id);

    res.json({
      id: seller.id,
      email: seller.email,
      token,
      hasListing: seller.name !== null,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ── POST /api/logout ──────────────────────────────────────────────────────────
app.post('/api/logout', authMiddleware, (req, res) => {
  const token = req.headers['authorization'].slice(7);
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.json({ success: true });
});

// ── GET /api/me ───────────────────────────────────────────────────────────────
app.get('/api/me', authMiddleware, (req, res) => {
  const { password, ...seller } = req.seller;
  res.json(seller);
});

// ── POST /api/sellers — create/update listing ─────────────────────────────────
app.post('/api/sellers', authMiddleware, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { name, cuisine, neighbourhood, dietary_tags, description } = req.body;
    if (!name || !cuisine || !neighbourhood || !description) {
      return res.status(400).json({ error: 'Name, cuisine, neighbourhood, and description are required' });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.seller.photo_url;

    db.prepare(`
      UPDATE sellers
      SET name = ?, cuisine = ?, neighbourhood = ?, dietary_tags = ?, description = ?, photo_url = ?
      WHERE id = ?
    `).run(name, cuisine, neighbourhood, dietary_tags || '', description, photoUrl, req.seller.id);

    const updated = db.prepare('SELECT id, name, cuisine, neighbourhood, dietary_tags, description, photo_url FROM sellers WHERE id = ?').get(req.seller.id);
    res.json(updated);
  });
});

// ── GET /api/sellers — public listing browse ──────────────────────────────────
app.get('/api/sellers', (req, res) => {
  const sellers = db.prepare(`
    SELECT id, name, cuisine, neighbourhood, dietary_tags, description, photo_url, created_at
    FROM sellers
    WHERE name IS NOT NULL
    ORDER BY created_at DESC
  `).all();
  res.json(sellers);
});

// ── GET /api/sellers/:id ───────────────────────────────────────────────────────
app.get('/api/sellers/:id', (req, res) => {
  const seller = db.prepare(`
    SELECT id, name, cuisine, neighbourhood, dietary_tags, description, photo_url, created_at
    FROM sellers WHERE id = ?
  `).get(req.params.id);
  if (!seller) return res.status(404).json({ error: 'Seller not found' });
  res.json(seller);
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`SaugaHomeEats API running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
