const User = require("../models/User");
const config = require("./env");

async function initializeDatabase() {
  try {
    // Create user table
    await User.createTable();

    // Initialize admin user
    const adminData = {
      firstName: config.ADMIN_FIRST_NAME,
      lastName: config.ADMIN_LAST_NAME,
      username: config.ADMIN_USERNAME,
      email: config.ADMIN_EMAIL,
      password: config.ADMIN_PASSWORD,
    };

    await User.initializeAdmin(adminData);

    console.log("Auth service database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
