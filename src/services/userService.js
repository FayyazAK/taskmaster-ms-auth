const { sequelize } = require("../config/database");
const User = require("../models/User")(sequelize);
const config = require("../config/env");
const { hashPassword } = require("../utils/userUtils");
const { cacheHelpers, keyGenerators } = require("../config/redis");
const logger = require("../utils/logger");

class UserService {
  static async initializeAdmin() {
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({
        where: { username: config.ADMIN_USERNAME },
      });

      if (existingAdmin) {
        // logger.info("Admin user already exists");
        return;
      }

      const hashedPassword = await hashPassword(config.ADMIN_PASSWORD);
      await User.create({
        firstName: config.ADMIN_FIRST_NAME,
        lastName: config.ADMIN_LAST_NAME,
        username: config.ADMIN_USERNAME,
        email: config.ADMIN_EMAIL,
        password: hashedPassword,
        isVerified: true,
        role: "admin",
      });
      logger.info("Admin user initialized successfully");
    } catch (error) {
      logger.error("Error initializing admin user:", error);
      throw error;
    }
  }

  static async create({ firstName, lastName, username, email, password }) {
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      isVerified: false,
      role: "user",
    });

    // Invalidate users cache
    await cacheHelpers.del(keyGenerators.users());

    return user.userId;
  }

  static async verifyUser(userId) {
    await User.update({ isVerified: true }, { where: { userId } });

    // Invalidate cache
    await cacheHelpers.del(keyGenerators.user(userId));
    await cacheHelpers.del(keyGenerators.users());
  }

  static async isVerified(userId) {
    const user = await this.findById(userId);
    return user ? user.isVerified : false;
  }

  static async find() {
    // Try to get from cache first
    const cacheKey = keyGenerators.users();
    const cachedUsers = await cacheHelpers.get(cacheKey);

    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await User.findAll();

    // Store in cache for future requests
    await cacheHelpers.set(cacheKey, users);

    return users;
  }

  static async findByUsername(username) {
    return await User.findOne({ where: { username } });
  }

  static async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  static async findById(userId) {
    // Try to get from cache first
    const cacheKey = keyGenerators.user(userId);
    const cachedUser = await cacheHelpers.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await User.findByPk(userId);

    // Store in cache for future requests
    if (user) {
      await cacheHelpers.set(cacheKey, user);
    }

    return user;
  }

  static async update(
    userId,
    { firstName, lastName, username, email, password }
  ) {
    await User.update(
      {
        firstName,
        lastName,
        username,
        email,
        password,
      },
      { where: { userId } }
    );

    // Invalidate users cache
    await cacheHelpers.del(keyGenerators.users());
    await cacheHelpers.del(keyGenerators.user(userId));
  }

  static async updateUnverifiedUser(
    userId,
    { firstName, lastName, email, password }
  ) {
    await User.update(
      {
        firstName,
        lastName,
        email,
        password,
      },
      {
        where: {
          userId,
          isVerified: false,
        },
      }
    );

    // Invalidate users cache
    await cacheHelpers.del(keyGenerators.users());
    await cacheHelpers.del(keyGenerators.user(userId));
  }

  static async delete(userId) {
    await User.destroy({ where: { userId } });

    // Invalidate users cache
    await cacheHelpers.del(keyGenerators.users());
    await cacheHelpers.del(keyGenerators.user(userId));
    await cacheHelpers.deleteUserCache(userId);
  }
}

module.exports = UserService;
