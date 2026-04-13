const express = require('express');
const logger = require('../../config/logger');
const auth = require('../../middleware/auth.middleware');
const logsController = require('./logs.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: System audit logs
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get system audit logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
router.get('/', auth('ADMIN'), logsController.getLogs);

/**
 * @swagger
 * /logs/telemetry:
 *   post:
 *     summary: Receive frontend telemetry logs
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - message
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [info, warn, error]
 *               message:
 *                 type: string
 *               metadata:
 *                 type: object
 *               url:
 *                 type: string
 *               userAgent:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       "204":
 *         description: No Content
 */
router.post('/telemetry', (req, res) => {
  const { level, message, metadata, url, userAgent, timestamp } = req.body;

  const logPayload = {
    message,
    timestamp,
    url,
    userAgent,
    ...metadata
  };

  switch (level) {
    case 'error':
      logger.error('[FRONTEND] %s', message, logPayload);
      break;
    case 'warn':
      logger.warn('[FRONTEND] %s', message, logPayload);
      break;
    case 'info':
    default:
      logger.info('[FRONTEND] %s', message, logPayload);
      break;
  }

  res.status(204).send();
});

module.exports = router;
