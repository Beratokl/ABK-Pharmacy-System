const Database = require('./database/db');

const db = new Database();
db.init();

// Sample receiving data - restocking low inventory items
const receivingData = [
    { item_id: 2, quantity: 50, supplier: 'Pfizer' },        // Advil (was 5)
    { item_id: 4, quantity: 30, supplier: 'Sandoz' },       // Amoxicillin (was 8)
    { item_id: 7, quantity: 25, supplier: 'GSK' },          // Panadol Cold & Flu (was 3)
    { item_id: 12, quantity: 40, supplier: 'Blackmores' },  // Vitamin C (was 2)
    { item_id: 16, quantity: 35, supplier: 'Pfizer' },      // Amlodipine (was 7)
    { item_id: 18, quantity: 20, supplier: 'Reckitt' },     // Gaviscon (was 1)
    { item_id: 20, quantity: 30, supplier: 'Johnson & Johnson' }, // Zyrtec (was 4)
    { item_id: 1, quantity: 100, supplier: 'GSK' },         // Panadol Extra (restock)
    { item_id: 10, quantity: 50, supplier: 'Nature Made' }, // Vitamin D3 (restock)
    { item_id: 15, quantity: 60, supplier: 'Lupin' }        // Lisinopril (restock)
];

function addReceivingRecords() {
    console.log('Adding receiving records...');
    
    receivingData.forEach((record, index) => {
        // Insert receiving record
        const receivingSql = 'INSERT INTO receiving (item_id, quantity, supplier) VALUES (?, ?, ?)';
        db.getDb().run(receivingSql, [record.item_id, record.quantity, record.supplier], function(err) {
            if (err) {
                console.error('Error inserting receiving record:', err.message);
                return;
            }
            
            // Update inventory quantity
            const updateSql = 'UPDATE inventory SET quantity = quantity + ? WHERE id = ?';
            db.getDb().run(updateSql, [record.quantity, record.item_id], (err) => {
                if (err) {
                    console.error('Error updating inventory:', err.message);
                } else {
                    // Get item name for confirmation
                    db.getDb().get('SELECT name FROM inventory WHERE id = ?', [record.item_id], (err, row) => {
                        if (!err && row) {
                            console.log(`✅ Received ${record.quantity} units of ${row.name} from ${record.supplier}`);
                        }
                    });
                }
            });
        });
    });
    
    setTimeout(() => {
        console.log('\n🎉 Receiving records added successfully!');
        console.log('📦 Summary:');
        console.log(`   • ${receivingData.length} receiving records added`);
        console.log('   • Low stock items have been restocked');
        console.log('   • Inventory quantities updated automatically');
        console.log('\n📊 Check your dashboard - alerts should be reduced!');
        process.exit(0);
    }, 2000);
}

addReceivingRecords();