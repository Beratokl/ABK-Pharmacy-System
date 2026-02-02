const Database = require('./database/db');
const MigrationRunner = require('./database/migrationRunner');

const db = new Database();
db.init();

const migrationRunner = new MigrationRunner(db);

migrationRunner.runMigrations()
    .then(() => {
        console.log('All migrations completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error.message);
        process.exit(1);
    });