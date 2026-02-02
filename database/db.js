const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    init() {
        const dbPath = path.join(__dirname, 'pharmacy.db');
        this.db = new sqlite3.Database(dbPath);
        this.createTables();
    }

    createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT,
                barcode TEXT UNIQUE,
                quantity INTEGER DEFAULT 0,
                unit_price REAL,
                supplier TEXT,
                expiry_date TEXT,
                reorder_level INTEGER DEFAULT 10,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS personnel (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT,
                email TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS receiving (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER,
                quantity INTEGER,
                received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                supplier TEXT,
                FOREIGN KEY (item_id) REFERENCES inventory (id)
            )`,
            `CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER,
                quantity INTEGER,
                unit_price REAL,
                total_amount REAL,
                customer_name TEXT,
                sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (item_id) REFERENCES inventory (id)
            )`,
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'technician',
                name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS shelves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shelf_code TEXT UNIQUE NOT NULL,
                location TEXT,
                category TEXT,
                max_capacity INTEGER DEFAULT 100,
                current_stock INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                address TEXT,
                date_of_birth TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        tables.forEach(sql => {
            this.db.run(sql);
        });
    }

    getDb() {
        return this.db;
    }
}

module.exports = Database;