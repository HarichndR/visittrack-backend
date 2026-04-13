const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const userService = require('./user.service');
const ApiError = require('../../utils/customError');

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).send(new ApiResponse(201, user, 'User created successfully'));
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.queryUsers({}, {});
  res.send(new ApiResponse(200, users, 'Users retrieved successfully'));
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.send(new ApiResponse(200, user, 'User retrieved successfully'));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(new ApiResponse(200, user, 'User updated successfully'));
});

const getProfile = asyncHandler(async (req, res) => {
  res.send(new ApiResponse(200, req.user, 'Profile retrieved successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserById(req.user._id, req.body);
  res.send(new ApiResponse(200, user, 'Profile updated successfully'));
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(204).send(new ApiResponse(204, null, 'User deleted successfully'));
});

const saveEvent = asyncHandler(async (req, res) => {
  const user = await userService.saveEvent(req.user._id, req.params.eventId);
  res.send(new ApiResponse(200, user, 'Event saved successfully'));
});

const unsaveEvent = asyncHandler(async (req, res) => {
  const user = await userService.unsaveEvent(req.user._id, req.params.eventId);
  res.send(new ApiResponse(200, user, 'Event unsaved successfully'));
});

const submitOrganizerRequest = asyncHandler(async (req, res) => {
  const request = await userService.createOrganizerRequest(req.user._id, req.body);
  res.status(201).send(new ApiResponse(201, request, 'Organizer request submitted successfully'));
});

const submitPublicOrganizerRequest = asyncHandler(async (req, res) => {
  const request = await userService.createOrganizerRequest(null, req.body);
  res.status(201).send(new ApiResponse(201, request, 'Public organizer request submitted successfully'));
});

const getOrganizerRequests = asyncHandler(async (req, res) => {
  const requests = await userService.getOrganizerRequests(req.query);
  res.send(new ApiResponse(200, requests, 'Organizer requests retrieved successfully'));
});

const approveOrganizerRequest = asyncHandler(async (req, res) => {
  const request = await userService.approveOrganizerRequest(req.params.requestId);
  res.send(new ApiResponse(200, request, 'Organizer request approved successfully'));
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  getProfile,
  updateProfile,
  deleteUser,
  saveEvent,
  unsaveEvent,
  submitOrganizerRequest,
  submitPublicOrganizerRequest,
  getOrganizerRequests,
  approveOrganizerRequest,
};
