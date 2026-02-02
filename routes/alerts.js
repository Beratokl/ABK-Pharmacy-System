const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get low stock alerts
router.get('/low-stock', (req, res) => {
    const sql = 'SELECT * FROM inventory WHERE quantity <= reorder_level ORDER BY quantity ASC';
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get expiry alerts (items expiring in next 30 days)
router.get('/expiring', (req, res) => {
    const sql = `SELECT * FROM inventory 
                 WHERE expiry_date IS NOT NULL 
                 AND date(expiry_date) <= date('now', '+30 days')
                 ORDER BY expiry_date ASC`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get all alerts
router.get('/', (req, res) => {
    const lowStockSql = 'SELECT *, "low_stock" as alert_type FROM inventory WHERE quantity <= reorder_level';
    const expiringSql = `SELECT *, "expiring" as alert_type FROM inventory 
                         WHERE expiry_date IS NOT NULL 
                         AND date(expiry_date) <= date('now', '+30 days')`;
    
    db.getDb().all(`${lowStockSql} UNION ${expiringSql} ORDER BY quantity ASC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;