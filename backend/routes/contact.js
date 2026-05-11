import express from 'express';
import { Contact } from '../models/Contact.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Create contact record
    const contact = new Contact({
      name,
      email,
      message,
      subject: subject || 'General Inquiry'
    });

    await contact.save();

    // Send notification email to restaurant
    try {
      await sendContactNotificationEmail(contact);
    } catch (emailError) {
      console.error('Contact email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// GET /api/contact - Get all contact messages (for admin)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts'
    });
  }
});

// PUT /api/contact/:id/reply - Reply to contact message
router.put('/:id/reply', async (req, res) => {
  try {
    const { replyMessage } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        replyMessage,
        status: 'replied',
        repliedAt: new Date()
      },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }

    // Send reply email to customer
    try {
      await sendReplyEmail(contact, replyMessage);
    } catch (emailError) {
      console.error('Reply email sending failed:', emailError);
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error replying to contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send reply'
    });
  }
});

// PUT /api/contact/:id/status - Update contact status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status'
    });
  }
});

// Email helper functions
async function sendContactNotificationEmail(contact) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RESTAURANT_EMAIL || process.env.EMAIL_USER,
    subject: `New Contact Message - ${contact.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e11d48;">New Contact Message</h2>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Date:</strong> ${contact.createdAt.toLocaleString()}</p>
        </div>

        <h4>Message:</h4>
        <div style="background: #fff; padding: 15px; border-radius: 8px; border-left: 4px solid #e11d48;">
          ${contact.message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendReplyEmail(contact, replyMessage) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: contact.email,
    subject: `Re: ${contact.subject} - Johnny & Jugnu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e11d48;">Johnny & Jugnu - Reply to Your Message</h2>
        <p>Hi ${contact.name},</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4>Your Original Message:</h4>
          <p style="font-style: italic;">${contact.message.replace(/\n/g, '<br>')}</p>
        </div>

        <h4>Our Response:</h4>
        <div style="background: #fff; padding: 15px; border-radius: 8px; border-left: 4px solid #e11d48;">
          ${replyMessage.replace(/\n/g, '<br>')}
        </div>

        <p>Best regards,<br>Johnny & Jugnu Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

export default router;