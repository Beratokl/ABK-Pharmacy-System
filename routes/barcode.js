const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Search item by barcode
router.get('/scan/:barcode', (req, res) => {
    const { barcode } = req.params;
    
    db.getDb().get('SELECT * FROM inventory WHERE barcode = ?', [barcode], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Item not found' });
        res.json(row);
    });
});

// Generate barcode for item
router.post('/generate/:itemId', (req, res) => {
    const { itemId } = req.params;
    const barcode = '8901030' + itemId.toString().padStart(5, '0'); // Simple barcode generation
    
    db.getDb().run('UPDATE inventory SET barcode = ? WHERE id = ?', [barcode, itemId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ barcode, message: 'Barcode generated successfully' });
    });
});

module.exports = router;