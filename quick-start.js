const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'pharmacy-secret',
    resave: false,
    saveUninitialized: true
}));

// Direct login bypass
app.get('/bypass-login', (req, res) => {
    req.session.authenticated = true;
    req.session.username = 'admin';
    req.session.role = 'admin';
    res.redirect('/');
});

// Main routes
app.use('/api', require('./routes/inventory'));
app.use('/api', require('./routes/sales'));
app.use('/api', require('./routes/reports'));

app.get('/', (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/bypass-login');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3002, () => {
    console.log('🚀 Pharmacy system running on http://localhost:3002');
    console.log('🔓 Auto-login enabled - no credentials needed');
});