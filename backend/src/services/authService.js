const { query } = require('../config/db');
const bcrypt = require('bcrypt');

const findUserByEmail = async (email) => {
  const result = await query(
    'SELECT id, name, email, password, role FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await query(
    'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const getPasswordHashById = async (id) => {
  const result = await query(
    'SELECT password FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0]?.password;
};

const createUser = async (userData) => {
  const { name, email, password, address, role } = userData;
  
  // 10 salt rounds is a good default for bcrypt
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

const updatePassword = async (id, newPassword) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  await query(
    'UPDATE users SET password = $1 WHERE id = $2',
    [hashedPassword, id]
  );
};

module.exports = {
  findUserByEmail,
  findUserById,
  getPasswordHashById,
  createUser,
  updatePassword
};
