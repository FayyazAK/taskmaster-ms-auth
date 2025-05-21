const amqp = require('amqplib');
const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const logger = require('../utils/logger');

let connection;
let channel;

async function connect() {
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    logger.info('🐇 RabbitMQ connected successfully');
  } catch (error) {
    logger.error('🐇 Error connecting to RabbitMQ:', error);
    throw error;
  }
}

async function disconnect() {
  try {
    await channel.close();
    await connection.close();
    logger.info('🐇 RabbitMQ disconnected successfully');
  } catch (error) {
    logger.error('🐇 Error disconnecting RabbitMQ:', error);
    throw error;
  }
}

async function publish(queue, message) {
  try {
    // ensure the queue exists
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    logger.info(`🐇 Message published to queue "${queue}"`);
  } catch (error) {
    logger.error(`🐇 Error publishing message to queue "${queue}":`, error);
    throw error;
  }
}

module.exports = {
  connect,
  disconnect,
  publish,
};