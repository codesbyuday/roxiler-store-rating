const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Fetch already executed migrations
    const { rows } = await client.query('SELECT migration_name FROM schema_migrations');
    const executedMigrations = new Set(rows.map(row => row.migration_name));

    // 3. Read migration files from the migrations directory
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // ensures deterministic order like 001_, 002_, etc.

    // 4. Run pending migrations
    for (const file of files) {
      if (executedMigrations.has(file)) {
        continue;
      }

      console.log(`Running migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query('BEGIN');
        
        // Execute the migration SQL
        await client.query(sql);
        
        // Record the migration success
        await client.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
          [file]
        );
        
        await client.query('COMMIT');
        console.log(`✓ Migration ${file} completed successfully.`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`✗ Migration ${file} failed! Rolling back.`);
        throw err;
      }
    }

    console.log('All database migrations completed successfully.');
  } finally {
    client.release();
  }
}

module.exports = runMigrations;
