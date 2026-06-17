// database.js — SQLite connection and schema setup
// Uses better-sqlite3 (as per spec Section 2)

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'saugahome.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables exactly as per spec Section 4
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

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id)
  );
`);

console.log('Database connected:', DB_PATH);

module.exports = db;
