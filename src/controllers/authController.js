const Database = require('../../database/db');
const db = new Database();
db.init();

const login = (req, res) => {
    const { username, password } = req.body;
    
    db.getDb().get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Database error' });
        } else if (user) {
            req.session.authenticated = true;
            req.session.username = username;
            req.session.role = user.role;
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
};

const logout = (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out' });
};

module.exports = { login, logout };