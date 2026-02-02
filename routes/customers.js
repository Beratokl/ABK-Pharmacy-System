const express = require('express');
const router = express.Router();
const Database = require('../database/db');

const db = new Database();
db.init();

// Get all customers
router.get('/', (req, res) => {
    db.getDb().all('SELECT * FROM customers ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get customer with purchase history
router.get('/:id', (req, res) => {
    const customerId = req.params.id;
    
    // Get customer details
    db.getDb().get('SELECT * FROM customers WHERE id = ?', [customerId], (err, customer) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        
        // Get purchase history
        const salesSql = `SELECT s.*, i.name as item_name 
                         FROM sales s 
                         JOIN inventory i ON s.item_id = i.id 
                         WHERE s.customer_name = ? 
                         ORDER BY s.sale_date DESC`;
        
        db.getDb().all(salesSql, [customer.name], (err, purchases) => {
            if (err) return res.status(500).json({ error: err.message });
            
            customer.purchases = purchases || [];
            customer.total_spent = purchases.reduce((sum, p) => sum + p.total_amount, 0);
            customer.total_purchases = purchases.length;
            
            res.json(customer);
        });
    });
});

// Add new customer
router.post('/', (req, res) => {
    const { name, phone, email, address, date_of_birth } = req.body;
    const sql = 'INSERT INTO customers (name, phone, email, address, date_of_birth) VALUES (?, ?, ?, ?, ?)';
    
    db.getDb().run(sql, [name, phone, email, address, date_of_birth], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Customer added successfully' });
    });
});

// Update customer
router.put('/:id', (req, res) => {
    const { name, phone, email, address, date_of_birth } = req.body;
    const sql = 'UPDATE customers SET name=?, phone=?, email=?, address=?, date_of_birth=? WHERE id=?';
    
    db.getDb().run(sql, [name, phone, email, address, date_of_birth, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer updated successfully' });
    });
});

// Delete customer
router.delete('/:id', (req, res) => {
    db.getDb().run('DELETE FROM customers WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer deleted successfully' });
    });
});

module.exports = router;