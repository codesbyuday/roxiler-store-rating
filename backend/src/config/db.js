const { Pool } = require('pg');
const config = require('./env');

let pool;

if (config.databaseUrl) {
  pool = new Pool({
    connectionString: config.databaseUrl,
  });
} else {
  pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });
}

// Global error handler for unexpected idle client errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Executes a parameterized query using the connection pool
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 */
const query = (text, params) => pool.query(text, params);

/**
 * Tests database connectivity gracefully without throwing unhandled exceptions
 * @returns {Promise<{ connected: boolean, message: string, timestamp?: string }>}
 */
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    return {
      connected: true,
      message: 'PostgreSQL connection successful',
      timestamp: result.rows[0].current_time,
    };
  } catch (error) {
    return {
      connected: false,
      message: `Database connection unavailable: ${error.message}`,
    };
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
