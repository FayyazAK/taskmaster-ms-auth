const app = require("./src/app");
const config = require("./src/config/env");
const { sequelize } = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServers = require("./src/config/server");
const logger = require("./src/utils/logger");
const KafkaHandler = require("./src/services/kafkaHandler");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function connectWithRetry(maxRetries = 3, delayMs = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info("Connected to Auth database!");
      return true;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      logger.info(`Retrying in ${delayMs/1000} seconds...`);
      await sleep(delayMs);
    }
  }
  return false;
}

async function startServer() {
  try {
    // Test database connection with retry
    try {
      await connectWithRetry();
    } catch (error) {
      logger.error("All database connection attempts failed:", error);
      process.exit(1);
    }

    // Initialize database
    await initializeDatabase();

    // Initialize Kafka handler
    await KafkaHandler.initialize();
    // Create server based on SSL configuration
    const server = createServers(app);

    if (config.ssl.enabled) {
      logger.info(`Auth service running on HTTPS port ${config.ssl.port}`);
    } else {
      logger.info(`Auth service running on HTTP port ${config.server.port}`);
    }

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      await KafkaHandler.shutdown();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received. Shutting down gracefully...");
      await KafkaHandler.shutdown();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start Auth service:", error);
    process.exit(1);
  }
}

startServer();
