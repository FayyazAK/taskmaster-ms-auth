const UserService = require("../services/userService");
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
    const existingUsername = await UserService.findByUsername(
      username.toLowerCase()
    );
    if (existingUsername) {
      if (!existingUsername.isVerified) {
        // If username exists but user is unverified, allow registration with new email
        const existingEmail = await UserService.findByEmail(
          email.toLowerCase()
        );
        if (existingEmail && existingEmail.userId !== existingUsername.userId) {
          return res.error(MSG.USER_EMAIL_TAKEN, STATUS.CONFLICT);
        }
        // If same user trying to register again, update their information and resend verification email
        if (existingEmail && existingEmail.userId === existingUsername.userId) {
          const hashedPassword = await hashPassword(password);
          await UserService.updateUnverifiedUser(existingUsername.userId, {
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
          });
          const token = generateToken(
            existingUsername.userId,
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
    const existingEmail = await UserService.findByEmail(email.toLowerCase());
    if (existingEmail) {
      if (!existingEmail.isVerified) {
        // Resend verification email
        const token = generateToken(existingEmail.userId, existingEmail.role);
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
    const userId = await UserService.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const newUser = await UserService.findById(userId);

    // Generate JWT token
    const token = generateToken(newUser.userId, newUser.role);

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
      await UserService.delete(userId);
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
    const user = await UserService.findById(decoded.userId);
    if (!user) {
      return res.error(MSG.INVALID_TOKEN, STATUS.UNAUTHORIZED);
    }

    // Verify the user
    await UserService.verifyUser(user.userId);
    user.isVerified = true;
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
    const user = await UserService.findByEmail(email.toLowerCase());
    if (!user) {
      return res.error(MSG.INVALID_CREDENTIALS, STATUS.UNAUTHORIZED);
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Resend verification email
      const token = generateToken(user.userId, user.role);
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
    const token = generateToken(user.userId, user.role);

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
    const userId = req.user.userId;
    const user = await UserService.findById(userId);
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
