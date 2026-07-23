// database.js — SQLite connection and schema setup
// Uses better-sqlite3 (Sprint 2 schema)

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'saugahome.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sellers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    cuisine TEXT,
    neighbourhood TEXT,
    dietary_tags TEXT,
    description TEXT,
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS buyers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'seller',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    available INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Placed',
    total_price REAL NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id),
    FOREIGN KEY (seller_id) REFERENCES sellers(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE,
    seller_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (seller_id) REFERENCES sellers(id),
    FOREIGN KEY (buyer_id) REFERENCES buyers(id)
  );
`);

// ── Sprint 3 migration: add tracking columns to orders if they don't exist yet ──
// SQLite has no "ADD COLUMN IF NOT EXISTS", so check pragma table_info first.
// This keeps the migration safe to re-run and non-destructive to existing rows.
const orderColumns = db.prepare(`PRAGMA table_info(orders)`).all().map(c => c.name);
const sprint3Columns = [
  ['seller_lat', 'REAL'],
  ['seller_lng', 'REAL'],
  ['buyer_lat', 'REAL'],
  ['buyer_lng', 'REAL'],
  ['delivery_address', 'TEXT'],
  ['status_updated_at', 'DATETIME'],
];
for (const [col, type] of sprint3Columns) {
  if (!orderColumns.includes(col)) {
    db.exec(`ALTER TABLE orders ADD COLUMN ${col} ${type}`);
    console.log(`Migration: added orders.${col} (${type})`);
  }
}

console.log('Database connected:', DB_PATH);
console.log('Tables ready: sellers, buyers, sessions, menu_items, orders, order_items, reviews');

module.exports = db;