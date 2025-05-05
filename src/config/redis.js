// config/redis.js
const Redis = require("ioredis");
const config = require("./env");
const logger = require("../utils/logger");

const redisClient = new Redis({
  host: config.REDIS.HOST,
  port: config.REDIS.PORT,
  password: config.REDIS.PASSWORD,
  db: config.REDIS.DB,
  keyPrefix: "authService:",
  // Reconnect strategy
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis server");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

// Handle Redis connection cleanup
const cleanup = async () => {
  try {
    await redisClient.quit();
    logger.info("Redis connection closed");
  } catch (error) {
    logger.error("Error closing Redis connection:", error);
  }
};

// Handle process termination
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

// Cache helper functions
const cacheHelpers = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error("Redis get error:", error);
      return null;
    }
  },

  async set(key, value, ttl = config.REDIS.TTL) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await redisClient.setex(key, ttl, stringValue);
      } else {
        await redisClient.set(key, stringValue);
      }
    } catch (error) {
      logger.error("Redis set error:", error);
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error("Redis delete error:", error);
    }
  },

  async deleteUserCache(userId) {
    try {
      const pattern = `users:${userId}:*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error("Redis delete user cache error:", error);
    }
  },
};

const keyGenerators = {
  // User keys
  user: (userId) => `users:${userId}`,
  users: () => "users",
};

module.exports = {
  redisClient,
  cacheHelpers,
  keyGenerators,
  cleanup,
};
