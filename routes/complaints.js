// complaintRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const Complaint = require('../models/complaintmodel');  // Import the Complaint model
const router = express.Router();
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // Convert string to boolean
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});


// Function to send confirmation email
const sendConfirmationEmail = async (email, complaintNumber, message) => {
  try {
    const mailOptions = {
      from: '"TaylorZone by Raiba" <taylorzonebyraiba@gmail.com>',
      to: email,
      subject: 'Complaint Registration Confirmation',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dcdcdc; border-radius: 10px; background-color: #fefefe;">
          <!-- Stylish Header -->
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; border-bottom: 1px solid #e5e5e5;">
            <h1 style="font-family: 'Playfair Display', serif; color: #333333; font-size: 32px; margin: 0;">TaylorZone by Raiba</h1>
            <p style="color: #888888; font-size: 14px; margin: 5px 0 0;">Elegant Fashion, Timeless Style</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0; font-family: 'Playfair Display', serif;">Complaint Registration Confirmation</h2>
            <div style="background-color: #fafafa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e5e5e5;">
              <p style="margin: 10px 0; font-size: 16px;"><strong>Complaint ID:</strong> ${complaintNumber}</p>
              <p style="margin: 10px 0; font-size: 16px;"><strong>Issue Description:</strong></p>
              <p style="margin: 10px 0; font-style: italic; color: #555; font-size: 16px;">${message}</p>
            </div>
            <p style="color: #555555; font-size: 16px; line-height: 1.8;">
              Thank you for reaching out to us! Our experienced specialists are already working on resolving your issue. You can expect a detailed reply to your query within 24 hours. At TaylorZone by Raiba, we are committed to ensuring that your experience with us is nothing short of exceptional.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999999; font-size: 12px; line-height: 1.6;">
              This is an automated email. Please do not reply to this message.<br>
              For further assistance, feel free to contact our support team at <a href="mailto:support@taylorzonebyraiba.com" style="color: #888888; text-decoration: none;">support@taylorzonebyraiba.com</a>.
            </p>
            <p style="color: #aaaaaa; font-size: 12px; margin-top: 10px;">
              © 2025 TaylorZone by Raiba. All Rights Reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        TaylorZone by Raiba

        Complaint Registration Confirmation

        Complaint ID: ${complaintNumber}

        Issue Description:
        ${message}

        Thank you for reaching out to us! Our experienced specialists are already working on resolving your issue. You can expect a detailed reply to your query within 24 hours. At TaylorZone by Raiba, we are committed to ensuring that your experience with us is nothing short of exceptional.

        This is an automated email. Please do not reply to this message.
        For further assistance, feel free to contact our support team at support@taylorzonebyraiba.com.

        © 2025 TaylorZone by Raiba. All Rights Reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};


// Post Complaint Route
router.post('/post-complaints', async (req, res) => {
  try {
    const { name, email, message, userType } = req.body;

    // Generate 6 digit random complaint number
    const complaintNumber = Math.floor(100000 + Math.random() * 900000).toString();

    const complaintData = {
      complaintNumber,
      name,
      email,
      message,
      userType
    };

    const complaint = new Complaint(complaintData);
    const result = await complaint.save();

    // Send confirmation email
    await sendConfirmationEmail(email, complaintNumber, message);

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      complaint: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering complaint',
      error: error.message
    });
  }
});

// Get All Complaints Route
router.get('/get-complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    
    res.status(200).json({
      success: true,
      complaints
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
});

// Update Complaint Status Route
router.put('/update-complaint-status', async (req, res) => {
  try {
    const { complaintId, status } = req.body;

    const updatedComplaint = await Complaint.findOneAndUpdate(
      { complaintNumber: complaintId },
      { $set: { status } },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    });

  } catch (error) {
    res.status(500).json({
      success: false, 
      message: 'Error updating complaint status',
      error: error.message
    });
  }
});

module.exports = router;
