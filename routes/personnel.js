const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get all personnel
router.get('/', (req, res) => {
    db.getDb().all('SELECT * FROM personnel ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add new personnel
router.post('/', (req, res) => {
    const { name, role, email, phone } = req.body;
    const sql = 'INSERT INTO personnel (name, role, email, phone) VALUES (?, ?, ?, ?)';
    
    db.getDb().run(sql, [name, role, email, phone], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Personnel added successfully' });
    });
});

// Update personnel
router.put('/:id', (req, res) => {
    const { name, role, email, phone } = req.body;
    const sql = 'UPDATE personnel SET name=?, role=?, email=?, phone=? WHERE id=?';
    
    db.getDb().run(sql, [name, role, email, phone, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Personnel updated successfully' });
    });
});

// Delete personnel
router.delete('/:id', (req, res) => {
    db.getDb().run('DELETE FROM personnel WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Personnel deleted successfully' });
    });
});

module.exports = router;