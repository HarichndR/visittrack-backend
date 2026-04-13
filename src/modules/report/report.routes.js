const express = require('express');
const auth = require('../../middleware/auth.middleware');
const reportController = require('./report.controller');
const { ADMIN, ORGANIZER } = require('../../constants/roles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Event reporting and analytics
 */

/**
 * @swagger
 * /reports/summary/{eventId}:
 *   get:
 *     summary: Get event analytics summary
 *     description: Retrieve key metrics such as total visitors, check-in rates, and top exhibitors for a specific event.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 */
router.get('/summary/:eventId', auth(ADMIN, ORGANIZER), reportController.getEventSummary);

/**
 * @swagger
 * /reports/export-visitors/{eventId}:
 *   get:
 *     summary: Export visitor list to CSV
 *     description: Generate and download a CSV file containing all registered visitors for an event.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export-visitors/:eventId', auth(ADMIN, ORGANIZER), reportController.exportVisitors);

module.exports = router;
