const express = require('express');
const auth = require('../../middleware/auth.middleware');
const formController = require('./form.controller');
const { ADMIN, ORGANIZER } = require('../../constants/roles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Forms
 *   description: Custom form management
 */

/**
 * @swagger
 * /forms:
 *   post:
 *     summary: Create a custom form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Created
 *   get:
 *     summary: Get all forms
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
router
  .route('/')
  .post(auth(ADMIN, ORGANIZER), formController.createForm);

/**
 * @swagger
 * /forms/from-template:
 *   post:
 *     summary: Create a form using a template
 *     description: Admins or Organizers can initialize a new form with fields pre-populated from a template.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - templateId
 *             properties:
 *               eventId:
 *                 type: string
 *               templateId:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 */
router
  .route('/from-template')
  .post(auth(ADMIN, ORGANIZER), formController.createFormFromTemplate);

/**
 * @swagger
 * /forms/event/{eventId}:
 *   get:
 *     summary: Get form associated with an event
 *     tags: [Forms]
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
router
  .route('/event/:eventId')
  .get(formController.getFormByEvent);

/**
 * @swagger
 * /forms/{id}:
 *   get:
 *     summary: Get a form
 *     tags: [Forms]
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
 */
/**
 * @swagger
 * /forms/{id}:
 *   patch:
 *     summary: Update form structure
 *     tags: [Forms]
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
 *               title:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       "200":
 *         description: OK
 *
 *   delete:
 *     summary: Delete a custom form
 *     tags: [Forms]
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
  .route('/:formId')
  .patch(auth(ADMIN, ORGANIZER), formController.updateForm)
  .delete(auth(ADMIN, ORGANIZER), formController.deleteForm);

module.exports = router;
