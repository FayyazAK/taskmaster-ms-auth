const logger = require("../utils/logger");
const rabbitProducer = require("./rabbitmqProducer");

const TodoService = {
  async deleteUserLists(userId) {
    try {
      await rabbitProducer.sendMessage("user.delete", {
        userId,
        action: "delete",
        timestamp: new Date().toISOString(),
      });
      logger.info(`User deletion message sent to Kafka for user ${userId}`);
    } catch (error) {
      logger.error(
        `Failed to send user deletion message to Kafka: ${error.message}`
      );
      throw error;
    }
  },
};

module.exports = TodoService;
