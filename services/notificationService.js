const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Initialize Twilio
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log('\n📧 [EMAIL LOG] Input Parameters:');
    console.log('  - To:', to);
    console.log('  - Subject:', subject);
    console.log('  - HTML preview:', html.substring(0, 50) + '...');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL LOG] Email sent successfully');
    console.log('  - Response:', info.response);
    return true;
  } catch (error) {
    console.error('❌ [EMAIL LOG] Email error:', error.message);
    console.error('  - Full error:', error);
    return false;
  }
};

const sendWhatsApp = async ({ to, message }) => {
  try {
    console.log('\n📱 [WHATSAPP LOG] Input Parameters:');
    console.log('  - Raw phone number:', to);
    console.log('  - Message preview:', message.substring(0, 50) + '...');
    
    if (!twilioClient) {
      console.error('❌ [WHATSAPP LOG] Twilio is not configured');
      return false;
    }
    
    // Ensure "to" format is whatsapp:+91XXXXXXXXXX
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:+91${to}`;
    console.log('  - Formatted phone:', formattedTo);
    
    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: formattedTo,
    });
    
    console.log('✅ [WHATSAPP LOG] Message sent successfully');
    console.log('  - Message SID:', response.sid);
    console.log('  - From:', process.env.TWILIO_WHATSAPP_FROM);
    console.log('  - To:', formattedTo);
    return true;
  } catch (error) {
    console.error('❌ [WHATSAPP LOG] Error:', error.message);
    console.error('  - Full error:', error);
    return false;
  }
};

const sendAppointmentNotifications = async (appointment) => {
  console.log('\n📋 [APPOINTMENT NOTIFICATION LOG] Received Payload:');
  console.log(JSON.stringify(appointment, null, 2));
  
  const { name, date, time, appointmentId, phone, email, departmentName, doctorName } = appointment;
  
  console.log('\n📋 [APPOINTMENT NOTIFICATION LOG] Extracted Fields:');
  console.log('  - Name:', name);
  console.log('  - Phone:', phone);
  console.log('  - Email:', email);
  console.log('  - Department:', departmentName);
  console.log('  - Doctor:', doctorName);
  console.log('  - Date:', date);
  console.log('  - Time:', time);
  console.log('  - Appointment ID:', appointmentId);
  
  // WhatsApp Message for Patient
  const whatsappMessage = `Hello ${name}, your appointment at K.R. Memorial Hospital is confirmed!
ID: ${appointmentId}
Dept: ${departmentName}
Doctor: ${doctorName || 'Any Available'}
Date: ${date}
Time: ${time}

Please carry valid ID and previous records. Need help? Call: +91-8006005111`;

  // WhatsApp Message for Hospital
  const hospitalMessage = `New Appointment Booked!
Patient: ${name}
ID: ${appointmentId}
Department: ${departmentName}
Doctor: ${doctorName || 'Any Available'}
Date: ${date}
Time: ${time}
Phone: ${phone}`;

  console.log('\n📋 [APPOINTMENT NOTIFICATION LOG] Messages Created:');
  console.log('  - Patient WhatsApp message created');
  console.log('  - Hospital WhatsApp message created');

  // Email Html for Patient
  const emailHtml = `
    <h2>Appointment Confirmed!</h2>
    <p>Dear ${name},</p>
    <p>Your appointment has been successfully scheduled at K.R. Memorial Hospital.</p>
    <ul>
      <li><strong>Appointment ID:</strong> ${appointmentId}</li>
      <li><strong>Department:</strong> ${departmentName}</li>
      <li><strong>Doctor:</strong> ${doctorName || 'Any Available'}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Time:</strong> ${time}</li>
    </ul>
    <p>Please bring a valid photo ID and any previous medical records.</p>
    <p>Thank you,<br>K.R. Memorial Hospital</p>
  `;

  // Email Html for Hospital
  const hospitalEmailHtml = `
    <h2 style="color: #0B3D91;">New Appointment Booking</h2>
    <p><strong>Patient Details:</strong></p>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Phone:</strong> ${phone}</li>
      <li><strong>Email:</strong> ${email || 'N/A'}</li>
      <li><strong>Age:</strong> ${appointment.age}</li>
      <li><strong>Gender:</strong> ${appointment.gender}</li>
      <li><strong>Patient Type:</strong> ${appointment.isNewPatient ? 'New Patient' : 'Existing Patient'}</li>
    </ul>
    <p><strong>Appointment Details:</strong></p>
    <ul>
      <li><strong>Appointment ID:</strong> ${appointmentId}</li>
      <li><strong>Department:</strong> ${departmentName}</li>
      <li><strong>Doctor:</strong> ${doctorName || 'Any Available'}</li>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Time:</strong> ${time}</li>
      <li><strong>Reason:</strong> ${appointment.reason || 'N/A'}</li>
    </ul>
    <p style="color: #666; font-size: 12px;">This is an automated notification from K.R. Memorial Hospital appointment system.</p>
  `;

  let patientWhatsappSent = false;
  let hospitalWhatsappSent = false;
  let emailSent = false;

  console.log('\n📋 [APPOINTMENT NOTIFICATION LOG] Starting Notifications:');
  
  // Send to Patient
  if (phone) {
    console.log('  📤 Sending WhatsApp to patient...');
    patientWhatsappSent = await sendWhatsApp({ to: phone, message: whatsappMessage });
    console.log('  📤 Patient WhatsApp result:', patientWhatsappSent);
  } else {
    console.log('  ⚠️  No phone number provided - skipping patient WhatsApp');
  }
  
  // Send to Hospital
  const hospitalNumber = process.env.HOSPITAL_WHATSAPP_NUMBER;
  if (hospitalNumber) {
    console.log('  📤 Sending WhatsApp to hospital (' + hospitalNumber + ')...');
    hospitalWhatsappSent = await sendWhatsApp({ to: hospitalNumber, message: hospitalMessage });
    console.log('  📤 Hospital WhatsApp result:', hospitalWhatsappSent);
  } else {
    console.log('  ⚠️  HOSPITAL_WHATSAPP_NUMBER not in .env - skipping hospital WhatsApp');
  }
  
  // Send email to patient
  if (email) {
    console.log('  📧 Sending email to patient...');
    emailSent = await sendEmail({ to: email, subject: `Appointment Confirmed - ${appointmentId}`, html: emailHtml });
    console.log('  📧 Email result:', emailSent);
  } else {
    console.log('  ⚠️  No email provided - skipping email');
  }

  // Send email to hospital
  const hospitalEmail = process.env.HOSPITAL_EMAIL;
  if (hospitalEmail) {
    console.log('  📧 Sending email to hospital (' + hospitalEmail + ')...');
    await sendEmail({ to: hospitalEmail, subject: `New Appointment Booking - ${appointmentId}`, html: hospitalEmailHtml });
    console.log('  📧 Hospital email sent');
  } else {
    console.log('  ⚠️  HOSPITAL_EMAIL not in .env - skipping hospital email');
  }

  console.log('\n✅ [APPOINTMENT NOTIFICATION LOG] Final Results:');
  console.log(JSON.stringify({ patientWhatsappSent, hospitalWhatsappSent, emailSent }, null, 2));

  return { patientWhatsappSent, hospitalWhatsappSent, emailSent };
};

const sendOtpEmail = async (email, otp) => {
  const subject = 'Admin Login OTP - K.R. Memorial Hospital';
  const html = `
    <h2>Admin Login Verification</h2>
    <p>Your One-Time Password (OTP) for admin login is:</p>
    <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
    <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return await sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendWhatsApp,
  sendAppointmentNotifications,
  sendOtpEmail,
};
