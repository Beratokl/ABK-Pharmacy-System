const Database = require('./database/db');

const db = new Database();
db.init();

// Create new inventory table with barcode column
const createNewTable = `CREATE TABLE IF NOT EXISTS inventory_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    barcode TEXT UNIQUE,
    quantity INTEGER DEFAULT 0,
    unit_price REAL,
    supplier TEXT,
    expiry_date TEXT,
    reorder_level INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

// Copy data and add barcodes
db.getDb().serialize(() => {
    db.getDb().run(createNewTable);
    
    db.getDb().run(`INSERT INTO inventory_new (id, name, category, quantity, unit_price, supplier, expiry_date, reorder_level, created_at)
                    SELECT id, name, category, quantity, unit_price, supplier, expiry_date, reorder_level, created_at 
                    FROM inventory`);
    
    db.getDb().run('DROP TABLE inventory');
    db.getDb().run('ALTER TABLE inventory_new RENAME TO inventory');
    
    // Generate barcodes
    db.getDb().all('SELECT id, name FROM inventory', (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        console.log(`Generating barcodes for ${rows.length} items...`);
        
        rows.forEach(item => {
            const barcode = '8901030' + item.id.toString().padStart(5, '0');
            
            db.getDb().run('UPDATE inventory SET barcode = ? WHERE id = ?', [barcode, item.id], (err) => {
                if (err) {
                    console.error(`Error updating ${item.name}:`, err.message);
                } else {
                    console.log(`✅ ${item.name} -> ${barcode}`);
                }
            });
        });
        
        setTimeout(() => {
            console.log('\n🎉 Barcodes added successfully!');
            console.log('📱 Sample barcodes to test:');
            console.log('   • 8901030000001');
            console.log('   • 8901030000002'); 
            console.log('   • 8901030000003');
            process.exit(0);
        }, 2000);
    });
});