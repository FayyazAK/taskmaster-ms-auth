const User = require("../models/User");
const config = require("../config/env");
const { hashPassword } = require("../utils/userUtils");
const logger = require("../utils/logger");

class UserService {
  static async initializeAdmin() {
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({
        username: config.admin.username
      });

      if (existingAdmin) {
        logger.info("Admin user already exists");
        return;
      }

      const hashedPassword = await hashPassword(config.admin.password);
      await User.create({
        firstName: config.admin.firstName,
        lastName: config.admin.lastName,
        username: config.admin.username,
        email: config.admin.email,
        password: hashedPassword,
        isVerified: true,
        role: "admin"
      });
      logger.info("Admin user initialized successfully");
    } catch (error) {
      logger.error("Error initializing admin user:", error);
      throw error;
    }
  }

  static async find() {
    try {
      return await User.find();
    } catch (error) {
      logger.error("Error finding users:", error);
      throw error;
    }
  }

  static async findById(userId) {
    try {
      return await User.findById(userId);
    } catch (error) {
      logger.error("Error finding user by ID:", error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      return await User.findOne({ username });
    } catch (error) {
      logger.error("Error finding user by username:", error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      logger.error("Error finding user by email:", error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      return await User.create(userData);
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  static async update(userId, updateData) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error("Error updating user:", error);
      throw error;
    }
  }

  static async updateUnverifiedUser(userId, updateData) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $set: { ...updateData, isVerified: false } },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error("Error updating unverified user:", error);
      throw error;
    }
  }

  static async verifyUser(userId) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $set: { isVerified: true } },
        { new: true }
      );
    } catch (error) {
      logger.error("Error verifying user:", error);
      throw error;
    }
  }

  static async delete(userId) {
    try {
      return await User.findByIdAndDelete(userId);
    } catch (error) {
      logger.error("Error deleting user:", error);
      throw error;
    }
  }
}

module.exports = UserService;
