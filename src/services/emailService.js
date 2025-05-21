const config = require("../config/env");
const logger = require("../utils/logger");
const rabbitProducer = require("./rabbitmqProducer");

const EmailService = {
  async sendVerificationEmail(email, token, name) {
    try {
      await rabbitProducer.sendMessage("email.verification", {
        recipientEmail: email,
        subject: "Welcome to TaskMaster",
        emailType: "verification",
        name,
        verifyLink: `${config.gateway.url}/api/auth/verify?token=${token}`,
        scheduledFor: new Date()
          .toISOString()
          .replace("T", " ")
          .replace("Z", ""),
      });
      logger.info(`Verification email scheduled for ${email}`);
    } catch (error) {
      logger.error(`Error scheduling verification email: ${error.message}`);
      throw new Error("Failed to send verification email due to RabbitMQ error");
    }
  },
};

module.exports = EmailService;
