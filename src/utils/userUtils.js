const bcrypt = require("bcrypt");

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const sanitizeUser = (user) => {
  if (!user) return null;

  // Handle Sequelize model instance
  const userData = user.get ? user.get({ plain: true }) : user;

  // Remove sensitive data
  const { password, ...sanitizedUser } = userData;

  // Ensure consistent field names
  return {
    userId: sanitizedUser.userId,
    firstName: sanitizedUser.firstName,
    lastName: sanitizedUser.lastName,
    username: sanitizedUser.username,
    email: sanitizedUser.email,
    role: sanitizedUser.role,
    isVerified: sanitizedUser.isVerified,
    createdAt: sanitizedUser.createdAt,
    updatedAt: sanitizedUser.updatedAt,
  };
};

const sanitizeUsers = (users) => {
  return users.map((user) => sanitizeUser(user));
};

module.exports = {
  validateEmail,
  validatePassword,
  hashPassword,
  sanitizeUser,
  sanitizeUsers,
};
