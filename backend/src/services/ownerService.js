const { query } = require('../config/db');

/**
 * Retrieve the dashboard data for a given store owner.
 * Determines the store implicitly from the ownerId.
 * Calculates average rating natively via PostgreSQL.
 */
const getDashboardData = async (ownerId) => {
  // 1. Get the owner's store and its calculated average rating
  const storeQuery = `
    SELECT 
      s.id, 
      s.name, 
      s.address, 
      COALESCE(AVG(r.rating), 0) AS "averageRating"
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE s.owner_id = $1
    GROUP BY s.id
  `;
  
  const storeResult = await query(storeQuery, [ownerId]);

  if (storeResult.rows.length === 0) {
    return null; // Owner has no assigned store
  }

  const storeRow = storeResult.rows[0];

  // 2. Get the list of users who actually submitted ratings for this store
  const ratingsQuery = `
    SELECT 
      u.id AS "userId", 
      u.name AS "userName", 
      u.email AS "userEmail", 
      r.rating
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE r.store_id = $1
    ORDER BY r.created_at DESC
  `;

  const ratingsResult = await query(ratingsQuery, [storeRow.id]);

  return {
    store: {
      id: storeRow.id,
      name: storeRow.name,
      address: storeRow.address
    },
    averageRating: parseFloat(storeRow.averageRating),
    ratings: ratingsResult.rows
  };
};

module.exports = {
  getDashboardData
};
