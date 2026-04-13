const express = require('express');
const auth = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const exhibitorValidation = require('./exhibitor.validation');
const exhibitorController = require('./exhibitor.controller');
const { ADMIN, ORGANIZER } = require('../../constants/roles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exhibitors
 *   description: Exhibitor management
 */

/**
 * @swagger
 * /exhibitors:
 *   post:
 *     summary: Onboard a new exhibitor
 *     description: Admins or Organizers can create exhibitor profiles linked to specific events.
 *     tags: [Exhibitors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - email
 *               - eventId
 *             properties:
 *               businessName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               eventId:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all exhibitors
 *     description: Retrieve a list of all registered exhibitors.
 *     tags: [Exhibitors]
 *     parameters:
 *       - in: query
 *         name: businessName
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       "200":
 *         description: OK
 */
router
  .route('/')
  .post(auth('manageExhibitors'), validate(exhibitorValidation.createExhibitor), exhibitorController.createExhibitor)
  .get(exhibitorController.getExhibitors);

router.get('/me', auth(), exhibitorController.getMyExhibitor);

/**
 * @swagger
 * /exhibitors/{id}:
 *   get:
 *     summary: Get an exhibitor profile
 *     tags: [Exhibitors]
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
 *   patch:
 *     summary: Update an exhibitor profile
 *     tags: [Exhibitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   delete:
 *     summary: Delete an exhibitor profile
 *     tags: [Exhibitors]
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
  .route('/:exhibitorId')
  .get(validate(exhibitorValidation.getExhibitor), exhibitorController.getExhibitor)
  .patch(auth(), validate(exhibitorValidation.updateExhibitor), exhibitorController.updateExhibitor)
  .delete(auth('manageExhibitors'), validate(exhibitorValidation.deleteExhibitor), exhibitorController.deleteExhibitor);

module.exports = router;
