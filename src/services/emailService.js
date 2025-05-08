const axios = require("axios");
const config = require("../config/env");
const logger = require("../utils/logger");
const https = require("https");

const EmailService = {
  async sendRegistrationEmail(email, token, name) {
    try {
      const response = await axios.post(
        `${config.GATEWAY_URL}/api/emails/send`,
        {
          recipientEmail: email,
          subject: "Welcome to TaskMaster",
          emailType: "registration",
          templateData: {
            name: name,
            verifyLink: `${config.GATEWAY_URL}/api/auth/verify?token=${token}`,
          },
          scheduledFor: new Date()
            .toISOString()
            .replace("T", " ")
            .replace("Z", ""),
        },
        {
          withCredentials: true,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            "x-system-token": config.SYSTEM_TOKEN,
          },
        }
      );
      logger.info(`Registration email scheduled for ${email}`);
      return response.data;
    } catch (error) {
      logger.error(`Error scheduling registration email`);
      throw error;
    }
  },
};

module.exports = EmailService;
