const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    qrCode: {
      type: String, // Data URI of the QR code
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'],
      default: 'PENDING',
    },
    score: {
      type: String,
      enum: ['HOT', 'WARM', 'COLD'],
      default: 'COLD',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    scannedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    ticketType: {
      type: String,
      default: 'Standard',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'EXEMPT'],
      default: 'PENDING',
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    profession: {
      type: String,
      trim: true,
    },
    interests: [{
      type: String,
      enum: ['Tech', 'Business', 'Finance', 'Manufacturing', 'Textile', 'Healthcare', 'AI', 'Marketing'],
    }],
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by event and status
visitorSchema.index({ eventId: 1, status: 1 });
visitorSchema.index({ eventId: 1, email: 1 }); // Prevent duplicate registrations and fast lookups
visitorSchema.index({ interests: 1 }); // Multi-key index for interest search

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
