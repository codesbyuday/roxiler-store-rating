/**
 * Utility functions for input validation
 */

const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  if (!password) return false;
  // 8-16 characters
  if (password.length < 8 || password.length > 16) return false;
  // at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  // at least one special character
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  
  return true;
};

const isValidName = (name) => {
  if (!name) return false;
  return name.length >= 20 && name.length <= 60;
};

const isValidAddress = (address) => {
  if (!address) return true; // Assuming address might be optional, but if provided, max 400
  return address.length <= 400;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidAddress
};
