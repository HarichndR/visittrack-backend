const express = require('express');
const organizationController = require('./organization.controller');
const auth = require('../../middleware/auth.middleware');

const router = express.Router();

router
  .route('/')
  .get(organizationController.getOrganizations)
  .post(auth('manageExhibitors'), organizationController.createOrganization);

router
  .route('/:id/join-request')
  .post(auth(), organizationController.requestJoinChapter);

router
  .route('/:id/requests')
  .get(auth(), organizationController.getJoinRequests);

router
  .route('/requests/:requestId')
  .patch(auth(), organizationController.manageJoinRequest);

module.exports = router;
