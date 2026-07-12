// seed.js -- Populate the database with sample sellers, buyers, menu items, and orders
// Run with: npm run seed
// All accounts use password: password123

const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const db = require('./database'); // shares the SAME better-sqlite3 connection + schema as server.js

const SEED_SELLERS = [
  {
    email: 'priya@saugahomeeats.test',
    name: "Priya's Kitchen",
    cuisine: 'Punjabi',
    neighbourhood: 'Square One',
    dietary_tags: 'vegetarian,halal',
    description: "Authentic Punjabi home cooking made with love and fresh spices sourced from my local market. Specializing in dal makhani, chole, and weekend tiffin boxes that taste just like mom used to make. Order by Friday for weekend delivery within Square One.",
    photo_url: "/uploads/seed/seller1.jpg",
    menu: [
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils in a creamy tomato butter sauce', price: 12.99 },
      { name: 'Butter Chicken', description: 'Tandoori chicken in a rich tomato-cream gravy, served with rice', price: 14.99 },
      { name: 'Chole Bhature', description: 'Spiced chickpea curry with fluffy fried bread', price: 10.99 },
      { name: 'Weekend Tiffin Box', description: '3 curries, rice, and 4 rotis -- a full home-cooked meal', price: 16.99 },
    ],
  },
  {
    email: 'maria@saugahomeeats.test',
    name: "Maria's Filipino Home",
    cuisine: 'Filipino',
    neighbourhood: 'Erin Mills',
    dietary_tags: '',
    description: "Bringing the flavours of the Philippines to Mississauga -- adobo, sinigang, kare-kare, and lechon kawali made from traditional family recipes. Available for family parties, special occasions, and weekly meal prep. Tray orders accepted with 48 hours notice.",
    photo_url: "/uploads/seed/seller2.jpg",
    menu: [
      { name: 'Chicken Adobo', description: 'Braised chicken in soy, vinegar, and garlic, served with rice', price: 13.99 },
      { name: 'Pork Sinigang', description: 'Tamarind-based sour soup with pork and vegetables', price: 14.99 },
      { name: 'Lechon Kawali', description: 'Crispy pork belly, served with a vinegar dipping sauce', price: 15.99 },
      { name: 'Lumpia (6 pc)', description: 'Crispy Filipino spring rolls with ground pork and vegetables', price: 8.99 },
    ],
  },
  {
    email: 'joy@saugahomeeats.test',
    name: "Auntie Joy's Caribbean",
    cuisine: 'Caribbean',
    neighbourhood: 'Cooksville',
    dietary_tags: 'halal',
    description: "Jerk chicken, oxtail stew, and rice & peas that will transport you straight to Jamaica. Everything is made fresh to order with authentic island seasonings -- no shortcuts, no compromises. Available Fridays and Saturdays for pick-up or local delivery.",
    photo_url: "/uploads/seed/seller3.jpg",
    menu: [
      { name: 'Jerk Chicken', description: 'Smoky, spicy grilled chicken marinated overnight', price: 14.99 },
      { name: 'Oxtail Stew', description: 'Slow-braised oxtail in a rich brown gravy with butter beans', price: 17.99 },
      { name: 'Curry Goat', description: 'Tender goat in a fragrant Caribbean curry, served with rice', price: 16.99 },
      { name: 'Rice & Peas (side)', description: 'Coconut rice with kidney beans and island spices', price: 5.99 },
    ],
  },
  {
    email: 'fatima@saugahomeeats.test',
    name: "Fatima's Sweets & Bakes",
    cuisine: 'Pakistani',
    neighbourhood: 'Meadowvale',
    dietary_tags: 'halal,vegetarian',
    description: "Handcrafted mithai, cookies, and celebration cakes for every occasion. Specialties include gulab jamun, kheer, and custom Eid gift boxes. All baked goods are 100% halal-certified. Minimum 3-day notice for custom orders.",
    photo_url: "/uploads/seed/seller4.jpg",
    menu: [
      { name: 'Gulab Jamun (6 pc)', description: 'Soft milk dumplings soaked in rose-cardamom syrup', price: 7.99 },
      { name: 'Kheer', description: 'Creamy rice pudding with cardamom, saffron, and pistachios', price: 6.99 },
      { name: 'Assorted Mithai Box', description: 'A curated box of 12 traditional sweets', price: 19.99 },
      { name: 'Eid Gift Box', description: 'Premium gift box of mithai and cookies, beautifully packaged', price: 24.99 },
    ],
  },
  {
    email: 'latha@saugahomeeats.test',
    name: "Latha's Tiffin Service",
    cuisine: 'Sri Lankan',
    neighbourhood: 'Mississauga Valley',
    dietary_tags: 'vegetarian,vegan,gluten-free',
    description: "Weekly tiffin subscriptions featuring Sri Lankan home cooking -- kottu roti, dhal curry, and freshly made pol sambol. Vegan and gluten-free options available every day. Subscribe for 5-day or 3-day weekly plans delivered to your door.",
    photo_url: "/uploads/seed/seller5.jpg",
    menu: [
      { name: 'Kottu Roti', description: 'Chopped roti stir-fried with vegetables and spices', price: 13.99 },
      { name: 'Dhal Curry', description: 'Red lentils simmered in coconut milk and curry leaves', price: 9.99 },
      { name: 'String Hoppers (5 pc)', description: 'Steamed rice noodle cakes, served with sambol', price: 8.99 },
      { name: 'Pol Sambol (side)', description: 'Fresh coconut relish with chili and lime', price: 4.99 },
    ],
  },
  {
    email: 'nonna@saugahomeeats.test',
    name: "Nonna Rosa's Kitchen",
    cuisine: 'Italian',
    neighbourhood: 'Port Credit',
    dietary_tags: 'vegetarian',
    description: "Three generations of Italian cooking right here in Port Credit. Fresh pasta made by hand every morning, Sunday sauce slow-simmered for 6 hours, and tiramisu that won our family the Calabria food festival three years running. Portions are generous -- this is true Italian hospitality.",
    photo_url: "/uploads/seed/seller6.jpg",
    menu: [
      { name: 'Fresh Fettuccine with Sunday Sauce', description: 'Handmade pasta with a 6-hour slow-simmered tomato sauce', price: 15.99 },
      { name: 'Homemade Margherita Pizza', description: 'Wood-fired-style crust with San Marzano tomatoes and basil', price: 13.99 },
      { name: 'Caprese Salad', description: 'Fresh mozzarella, tomato, and basil with olive oil', price: 8.99 },
      { name: 'Tiramisu', description: 'Classic espresso-soaked ladyfingers with mascarpone', price: 7.99 },
    ],
  },
  {
    email: 'bintu@saugahomeeats.test',
    name: "Bintu's West African Kitchen",
    cuisine: 'West African',
    neighbourhood: 'Streetsville',
    dietary_tags: 'halal,gluten-free',
    description: "Jollof rice, egusi soup, and suya skewers that bring the bold, rich flavours of West Africa to your table. Made with imported spices and sustainably sourced ingredients. Perfect for family gatherings and office lunches. Orders taken via WhatsApp -- contact button below.",
    photo_url: "/uploads/seed/seller7.jpg",
    menu: [
      { name: 'Jollof Rice', description: 'Smoky tomato rice, a West African classic', price: 12.99 },
      { name: 'Egusi Soup', description: 'Ground melon seed stew with leafy greens and spice', price: 14.99 },
      { name: 'Suya Skewers (4 pc)', description: 'Grilled beef skewers coated in spiced peanut rub', price: 9.99 },
      { name: 'Fried Plantain (side)', description: 'Sweet caramelized plantain slices', price: 4.99 },
    ],
  },
  {
    email: 'meera@saugahomeeats.test',
    name: "Meera's Gujarati Thali",
    cuisine: 'Gujarati',
    neighbourhood: 'Clarkson',
    dietary_tags: 'vegetarian,vegan',
    description: "Full vegetarian Gujarati thali experience delivered to your home -- rotli, dal, shaak, khichdi, and seasonal pickles. Perfect for working families who want a wholesome home-cooked meal without the effort. Thali subscription plans available Monday through Saturday.",
    photo_url: "/uploads/seed/seller8.jpg",
    menu: [
      { name: 'Full Gujarati Thali', description: 'Rotli, dal, shaak, rice, and seasonal pickle -- a complete meal', price: 16.99 },
      { name: 'Dhokla (6 pc)', description: 'Steamed savoury chickpea cakes with a mustard tempering', price: 6.99 },
      { name: 'Thepla (4 pc)', description: 'Spiced flatbread made with fenugreek leaves', price: 5.99 },
      { name: 'Khichdi', description: 'Comforting rice and lentil porridge with ghee', price: 9.99 },
    ],
  },
];

const SEED_BUYERS = [
  { email: 'buyer1@saugahomeeats.test', name: 'Amanda Chen' },
  { email: 'buyer2@saugahomeeats.test', name: 'Devon Williams' },
  { email: 'buyer3@saugahomeeats.test', name: 'Simran Kaur' },
  { email: 'buyer4@saugahomeeats.test', name: 'Marco Rossi' },
];

const SEED_ORDERS = [
  {
    buyerEmail: 'buyer1@saugahomeeats.test',
    sellerEmail: 'priya@saugahomeeats.test',
    items: [{ name: 'Butter Chicken', quantity: 2 }, { name: 'Chole Bhature', quantity: 1 }],
    status: 'Placed',
    notes: '[SEED] No onions please, mild spice if possible.',
  },
  {
    buyerEmail: 'buyer2@saugahomeeats.test',
    sellerEmail: 'maria@saugahomeeats.test',
    items: [{ name: 'Chicken Adobo', quantity: 1 }, { name: 'Lumpia (6 pc)', quantity: 1 }],
    status: 'Accepted',
    notes: '[SEED] Pickup around 6pm works great, thank you!',
  },
  {
    buyerEmail: 'buyer3@saugahomeeats.test',
    sellerEmail: 'bintu@saugahomeeats.test',
    items: [{ name: 'Jollof Rice', quantity: 3 }, { name: 'Suya Skewers (4 pc)', quantity: 2 }],
    status: 'Declined',
    notes: '[SEED] Ordering for a small office lunch, 3 people.',
  },
  {
    buyerEmail: 'buyer4@saugahomeeats.test',
    sellerEmail: 'nonna@saugahomeeats.test',
    items: [{ name: 'Fresh Fettuccine with Sunday Sauce', quantity: 2 }, { name: 'Tiramisu', quantity: 2 }],
    status: 'Placed',
    notes: '[SEED] First time ordering, excited to try this!',
  },
];

async function seed() {
  console.log('Seeding database...\n');

  const password = await bcrypt.hash('password123', 10);

  const seedDir = path.join(__dirname, 'uploads', 'seed');
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
    fs.writeFileSync(
      path.join(seedDir, 'README.txt'),
      'Place real food photos here named seller1.jpg, seller2.jpg... etc.\nUpdate photo_url in seed.js to point to them before the demo.'
    );
  }

  console.log('-- Sellers & Menus --');
  let sellersCreated = 0, sellersSkipped = 0, menuItemsCreated = 0;

  for (const seller of SEED_SELLERS) {
    let sellerRow = db.prepare('SELECT id FROM sellers WHERE email = ?').get(seller.email);

    if (sellerRow) {
      console.log('  SKIP (exists): ' + seller.name);
      sellersSkipped++;
    } else {
      const result = db.prepare(
        'INSERT INTO sellers (email, password, name, cuisine, neighbourhood, dietary_tags, description, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(seller.email, password, seller.name, seller.cuisine, seller.neighbourhood, seller.dietary_tags, seller.description, seller.photo_url);

      sellerRow = { id: result.lastInsertRowid };
      console.log('  CREATED seller: ' + seller.name + ' (' + seller.cuisine + ', ' + seller.neighbourhood + ')');
      sellersCreated++;
    }

    const existingMenuCount = db.prepare('SELECT COUNT(*) as count FROM menu_items WHERE seller_id = ?').get(sellerRow.id).count;
    if (existingMenuCount > 0) {
      console.log('     SKIP menu (already has ' + existingMenuCount + ' items)');
      continue;
    }

    const insertMenuItem = db.prepare(
      'INSERT INTO menu_items (seller_id, name, description, price, available) VALUES (?, ?, ?, ?, 1)'
    );
    for (const item of seller.menu) {
      insertMenuItem.run(sellerRow.id, item.name, item.description, item.price);
      menuItemsCreated++;
    }
    console.log('     ADDED ' + seller.menu.length + ' menu items');
  }

  console.log('\n-- Buyers --');
  let buyersCreated = 0, buyersSkipped = 0;

  for (const buyer of SEED_BUYERS) {
    const existing = db.prepare('SELECT id FROM buyers WHERE email = ?').get(buyer.email);
    if (existing) {
      console.log('  SKIP (exists): ' + buyer.name);
      buyersSkipped++;
      continue;
    }
    db.prepare('INSERT INTO buyers (email, password, name) VALUES (?, ?, ?)').run(buyer.email, password, buyer.name);
    console.log('  CREATED: ' + buyer.name + ' (' + buyer.email + ')');
    buyersCreated++;
  }

  console.log('\n-- Sample Orders --');
  let ordersCreated = 0, ordersSkipped = 0;

  const existingSeedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE notes LIKE '[SEED]%'").get().count;
  if (existingSeedOrders > 0) {
    console.log('  SKIP: ' + existingSeedOrders + ' sample order(s) already exist');
    ordersSkipped = SEED_ORDERS.length;
  } else {
    const insertOrder = db.prepare(
      "INSERT INTO orders (buyer_id, seller_id, status, total_price, notes) VALUES (?, ?, ?, ?, ?)"
    );
    const insertOrderItem = db.prepare(
      'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)'
    );

    for (const order of SEED_ORDERS) {
      const buyer = db.prepare('SELECT id FROM buyers WHERE email = ?').get(order.buyerEmail);
      const sellerRow = db.prepare('SELECT id, name FROM sellers WHERE email = ?').get(order.sellerEmail);

      if (!buyer || !sellerRow) {
        console.log('  WARN: skipped order, buyer or seller not found (' + order.buyerEmail + ' -> ' + order.sellerEmail + ')');
        continue;
      }

      const resolvedItems = [];
      let total = 0;
      let ok = true;
      for (const it of order.items) {
        const menuItem = db.prepare('SELECT * FROM menu_items WHERE seller_id = ? AND name = ?').get(sellerRow.id, it.name);
        if (!menuItem) {
          console.log('  WARN: menu item "' + it.name + '" not found for ' + sellerRow.name);
          ok = false;
          break;
        }
        resolvedItems.push({ menu_item_id: menuItem.id, item_name: menuItem.name, quantity: it.quantity, unit_price: menuItem.price });
        total += menuItem.price * it.quantity;
      }
      if (!ok) continue;

      const tx = db.transaction(() => {
        const result = insertOrder.run(buyer.id, sellerRow.id, order.status, total, order.notes);
        const orderId = result.lastInsertRowid;
        for (const ri of resolvedItems) {
          insertOrderItem.run(orderId, ri.menu_item_id, ri.item_name, ri.quantity, ri.unit_price);
        }
      });
      tx();

      console.log('  CREATED order: ' + order.buyerEmail + ' -> ' + sellerRow.name + ' (' + order.status + ', $' + total.toFixed(2) + ')');
      ordersCreated++;
    }
  }

  console.log('\nSeed complete!');
  console.log('  Sellers -- Created: ' + sellersCreated + ', Skipped: ' + sellersSkipped);
  console.log('  Menu items -- Created: ' + menuItemsCreated);
  console.log('  Buyers -- Created: ' + buyersCreated + ', Skipped: ' + buyersSkipped);
  console.log('  Orders -- Created: ' + ordersCreated + ', Skipped: ' + ordersSkipped);
  console.log('\nAll seed accounts use password: password123');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
