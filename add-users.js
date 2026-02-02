const Database = require('./database/db');

const db = new Database();
db.init();

const defaultUsers = [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator' },
    { username: 'pharmacist', password: 'pharma123', role: 'pharmacist', name: 'Dr. Sarah Ahmed' },
    { username: 'tech', password: 'tech123', role: 'technician', name: 'Mohammed Al-Rashid' }
];

function addDefaultUsers() {
    console.log('Adding default users...');
    
    defaultUsers.forEach(user => {
        const sql = 'INSERT OR IGNORE INTO users (username, password, role, name) VALUES (?, ?, ?, ?)';
        
        db.getDb().run(sql, [user.username, user.password, user.role, user.name], function(err) {
            if (err) {
                console.error('Error adding user:', user.username, err.message);
            } else {
                console.log(`✅ Added user: ${user.username} (${user.role})`);
            }
        });
    });
    
    setTimeout(() => {
        console.log('\n🎉 Default users added successfully!');
        console.log('🔐 Login Credentials:');
        console.log('   Admin: admin / admin123');
        console.log('   Pharmacist: pharmacist / pharma123');
        console.log('   Technician: tech / tech123');
        console.log('\n🚀 Start your server and visit the login page!');
        process.exit(0);
    }, 1000);
}

addDefaultUsers();