const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Simple summary report
router.get('/summary', (req, res) => {
    db.getDb().get('SELECT COUNT(*) as total_items FROM inventory', (err, inventory) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.getDb().get('SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_revenue FROM sales', (err, sales) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                total_items: inventory.total_items || 0,
                total_sales: sales.total_sales || 0,
                total_revenue: sales.total_revenue || 0,
                inventory_value: 0
            });
        });
    });
});

// Top selling items
router.get('/top-items', (req, res) => {
    const sql = `SELECT i.name, SUM(s.quantity) as total_sold, SUM(s.total_amount) as total_revenue
                 FROM sales s
                 JOIN inventory i ON s.item_id = i.id
                 GROUP BY s.item_id
                 ORDER BY total_sold DESC
                 LIMIT 5`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

module.exports = router;