const app = require("./src/app");
const config = require("./src/config/env");
const { sequelize } = require("./src/config/database");
const initializeDatabase = require("./src/config/db-init");
const createServers = require("./src/config/server");
const logger = require("./src/utils/logger");
const RabbitMQHandler = require("./src/services/rabbitmqHandler");

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Connected to Auth database!");

    // Initialize database
    await initializeDatabase();

    // Initialize RabbitMQ handler
    await RabbitMQHandler.initialize();

    // Create server based on SSL configuration
    const server = createServers(app);

    if (config.ssl.enabled) {
      logger.info(`Auth service running on HTTPS port ${config.ssl.port}`);
    } else {
      logger.info(`Auth service running on HTTP port ${config.server.port}`);
    }

    // Handle graceful shutdown
    const shutdownGracefully = async () => {
      logger.info('Shutting down gracefully...');
      
      // Close server
      server.close(() => {
        logger.info('Server closed');
      });
      
      // Close RabbitMQ connections
      await RabbitMQHandler.close();
      logger.info('RabbitMQ connections closed');
      
      // Close database connection
      await sequelize.close();
      logger.info('Database connection closed');
      
      process.exit(0);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', shutdownGracefully);
    process.on('SIGINT', shutdownGracefully);
    
  } catch (error) {
    logger.error("Failed to start Auth service:", error);
    process.exit(1);
  }
}

startServer();
