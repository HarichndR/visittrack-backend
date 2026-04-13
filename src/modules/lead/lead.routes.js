const express = require('express');
const auth = require('../../middleware/auth.middleware');
const leadController = require('./lead.controller');
const leadValidation = require('./lead.validation');
const validate = require('../../middleware/validate.middleware');
const { ADMIN, ORGANIZER, EXHIBITOR } = require('../../constants/roles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Exhibitor lead management
 */

/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Capture a new lead
 *     description: Exhibitors can capture visitor information scanning their QR codes.
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitorId
 *               - eventId
 *             properties:
 *               visitorId:
 *                 type: string
 *               eventId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all leads
 *     description: Retrieve a list of leads captured by the authenticated exhibitor.
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
router
  .route('/')
  .post(auth(ADMIN, ORGANIZER, EXHIBITOR), validate(leadValidation.createLead), leadController.createLead)
  .get(auth(ADMIN, ORGANIZER, EXHIBITOR), validate(leadValidation.getLeads), leadController.getLeads);

/**
 * @swagger
 * /leads/export:
 *   get:
 *     summary: Export leads to CSV
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: CSV File
 */
router.get('/export', auth(ADMIN, ORGANIZER, EXHIBITOR), validate(leadValidation.getLeads), leadController.exportLeads);

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     summary: Get a specific lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a lead record
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No Content
 */
router
  .route('/:leadId')
  .get(auth(ADMIN, ORGANIZER, EXHIBITOR), validate(leadValidation.getLead), leadController.getLead)
  .delete(auth(ADMIN, ORGANIZER, EXHIBITOR), validate(leadValidation.deleteLead), leadController.deleteLead);

module.exports = router;
