const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: document will be deleted at the specified Date
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active OTP per email
otpSchema.index({ email: 1 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
