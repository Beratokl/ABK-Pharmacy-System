const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get all receiving records
router.get('/', (req, res) => {
    const sql = `SELECT r.*, i.name as item_name FROM receiving r 
                 JOIN inventory i ON r.item_id = i.id 
                 ORDER BY r.received_date DESC`;
    
    db.getDb().all(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Record new receiving
router.post('/', (req, res) => {
    const { item_id, quantity, supplier } = req.body;
    
    // Insert receiving record
    const receivingSql = 'INSERT INTO receiving (item_id, quantity, supplier) VALUES (?, ?, ?)';
    db.getDb().run(receivingSql, [item_id, quantity, supplier], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Update inventory quantity
        const updateSql = 'UPDATE inventory SET quantity = quantity + ? WHERE id = ?';
        db.getDb().run(updateSql, [quantity, item_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Receiving recorded successfully' });
        });
    });
});

module.exports = router;