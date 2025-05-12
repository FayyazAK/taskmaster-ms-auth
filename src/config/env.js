const path = require("path");
const dotenv = require("dotenv");
const validateEnv = require("./validateEnv");

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || "development"}`
  ),
});

// Validate and sanitize environment variables
const env = validateEnv(process.env);

module.exports = {
  nodeEnv: env.NODE_ENV,

  server: {
    port: env.PORT,
  },

  gateway: {
    signature: env.API_GATEWAY_SIGNATURE,
    systemToken: env.SYSTEM_TOKEN,
    url: env.GATEWAY_URL,
  },

  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS.split(","),
    allowedMethods: env.CORS_ALLOWED_METHODS.split(","),
    allowedHeaders: env.CORS_ALLOWED_HEADERS.split(","),
  },

  ssl: {
    enabled: env.SSL_ENABLED,
    keyPath: env.SSL_KEY_PATH,
    certPath: env.SSL_CERT_PATH,
    port: env.SSL_PORT,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },

  cookie: {
    httpOnly: env.COOKIE_HTTP_ONLY,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.COOKIE_EXPIRES_IN,
  },

  db: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    name: env.AUTH_DB_NAME,
  },

  admin: {
    firstName: env.ADMIN_FIRST_NAME,
    lastName: env.ADMIN_LAST_NAME,
    username: env.ADMIN_USERNAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  },

  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    ttl: env.REDIS_TTL,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    clearOnStart: env.CLEAR_CACHE_ON_START,
  },

  log: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR,
    datePattern: env.LOG_DATE_PATTERN,
    maxSize: env.LOG_MAX_SIZE,
    maxFiles: env.LOG_MAX_FILES,
    service: env.LOG_SERVICE_NAME,
  },

  email: {
    apiPath: env.EMAIL_API_PATH,
    verifyPath: env.EMAIL_VERIFY_PATH,
    rejectUnauthorized: env.EMAIL_TLS_REJECT_UNAUTHORIZED,
    registration: {
      type: env.EMAIL_REG_TYPE,
      subject: env.EMAIL_REG_SUBJECT,
    },
  },
};
