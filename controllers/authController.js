const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AdminOtp = require('../models/AdminOtp');
const { sendOtpEmail } = require('../services/notificationService');

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save/Update OTP in DB
    await AdminOtp.deleteMany({ email }); // Remove old OTPs
    await AdminOtp.create({ email, otp: hashedOtp });

    // Send via email
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) return res.status(500).json({ success: false, message: 'Failed to send OTP email' });

    res.status(200).json({ success: true, message: 'OTP sent successfully to registered admin email' });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 1. Verify Password
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 2. Verify OTP
    const otpRecord = await AdminOtp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    const isValidOtp = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Generate JWT
    const token = jwt.sign({ id: email, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Delete used OTP
    await AdminOtp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
