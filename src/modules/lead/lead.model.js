const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    exhibitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exhibitor',
      required: true,
    },
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    capturedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    status: {
      type: String,
      enum: ['COLD', 'WARM', 'HOT'],
      default: 'COLD',
    },
    visitorSnapshot: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexed for fast lookup by exhibitor per event
leadSchema.index({ exhibitorId: 1, eventId: 1 });
leadSchema.index({ exhibitorId: 1, status: 1, createdAt: -1 }); // Fast filters for dashboard
leadSchema.index({ visitorId: 1, exhibitorId: 1 }, { unique: true });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
