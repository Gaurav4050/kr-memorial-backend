const mongoose = require('mongoose');

const adminOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Valid for 5 minutes
  },
});

module.exports = mongoose.model('AdminOtp', adminOtpSchema);
