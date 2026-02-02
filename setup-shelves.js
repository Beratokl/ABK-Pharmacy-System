const Database = require('./database/db');

const db = new Database();
db.init();

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

// Add shelf_id column to inventory
const addShelfColumn = `ALTER TABLE inventory ADD COLUMN shelf_id INTEGER`;

// Sample shelves data
const shelves = [
    { shelf_code: 'A1', location: 'Main Floor - Left', category: 'Pain Relief', max_capacity: 120, current_stock: 85 },
    { shelf_code: 'A2', location: 'Main Floor - Left', category: 'Antibiotics', max_capacity: 80, current_stock: 45 },
    { shelf_code: 'B1', location: 'Main Floor - Center', category: 'Cold & Flu', max_capacity: 100, current_stock: 65 },
    { shelf_code: 'B2', location: 'Main Floor - Center', category: 'Vitamins', max_capacity: 150, current_stock: 95 },
    { shelf_code: 'C1', location: 'Main Floor - Right', category: 'Diabetes', max_capacity: 60, current_stock: 25 },
    { shelf_code: 'C2', location: 'Main Floor - Right', category: 'Cardiovascular', max_capacity: 90, current_stock: 55 },
    { shelf_code: 'D1', location: 'Back Wall', category: 'Gastro', max_capacity: 70, current_stock: 30 },
    { shelf_code: 'D2', location: 'Back Wall', category: 'Allergy', max_capacity: 80, current_stock: 40 }
];

function setupShelves() {
    console.log('Setting up shelf management system...');
    
    // Create shelves table
    db.getDb().run(createShelvesTable, (err) => {
        if (err) {
            console.error('Error creating shelves table:', err.message);
        } else {
            console.log('✅ Shelves table created');
        }
        
        // Add shelf_id column to inventory
        db.getDb().run(addShelfColumn, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Error adding shelf_id column:', err.message);
            } else {
                console.log('✅ Shelf_id column added to inventory');
            }
            
            // Insert sample shelves
            console.log('Adding sample shelves...');
            shelves.forEach(shelf => {
                const sql = 'INSERT OR IGNORE INTO shelves (shelf_code, location, category, max_capacity, current_stock) VALUES (?, ?, ?, ?, ?)';
                
                db.getDb().run(sql, [shelf.shelf_code, shelf.location, shelf.category, shelf.max_capacity, shelf.current_stock], function(err) {
                    if (err) {
                        console.error(`Error adding shelf ${shelf.shelf_code}:`, err.message);
                    } else {
                        console.log(`✅ Added shelf: ${shelf.shelf_code} (${shelf.category})`);
                    }
                });