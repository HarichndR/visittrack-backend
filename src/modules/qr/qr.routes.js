const express = require('express');
const auth = require('../../middleware/auth.middleware');
const qrController = require('./qr.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: QR
 *   description: QR code generation
 */

/**
 * @swagger
 * /qr/visitor/{visitorId}:
 *   get:
 *     summary: Generate QR code for a visitor
 *     description: Retrieve a Base64 encoded QR code containing the visitor's identification.
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: visitorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 */
router.get('/visitor/:visitorId', auth(), qrController.getVisitorQR);

/**
 * @swagger
 * /qr/exhibitor/{exhibitorId}:
 *   get:
 *     summary: Generate QR code for an exhibitor booth
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 */
router.get('/exhibitor/:exhibitorId', auth(), qrController.getExhibitorQR);

module.exports = router;
