const express = require('express');
const auth = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const visitorValidation = require('./visitor.validation');
const visitorController = require('./visitor.controller');
const upload = require('../../utils/upload');
const { ADMIN, ORGANIZER, STAFF } = require('../../constants/roles');
const permissions = require('../../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Visitors
 *   description: Visitor management and check-in
 */

/**
 * @swagger
 * /visitors:
 *   post:
 *     summary: Create a visitor (Register for event)
 *     tags: [Visitors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - eventId
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               eventId:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *   get:
 *     summary: Get all visitors
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Visitor name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Visitor role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of visitors
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 */
router
  .route('/')
  .post(validate(visitorValidation.createVisitor), visitorController.createVisitor)
  .get(auth(permissions.MANAGE_VISITORS), visitorController.getVisitors);

/**
 * @swagger
 * /visitors/bulk:
 *   post:
 *     summary: Bulk upload visitors via CSV
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
/**
 * @swagger
 * /visitors/my-bookings:
 *   get:
 *     summary: Get own event bookings
 *     description: Visitors can retrieve a list of all events they have registered for.
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
router.get('/my-bookings', auth(), visitorController.getMyBookings);

router
  .route('/bulk')
  .post(auth(permissions.MANAGE_VISITORS), upload.single('file'), validate(visitorValidation.bulkUpload), visitorController.bulkUpload);

/**
 * @swagger
 * /visitors/{id}:
 *   get:
 *     summary: Get a visitor
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Visitor id
 *     responses:
 *       "200":
 *         description: OK
 */
router
  .route('/:visitorId')
  .get(auth(), validate(visitorValidation.getVisitor), visitorController.getVisitor)
  .patch(auth(permissions.MANAGE_VISITORS), validate(visitorValidation.updateVisitor), visitorController.updateVisitor);

/**
 * @swagger
 * /visitors/{id}/check-in:
 *   post:
 *     summary: Check-in a visitor
 *     tags: [Visitors]
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
  .route('/:visitorId/check-in')
  .post(auth(permissions.CHECK_IN_VISITORS), visitorController.checkIn);

/**
 * @swagger
 * /visitors/{id}/check-out:
 *   post:
 *     summary: Check-out a visitor
 *     tags: [Visitors]
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
  .route('/:visitorId/check-out')
  .post(auth(permissions.CHECK_IN_VISITORS), visitorController.checkOut);

/**
 * @swagger
 * /visitors/{id}/score:
 *   post:
 *     summary: Assign a quality score to a visitor
 *     description: Admins or Organizers can score visitors based on engagement or profile quality.
 *     tags: [Visitors]
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
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       "200":
 *         description: OK
 */
router
  .route('/:visitorId/score')
  .post(auth(ADMIN, ORGANIZER), visitorController.scoreVisitor);

/**
 * @swagger
 * /visitors/{id}/approve:
 *   post:
 *     summary: Approve a visitor for event access
 *     description: Staff or Admins can manually approve a visitor if auto-approval is disabled.
 *     tags: [Visitors]
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
  .route('/:visitorId/approve')
  .post(auth(ADMIN, ORGANIZER, STAFF), visitorController.approveVisitor);

module.exports = router;
