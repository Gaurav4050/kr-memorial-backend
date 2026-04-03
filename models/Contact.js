const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    subject: {
      type: String,
      enum: ['Appointment Inquiry', 'Billing Query', 'Feedback', 'Careers', 'Media Inquiry', 'Other'],
    },
    department: {
      type: String,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
    },
    status: {
      type: String,
      enum: ['new', 'responded', 'closed'],
      default: 'new',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    whatsappSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
