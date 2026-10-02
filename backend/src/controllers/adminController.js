const adminService = require('../services/adminService');
const { isValidEmail, isValidPassword, isValidName, isValidAddress } = require('../utils/validation');

/**
 * Get Dashboard Statistics
 */
const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Create User (Admin functionality)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ success: false, message: 'Name must be between 20 and 60 characters' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be 8-16 characters, contain at least one uppercase letter and one special character' });
    }
    if (!isValidAddress(address)) {
      return res.status(400).json({ success: false, message: 'Address must be a maximum of 400 characters' });
    }

    const validRoles = ['admin', 'user', 'owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const newUser = await adminService.createUser({ name, email, password, address, role });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }
    next(error);
  }
};

/**
 * Create Store
 */
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address || !ownerId) {
      return res.status(400).json({ success: false, message: 'Name, email, address, and ownerId are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!isValidAddress(address)) {
      return res.status(400).json({ success: false, message: 'Address must be a maximum of 400 characters' });
    }

    // Verify owner exists and has role 'owner'
    const userRoleRecord = await adminService.getUserRoleById(ownerId);
    if (!userRoleRecord) {
      return res.status(404).json({ success: false, message: 'Owner user not found' });
    }
    if (userRoleRecord.role !== 'owner') {
      return res.status(400).json({ success: false, message: 'Assigned user must have the owner role' });
    }

    const newStore = await adminService.createStore({ name, email, address, ownerId });
    
    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      store: newStore
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'stores_owner_id_key') {
      return res.status(409).json({ success: false, message: 'This owner already has a store assigned' });
    }
    next(error);
  }
};

/**
 * Get Users List
 */
const getUsers = async (req, res, next) => {
  try {
    const { name, email, address, role, sortBy = 'id', order = 'asc' } = req.query;
    const filters = { name, email, address, role };
    
    const users = await adminService.getUsers(filters, sortBy, order);
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Details
 */
const getUserDetails = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await adminService.getUserDetails(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Stores List
 */
const getStores = async (req, res, next) => {
  try {
    const { name, email, address, sortBy = 'id', order = 'asc' } = req.query;
    const filters = { name, email, address };
    
    const stores = await adminService.getStores(filters, sortBy, order);
    
    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  createUser,
  createStore,
  getUsers,
  getUserDetails,
  getStores
};
