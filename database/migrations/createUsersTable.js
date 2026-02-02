const createUsersTable = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'technician',
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

module.exports = {
    name: 'createUsersTable',
    query: createUsersTable,
    execute: (db) => {
        return new Promise((resolve, reject) => {
            db.run(createUsersTable, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve('✅ Users table created successfully!');
                }
            });
        });
    }
};