const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get all sales records
router.get('/', (req, res) => {
    const sql = `SELECT s.*, i.name as item_name FROM sales s 
                 JOIN inventory i ON s.item_id = i.id 
                 ORDER BY s.sale_date DESC`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Record new sale
router.post('/', (req, res) => {
    const { item_id, quantity, unit_price, customer_name } = req.body;
    const total_amount = quantity * unit_price;
    
    // Check if enough stock available
    db.getDb().get('SELECT quantity FROM inventory WHERE id = ?', [item_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Item not found' });
        if (row.quantity < quantity) return res.status(400).json({ error: 'Insufficient stock' });
        
        // Insert sale record
        const saleSql = 'INSERT INTO sales (item_id, quantity, unit_price, total_amount, customer_name) VALUES (?, ?, ?, ?, ?)';
        db.getDb().run(saleSql, [item_id, quantity, unit_price, total_amount, customer_name], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Update inventory quantity
            const updateSql = 'UPDATE inventory SET quantity = quantity - ? WHERE id = ?';
            db.getDb().run(updateSql, [quantity, item_id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, message: 'Sale recorded successfully', total_amount });
            });
        });
    });
});

// Get sales summary
router.get('/summary', (req, res) => {
    const sql = `SELECT 
                    COUNT(*) as total_sales,
                    COALESCE(SUM(total_amount), 0) as total_revenue,
                    COALESCE(SUM(quantity), 0) as total_items_sold
                 FROM sales 
                 WHERE DATE(sale_date) = DATE('now')`;
    
    db.getDb().get(sql, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || { total_sales: 0, total_revenue: 0, total_items_sold: 0 });
    });
});

module.exports = router;