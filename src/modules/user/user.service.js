const User = require('./user.model');
const OrganizerRequest = require('./organizer-request.model');
const ApiError = require('../../utils/customError');
const { ORGANIZER } = require('../../constants/roles');
const notificationService = require('../../utils/notification.service');

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(400, 'Email already taken');
  }
  if (userBody.role && userBody.role !== 'VISITOR' && userBody.mustChangePassword === undefined) {
    userBody.mustChangePassword = true;
  }
  return User.create(userBody);
};

const queryUsers = async (filter, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const users = await User.find({ ...filter, isActive: { $ne: false } })
    .sort('-createdAt')
    .limit(limit)
    .skip(skip);

  const totalResults = await User.countDocuments({ ...filter, isActive: { $ne: false } });
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: users,
    page,
    limit,
    totalPages,
    totalResults
  };
};

const getUserById = async (id) => {
  return User.findById(id);
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(400, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  await user.deleteOne();
  return user;
};

const saveEvent = async (userId, eventId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedEvents: eventId } },
    { new: true }
  ).populate('savedEvents');
  return user;
};

const unsaveEvent = async (userId, eventId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { savedEvents: eventId } },
    { new: true }
  ).populate('savedEvents');
  return user;
};

const createOrganizerRequest = async (userId, requestBody) => {
  const email = requestBody.email;
  
  // Check for existing pending request for this email
  const existingRequest = await OrganizerRequest.findOne({ 
    email: email, 
    status: 'PENDING' 
  });
  
  if (existingRequest) {
    throw new ApiError(400, 'A pending application for this email already exists.');
  }

  const data = userId ? { userId, ...requestBody } : requestBody;
  return OrganizerRequest.create(data);
};

const getOrganizerRequests = async (filter) => {
  return OrganizerRequest.find(filter)
    .populate('userId', 'name email')
    .sort('-createdAt');
};

const approveOrganizerRequest = async (requestId) => {
  const request = await OrganizerRequest.findById(requestId).populate('userId');
  if (!request) {
    throw new ApiError(404, 'Organizer request not found');
  }
  
  request.status = 'APPROVED';
  await request.save();

  let targetEmail = request.email;
  let targetName = request.name;

  // If it's an internal upgrade
  if (request.userId) {
    await User.findByIdAndUpdate(request.userId._id, { role: ORGANIZER });
    targetEmail = request.userId.email;
    targetName = request.userId.name;
  } else {
    // If it's a public request, check if user exists or create them
    let user = await User.findOne({ email: request.email });
    if (!user) {
      // Create a pending organizer account
      user = await User.create({
        name: request.name,
        email: request.email,
        password: 'admin123', // Deterministic placeholder for QA testing
        role: ORGANIZER,
        isEmailVerified: true, // Auto-verify for approved applications
        mustChangePassword: true
      });
    } else {
      user.role = ORGANIZER;
      await user.save();
    }
  }

  // Send professional notification
  await notificationService.sendOrganizerApprovalEmail(targetEmail, request.businessName);
  
  return request;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  saveEvent,
  unsaveEvent,
  createOrganizerRequest,
  getOrganizerRequests,
  approveOrganizerRequest,
};
