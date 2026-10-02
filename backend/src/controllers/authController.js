const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/env');
const authService = require('../services/authService');
const { isValidEmail, isValidPassword, isValidName, isValidAddress } = require('../utils/validation');

/**
 * Handle Normal User Signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;

    // Basic required fields check
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Valdiation Rules
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

    // Check if user already exists
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Explicitly force role to 'user'. Do not trust req.body.role.
    const newUser = await authService.createUser({
      name,
      email,
      password,
      address,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Change Password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must be 8-16 characters, contain at least one uppercase letter and one special character' });
    }

    const currentHash = await authService.getPasswordHashById(userId);
    if (!currentHash) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    await authService.updatePassword(userId, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test Endpoint: Get Current User Profile (Safe info)
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test Endpoint: Verify Admin Role
 */
const getAdminOnly = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'You have successfully accessed an admin-only endpoint',
    user: req.user
  });
};

module.exports = {
  signup,
  login,
  changePassword,
  getMe,
  getAdminOnly
};
