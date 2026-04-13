const mongoose = require('mongoose');

const stallBookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    exhibitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    stallId: {
      type: String,
      trim: true,
      description: 'Human readable stall ID (e.g. A1, B1)',
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
    maxStaff: {
      type: Number,
      default: 2,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one active request/booking per event
stallBookingSchema.index({ eventId: 1, exhibitorId: 1 }, { unique: true });

// Ensure stall IDs are unique per event (once assigned)
stallBookingSchema.index(
  { eventId: 1, stallId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { stallId: { $exists: true, $ne: null } } 
  }
);

const StallBooking = mongoose.model('StallBooking', stallBookingSchema);

module.exports = StallBooking;
