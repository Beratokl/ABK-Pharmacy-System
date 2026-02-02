const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get all inventory items
router.get('/', (req, res) => {
    db.getDb().all('SELECT * FROM inventory ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add new item
router.post('/', (req, res) => {
    const { name, category, quantity, unit_price, supplier, expiry_date, reorder_level } = req.body;
    const sql = `INSERT INTO inventory (name, category, quantity, unit_price, supplier, expiry_date, reorder_level) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.getDb().run(sql, [name, category, quantity, unit_price, supplier, expiry_date, reorder_level], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Item added successfully' });
    });
});

// Update item
router.put('/:id', (req, res) => {
    const { name, category, quantity, unit_price, supplier, expiry_date, reorder_level } = req.body;
    const sql = `UPDATE inventory SET name=?, category=?, quantity=?, unit_price=?, supplier=?, expiry_date=?, reorder_level=? WHERE id=?`;
    
    db.getDb().run(sql, [name, category, quantity, unit_price, supplier, expiry_date, reorder_level, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item updated successfully' });
    });
});

// Delete item
router.delete('/:id', (req, res) => {
    db.getDb().run('DELETE FROM inventory WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item deleted successfully' });
    });
});

module.exports = router;