const Database = require('./database/db');

const db = new Database();
db.init();

console.log('Setting up shelf management system...');

// Create shelves table
const createShelvesTable = `CREATE TABLE IF NOT EXISTS shelves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shelf_code TEXT UNIQUE NOT NULL,
    location TEXT,
    category TEXT,
    max_capacity INTEGER DEFAULT 100,
    current_stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

db.getDb().run(createShelvesTable, (err) => {
    if (err) {
        console.error('Error creating shelves table:', err.message);
    } else {
        console.log('✅ Shelves table created');
    }
    
    // Add sample shelves
    const shelves = [
        ['A1', 'Main Floor - Left', 'Pain Relief', 120, 85],
        ['A2', 'Main Floor - Left', 'Antibiotics', 80, 45],
        ['B1', 'Main Floor - Center', 'Cold & Flu', 100, 65],
        ['B2', 'Main Floor - Center', 'Vitamins', 150, 95],
        ['C1', 'Main Floor - Right', 'Diabetes', 60, 25],
        ['C2', 'Main Floor - Right', 'Cardiovascular', 90, 55],
        ['D1', 'Back Wall', 'Gastro', 70, 30],
        ['D2', 'Back Wall', 'Allergy', 80, 40]
    ];
    
    shelves.forEach(shelf => {
        const sql = 'INSERT OR IGNORE INTO shelves (shelf_code, location, category, max_capacity, current_stock) VALUES (?, ?, ?, ?, ?)';
        db.getDb().run(sql, shelf, (err) => {
            if (err) {
                console.error(`Error adding shelf ${shelf[0]}:`, err.message);
            } else {
                console.log(`✅ Added shelf: ${shelf[0]} (${shelf[2]})`);
            }
        });
    });
    
    setTimeout(() => {
        console.log('\n🎉 Shelf Management System Setup Complete!');
        console.log('📋 Features Available:');
        console.log('   • 8 shelves with different categories');
        console.log('   • Capacity tracking (low/high alerts)');
        console.log('   • Visual capacity indicators');
        console.log('\n🚀 Go to Shelves tab to manage your pharmacy layout!');
        process.exit(0);
    }, 2000);
});