const mongoose = require('mongoose');

const exhibitorSchema = new mongoose.Schema(
  // think her whay do like exbiter has event id  i think evemts has exbiter id reenfrnce becouse one exabiter may have multipel events
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    stallNumber: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyBio: {
      type: String,
      trim: true,
    },
    digitalAssets: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        description: { type: String },
      },
    ],
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    stallType: {
      type: String,
      enum: ['Premium', 'Standard', 'Corner'],
      default: 'Standard',
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String,
    },
    contactPerson: {
      name: String,
      phone: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by event and stall
exhibitorSchema.index({ eventId: 1, stallNumber: 1 }, { unique: true });

const Exhibitor = mongoose.model('Exhibitor', exhibitorSchema);

module.exports = Exhibitor;
