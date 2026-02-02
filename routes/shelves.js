const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get all shelves with capacity info
router.get('/', (req, res) => {
    const sql = `SELECT s.*, 
                 COUNT(i.id) as item_count,
                 GROUP_CONCAT(i.name, ', ') as items,
                 ROUND((COUNT(i.id) * 100.0 / s.max_capacity), 2) as capacity_percentage
                 FROM shelves s
                 LEFT JOIN inventory i ON i.shelf_id = s.id
                 GROUP BY s.id
                 ORDER BY s.shelf_code`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get capacity alerts
router.get('/alerts', (req, res) => {
    const sql = `SELECT s.*, 
                 COUNT(i.id) as actual_items,
                 ROUND((COUNT(i.id) * 100.0 / s.max_capacity), 2) as capacity_percentage,
                 CASE 
                   WHEN COUNT(i.id) >= s.max_capacity * 0.9 THEN 'high'
                   WHEN COUNT(i.id) <= s.max_capacity * 0.1 THEN 'low'
                   ELSE 'normal'
                 END as alert_type
                 FROM shelves s
                 LEFT JOIN inventory i ON i.shelf_id = s.id
                 GROUP BY s.id
                 HAVING COUNT(i.id) >= s.max_capacity * 0.9 
                    OR COUNT(i.id) <= s.max_capacity * 0.1
                 ORDER BY capacity_percentage DESC`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get misplaced items
router.get('/misplaced', (req, res) => {
    const sql = `SELECT i.*, s.shelf_code as current_shelf, 
                 correct_s.shelf_code as correct_shelf
                 FROM inventory i
                 LEFT JOIN shelves s ON i.shelf_id = s.id
                 LEFT JOIN shelves correct_s ON correct_s.category = i.category
                 WHERE i.shelf_id IS NULL OR (i.shelf_id != correct_s.id AND correct_s.id IS NOT NULL)
                 ORDER BY i.name`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add new shelf
router.post('/', (req, res) => {
    const { shelf_code, location, category, max_capacity } = req.body;
    const sql = 'INSERT INTO shelves (shelf_code, location, category, max_capacity) VALUES (?, ?, ?, ?)';
    
    db.getDb().run(sql, [shelf_code, location, category, max_capacity || 100], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Shelf added successfully' });
    });
});

// Update shelf capacity
router.put('/:id/capacity', (req, res) => {
    const { current_stock } = req.body;
    const sql = 'UPDATE shelves SET current_stock = ? WHERE id = ?';
    
    db.getDb().run(sql, [current_stock, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Shelf capacity updated' });
    });
});

module.exports = router;