const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const Otp = require('./otp.model');
const ApiError = require('../../utils/customError');
const config = require('../../config/env');
const moment = require('moment');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, 'access');

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, 'refresh', config.jwt.refreshSecret);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }
  return user;
};

/**
 * Generate OTP for user
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = moment().add(10, 'minutes').toDate();

  // Remove any existing OTP for this email and create new one
  await Otp.deleteMany({ email });
  await Otp.create({ email, otp, expiresAt });

  // In a real app, send OTP via Email/SMS here
  return otp;
};

/**
 * Login with OTP
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<User>}
 */
const loginWithOtp = async (email, otp) => {
  const otpDoc = await Otp.findOne({ email, otp });
  
  if (!otpDoc) {
    throw new ApiError(401, 'Invalid or expired OTP');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Clear OTP document after successful login
  await Otp.deleteMany({ email });

  return user;
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = jwt.verify(refreshToken, config.jwt.refreshSecret);
    if (refreshTokenDoc.type !== 'refresh') {
      throw new Error();
    }
    const user = await User.findById(refreshTokenDoc.sub);
    if (!user) {
      throw new Error();
    }
    return generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(401, 'Please authenticate');
  }
};

module.exports = {
  generateAuthTokens,
  loginUserWithEmailAndPassword,
  generateOtp,
  loginWithOtp,
  refreshAuth,
};
