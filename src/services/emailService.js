const axios = require("axios");
const config = require("../config/env");
const logger = require("../utils/logger");
const https = require("https");
const kafkaProducer = require("./kafkaProducer");

const EmailService = {
  async sendVerificationEmail(email, token, name) {
    try {
      await kafkaProducer.sendMessage("email.verification", {
        recipientEmail: email,
        subject: "Welcome to TaskMaster",
        emailType: "verification",
        name: name,
        verifyLink: `${config.gateway.url}/api/auth/verify?token=${token}`,
        scheduledFor: new Date()
          .toISOString()
          .replace("T", " ")
          .replace("Z", ""),
      });
      logger.info(`Verification email scheduled for ${email}`);
    } catch (error) {
      logger.error(`Error scheduling verification email: ${error.message}`);
      throw new Error("Failed to send verification email due to Kafka error");
    }
  },
};

module.exports = EmailService;
