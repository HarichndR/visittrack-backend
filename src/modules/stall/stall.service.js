const httpStatus = require('http-status');
const StallBooking = require('./stall-booking.model');
const Event = require('../event/event.model');
const ApiError = require('../../utils/customError');

/**
 * Request a stall for an event
 */
const requestStall = async (exhibitorId, eventId, companyName, notes) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  // Check if max stalls reached
  const currentStalls = await StallBooking.countDocuments({ eventId, status: { $ne: 'REJECTED' } });
  if (event.maxStalls > 0 && currentStalls >= event.maxStalls) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Event has reached its maximum stall capacity');
  }

  return StallBooking.create({
    eventId,
    exhibitorId,
    companyName,
    notes,
    maxStaff: event.maxStaffPerEvent || 5
  });
};

/**
 * Get all stall bookings for an event (for organizers/staff)
 */
const getEventStallBookings = async (eventId) => {
  return StallBooking.find({ eventId }).populate('exhibitorId', 'name email');
};

/**
 * Get exhibitor's own bookings
 */
const getExhibitorBookings = async (exhibitorId) => {
  return StallBooking.find({ exhibitorId }).populate('eventId', 'name startDate location');
};

/**
 * Approve and assign a stall ID
 */
const approveStall = async (bookingId, stallId, adminId) => {
  const booking = await StallBooking.findById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking request not found');
  }

  let finalStallId = stallId;
  
  // Auto-generate stallId if not provided
  if (!finalStallId) {
    const event = await Event.findById(booking.eventId);
    const prefix = event?.stallPrefix || 'A';
    const approvedBookings = await StallBooking.countDocuments({ 
      eventId: booking.eventId, 
      status: 'APPROVED',
      stallId: { $ne: null }
    });
    finalStallId = `${prefix}${approvedBookings + 1}`;
  }

  // Check if finalStallId is already taken for this event
  const isTaken = await StallBooking.findOne({ 
    eventId: booking.eventId, 
    stallId: finalStallId, 
    _id: { $ne: bookingId },
    status: 'APPROVED'
  });

  if (isTaken) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Stall ${finalStallId} is already assigned to another exhibitor`);
  }

  booking.status = 'APPROVED';
  booking.stallId = finalStallId;
  booking.approvedBy = adminId;
  booking.approvedAt = new Date();
  
  await booking.save();

  // Bridging: Synchronize with Exhibitor Index
  const Exhibitor = require('../exhibitor/exhibitor.model');
  const user = await require('../user/user.model').findById(booking.exhibitorId);
  
  await Exhibitor.findOneAndUpdate(
    { eventId: booking.eventId, userId: booking.exhibitorId },
    {
      name: user?.name || booking.companyName,
      company: booking.companyName,
      stallNumber: finalStallId,
      eventId: booking.eventId,
      userId: booking.exhibitorId,
      status: 'ACTIVE'
    },
    { upsert: true, new: true }
  );

  return booking;
};

/**
 * Manually add a stall (Organizers/Staff)
 */
const manualAddStall = async (adminId, eventId, exhibitorEmail, stallId, companyName) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');

  // Check max stalls
  const currentStalls = await StallBooking.countDocuments({ eventId, status: { $ne: 'REJECTED' } });
  if (event.maxStalls > 0 && currentStalls >= event.maxStalls) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Event has reached its maximum stall capacity');
  }

  // Auto-generate stallId if not provided
  let finalStallId = stallId;
  if (!finalStallId) {
    const prefix = event.stallPrefix || 'A';
    const approvedBookings = await StallBooking.countDocuments({ 
      eventId, 
      status: 'APPROVED',
      stallId: { $ne: null }
    });
    finalStallId = `${prefix}${approvedBookings + 1}`;
  }

  // Find user by email to get ID
  const User = require('../user/user.model');
  const user = await User.findOne({ email: exhibitorEmail });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'Exhibitor user not found with this email');

  try {
    // Use findOneAndUpdate to handle existing bookings for this exhibitor+event
    const booking = await StallBooking.findOneAndUpdate(
      { eventId, exhibitorId: user._id },
      {
        companyName,
        stallId: finalStallId,
        status: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
        maxStaff: event.maxStaffPerEvent || 5
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Bridging: Synchronize with Exhibitor Index
    const Exhibitor = require('../exhibitor/exhibitor.model');
    await Exhibitor.findOneAndUpdate(
      { eventId, userId: user._id },
      {
        name: user.name,
        company: companyName,
        stallNumber: finalStallId,
        eventId,
        userId: user._id,
        status: 'ACTIVE'
      },
      { upsert: true, new: true, runValidators: true }
    );

    return booking;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'The requested stall ID is already occupied or this exhibitor already has a booking.');
    }
    throw error;
  }
};

module.exports = {
  requestStall,
  getEventStallBookings,
  getExhibitorBookings,
  approveStall,
  manualAddStall
};
