const Exhibitor = require('./exhibitor.model');
const ApiError = require('../../utils/customError');
const { paginate } = require('../../utils/query.helper');

const createExhibitor = async (exhibitorBody) => {
  if (await Exhibitor.findOne({ eventId: exhibitorBody.eventId, stallNumber: exhibitorBody.stallNumber }).lean()) {
    throw new ApiError(400, 'Stall already occupied for this event');
  }
  return Exhibitor.create(exhibitorBody);
};

const queryExhibitors = async (filter = {}, options = {}) => {
  return paginate(Exhibitor, filter, {
    ...options,
    populate: [
      { path: 'eventId', select: 'name' },
      { path: 'userId', select: 'name email' }
    ]
  });
};

const getExhibitorById = async (id) => {
  return Exhibitor.findById(id)
    .populate('eventId', 'name')
    .populate('userId', 'name email')
    .lean();
};

const updateExhibitorById = async (exhibitorId, updateBody) => {
  const exhibitor = await getExhibitorById(exhibitorId);
  if (!exhibitor) {
    throw new ApiError(404, 'Exhibitor not found');
  }
  Object.assign(exhibitor, updateBody);
  await exhibitor.save();
  return exhibitor;
};

const getExhibitorByUserId = async (userId) => {
  return Exhibitor.findOne({ 
    $or: [{ userId }, { staff: userId }], 
    status: 'ACTIVE' 
  }).lean();
};

module.exports = {
  createExhibitor,
  queryExhibitors,
  getExhibitorById,
  updateExhibitorById,
  getExhibitorByUserId,
};
