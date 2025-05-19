const kafka = require("../config/kafka");
const logger = require("../utils/logger");

class KafkaProducer {
  constructor() {
    this.producer = kafka.producer();
  }

  async connect() {
    try {
      await this.producer.connect();
      logger.info("Kafka producer connected successfully");
    } catch (error) {
      logger.error("Error connecting Kafka producer:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.producer.disconnect();
      logger.info("Kafka producer disconnected successfully");
    } catch (error) {
      logger.error("Error disconnecting Kafka producer:", error);
      throw error;
    }
  }

  async sendMessage(topic, message) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
          },
        ],
      });
      logger.info(`Message sent to topic ${topic} successfully`);
    } catch (error) {
      logger.error(`Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }
}

module.exports = new KafkaProducer();
