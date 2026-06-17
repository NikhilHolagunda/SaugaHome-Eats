// seed.js — Populate the database with 8 sample sellers for demo
// Run with: npm run seed
// All accounts use password: password123

const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'saugahome.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA foreign_keys = ON');
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

const SEED_SELLERS = [
  {
    email: 'priya@saugahomeeats.test',
    name: "Priya's Kitchen",
    cuisine: 'Punjabi',
    neighbourhood: 'Square One',
    dietary_tags: 'vegetarian,halal',
    description: "Authentic Punjabi home cooking made with love and fresh spices sourced from my local market. Specializing in dal makhani, chole, and weekend tiffin boxes that taste just like mom used to make. Order by Friday for weekend delivery within Square One.",
    photo_url: null, // Replace with real food photos before demo
  },
  {
    email: 'maria@saugahomeeats.test',
    name: "Maria's Filipino Home",
    cuisine: 'Filipino',
    neighbourhood: 'Erin Mills',
    dietary_tags: '',
    description: "Bringing the flavours of the Philippines to Mississauga — adobo, sinigang, kare-kare, and lechon kawali made from traditional family recipes. Available for family parties, special occasions, and weekly meal prep. Tray orders accepted with 48 hours notice.",
    photo_url: null,
  },
  {
    email: 'joy@saugahomeeats.test',
    name: "Auntie Joy's Caribbean",
    cuisine: 'Caribbean',
    neighbourhood: 'Cooksville',
    dietary_tags: 'halal',
    description: "Jerk chicken, oxtail stew, and rice & peas that will transport you straight to Jamaica. Everything is made fresh to order with authentic island seasonings — no shortcuts, no compromises. Available Fridays and Saturdays for pick-up or local delivery.",
    photo_url: null,
  },
  {
    email: 'fatima@saugahomeeats.test',
    name: "Fatima's Sweets & Bakes",
    cuisine: 'Pakistani',
    neighbourhood: 'Meadowvale',
    dietary_tags: 'halal,vegetarian',
    description: "Handcrafted mithai, cookies, and celebration cakes for every occasion. Specialties include gulab jamun, kheer, and custom Eid gift boxes. All baked goods are 100% halal-certified. Minimum 3-day notice for custom orders.",
    photo_url: null,
  },
  {
    email: 'latha@saugahomeeats.test',
    name: "Latha's Tiffin Service",
    cuisine: 'Sri Lankan',
    neighbourhood: 'Mississauga Valley',
    dietary_tags: 'vegetarian,vegan,gluten-free',
    description: "Weekly tiffin subscriptions featuring Sri Lankan home cooking — kottu roti, dhal curry, and freshly made pol sambol. Vegan and gluten-free options available every day. Subscribe for 5-day or 3-day weekly plans delivered to your door.",
    photo_url: null,
  },
  {
    email: 'nonna@saugahomeeats.test',
    name: "Nonna Rosa's Kitchen",
    cuisine: 'Italian',
    neighbourhood: 'Port Credit',
    dietary_tags: 'vegetarian',
    description: "Three generations of Italian cooking right here in Port Credit. Fresh pasta made by hand every morning, Sunday sauce slow-simmered for 6 hours, and tiramisu that won our family the Calabria food festival three years running. Portions are generous — this is true Italian hospitality.",
    photo_url: null,
  },
  {
    email: 'bintu@saugahomeeats.test',
    name: "Bintu's West African Kitchen",
    cuisine: 'West African',
    neighbourhood: 'Streetsville',
    dietary_tags: 'halal,gluten-free',
    description: "Jollof rice, egusi soup, and suya skewers that bring the bold, rich flavours of West Africa to your table. Made with imported spices and sustainably sourced ingredients. Perfect for family gatherings and office lunches. Orders taken via WhatsApp — contact button below.",
    photo_url: null,
  },
  {
    email: 'meera@saugahomeeats.test',
    name: "Meera's Gujarati Thali",
    cuisine: 'Gujarati',
    neighbourhood: 'Clarkson',
    dietary_tags: 'vegetarian,vegan',
    description: "Full vegetarian Gujarati thali experience delivered to your home — rotli, dal, shaak, khichdi, and seasonal pickles. Perfect for working families who want a wholesome home-cooked meal without the effort. Thali subscription plans available Monday through Saturday.",
    photo_url: null,
  },
];

async function seed() {
  console.log('🌱 Seeding database with sample sellers...\n');

  const password = await bcrypt.hash('password123', 10);

  // Create seed photo directory note
  const seedDir = path.join(__dirname, 'uploads', 'seed');
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
    fs.writeFileSync(
      path.join(seedDir, 'README.txt'),
      'Place real food photos here named seller1.jpg, seller2.jpg... etc.\nUpdate photo_url in seed.js to point to them before the demo.'
    );
  }

  let created = 0, skipped = 0;

  for (const seller of SEED_SELLERS) {
    const existing = db.prepare('SELECT id FROM sellers WHERE email = ?').get(seller.email);
    if (existing) {
      console.log(`  ⏭  Skipped (already exists): ${seller.name}`);
      skipped++;
      continue;
    }

    db.prepare(`
      INSERT INTO sellers (email, password, name, cuisine, neighbourhood, dietary_tags, description, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(seller.email, password, seller.name, seller.cuisine, seller.neighbourhood, seller.dietary_tags, seller.description, seller.photo_url);

    console.log(`  ✅  Created: ${seller.name} (${seller.cuisine}, ${seller.neighbourhood})`);
    created++;
  }

  console.log(`\n🎉 Seed complete! Created: ${created}, Skipped: ${skipped}`);
  console.log('\nAll seed accounts use password: password123');
  console.log('\nNote: Replace photo_url values in seed.js with real food images before the demo!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
