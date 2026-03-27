const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      required: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    departmentName: {
      type: String,
    },
    doctorId: {
      type: String,
    },
    doctorName: {
      type: String,
      default: 'Any Available',
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    reason: {
      type: String,
      trim: true,
    },
    isNewPatient: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notificationSent: {
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Index for faster queries
appointmentSchema.index({ date: -1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
