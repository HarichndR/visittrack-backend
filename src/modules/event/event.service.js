const Event = require('./event.model');
const ApiError = require('../../utils/customError');
const { paginate } = require('../../utils/query.helper');

const createEvent = async (eventBody, organizerId) => {
  return Event.create({ ...eventBody, organizer: organizerId });
};

const autoArchiveEvents = async () => {
  const now = new Date();
  await Event.updateMany(
    { isActive: true, endDate: { $lt: now } },
    { $set: { isActive: false } }
  );
};

const queryEvents = async (filterOptions, options = {}) => {
  await autoArchiveEvents();
  const { search } = filterOptions;
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  return paginate(Event, filter, options);
};

const getEventById = async (id) => {
  return Event.findById(id);
};

const updateEventById = async (eventId, updateBody) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  Object.assign(event, updateBody);
  await event.save();
  return event;
};

const deleteEventById = async (eventId) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  await event.deleteOne();
  return event;
};

module.exports = {
  createEvent,
  queryEvents,
  getEventById,
  updateEventById,
  deleteEventById,
};
