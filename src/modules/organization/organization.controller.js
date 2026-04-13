const Organization = require('./organization.model');
const ChapterMember = require('./chapterMember.model');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/customError');

const getOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.find({ isActive: true }).lean();
  res.send(new ApiResponse(200, organizations, 'Organizations retrieved successfully'));
});

const createOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.create({
    ...req.body,
    owner: req.user._id
  });
  res.status(201).send(new ApiResponse(201, organization, 'Organization created successfully'));
});

const requestJoinChapter = asyncHandler(async (req, res) => {
  const organizationId = req.params.id;
  const visitorId = req.user._id;

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, 'Organization not found');
  }

  // Check if already a member or requested
  const existingRequest = await ChapterMember.findOne({ organizationId, visitorId });
  if (existingRequest) {
    throw new ApiError(400, 'Join request already submitted or member is already active');
  }

  const joinRequest = await ChapterMember.create({
    organizationId,
    visitorId,
    status: 'PENDING'
  });

  res.status(201).send(new ApiResponse(201, joinRequest, 'Join request submitted successfully. Awaiting approval.'));
});

const getJoinRequests = asyncHandler(async (req, res) => {
  const organizationId = req.params.id;
  
  // Verify ownership
  const organization = await Organization.findOne({ _id: organizationId, owner: req.user._id });
  if (!organization && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to view requests for this organization');
  }

  const requests = await ChapterMember.find({ organizationId, status: 'PENDING' }).populate('visitorId', 'name email profession');
  res.send(new ApiResponse(200, requests, 'Pending join requests retrieved'));
});

const manageJoinRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, notes } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new ApiError(400, 'Invalid status update');
  }

  const joinRequest = await ChapterMember.findById(requestId).populate('organizationId');
  if (!joinRequest) {
    throw new ApiError(404, 'Request not found');
  }

  // Verify ownership of organization
  if (joinRequest.organizationId.owner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Unauthorized to manage requests for this organization');
  }

  joinRequest.status = status;
  joinRequest.notes = notes;
  joinRequest.managedBy = req.user._id;
  joinRequest.managedAt = new Date();
  await joinRequest.save();

  // If approved, also add to followers array for legacy compatibility
  if (status === 'APPROVED') {
    await Organization.findByIdAndUpdate(joinRequest.organizationId._id, {
      $addToSet: { followers: joinRequest.visitorId }
    });
  }

  res.send(new ApiResponse(200, joinRequest, `Request ${status.toLowerCase()} successfully`));
});

module.exports = {
  getOrganizations,
  createOrganization,
  requestJoinChapter,
  getJoinRequests,
  manageJoinRequest,
};
