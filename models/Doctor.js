const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    departmentId: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true, // we will upload to cloudinary
    },
    designation: {
      type: String,
      default: 'Senior Consultant',
    },
    languages: [{
      type: String,
    }],
    opdDays: {
      type: String,
      default: 'Mon-Sat',
    },
    opdTime: {
      type: String,
      default: '09:00 AM - 05:00 PM',
    },
    bio: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
