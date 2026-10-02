const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

async function runSeed() {
  const client = await pool.connect();

  try {
    console.log('Starting seed data generation...');
    await client.query('BEGIN');

    // Generate a secure bcrypt hash for seed users
    // Complies with constraint: 8-16 chars, 1 uppercase, 1 special char
    const saltRounds = 10;
    const commonPasswordHash = await bcrypt.hash('Demo@12345', saltRounds);

    // 1. Seed Users (Names must be >= 20 characters per PDF constraints)
    const usersData = [
      { name: 'System Administrator User', email: 'admin@demo.com', role: 'admin', address: '123 Admin Street, Tech City' },
      { name: 'Primary Store Owner Account', email: 'owner@demo.com', role: 'owner', address: '456 Business Blvd, Commerce Town' },
      { name: 'First Normal User Account', email: 'user1@demo.com', role: 'user', address: '789 Consumer Road, Buyer City' },
      { name: 'Second Normal User Account', email: 'user2@demo.com', role: 'user', address: '101 Shopper Ave, Market Town' },
    ];

    const insertedUserIds = {};

    for (const user of usersData) {
      // Idempotent insert using ON CONFLICT DO UPDATE returning id
      const res = await client.query(
        `INSERT INTO users (name, email, password, address, role) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email 
         RETURNING id`,
        [user.name, user.email, commonPasswordHash, user.address, user.role]
      );
      insertedUserIds[user.role + (user.email.includes('2') ? '2' : '1')] = res.rows[0].id;
    }

    // 2. Seed Store
    // Ensure the store is owned by the owner we just created
    const storeOwnerId = insertedUserIds['owner1'];
    let storeId;

    const storeRes = await client.query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (owner_id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      ['Demo Rating Electronics Store', 'contact@demostore.com', '456 Business Blvd, Commerce Town', storeOwnerId]
    );
    storeId = storeRes.rows[0].id;

    // 3. Seed Ratings
    // First user rating (rating: 5)
    await client.query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id) DO NOTHING`,
      [insertedUserIds['user1'], storeId, 5]
    );

    // Second user rating (rating: 4)
    await client.query(
      `INSERT INTO ratings (user_id, store_id, rating) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id) DO NOTHING`,
      [insertedUserIds['user2'], storeId, 4]
    );

    await client.query('COMMIT');
    console.log('✓ Seed data successfully verified and/or inserted.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Seed data generation failed! Rolling back.');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = runSeed;
