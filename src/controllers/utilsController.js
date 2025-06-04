const { backupDatabase } = require("../services/backupDb");
const STATUS = require("../utils/statusCodes");
const MSG = require("../utils/messages");
const logger = require("../utils/logger");

const utilsController = {
  backupDatabase: async (req, res, next) => {
    try {
      const backupPath = await backupDatabase();
      return res.success(
        backupPath,
        MSG.BACKUP_SUCCESS,
        STATUS.OK
      );
    } catch (error) {
      logger.error("Backup failed:", error);
      return res.error(
        MSG.BACKUP_FAILED + ": " + error.message,
        STATUS.INTERNAL_SERVER_ERROR
      );
    }
  },
};

module.exports = utilsController;
