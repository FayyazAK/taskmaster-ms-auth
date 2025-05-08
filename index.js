const app = require("./src/app");
const config = require("./src/config/env");
const { sequelize } = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServers = require("./src/config/server");
const logger = require("./src/utils/logger");

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Connected to Auth database!");

    // Initialize database
    await initializeDatabase();

    // Create HTTP and/or HTTPS servers based on configuration
    const servers = createServers(app);

    if (config.SSL.enabled) {
      logger.info(`Auth service running on HTTPS port ${config.SSL.port}`);
    } else {
      logger.info(`Auth service running on HTTP port ${config.PORT}`);
    }

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info("Shutting down gracefully...");
      try {
        // Close database connection
        await sequelize.close();
        logger.info("Database connection closed");

        // Close HTTP/HTTPS servers
        if (servers.https) {
          await new Promise((resolve) => servers.https.close(resolve));
        }
        if (servers.http) {
          await new Promise((resolve) => servers.http.close(resolve));
        }
        logger.info("Servers closed");

        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error("Failed to start Auth service:", error);
    process.exit(1);
  }
}

startServer();
