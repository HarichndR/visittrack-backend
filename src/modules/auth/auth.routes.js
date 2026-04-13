const express = require('express');
const validate = require('../../middleware/validate.middleware');
const authValidation = require('./auth.validation');
const authController = require('./auth.controller');
const { otpLimiter } = require('../../middleware/rateLimit.middleware');

const auth = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [ADMIN, ORGANIZER, STAFF, EXHIBITOR, VISITOR]
 *     responses:
 *       "201":
 *         description: Created
 *       "400":
 *         description: Email already taken
 */
router.post('/register', validate(authValidation.register), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         description: Incorrect email or password
 */
router.post('/login', validate(authValidation.login), authController.login);

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     summary: Refresh auth tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/refresh-tokens', validate(authValidation.refreshToken), authController.refreshTokens);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OTP sent
 */
router.post('/send-otp', otpLimiter, authController.sendOtp);

/**
 * @swagger
 * /auth/login-otp:
 *   post:
 *     summary: Login with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/login-otp', otpLimiter, authController.loginWithOtp);

/**
 * @swagger
 * /auth/setup-password:
 *   post:
 *     summary: Setup password for first-time login
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       "200":
 *         description: Password set successfully
 */
router.post('/setup-password', auth(), authController.setupPassword);

module.exports = router;
