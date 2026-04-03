const Contact = require('../models/Contact');
const { sendEmail, sendWhatsApp } = require('../services/notificationService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    console.log('\n📝 [CONTACT] Received payload:', JSON.stringify(req.body, null, 2));
    
    let { name, phone, email, subject, department, message } = req.body;

    // Trim whitespace from all fields
    name = name?.trim();
    phone = phone?.trim();
    email = email?.trim();
    subject = subject?.trim();
    department = department?.trim();
    message = message?.trim();

    console.log('\n✅ [CONTACT] After trim:', { name, phone, email, subject, department, message });

    // Validate required fields
    if (!name) {
      console.error('❌ [CONTACT] Missing name');
      return res.status(400).json({
        success: false,
        message: 'Please provide your name',
      });
    }

    if (!phone) {
      console.error('❌ [CONTACT] Missing phone');
      return res.status(400).json({
        success: false,
        message: 'Please provide your phone number',
      });
    }

    if (!message) {
      console.error('❌ [CONTACT] Missing message');
      return res.status(400).json({
        success: false,
        message: 'Please provide a message',
      });
    }

    // Validate phone is 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      });
    }

    console.log('✅ [CONTACT] Validation passed, creating contact record...');

    // Create contact record
    const contact = await Contact.create({
      name,
      phone,
      email: email || undefined,
      subject: subject || undefined,
      department: department || undefined,
      message,
    });

    console.log('📦 [CONTACT] Contact created:', contact._id);

    // Send email to hospital
    const emailSent = await sendEmail({
      to: process.env.HOSPITAL_EMAIL || 'wecare@krmemorialhospital.com',
      subject: `New Contact Form Submission - ${subject || 'General Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0B3D91;">📬 New Contact Form Submission</h2>
          <hr style="border: none; border-top: 2px solid #E2E8F0; margin: 20px 0;">
          
          <div style="background: #F8FAFC; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            ${email ? `<p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
            ${subject ? `<p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>` : ''}
            ${department ? `<p style="margin: 8px 0;"><strong>Department:</strong> ${department}</p>` : ''}
          </div>

          <div style="background: #fff; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #334155; margin-top: 0;">Message:</h4>
            <p style="color: #64748B; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <hr style="border: none; border-top: 2px solid #E2E8F0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748B; text-align: center;">
            This is an automated message. Contact ID: ${contact._id.toString().slice(-8).toUpperCase()}
          </p>
        </div>
      `,
    });

    // Send email confirmation to user
    if (email) {
      await sendEmail({
        to: email,
        subject: 'We Received Your Message - K.R. Memorial Hospital',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #0B3D91; margin: 0;">K.R. Memorial Hospital</h2>
              <p style="color: #64748B; margin: 5px 0 0 0;">Jaipur, Rajasthan</p>
            </div>

            <h3 style="color: #334155;">Thank You for Contacting Us!</h3>
            <p>Dear <strong>${name}</strong>,</p>
            <p>We have received your message and will get back to you within <strong>2 hours</strong> during working hours.</p>

            <div style="background: #EFF6FF; border-left: 4px solid #0B3D91; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #0B3D91;"><strong>Reference Number:</strong> ${contact._id.toString().slice(-8).toUpperCase()}</p>
            </div>

            <h4 style="color: #334155; margin-top: 20px;">Your Message Details:</h4>
            <p style="color: #64748B;">
              <strong>Subject:</strong> ${subject || 'No subject provided'}<br>
              <strong>Department:</strong> ${department || 'Not specified'}<br>
              <strong>Message:</strong> ${message.replace(/\n/g, '<br>')}
            </p>

            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
            <h4 style="color: #334155;">Need Immediate Help?</h4>
            <p style="color: #64748B;">
              <strong>📞 Call Us:</strong> <a href="tel:8006005111" style="color: #0B3D91;">8006005111</a> or <a href="tel:01423220320" style="color: #0B3D91;">01423-220320</a><br>
              <strong>📍 Visit Us:</strong> NH-11, Sikar Road, Chomu, Jaipur, Rajasthan 303702<br>
              <strong>🕐 24/7 Emergency:</strong> Available round the clock
            </p>

            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748B; text-align: center;">
              K.R. Memorial Hospital | Jaipur, Rajasthan<br>
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        `,
      });
    }

    // Send WhatsApp notification to hospital
    const whatsappMessage = `
🏥 *New Contact Submission*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
${email ? `📧 *Email:* ${email}\n` : ''}${subject ? `📋 *Subject:* ${subject}\n` : ''}${department ? `🏢 *Department:* ${department}\n` : ''}
💬 *Message:* 
${message}

---
📌 Reference: ${contact._id.toString().slice(-8).toUpperCase()}
⏰ Time: ${new Date().toLocaleString('en-IN')}
    `.trim();

    const whatsappSent = await sendWhatsApp({
      to: process.env.WHATSAPP_PHONE || '+918006005111',
      message: whatsappMessage,
    });

    console.log('📧 [CONTACT] Email sent:', emailSent);
    console.log('📱 [CONTACT] WhatsApp sent:', whatsappSent);

    // Update contact status
    contact.emailSent = emailSent;
    contact.whatsappSent = whatsappSent;
    await contact.save();

    console.log('✅ [CONTACT] Contact saved successfully:', contact._id);

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will contact you soon!',
      contact: {
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
      },
    });
  } catch (error) {
    console.error('❌ [CONTACT] Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form. Please try again.',
      error: error.message,
    });
  }
};

// @desc    Get all contacts (admin)
// @route   GET /api/contact
// @access  Private (Admin)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message,
    });
  }
};

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private (Admin)
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message,
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private (Admin)
exports.updateContact = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message,
    });
  }
};
