const rabbitProducer = require('./rabbitmqProducer');
const logger = require('../utils/logger');
const MSG = require('../utils/messages');

class RabbitMQHandler {
  static async initialize() {
    try {
      await rabbitProducer.connect();
      logger.info('RabbitMQ handler initialized successfully');
    } catch (error) {
      logger.error(MSG.SERVICE_UNAVAILABLE, error);
      throw error;
    }
  }

  static async shutdown() {
    try {
      await rabbitProducer.disconnect();
      logger.info('RabbitMQ handler shutdown successfully');
    } catch (error) {
      logger.error('Error during RabbitMQ handler shutdown:', error);
      throw error;
    }
  }
}

module.exports = RabbitMQHandler;