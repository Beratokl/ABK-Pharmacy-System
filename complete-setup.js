const Database = require('./database/db');
const fs = require('fs');

// Delete existing database
if (fs.existsSync('./database/pharmacy.db')) {
    fs.unlinkSync('./database/pharmacy.db');
    console.log('🗑️  Old database deleted');
}

const db = new Database();
db.init();

// Create all tables
const tables = {
    inventory: `CREATE TABLE inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        quantity INTEGER DEFAULT 0,
        price REAL,
        cost REAL,
        supplier TEXT,
        barcode TEXT,
        expiry_date DATE,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    sales: `CREATE TABLE sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        customer_name TEXT,
        quantity INTEGER,
        unit_price REAL,
        total_amount REAL,
        sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES inventory (id)
    )`,
    
    customers: `CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        total_spent REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    alerts: `CREATE TABLE alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        item_id INTEGER,
        severity TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT 0
    )`,
    
    users: `CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'technician',
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
};

// Create tables
Object.entries(tables).forEach(([name, sql]) => {
    db.getDb().run(sql, (err) => {
        if (err) console.error(`Error creating ${name}:`, err);
        else console.log(`✅ ${name} table created`);
    });
});

// Add data
setTimeout(() => {
    // Add inventory
    const items = [
        ['Advil 200mg', 'Pain Relief', 50, 8.50, 5.00, 'PharmaCorp', '123456789', '2025-12-31', 'A1'],
        ['Aspirin 100mg', 'Pain Relief', 30, 12.75, 8.00, 'MedSupply', '987654321', '2024-06-15', 'A2'],
        ['Vitamin C 500mg', 'Vitamins', 0, 15.99, 10.00, 'HealthPlus', '456789123', '2025-08-20', 'B1'],
        ['Panadol Extra', 'Pain Relief', 25, 14.50, 9.50, 'GSK', '789123456', '2025-03-10', 'A3']
    ];
    
    items.forEach(item => {
        db.getDb().run('INSERT INTO inventory (name, category, quantity, price, cost, supplier, barcode, expiry_date, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            item, (err) => {
            if (err) console.error('Error adding item:', err);
            else console.log(`✅ Added: ${item[0]}`);
        });
    });
    
    // Add sales
    const sales = [
        [1, 'Ahmed Ali', 2, 8.50, 17.00],
        [2, 'Sara Hassan', 1, 12.75, 12.75],
        [4, 'Omar Khalil', 3, 14.50, 43.50]
    ];
    
    sales.forEach(sale => {
        db.getDb().run('INSERT INTO sales (item_id, customer_name, quantity, unit_price, total_amount) VALUES (?, ?, ?, ?, ?)', 
            sale, (err) => {
            if (err) console.error('Error adding sale:', err);
            else console.log(`✅ Sale: ${sale[4]} to ${sale[1]}`);
        });
    });
    
    // Add customers
    const customers = [
        ['Ahmed Ali', '+971501234567', 'ahmed@email.com', 'Dubai Marina'],
        ['Sara Hassan', '+971509876543', 'sara@email.com', 'Jumeirah'],
        ['Omar Khalil', '+971505555555', 'omar@email.com', 'Downtown']
    ];
    
    customers.forEach(customer => {
        db.getDb().run('INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)', 
            customer, (err) => {
            if (err) console.error('Error adding customer:', err);
            else console.log(`✅ Customer: ${customer[0]}`);
        });
    });
    
    // Add alerts
    const alerts = [
        ['low_stock', 'Vitamin C 500mg is out of stock', 3, 'high'],
        ['expiring', 'Aspirin 100mg expires in 6 months', 2, 'medium']
    ];
    
    alerts.forEach(alert => {
        db.getDb().run('INSERT INTO alerts (type, message, item_id, severity) VALUES (?, ?, ?, ?)', 
            alert, (err) => {
            if (err) console.error('Error adding alert:', err);
            else console.log(`✅ Alert: ${alert[1]}`);
        });
    });
    
    // Add users
    const users = [
        ['admin', 'admin123', 'admin', 'Administrator'],
        ['pharmacist', 'pharma123', 'pharmacist', 'Dr. Sarah Ahmed'],
        ['tech', 'tech123', 'technician', 'Mohammed Al-Rashid']
    ];
    
    users.forEach(user => {
        db.getDb().run('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)', 
            user, (err) => {
            if (err) console.error('Error adding user:', err);
            else console.log(`✅ User: ${user[0]}`);
        });
    });
    
    setTimeout(() => {
        console.log('\n🎉 COMPLETE DATABASE SETUP FINISHED!');
        console.log('📊 Inventory: 4 items (1 out of stock)');
        console.log('💰 Sales: $73.25 revenue from 3 transactions');
        console.log('👥 Customers: 3 customers with contact info');
        console.log('⚠️  Alerts: 2 active alerts');
        console.log('👤 Users: admin/admin123, pharmacist/pharma123, tech/tech123');
        process.exit(0);
    }, 2000);
}, 1000);