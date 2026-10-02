const { query } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async () => {
  const result = await query(`
    SELECT 
      (SELECT COUNT(*) FROM users) AS "totalUsers",
      (SELECT COUNT(*) FROM stores) AS "totalStores",
      (SELECT COUNT(*) FROM ratings) AS "totalRatings"
  `);
  return {
    totalUsers: parseInt(result.rows[0].totalUsers, 10),
    totalStores: parseInt(result.rows[0].totalStores, 10),
    totalRatings: parseInt(result.rows[0].totalRatings, 10)
  };
};

/**
 * Create a new user (Admin functionality)
 */
const createUser = async (userData) => {
  const { name, email, password, address, role } = userData;
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await query(
    `INSERT INTO users (name, email, password, address, role) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, address, role, created_at`,
    [name, email, hashedPassword, address || null, role]
  );

  return result.rows[0];
};

/**
 * Check if user exists and get role
 */
const getUserRoleById = async (id) => {
  const result = await query('SELECT role FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

/**
 * Create a new store
 */
const createStore = async (storeData) => {
  const { name, email, address, ownerId } = storeData;
  
  const result = await query(
    `INSERT INTO stores (name, email, address, owner_id) 
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id, created_at`,
    [name, email, address, ownerId]
  );

  return result.rows[0];
};

/**
 * Get filtered and sorted list of users
 */
const getUsers = async (filters, sortBy, order) => {
  const params = [];
  let sql = `SELECT id, name, email, address, role FROM users WHERE 1=1`;

  // Filtering
  if (filters.name) {
    params.push(`%${filters.name}%`);
    sql += ` AND name ILIKE $${params.length}`;
  }
  if (filters.email) {
    params.push(`%${filters.email}%`);
    sql += ` AND email ILIKE $${params.length}`;
  }
  if (filters.address) {
    params.push(`%${filters.address}%`);
    sql += ` AND address ILIKE $${params.length}`;
  }
  if (filters.role) {
    params.push(filters.role);
    sql += ` AND role = $${params.length}`;
  }

  // Sorting
  const allowedSorts = ['name', 'email', 'address', 'role', 'id'];
  const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'id';
  const safeOrder = order === 'desc' ? 'DESC' : 'ASC';

  sql += ` ORDER BY ${safeSort} ${safeOrder}`;

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get specific user details
 */
const getUserDetails = async (userId) => {
  const result = await query(
    `SELECT id, name, email, address, role FROM users WHERE id = $1`,
    [userId]
  );
  const user = result.rows[0];

  if (!user) return null;

  if (user.role === 'owner') {
    // Find associated store and rating if any
    const storeRes = await query(
      `SELECT s.id, s.name, COALESCE(AVG(r.rating), 0) AS "overallRating"
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [userId]
    );
    if (storeRes.rows.length > 0) {
      user.store = {
        id: storeRes.rows[0].id,
        name: storeRes.rows[0].name,
        overallRating: parseFloat(storeRes.rows[0].overallRating)
      };
    } else {
      user.store = null; // No store assigned yet
    }
  }

  return user;
};

/**
 * Get filtered and sorted list of stores with average ratings
 */
const getStores = async (filters, sortBy, order) => {
  const params = [];
  let sql = `
    SELECT 
      s.id, 
      s.name, 
      s.email, 
      s.address, 
      COALESCE(AVG(r.rating), 0) AS "overallRating"
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;

  // Filtering
  if (filters.name) {
    params.push(`%${filters.name}%`);
    sql += ` AND s.name ILIKE $${params.length}`;
  }
  if (filters.email) {
    params.push(`%${filters.email}%`);
    sql += ` AND s.email ILIKE $${params.length}`;
  }
  if (filters.address) {
    params.push(`%${filters.address}%`);
    sql += ` AND s.address ILIKE $${params.length}`;
  }

  sql += ` GROUP BY s.id`;

  // Sorting
  // We allow sorting by overallRating, name, email, address, id
  const allowedSorts = ['name', 'email', 'address', 'overallRating', 'id'];
  let safeSort = allowedSorts.includes(sortBy) ? sortBy : 'id';
  
  // Wrap in quotes if it's the alias
  if (safeSort === 'overallRating') {
    safeSort = '"overallRating"';
  } else {
    safeSort = `s.${safeSort}`;
  }

  const safeOrder = order === 'desc' ? 'DESC' : 'ASC';
  sql += ` ORDER BY ${safeSort} ${safeOrder}`;

  const result = await query(sql, params);
  
  // Cast overallRating to float (pg returns NUMERIC as string by default for AVG)
  return result.rows.map(row => ({
    ...row,
    overallRating: parseFloat(row.overallRating)
  }));
};

module.exports = {
  getDashboardStats,
  createUser,
  getUserRoleById,
  createStore,
  getUsers,
  getUserDetails,
  getStores
};
