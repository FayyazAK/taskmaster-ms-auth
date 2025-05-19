const { sequelize } = require("./database");
const UserService = require("../services/userService");
const logger = require("../utils/logger");

async function initializeDatabase() {
  try {
    // Create tables with specific options
    await sequelize.sync({
      alter: false,
      force: false,
      logging: (msg) => logger.debug(msg),
    });

    // Initialize admin user
    await UserService.initializeAdmin();

    logger.info("Database initialization completed successfully");
  } catch (error) {
    logger.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initializeDatabase;
