const Database = require('./database/db');

const db = new Database();
db.init();

console.log('Setting up customer management...');

// Create customers table
const createCustomersTable = `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    date_of_birth TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

db.getDb().run(createCustomersTable, (err) => {
    if (err) {
        console.error('Error creating customers table:', err.message);
    } else {
        console.log('✅ Customers table created');
    }
    
    // Add sample customers
    const customers = [
        ['Ahmed Al-Mansouri', '+971-50-123-4567', 'ahmed.mansouri@email.com', 'Dubai Marina, Dubai', '1985-03-15'],
        ['Fatima Hassan', '+971-55-987-6543', 'fatima.hassan@email.com', 'Jumeirah, Dubai', '1990-07-22'],
        ['Mohammed Ali', '+971-52-456-7890', 'mohammed.ali@email.com', 'Business Bay, Dubai', '1982-11-08'],
        ['Sarah Abdullah', '+971-50-789-1234', 'sarah.abdullah@email.com', 'Downtown Dubai', '1988-05-30'],
        ['Omar Khalil', '+971-56-234-5678', 'omar.khalil@email.com', 'JBR, Dubai', '1975-12-12']
    ];
    
    customers.forEach(customer => {
        const sql = 'INSERT OR IGNORE INTO customers (name, phone, email, address, date_of_birth) VALUES (?, ?, ?, ?, ?)';
        db.getDb().run(sql, customer, (err) => {
            if (err) {
                console.error(`Error adding customer ${customer[0]}:`, err.message);
            } else {
                console.log(`✅ Added customer: ${customer[0]}`);
            }
        });
    });
    
    setTimeout(() => {
        console.log('\n🎉 Customer Management Setup Complete!');
        console.log('👥 Features Available:');
        console.log('   • Customer profiles with contact info');
        console.log('   • Purchase history tracking');
        console.log('   • Total spent calculations');
        console.log('   • Customer relationship management');
        console.log('\n🚀 Go to Customers tab to manage your customers!');
        process.exit(0);
    }, 2000);
});