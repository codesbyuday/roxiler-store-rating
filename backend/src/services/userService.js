const { query } = require('../config/db');

/**
 * Get stores listing for a normal user
 * Calculates overall rating and retrieves the user's specific rating
 */
const getStores = async (userId, filters, sortBy, order) => {
  const params = [userId]; // $1 is always the authenticated user's ID
  
  let sql = `
    SELECT 
      s.id, 
      s.name, 
      s.address, 
      COALESCE(AVG(r.rating), 0) AS "overallRating",
      (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1 LIMIT 1) AS "userRating"
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;

  // Filtering
  if (filters.name) {
    params.push(`%${filters.name}%`);
    sql += ` AND s.name ILIKE $${params.length}`;
  }
  if (filters.address) {
    params.push(`%${filters.address}%`);
    sql += ` AND s.address ILIKE $${params.length}`;
  }

  sql += ` GROUP BY s.id`;

  // Sorting
  const allowedSorts = ['name', 'address', 'overallRating', 'id'];
  let safeSort = allowedSorts.includes(sortBy) ? sortBy : 'id';
  
  if (safeSort === 'overallRating') {
    safeSort = '"overallRating"'; // Map to calculated alias
  } else {
    safeSort = `s.${safeSort}`; // Prefix with table alias
  }

  const safeOrder = order === 'desc' ? 'DESC' : 'ASC';
  sql += ` ORDER BY ${safeSort} ${safeOrder}`;

  const result = await query(sql, params);
  
  // Format numbers correctly (PostgreSQL AVG returns string/numeric)
  return result.rows.map(row => ({
    ...row,
    overallRating: parseFloat(row.overallRating),
    userRating: row.userRating ? parseInt(row.userRating, 10) : null
  }));
};

/**
 * Check if a store exists by ID
 */
const checkStoreExists = async (storeId) => {
  const result = await query(`SELECT id FROM stores WHERE id = $1`, [storeId]);
  return result.rowCount > 0;
};

/**
 * Submit a new rating
 */
const submitRating = async (userId, storeId, rating) => {
  const result = await query(
    `INSERT INTO ratings (user_id, store_id, rating) 
     VALUES ($1, $2, $3) 
     RETURNING id, user_id, store_id, rating, created_at, updated_at`,
    [userId, storeId, rating]
  );
  return result.rows[0];
};

/**
 * Modify an existing rating
 */
const modifyRating = async (userId, storeId, rating) => {
  const result = await query(
    `UPDATE ratings 
     SET rating = $1 
     WHERE user_id = $2 AND store_id = $3 
     RETURNING id, user_id, store_id, rating, created_at, updated_at`,
    [rating, userId, storeId]
  );
  return result.rows[0];
};

module.exports = {
  getStores,
  checkStoreExists,
  submitRating,
  modifyRating
};
