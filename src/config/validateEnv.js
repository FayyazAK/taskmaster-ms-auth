// config/validateEnv.js
const Joi = require("joi");

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),

  // SERVER
  PORT: Joi.number().port().default(4001),

  // GATEWAY
  API_GATEWAY_SIGNATURE: Joi.string().default("taskmaster@gateway"),
  SYSTEM_TOKEN: Joi.string().default("taskmaster@system"),
  GATEWAY_URL: Joi.string().uri().default("http://localhost:4000"),

  // MYSQL DATABASE CONNECTION
  DB_HOST: Joi.string().default("localhost"),
  DB_USER: Joi.string().default("root"),
  DB_PASSWORD: Joi.string().default("1234"),
  AUTH_DB_NAME: Joi.string().default("taskmaster-auth-db"),

  // JWT CONFIG
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default("1d"),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("7d"),

  // COOKIE CONFIG
  COOKIE_HTTP_ONLY: Joi.boolean().truthy("true").falsy("false").default(true),
  COOKIE_SAME_SITE: Joi.string().default("strict"),
  COOKIE_SECURE: Joi.boolean().truthy("true").falsy("false").default(false),
  COOKIE_EXPIRES_IN: Joi.number().default(86400000),

  // ADMIN CREDENTIALS
  ADMIN_FIRST_NAME: Joi.string().default("Admin"),
  ADMIN_LAST_NAME: Joi.string().default("User"),
  ADMIN_USERNAME: Joi.string().default("admin"),
  ADMIN_EMAIL: Joi.string().email().default("admin@example.com"),
  ADMIN_PASSWORD: Joi.string().default("admin"),

  // SSL CONFIG
  SSL_ENABLED: Joi.boolean().truthy("true").falsy("false").default(false),
  SSL_KEY_PATH: Joi.string().default("ssl/key.pem"),
  SSL_CERT_PATH: Joi.string().default("ssl/cert.pem"),
  SSL_PORT: Joi.number().port().default(4001),

  // CORS CONFIG
  CORS_ALLOWED_ORIGINS: Joi.string().default("https://127.0.0.1"),
  CORS_ALLOWED_METHODS: Joi.string().default("GET,POST,PUT,DELETE,OPTIONS"),
  CORS_ALLOWED_HEADERS: Joi.string().default("Content-Type,Authorization"),

  // RATE LIMITING
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15000),
  RATE_LIMIT_MAX: Joi.number().default(100),

  // REDIS CONFIGURATION
  REDIS_HOST: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow("").default(""),
  REDIS_DB: Joi.number().default(0),
  REDIS_TTL: Joi.number().default(3600),
  CLEAR_CACHE_ON_START: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(true),

  // LOGGING
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "http", "verbose", "debug", "silly")
    .default("info"),
  LOG_DIR: Joi.string().default("../logs"),
  LOG_DATE_PATTERN: Joi.string().default("YYYY-MM-DD"),
  LOG_MAX_SIZE: Joi.string().default("20m"),
  LOG_MAX_FILES: Joi.string().default("14d"),
  LOG_SERVICE_NAME: Joi.string().default("taskmaster-ms-auth"),

  // EMAIL SERVICE
  EMAIL_API_PATH: Joi.string().default("/api/emails/send"),
  EMAIL_VERIFY_PATH: Joi.string().default("/api/auth/verify"),
  EMAIL_REG_TYPE: Joi.string().default("registration"),
  EMAIL_REG_SUBJECT: Joi.string().default("Welcome to TaskMaster"),
  EMAIL_TLS_REJECT_UNAUTHORIZED: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .default(true),
})
  .unknown() // allow other vars
  .required();

function validateEnv(env = process.env) {
  const { error, value: validated } = envSchema.validate(env, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    console.error(
      "\n❌ Environment validation error(s):\n" +
        error.details.map((d) => ` • ${d.message}`).join("\n") +
        "\n"
    );
    process.exit(1);
  }

  return validated;
}

module.exports = validateEnv;
