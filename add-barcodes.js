const Database = require('./database/db');

const db = new Database();
db.init();

// Add barcode column if it doesn't exist
db.getDb().run('ALTER TABLE inventory ADD COLUMN barcode TEXT UNIQUE', (err) => {
    if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding barcode column:', err.message);
    } else {
        console.log('✅ Barcode column added/exists');
    }
    
    // Generate barcodes for existing items
    db.getDb().all('SELECT id, name FROM inventory WHERE barcode IS NULL', (err, rows) => {
        if (err) {
            console.error('Error fetching items:', err);
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
            console.log('\n🎉 Barcodes generated successfully!');
            console.log('📱 Try scanning these sample barcodes:');
            console.log('   • 8901030000001 (Panadol Extra)');
            console.log('   • 8901030000002 (Advil)');
            console.log('   • 8901030000003 (Aspirin)');
            console.log('\n🚀 Go to Scanner tab and test it!');
            process.exit(0);
        }, 2000);
    });
});