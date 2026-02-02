const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get all shelves with items
router.get('/', (req, res) => {
    const sql = `SELECT 
                    s.id, s.shelf_code, s.location, s.category, s.max_capacity,
                    COUNT(i.id) as item_count,
                    GROUP_CONCAT(i.name) as item_names
                 FROM shelves s
                 LEFT JOIN inventory i ON i.shelf_id = s.id
                 GROUP BY s.id
                 ORDER BY s.shelf_code`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const shelves = rows.map(shelf => ({
            ...shelf,
            items: shelf.item_names ? shelf.item_names.split(',') : [],
            capacity_percentage: Math.round((shelf.item_count / shelf.max_capacity) * 100)
        }));
        
        res.json(shelves);
    });
});

module.exports = router;