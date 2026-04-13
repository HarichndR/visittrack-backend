const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');
const User = require('../user/user.model');
const ApiError = require('../../utils/customError');

const register = asyncHandler(async (req, res) => {
  const { email, password, name, role } = req.body;
  
  // Security Hardening: Block direct ADMIN/ORGANIZER registration
  if (role === 'ADMIN' || role === 'ORGANIZER') {
    throw new ApiError(403, 'Unauthorized role registration. Organizers must submit a request application.');
  }

  if (await User.isEmailTaken(email)) {
    throw new ApiError(400, 'Email already taken');
  }
  const user = await User.create({ email, password, name, role });
  const tokens = await authService.generateAuthTokens(user);
  res.status(201).send(new ApiResponse(201, { user, tokens }, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await authService.generateAuthTokens(user);
  res.send(new ApiResponse(200, { user, tokens }, 'Login successful'));
});

const refreshTokens = asyncHandler(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send(new ApiResponse(200, { ...tokens }, 'Tokens refreshed successfully'));
});

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const otp = await authService.generateOtp(email);
  // Send 204 or 200 depending on if we want to return OTP in dev mode
  res.send(new ApiResponse(200, { otp: process.env.NODE_ENV === 'development' ? otp : undefined }, 'OTP sent successfully'));
});

const loginWithOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await authService.loginWithOtp(email, otp);
  const tokens = await authService.generateAuthTokens(user);
  res.send(new ApiResponse(200, { user, tokens }, 'OTP Login successful'));
});

const setupPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = req.user;
  
  if (!user.mustChangePassword) {
    throw new ApiError(400, 'Password setup not required');
  }

  user.password = password;
  user.mustChangePassword = false;
  await user.save();

  res.send(new ApiResponse(200, user, 'Password set successfully'));
});

module.exports = {
  register,
  login,
  refreshTokens,
  sendOtp,
  loginWithOtp,
  setupPassword,
};
