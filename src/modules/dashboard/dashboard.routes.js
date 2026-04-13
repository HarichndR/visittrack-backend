const express = require('express');
const auth = require('../../middleware/auth.middleware');
const dashboardController = require('./dashboard.controller');
const { ADMIN, ORGANIZER, STAFF, EXHIBITOR, VISITOR } = require('../../constants/roles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Real-time analytics and statistics
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
router.get('/stats', auth(ADMIN, ORGANIZER, STAFF, EXHIBITOR, VISITOR), dashboardController.getStats);

/**
 * @swagger
 * /dashboard/search:
 *   get:
 *     summary: Search dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
router.get('/search', auth(ADMIN, ORGANIZER, STAFF, EXHIBITOR, VISITOR), dashboardController.search);

module.exports = router;
