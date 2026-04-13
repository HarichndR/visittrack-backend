const express = require('express');
const auth = require('../../middleware/auth.middleware');
const formTemplateController = require('./formTemplate.controller');
const { ADMIN, ORGANIZER } = require('../../constants/roles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FormTemplates
 *   description: Reusable form template management
 */

/**
 * @swagger
 * /form-templates:
 *   get:
 *     summary: Get all form templates
 *     description: Retrieve a list of reusable form structures available on the platform.
 *     tags: [FormTemplates]
 *     responses:
 *       "200":
 *         description: OK
 *   post:
 *     summary: Create a new form template
 *     description: Admins can define a new reusable form structure.
 *     tags: [FormTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - fields
 *             properties:
 *               name:
 *                 type: string
 *               fields:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       "201":
 *         description: Created
 */
router
  .route('/')
  .post(auth(ADMIN), formTemplateController.createTemplate)
  .get(formTemplateController.getTemplates);

/**
 * @swagger
 * /form-templates/from-form:
 *   post:
 *     summary: Create a template from an existing form
 *     description: Admins or Organizers can save a customized event form as a reusable template.
 *     tags: [FormTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - formId
 *               - name
 *             properties:
 *               formId:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 */
router
  .route('/from-form')
  .post(auth(ADMIN, ORGANIZER), formTemplateController.createTemplateFromForm);

/**
 * @swagger
 * /form-templates/{id}:
 *   get:
 *     summary: Get a form template by ID
 *     tags: [FormTemplates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   patch:
 *     summary: Update a form template
 *     description: Admins can update a reusable form structure.
 *     tags: [FormTemplates]
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
 *               name:
 *                 type: string
 *               fields:
 *                 type: array
 *     responses:
 *       "200":
 *         description: OK
 *   delete:
 *     summary: Delete a form template
 *     description: Admins can remove a reusable form structure.
 *     tags: [FormTemplates]
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
router
  .route('/:id')
  .get(formTemplateController.getTemplateById)
  .patch(auth(ADMIN), formTemplateController.updateTemplate)
  .delete(auth(ADMIN), formTemplateController.deleteTemplate);

module.exports = router;
