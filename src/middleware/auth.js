const STATUS = require("../utils/statusCodes");
const { verifyToken } = require("../services/jwtService");
const MSG = require("../utils/messages");

const authenticate = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    if (!token) {
      res.clearCookie("token");
      return res.error(MSG.UNAUTHORIZED, STATUS.UNAUTHORIZED);
    }

    // Verify token
    const decoded = verifyToken(token);
    // Add user from payload to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.error(MSG.UNAUTHORIZED, STATUS.UNAUTHORIZED);
    }
    return res.error(MSG.UNAUTHORIZED, STATUS.UNAUTHORIZED);
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    res.clearCookie("token");
    return res.error(MSG.FORBIDDEN, STATUS.FORBIDDEN);
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };
