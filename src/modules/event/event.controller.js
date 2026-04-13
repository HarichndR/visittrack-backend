const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const eventService = require('./event.service');
const ApiError = require('../../utils/customError');
const organizationService = require('../organization/organization.service');
const userService = require('../user/user.service');

const createEvent = asyncHandler(async (req, res) => {
  let user = await userService.getUserById(req.user._id);
  
  // Bootstrap: Auto-create chapter if missing
  if (!user.organizationId) {
    const newOrg = await organizationService.createOrganization({
      name: `${user.name}'s Chapter`,
      bio: `Professional event community by ${user.name}`,
      owner: user._id
    });
    user = await userService.updateUserById(user._id, { organizationId: newOrg._id });
  }

  const event = await eventService.createEvent({
    ...req.body,
    organizationId: user.organizationId
  }, req.user._id);
  
  res.status(201).send(new ApiResponse(201, event, 'Event created successfully'));
});

const getEvents = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await eventService.queryEvents({ search }, { page, limit });
  res.send(new ApiResponse(200, result, 'Events retrieved successfully'));
});

const getEvent = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  res.send(new ApiResponse(200, event, 'Event retrieved successfully'));
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEventById(req.params.eventId, req.body);
  res.send(new ApiResponse(200, event, 'Event updated successfully'));
});

const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.deleteEventById(req.params.eventId);
  res.status(204).send(new ApiResponse(204, null, 'Event deleted successfully'));
});

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
};
