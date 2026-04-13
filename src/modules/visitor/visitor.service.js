const Visitor = require('./visitor.model');
const Event = require('../event/event.model');
const Lead = require('../lead/lead.model');
const ApiError = require('../../utils/customError');
const { generateQR } = require('../../utils/qrGenerator');
const { paginate } = require('../../utils/query.helper');
const mongoose = require('mongoose');

const createVisitor = async (visitorBody) => {
  const event = await Event.findById(visitorBody.eventId);
  if (!event) {
    throw new ApiError(404, 'Operational failure: target event not found');
  }

  const visitor = await Visitor.create({
    ...visitorBody,
    status: event.autoApproval ? 'CONFIRMED' : 'PENDING'
  });

  // Generate QR based on visitor ID
  const qrData = await generateQR(visitor._id.toString());
  visitor.qrCode = qrData;
  await visitor.save();
  return visitor;
};

const approveVisitor = async (visitorId) => {
  const visitor = await Visitor.findById(visitorId);
  if (!visitor) {
    throw new ApiError(404, 'Visitor not found');
  }
  if (visitor.status !== 'PENDING') {
    throw new ApiError(400, 'Visitor is already processed or confirmed');
  }
  visitor.status = 'CONFIRMED';
  await visitor.save();
  return visitor;
};

const queryVisitors = async (filterOptions, options) => {
  const { search, status, eventId, email } = filterOptions;
  const filter = {};

  if (eventId) filter.eventId = eventId;
  if (status) filter.status = status;
  if (email) filter.email = email;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  return paginate(Visitor, filter, {
    ...options,
    populate: 'eventId',
  });
};

const getVisitorById = async (id) => {
  return Visitor.findById(id).populate('eventId', 'name location');
};

const updateVisitorById = async (visitorId, updateBody) => {
  const visitor = await getVisitorById(visitorId);
  if (!visitor) {
    throw new ApiError(404, 'Visitor not found');
  }
  Object.assign(visitor, updateBody);
  await visitor.save();
  return visitor;
};

const checkInVisitor = async (visitorId) => {
    const visitor = await getVisitorById(visitorId);
    if (!visitor) {
        throw new ApiError(404, 'Visitor not found');
    }
    
    if (visitor.eventId && visitor.eventId.isActive === false) {
        throw new ApiError(403, 'Access Denied: Event has expired or been archived');
    }

    if (visitor.status === 'PENDING') {
        throw new ApiError(403, 'Access Denied: Booking awaiting organizer approval');
    }
    if (visitor.status === 'CHECKED_IN') {
        throw new ApiError(400, 'Visitor already checked in');
    }
    visitor.status = 'CHECKED_IN';
    visitor.checkInTime = new Date();
    await visitor.save();
    return visitor;
};

const checkOutVisitor = async (visitorId) => {
    const visitor = await getVisitorById(visitorId);
    if (!visitor) {
        throw new ApiError(404, 'Visitor not found');
    }
    visitor.status = 'CHECKED_OUT';
    visitor.checkOutTime = new Date();
    await visitor.save();
    return visitor;
};

const bulkUpload = async (visitorsData, eventId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const visitors = await Promise.all(visitorsData.map(async (data) => {
      const visitor = new Visitor({
        ...data,
        eventId,
      });
      // Generate QR
      const qrData = await generateQR(visitor._id.toString());
      visitor.qrCode = qrData;
      return visitor;
    }));
    
    const result = await Visitor.insertMany(visitors, { session });
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const scoreVisitor = async (visitorId) => {
  const visitor = await getVisitorById(visitorId);
  if (!visitor) throw new ApiError(404, 'Visitor not found');

  const leads = await Lead.find({ visitorId });
  
  const totalRating = leads.reduce((acc, curr) => {
    const rating = typeof curr.rating === 'number' ? curr.rating : 0;
    return acc + rating;
  }, 0);

  const avgRating = leads.length > 0 ? totalRating / leads.length : 0;
  const scanCount = Array.isArray(visitor.scannedBy) ? visitor.scannedBy.length : 0;

  // Professional Scoring Algorithm
  if (avgRating >= 4 || scanCount >= 3) {
    visitor.score = 'HOT';
  } else if (avgRating >= 2.5 || scanCount >= 1) {
    visitor.score = 'WARM';
  } else {
    visitor.score = 'COLD';
  }

  await visitor.save();
  return visitor;
};

module.exports = {
  createVisitor,
  queryVisitors,
  getVisitorById,
  updateVisitorById,
  checkInVisitor,
  checkOutVisitor,
  approveVisitor,
  bulkUpload,
  scoreVisitor
};
