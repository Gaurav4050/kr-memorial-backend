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
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

const sendWhatsApp = async ({ to, message }) => {
  try {
    if (!twilioClient) {
      console.log('Twilio is not configured');
      return false;
    }
    
    // Ensure "to" format is whatsapp:+91XXXXXXXXXX
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:+91${to}`;
    
    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: formattedTo,
    });
    
    console.log('WhatsApp sent:', response.sid);
    return true;
  } catch (error) {
    console.error('WhatsApp error:', error);
    return false;
  }
};

const sendAppointmentNotifications = async (appointment) => {
  const { name, date, time, appointmentId, phone, email, departmentName, doctorName } = appointment;
  
  // WhatsApp Message
  const whatsappMessage = `Hello ${name}, your appointment at K.R. Memorial Hospital is confirmed!
ID: ${appointmentId}
Dept: ${departmentName}
Doctor: ${doctorName || 'Any Available'}
Date: ${date}
Time: ${time}

Please carry valid ID and previous records. Need help? Call: +91-8006005111`;

  // Email Html
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

  let whatsappSent = false;
  let emailSent = false;

  if (phone) {
    whatsappSent = await sendWhatsApp({ to: phone, message: whatsappMessage });
  }
  
  if (email) {
    emailSent = await sendEmail({ to: email, subject: `Appointment Confirmed - ${appointmentId}`, html: emailHtml });
  }

  return { whatsappSent, emailSent };
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
