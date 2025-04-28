const axios = require("axios");
const config = require("../config/env");
const logger = require("../utils/logger");
const https = require("https");

const TodoService = {
  async deleteUserLists(userId, cookies) {
    try {
      const response = await axios.delete(
        `${config.GATEWAY_URL}/api/todo/lists`,
        {
          withCredentials: true,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          headers: {
            Cookie: Object.entries(cookies)
              .map(([key, value]) => `${key}=${value}`)
              .join("; "),
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error(`Error deleting user lists: ${error.message}`);
      throw error;
    }
  },
};

module.exports = TodoService;
