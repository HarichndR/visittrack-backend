const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  // add even timing even start and end time  
  // think about need to add event booking price tell me how actully doned in real even need to handle free evenent
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    host: {
      type: String,
      trim: true,
      default: 'VisiTrack Events',
    },
    banner: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoApproval: {
      type: Boolean,
      default: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    maxStalls: {
      type: Number,
      default: 0,
    },
    maxStaffPerEvent: {
      type: Number,
      default: 5,
    },
    stallPrefix: {
      type: String,
      default: 'A',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
