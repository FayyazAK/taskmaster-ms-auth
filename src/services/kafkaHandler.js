const kafkaProducer = require("./kafkaProducer");
const logger = require("../utils/logger");
const MSG = require("../utils/messages");

class KafkaHandler {
  static async initialize() {
    try {
      await kafkaProducer.connect();
      logger.info("Kafka handler initialized successfully");
    } catch (error) {
      logger.error(MSG.SERVICE_UNAVAILABLE, error);
      throw error;
    }
  }

  static async shutdown() {
    try {
      await kafkaProducer.disconnect();
      logger.info("Kafka handler shutdown successfully");
    } catch (error) {
      logger.error("Error during Kafka handler shutdown:", error);
      throw error;
    }
  }
}

module.exports = KafkaHandler;
