const rabbit = require('../config/rabbitmq');
const logger = require('../utils/logger');

class RabbitMQProducer {
  async connect() {
    try {
      await rabbit.connect();
      logger.info('RabbitMQ producer connected successfully');
    } catch (error) {
      logger.error('Error connecting RabbitMQ producer:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await rabbit.disconnect();
      logger.info('RabbitMQ producer disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting RabbitMQ producer:', error);
      throw error;
    }
  }

  async sendMessage(queue, message) {
    try {
      await rabbit.publish(queue, message);
      logger.info(`Message sent to queue "${queue}" successfully`);
    } catch (error) {
      logger.error(`Error sending message to queue "${queue}":`, error);
      throw error;
    }
  }
}

module.exports = new RabbitMQProducer();