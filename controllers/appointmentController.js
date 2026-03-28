const Appointment = require('../models/Appointment');
const { sendAppointmentNotifications } = require('../services/notificationService');

exports.createAppointment = async (req, res) => {
  try {
    console.log('\n=== 📥 [APPOINTMENT API LOG] New Request Received ===');
    console.log('📝 Raw Request Body:');
    console.log(JSON.stringify(req.body, null, 2));
    
    const { department, departmentName, doctorId, doctorName, date, time, name, age, gender, phone, email, reason, isNewPatient } = req.body;

    console.log('\n📝 [APPOINTMENT API LOG] Extracted Fields:');
    console.log(JSON.stringify({
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
    }, null, 2));

    // Generate unique Appointment ID (KRM + 6 random digits)
    const appointmentId = 'KRM' + Math.floor(100000 + Math.random() * 900000);
    console.log('✅ [APPOINTMENT API LOG] Generated Appointment ID:', appointmentId);

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

    console.log('✅ [APPOINTMENT API LOG] Appointment saved to database');
    console.log('  - Database ID:', appointment._id);

    // Send notifications
    console.log('\n📤 [APPOINTMENT API LOG] Calling sendAppointmentNotifications...');
    const { patientWhatsappSent, hospitalWhatsappSent, emailSent } = await sendAppointmentNotifications(appointment.toObject());

    // Update notification status
    appointment.notificationSent.email = emailSent;
    appointment.notificationSent.whatsapp.patient = patientWhatsappSent;
    appointment.notificationSent.whatsapp.hospital = hospitalWhatsappSent;
    await appointment.save();

    console.log('\n✅ [APPOINTMENT API LOG] Final Response:');
    console.log(JSON.stringify({
      success: true,
      appointmentId,
      notificationSent: { email: emailSent, patientWhatsapp: patientWhatsappSent, hospitalWhatsapp: hospitalWhatsappSent }
    }, null, 2));

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('\n❌ [APPOINTMENT API LOG] Error creating appointment:', error.message);
    console.error('  - Stack:', error.stack);
    console.error('  - Request Body was:', JSON.stringify(req.body, null, 2));
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
