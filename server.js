const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const Database = require('./database/db');
const { requireAuth } = require('./src/middleware/auth');
const inventoryRoutes = require('./routes/inventory');
const receivingRoutes = require('./routes/receiving');
const alertRoutes = require('./routes/alerts');
const personnelRoutes = require('./routes/personnel');
const salesRoutes = require('./routes/sales');
const barcodeRoutes = require('./routes/barcode');
const authRoutes = require('./routes/auth');
const backupRoutes = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'abk-pharmacy-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const db = new Database();
db.init();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', requireAuth, inventoryRoutes);
app.use('/api/receiving', requireAuth, receivingRoutes);
app.use('/api/alerts', requireAuth, alertRoutes);
app.use('/api/personnel', requireAuth, personnelRoutes);
app.use('/api/sales', requireAuth, salesRoutes);
app.use('/api/barcode', requireAuth, barcodeRoutes);
app.use('/api/backup', requireAuth, backupRoutes);

// Serve login page or dashboard
app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
    console.log(`ABK Pharmacy System running on port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}`);
});