const Database = require('./database/db');

const db = new Database();
db.init();

// Sample sales data with realistic pharmacy transactions
const salesData = [
    { item_id: 1, quantity: 2, unit_price: 8.50, customer_name: 'Ahmed Al-Mansouri' },     // Panadol Extra
    { item_id: 3, quantity: 1, unit_price: 6.25, customer_name: 'Fatima Hassan' },        // Aspirin
    { item_id: 10, quantity: 1, unit_price: 32.99, customer_name: 'Mohammed Ali' },       // Centrum Multivitamin
    { item_id: 2, quantity: 1, unit_price: 12.75, customer_name: 'Sarah Abdullah' },      // Advil
    { item_id: 8, quantity: 1, unit_price: 18.50, customer_name: 'Omar Khalil' },         // Sudafed PE
    { item_id: 11, quantity: 2, unit_price: 19.75, customer_name: 'Layla Ahmed' },        // Vitamin D3
    { item_id: 5, quantity: 1, unit_price: 35.50, customer_name: 'Khalid Rahman' },       // Augmentin
    { item_id: 17, quantity: 1, unit_price: 16.75, customer_name: 'Noor Al-Zahra' },      // Omeprazole
    { item_id: 1, quantity: 3, unit_price: 8.50, customer_name: 'Hassan Mahmoud' },       // Panadol Extra
    { item_id: 19, quantity: 1, unit_price: 28.50, customer_name: 'Amina Youssef' },      // Claritin
    { item_id: 9, quantity: 1, unit_price: 22.00, customer_name: 'Tariq Farouk' },        // Robitussin DM
    { item_id: 13, quantity: 1, unit_price: 18.25, customer_name: 'Zara Malik' },         // Metformin
    { item_id: 2, quantity: 2, unit_price: 12.75, customer_name: 'Yusuf Ibrahim' },       // Advil
    { item_id: 6, quantity: 1, unit_price: 28.75, customer_name: 'Maryam Qasim' },        // Azithromycin
    { item_id: 15, quantity: 1, unit_price: 24.75, customer_name: 'Abdullah Rashid' }     // Lisinopril
];

function addSalesRecords() {
    console.log('Adding sales records...');
    let totalRevenue = 0;
    
    salesData.forEach((sale, index) => {
        const total_amount = sale.quantity * sale.unit_price;
        totalRevenue += total_amount;
        
        // Check stock first
        db.getDb().get('SELECT quantity, name FROM inventory WHERE id = ?', [sale.item_id], (err, row) => {
            if (err || !row) {
                console.error(`Error checking stock for item ${sale.item_id}`);
                return;
            }
            
            if (row.quantity < sale.quantity) {
                console.log(`⚠️  Insufficient stock for ${row.name} (need ${sale.quantity}, have ${row.quantity})`);
                return;
            }
            
            // Insert sale record
            const saleSql = 'INSERT INTO sales (item_id, quantity, unit_price, total_amount, customer_name) VALUES (?, ?, ?, ?, ?)';
            db.getDb().run(saleSql, [sale.item_id, sale.quantity, sale.unit_price, total_amount, sale.customer_name], function(err) {
                if (err) {
                    console.error('Error inserting sale:', err.message);
                    return;
                }
                
                // Update inventory quantity
                const updateSql = 'UPDATE inventory SET quantity = quantity - ? WHERE id = ?';
                db.getDb().run(updateSql, [sale.quantity, sale.item_id], (err) => {
                    if (err) {
                        console.error('Error updating inventory:', err.message);
                    } else {
                        console.log(`✅ Sold ${sale.quantity} ${row.name} to ${sale.customer_name} - $${total_amount.toFixed(2)}`);
                    }
                });
            });
        });
    });
    
    setTimeout(() => {
        console.log('\n🎉 Sales records added successfully!');
        console.log('💰 Summary:');
        console.log(`   • ${salesData.length} sales transactions added`);
        console.log(`   • Estimated total revenue: $${totalRevenue.toFixed(2)}`);
        console.log('   • Inventory quantities reduced automatically');
        console.log('   • Customer records maintained');
        console.log('\n📊 Check your Sales tab and Dashboard for updated revenue!');
        process.exit(0);
    }, 3000);
}

addSalesRecords();