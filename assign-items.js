const Database = require('./database/db');

const db = new Database();
db.init();

console.log('Assigning items to shelves...');

// First, add shelf_id column to inventory if it doesn't exist
db.getDb().run('ALTER TABLE inventory ADD COLUMN shelf_id INTEGER', (err) => {
    if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding shelf_id column:', err.message);
        return;
    }
    console.log('✅ Shelf_id column ready');
    
    // Get all items and shelves
    db.getDb().all('SELECT id, name, category FROM inventory', (err, items) => {
        if (err) {
            console.error('Error getting items:', err);
            return;
        }
        
        db.getDb().all('SELECT id, shelf_code, category FROM shelves', (err, shelves) => {
            if (err) {
                console.error('Error getting shelves:', err);
                return;
            }
            
            console.log(`Found ${items.length} items and ${shelves.length} shelves`);
            
            // Assign each item to appropriate shelf
            items.forEach(item => {
                const shelf = shelves.find(s => s.category === item.category);
                
                if (shelf) {
                    db.getDb().run('UPDATE inventory SET shelf_id = ? WHERE id = ?', [shelf.id, item.id], (err) => {
                        if (err) {
                            console.error(`Error assigning ${item.name}:`, err.message);
                        } else {
                            console.log(`✅ ${item.name} → Shelf ${shelf.shelf_code} (${shelf.category})`);
                        }
                    });
                } else {
                    console.log(`⚠️  No shelf found for ${item.name} (${item.category})`);
                }
            });
            
            setTimeout(() => {
                console.log('\n🎉 Items assigned to shelves successfully!');
                console.log('📦 Your inventory is now organized by shelves:');
                console.log('   • Pain Relief items → Shelf A1');
                console.log('   • Antibiotics → Shelf A2');
                console.log('   • Cold & Flu → Shelf B1');
                console.log('   • Vitamins → Shelf B2');
                console.log('   • Diabetes → Shelf C1');
                console.log('   • Cardiovascular → Shelf C2');
                console.log('   • Gastro → Shelf D1');
                console.log('   • Allergy → Shelf D2');
                console.log('\n🚀 Check Shelves tab to see organized inventory!');
                process.exit(0);
            }, 3000);
        });
    });
});