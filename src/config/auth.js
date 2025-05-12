const config = require("./env");

module.exports = {
  jwtSecret: config.jwt.secret,
  jwtExpiresIn: config.jwt.expiresIn,
  refreshTokenExpiresIn: config.jwt.refreshTokenExpiresIn,
  cookieOptions: {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: config.cookie.maxAge,
  },
};
