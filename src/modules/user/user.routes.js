const express = require('express');
const auth = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const userValidation = require('./user.validation');
const userController = require('./user.controller');
const { ADMIN } = require('../../constants/roles');
const permissions = require('../../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Admins can retrieve a list of all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
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
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
router
  .route('/')
  .post(auth(permissions.MANAGE_STAFF), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve detailed information about the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 */
router
  .route('/profile')
  .get(auth(), userController.getProfile)
  .patch(auth(), validate(userValidation.updateProfile), userController.updateProfile);

/**
 * @swagger
 * /users/save-event/{eventId}:
 *   post:
 *     summary: Save an event to watchlist
 *     tags: [Users]
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
router.post('/save-event/:eventId', auth(), userController.saveEvent);

/**
 * @swagger
 * /users/unsave-event/{eventId}:
 *   post:
 *     summary: Remove an event from watchlist
 *     tags: [Users]
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
router.post('/unsave-event/:eventId', auth(), userController.unsaveEvent);

/**
 * @swagger
 * /users/request-organizer:
 *   post:
 *     summary: Submit organizer application
 *     description: Registered users can apply to become an organizer.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/request-organizer', auth(), validate(userValidation.submitOrganizerRequest), userController.submitOrganizerRequest);

/**
 * @swagger
 * /users/public-organizer-request:
 *   post:
 *     summary: Submit public organizer application
 *     description: Non-registered users can apply to become an organizer.
 *     tags: [Users]
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/public-organizer-request', validate(userValidation.submitOrganizerRequest), userController.submitPublicOrganizerRequest);

/**
 * @swagger
 * /users/organizer-requests:
 *   get:
 *     summary: Get all pending organizer applications
 *     description: Admins can review all pending applications to upgrade user roles.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */
router.get('/organizer-requests', auth('ADMIN'), userController.getOrganizerRequests);

/**
 * @swagger
 * /users/approve-organizer/{requestId}:
 *   post:
 *     summary: Approve an organizer application
 *     description: Admins can approve a request, which automatically upgrades the user or creates a new organizer account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/approve-organizer/:requestId', auth('ADMIN'), validate(userValidation.approveOrganizerRequest), userController.approveOrganizerRequest);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Retrieve detailed information about a specific user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Modify user details (Admins only).
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
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
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth(permissions.MANAGE_STAFF), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth(permissions.MANAGE_STAFF), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
