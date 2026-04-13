const mongoose = require('mongoose');

const nurtureLogSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exhibitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exhibitor',
      required: true,
    },
    assetsSent: [
      {
        name: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['QUEUED', 'SENT', 'FAILED'],
      default: 'SENT', // Defaulting to SENT for mock purposes
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const NurtureLog = mongoose.model('NurtureLog', nurtureLogSchema);

module.exports = NurtureLog;
