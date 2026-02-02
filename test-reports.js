const Database = require('./database/db');

const db = new Database();
db.init();

console.log('Testing reports queries...');

// Test summary query
db.getDb().get("SELECT COUNT(*) as count FROM inventory", (err, row) => {
    if (err) {
        console.error('Inventory count error:', err);
    } else {
        console.log('✅ Inventory count:', row.count);
    }
});

db.getDb().get("SELECT COUNT(*) as count FROM sales", (err, row) => {
    if (err) {
        console.error('Sales count error:', err);
    } else {
        console.log('✅ Sales count:', row.count);
    }
});

db.getDb().get("SELECT COALESCE(SUM(total_amount), 0) as revenue FROM sales", (err, row) => {
    if (err) {
        console.error('Revenue error:', err);
    } else {
        console.log('✅ Total revenue:', row.revenue);
    }
});

setTimeout(() => {
    console.log('Reports test completed!');
    process.exit(0);
}, 1000);