const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get financial summary
router.get('/summary', (req, res) => {
    const queries = {
        daily_revenue: "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM sales WHERE DATE(sale_date) = DATE('now')",
        monthly_revenue: "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM sales WHERE strftime('%Y-%m', sale_date) = strftime('%Y-%m', 'now')",
        total_revenue: "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM sales",
        inventory_value: "SELECT COALESCE(SUM(quantity * unit_price), 0) as value FROM inventory",
        total_transactions: "SELECT COUNT(*) as count FROM sales"
    };
    
    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, sql]) => {
        db.getDb().get(sql, (err, row) => {
            results[key] = err ? 0 : Object.values(row)[0];
            completed++;
            
            if (completed === total) {
                res.json(results);
            }
        });
    });
});

// Get daily sales for chart
router.get('/daily-sales', (req, res) => {
    const sql = `SELECT 
                    DATE(sale_date) as date,
                    COALESCE(SUM(total_amount), 0) as revenue,
                    COUNT(*) as transactions
                 FROM sales 
                 WHERE DATE(sale_date) >= DATE('now', '-7 days')
                 GROUP BY DATE(sale_date)
                 ORDER BY date DESC`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get top selling items by revenue
router.get('/top-revenue', (req, res) => {
    const sql = `SELECT 
                    i.name,
                    SUM(s.total_amount) as revenue,
                    SUM(s.quantity) as units_sold,
                    COUNT(s.id) as transactions
                 FROM sales s
                 JOIN inventory i ON s.item_id = i.id
                 GROUP BY s.item_id
                 ORDER BY revenue DESC
                 LIMIT 5`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get profit analysis
router.get('/profit', (req, res) => {
    const sql = `SELECT 
                    i.name,
                    i.unit_price as cost,
                    AVG(s.unit_price) as avg_selling_price,
                    SUM(s.quantity) as units_sold,
                    SUM(s.total_amount) as revenue,
                    SUM((s.unit_price - i.unit_price) * s.quantity) as profit
                 FROM sales s
                 JOIN inventory i ON s.item_id = i.id
                 GROUP BY s.item_id
                 ORDER BY profit DESC
                 LIMIT 10`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;