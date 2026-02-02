const Database = require('./database/db');

const db = new Database();
db.init();

console.log('Testing login system...');

// Check if users exist
db.getDb().all('SELECT username, role, name FROM users', (err, rows) => {
    if (err) {
        console.error('Error checking users:', err);
    } else {
        console.log('Users in database:', rows);
    }
});

// Test login
db.getDb().get('SELECT * FROM users WHERE username = ? AND password = ?', ['admin', 'admin123'], (err, user) => {
    if (err) {
        console.error('Login test error:', err);
    } else if (user) {
        console.log('✅ Login test successful for admin');
    } else {
        console.log('❌ Login test failed for admin');
    }
    
    setTimeout(() => process.exit(0), 1000);
});