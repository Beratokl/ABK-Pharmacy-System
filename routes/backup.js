const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Export database
router.get('/export', (req, res) => {
    const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {}
    };
    
    const tables = ['inventory', 'personnel', 'sales', 'receiving'];
    let completed = 0;
    
    tables.forEach(table => {
        db.getDb().all(`SELECT * FROM ${table}`, (err, rows) => {
            if (err) {
                console.error(`Error backing up ${table}:`, err);
                backup.data[table] = [];
            } else {
                backup.data[table] = rows;
            }
            
            completed++;
            if (completed === tables.length) {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=abk-pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`);
                res.json(backup);
            }
        });
    });
});

// Get backup info
router.get('/info', (req, res) => {
    const queries = [
        'SELECT COUNT(*) as count FROM inventory',
        'SELECT COUNT(*) as count FROM sales',
        'SELECT COUNT(*) as count FROM personnel',
        'SELECT COUNT(*) as count FROM receiving'
    ];
    
    const results = {};
    let completed = 0;
    
    queries.forEach((query, index) => {
        const table = ['inventory', 'sales', 'personnel', 'receiving'][index];
        db.getDb().get(query, (err, row) => {
            results[table] = err ? 0 : row.count;
            completed++;
            
            if (completed === queries.length) {
                res.json({
                    last_backup: 'Never',
                    total_records: Object.values(results).reduce((sum, count) => sum + count, 0),
                    breakdown: results
                });
            }
        });
    });
});

module.exports = router;