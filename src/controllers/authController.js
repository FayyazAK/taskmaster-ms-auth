const User = require("../models/User");
const bcrypt = require("bcrypt");
const config = require("../config/auth");
const {
  validateEmail,
  validatePassword,
  hashPassword,
  sanitizeUser,
} = require("../utils/userUtils");
const MSG = require("../utils/messages");
const { generateToken, verifyToken } = require("../services/jwtService");
const STATUS = require("../utils/statusCodes");
const EmailService = require("../services/emailService");
// Register a new user
const register = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.error(MSG.SIGNUP_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    const { firstName, lastName, username, email, password } = req.body;

    // Validate required fields
    if (!firstName || !username || !email || !password) {
      return res.error(MSG.SIGNUP_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.error(MSG.INVALID_EMAIL, STATUS.BAD_REQUEST);
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.error(MSG.INVALID_PASSWORD, STATUS.BAD_REQUEST);
    }

    // Check for existing username
    const existingUsername = await User.findByUsername(username.toLowerCase());
    if (existingUsername) {
      if (!existingUsername.is_verified) {
        // If username exists but user is unverified, allow registration with new email
        const existingEmail = await User.findByEmail(email.toLowerCase());
        if (
          existingEmail &&
          existingEmail.user_id !== existingUsername.user_id
        ) {
          return res.error(MSG.USER_EMAIL_TAKEN, STATUS.CONFLICT);
        }
        // If same user trying to register again, update their information and resend verification email
        if (
          existingEmail &&
          existingEmail.user_id === existingUsername.user_id
        ) {
          const hashedPassword = await hashPassword(password);
          await User.updateUnverifiedUser(existingUsername.user_id, {
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
          });
          const token = generateToken(
            existingUsername.user_id,
            existingUsername.role
          );
          await EmailService.sendRegistrationEmail(
            email.toLowerCase(),
            token,
            `${firstName} ${lastName}`
          );
          return res.error(MSG.USER_NOT_VERIFIED_RESEND_EMAIL, STATUS.CONFLICT);
        }
      } else {
        return res.error(MSG.USERNAME_TAKEN, STATUS.CONFLICT);
      }
    }

    // Check for existing email
    const existingEmail = await User.findByEmail(email.toLowerCase());
    if (existingEmail) {
      if (!existingEmail.is_verified) {
        // Resend verification email
        const token = generateToken(existingEmail.user_id, existingEmail.role);
        await EmailService.sendRegistrationEmail(
          existingEmail.email,
          token,
          `${existingEmail.firstName} ${existingEmail.lastName}`
        );
        return res.error(MSG.USER_NOT_VERIFIED_RESEND_EMAIL, STATUS.CONFLICT);
      }
      return res.error(MSG.USER_EMAIL_TAKEN, STATUS.CONFLICT);
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const user_id = await User.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const newUser = await User.findById(user_id);

    // Generate JWT token
    const token = generateToken(newUser.user_id, newUser.role);

    try {
      // Send registration email
      await EmailService.sendRegistrationEmail(
        newUser.email,
        token,
        `${newUser.firstName} ${newUser.lastName}`
      );
      res.success(null, MSG.USER_VERIFICATION_EMAIL_SENT, STATUS.CREATED);
    } catch (emailError) {
      // If email fails, delete the unverified user and return error
      await User.delete(user_id);
      return res.error(MSG.EMAIL_SEND_FAILED, STATUS.SERVICE_UNAVAILABLE);
    }
  } catch (error) {
    next(error);
  }
};

// Verify user
const verify = async (req, res, next) => {
  try {
    const { token } = req.query;
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.error(MSG.INVALID_TOKEN, STATUS.UNAUTHORIZED);
    }

    // Verify the user
    await User.verifyUser(user.user_id);

    res.cookie("token", token, config.cookieOptions);
    res.success(sanitizeUser(user), MSG.USER_REGISTERED, STATUS.OK);
  } catch (error) {
    next(error);
  }
};
// Login user
const login = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.error(MSG.LOGIN_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.error(MSG.LOGIN_FIELDS_REQUIRED, STATUS.BAD_REQUEST);
    }

    // Find user by email
    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      return res.error(MSG.INVALID_CREDENTIALS, STATUS.UNAUTHORIZED);
    }

    // Check if user is verified
    if (!user.is_verified) {
      // Resend verification email
      const token = generateToken(user.user_id, user.role);
      await EmailService.sendRegistrationEmail(
        user.email,
        token,
        `${user.firstName} ${user.lastName}`
      );
      return res.error(MSG.USER_NOT_VERIFIED_RESEND_EMAIL, STATUS.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.error(MSG.INVALID_CREDENTIALS, STATUS.UNAUTHORIZED);
    }

    // Generate JWT token
    const token = generateToken(user.user_id, user.role);

    // Set cookie
    res.cookie("token", token, config.cookieOptions);

    res.success(sanitizeUser(user), MSG.LOGIN_SUCCESS, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const user = await User.findById(user_id);
    if (!user) {
      return res.error(MSG.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }

    res.success(sanitizeUser(user), MSG.USER_FOUND, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.success(null, MSG.LOGOUT_SUCCESS, STATUS.OK);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  verify,
};
