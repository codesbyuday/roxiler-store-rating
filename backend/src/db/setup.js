const { testConnection, pool } = require('../config/db');
const runMigrations = require('./migrate');
const runSeed = require('./seed');

async function setup() {
  console.log('========================================');
  console.log(' Starting Database Setup Process...');
  console.log('========================================\n');

  try {
    // 1. Verify PostgreSQL connectivity
    process.stdout.write('Checking database connection... ');
    const dbStatus = await testConnection();
    if (!dbStatus.connected) {
      console.log('FAILED');
      throw new Error(`Database connection failed: ${dbStatus.message}`);
    }
    console.log('OK');

    // 2. Run pending migrations
    console.log('\n--- Running Migrations ---');
    await runMigrations();
    console.log('Migrations: completed');

    // 3. Run idempotent seed logic
    console.log('\n--- Running Seed Data ---');
    await runSeed();
    console.log('Seed: completed');

    // 4. Verify important tables exist
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'stores', 'ratings', 'schema_migrations')
    `);
    
    const tablesFound = rows.map(r => r.table_name);
    console.log('\nTables verified:', tablesFound.join(', '));

    console.log('\n========================================');
    console.log(' Setup: successful');
    console.log('========================================');
    
    process.exit(0);

  } catch (error) {
    console.error('\n========================================');
    console.error(' Setup: FAILED');
    console.error('========================================');
    console.error(error.message || error);
    process.exit(1);
  }
}

setup();
