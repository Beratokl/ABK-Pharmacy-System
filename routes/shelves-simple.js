const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get all shelves
router.get('/', (req, res) => {
    db.getDb().all('SELECT * FROM shelves ORDER BY shelf_code', (err, shelves) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Get items for each shelf
        const promises = shelves.map(shelf => {
            return new Promise((resolve) => {
                db.getDb().all('SELECT name FROM inventory WHERE shelf_id = ?', [shelf.id], (err, items) => {
                    shelf.items = err ? [] : items.map(i => i.name);
                    shelf.item_count = shelf.items.length;
                    shelf.capacity_percentage = Math.round((shelf.item_count / shelf.max_capacity) * 100);
                    resolve(shelf);
                });
            });
        });
        
        Promise.all(promises).then(results => {
            res.json(results);
        });
    });
});

// Get simple alerts
router.get('/alerts', (req, res) => {
    db.getDb().all('SELECT * FROM shelves', (err, shelves) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const alerts = shelves.filter(shelf => {
            const percentage = (shelf.current_stock / shelf.max_capacity) * 100;
            return percentage > 90 || percentage < 10;
        });
        
        res.json(alerts);
    });
});

// Get misplaced items (simplified)
router.get('/misplaced', (req, res) => {
    res.json([]); // Simplified - no misplaced items for now
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

module.exports = router;