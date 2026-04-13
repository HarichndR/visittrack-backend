const express = require('express');
const auth = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const stallController = require('./stall.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), stallController.requestStall)
  .get(auth('EXHIBITOR'), stallController.getMyBookings);

router
  .route('/event/:eventId')
  .get(auth('ORGANIZER', 'STAFF', 'ADMIN'), stallController.getEventBookings);

router
  .route('/approve/:bookingId')
  .patch(auth('ORGANIZER', 'STAFF', 'ADMIN'), stallController.approveStall);

router
  .route('/manual')
  .post(auth('ORGANIZER', 'STAFF', 'ADMIN'), stallController.manualAddStall);

module.exports = router;
