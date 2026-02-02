const fs = require('fs');
const path = require('path');

class MigrationRunner {
    constructor(database) {
        this.db = database;
        this.migrationsPath = path.join(__dirname, 'migrations');
    }

    async runMigrations() {
        try {
            const migrationFiles = fs.readdirSync(this.migrationsPath)
                .filter(file => file.endsWith('.js'));

            for (const file of migrationFiles) {
                const migration = require(path.join(this.migrationsPath, file));
                console.log(`Running migration: ${migration.name}`);
                
                const result = await migration.execute(this.db.getDb());
                console.log(result);
            }
        } catch (error) {
            console.error('Migration error:', error.message);
            throw error;
        }
    }
}

module.exports = MigrationRunner;