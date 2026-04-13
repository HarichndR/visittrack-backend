const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const Visitor = require('../visitor/visitor.model');
const Event = require('../event/event.model');
const Lead = require('../lead/lead.model');
const ApiError = require('../../utils/customError');

const getEventSummary = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const [visitorCount, leadCount] = await Promise.all([
    Visitor.countDocuments({ eventId }),
    Lead.countDocuments({ eventId }),
  ]);

  res.send(new ApiResponse(200, {
    event: event.name,
    stats: {
      visitorCount,
      leadCount,
    }
  }, 'Event summary retrieved successfully'));
});

const exportVisitors = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const visitors = await Visitor.find({ eventId }).select('name email company phone -_id');
  
  // Basic mock of CSV/JSON export for audit
  res.send(new ApiResponse(200, visitors, 'Visitor list exported successfully'));
});

module.exports = {
  getEventSummary,
  exportVisitors,
};
