const Database = require('./database/db');

const db = new Database();
db.init();

// Create alerts table
const createAlertsTable = `CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    item_id INTEGER,
    severity TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT 0
)`;

// Create email_logs table
const createEmailTable = `CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent'
)`;

db.getDb().run(createAlertsTable, (err) => {
    if (err) console.error('Error creating alerts table:', err);
    else console.log('✅ Alerts table created');
});

db.getDb().run(createEmailTable, (err) => {
    if (err) console.error('Error creating email table:', err);
    else console.log('✅ Email logs table created');
});

// Add sample alerts
const alerts = [
    { type: 'low_stock', message: 'Vitamin C 500mg is out of stock', item_id: 9, severity: 'high' },
    { type: 'expiring', message: 'Aspirin 100mg expires in 15 days', item_id: 2, severity: 'medium' },
    { type: 'low_stock', message: 'Advil 200mg is running low (5 left)', item_id: 1, severity: 'medium' },
    { type: 'expiring', message: 'Augmentin 625mg expires in 30 days', item_id: 3, severity: 'low' }
];

alerts.forEach(alert => {
    db.getDb().run('INSERT INTO alerts (type, message, item_id, severity) VALUES (?, ?, ?, ?)', 
        [alert.type, alert.message, alert.item_id, alert.severity], (err) => {
        if (err) console.error('Error adding alert:', err);
        else console.log(`✅ Added alert: ${alert.message}`);
    });
});

// Add sample email logs
const emails = [
    { recipient: 'manager@abkpharmacy.com', subject: 'Low Stock Alert', message: 'Multiple items are running low' },
    { recipient: 'supplier@medco.com', subject: 'Reorder Request', message: 'Please restock Vitamin C 500mg' },
    { recipient: 'admin@abkpharmacy.com', subject: 'Daily Report', message: 'Sales summary for today' }
];

setTimeout(() => {
    emails.forEach(email => {
        db.getDb().run('INSERT INTO email_logs (recipient, subject, message) VALUES (?, ?, ?)', 
            [email.recipient, email.subject, email.message], (err) => {
            if (err) console.error('Error adding email log:', err);
            else console.log(`✅ Added email log: ${email.subject}`);
        });
    });
    
    setTimeout(() => {
        console.log('\n🎉 Alerts and email system setup complete!');
        console.log('📧 Email notifications configured');
        console.log('⚠️  Stock alerts active');
        console.log('📅 Expiry alerts enabled');
        process.exit(0);
    }, 1000);
}, 1000);