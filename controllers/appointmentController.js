const Appointment = require('../models/Appointment');
const { sendAppointmentNotifications } = require('../services/notificationService');

exports.createAppointment = async (req, res) => {
  try {
    const { department, departmentName, doctorId, doctorName, date, time, name, age, gender, phone, email, reason, isNewPatient } = req.body;

    // Generate unique Appointment ID (KRM + 6 random digits)
    const appointmentId = 'KRM' + Math.floor(100000 + Math.random() * 900000);

    const appointment = await Appointment.create({
      appointmentId,
      department,
      departmentName,
      doctorId,
      doctorName,
      date,
      time,
      name,
      age,
      gender,
      phone,
      email,
      reason,
      isNewPatient,
    });

    // Send notifications
    const { emailSent, whatsappSent } = await sendAppointmentNotifications(appointment);

    // Update notification status
    appointment.notificationSent = { email: emailSent, whatsapp: whatsappSent };
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, status } = req.query;

    const query = {};
    if (date) query.date = date; // Date filter (YYYY-MM-DD)
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 }) // Latest first
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: appointments,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalMatches: count,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
