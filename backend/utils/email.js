const nodemailer = require('nodemailer');

// Create reusable transporter
const getTransporter = () => {
  // Create a test account if we're in development and no email credentials
  if (process.env.NODE_ENV === 'development' && 
      (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
    console.log('Using ethereal test account for email');
    return nodemailer.createTestAccount().then(account => {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: account.user,
          pass: account.pass
        }
      });
    });
  }
  
  // Use configured email settings
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Helps with self-signed certificates in development
    }
  });
};

// Send email with proper error handling and logging
const sendEmail = async (mailOptions) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent: ${info.messageId}`);
    
    // Log preview URL in development (for ethereal emails)
    if (process.env.NODE_ENV === 'development' && info.preview) {
      console.log(`Email preview: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, info };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

// Send booking confirmation email
exports.sendBookingConfirmation = async (user, booking, classroom) => {
  try {
    if (!user || !user.email || !booking || !classroom) {
      console.error('Missing required data for booking confirmation email');
      return false;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@classroombooking.com',
      to: user.email,
      subject: 'Classroom Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${user.name},</p>
        <p>Your booking has been confirmed:</p>
        <ul>
          <li><strong>Classroom:</strong> ${classroom.name} (${classroom.building}, Room ${classroom.roomNumber})</li>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
          <li><strong>Purpose:</strong> ${booking.purpose}</li>
        </ul>
        <p>Thank you for using our Classroom Booking System.</p>
      `
    };
    
    const result = await sendEmail(mailOptions);
    return result.success;
  } catch (error) {
    console.error('Booking confirmation email error:', error);
    return false;
  }
};

// Send booking status update email
exports.sendStatusUpdate = async (user, booking, classroom) => {
  try {
    if (!user || !user.email || !booking || !classroom) {
      console.error('Missing required data for status update email');
      return false;
    }
    
    const statusMessages = {
      confirmed: 'has been confirmed',
      rejected: 'has been rejected',
      cancelled: 'has been cancelled'
    };
    
    if (!statusMessages[booking.status]) {
      console.error(`Invalid booking status: ${booking.status}`);
      return false;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@classroombooking.com',
      to: user.email,
      subject: `Classroom Booking ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`,
      html: `
        <h1>Booking Update</h1>
        <p>Dear ${user.name},</p>
        <p>Your booking for ${classroom.name} on ${booking.date} (${booking.startTime} - ${booking.endTime}) ${statusMessages[booking.status]}.</p>
        ${booking.status === 'rejected' ? '<p>Please contact administration for more information.</p>' : ''}
        <p>Thank you for using our Classroom Booking System.</p>
      `
    };
    
    const result = await sendEmail(mailOptions);
    return result.success;
  } catch (error) {
    console.error('Status update email error:', error);
    return false;
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    if (!user || !user.email || !resetUrl) {
      console.error('Missing required data for password reset email');
      return false;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@classroombooking.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Dear ${user.name},</p>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <p><a href="${resetUrl}" target="_blank">Reset Password</a></p>
        <p>This link will expire in 30 minutes.</p>
        <p>If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
      `
    };
    
    const result = await sendEmail(mailOptions);
    return result.success;
  } catch (error) {
    console.error('Password reset email error:', error);
    return false;
  }
};

// Send password change confirmation email
exports.sendPasswordChangeConfirmation = async (user) => {
  try {
    if (!user || !user.email) {
      console.error('Missing required data for password change confirmation email');
      return false;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@classroombooking.com',
      to: user.email,
      subject: 'Password Changed Successfully',
      html: `
        <h1>Password Changed</h1>
        <p>Dear ${user.name},</p>
        <p>Your password has been changed successfully.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
      `
    };
    
    const result = await sendEmail(mailOptions);
    return result.success;
  } catch (error) {
    console.error('Password change confirmation email error:', error);
    return false;
  }
};

// Send contact form notification email to admin
exports.sendContactNotification = async (contactData) => {
  try {
    if (!contactData || !contactData.email || !contactData.message) {
      console.error('Missing required data for contact notification email');
      return false;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@classroombooking.com',
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>From:</strong> ${contactData.name} (${contactData.email})</p>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          ${contactData.message.replace(/\n/g, '<br>')}
        </div>
        <p>You can reply directly to this email to respond to the sender.</p>
      `
    };
    
    const result = await sendEmail(mailOptions);
    return result.success;
  } catch (error) {
    console.error('Contact notification email error:', error);
    return false;
  }
};
