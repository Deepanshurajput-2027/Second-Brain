import nodemailer from 'nodemailer';

// 1. Create the Transporter using your .env variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // Must be false for port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send Password Reset Email via Resend SMTP
 * @param {string|Object} toEmailOrOptions - Recipient email string or options object
 * @param {string} [maybeResetToken] - Token if first argument is a string
 */
export const sendPasswordResetEmail = async (toEmailOrOptions, maybeResetToken) => {
  let toEmail = '';
  let resetToken = '';

  if (typeof toEmailOrOptions === 'object' && toEmailOrOptions !== null) {
    toEmail = toEmailOrOptions.to || toEmailOrOptions.email || '';
    resetToken =
      toEmailOrOptions.resetToken ||
      (toEmailOrOptions.resetUrl ? toEmailOrOptions.resetUrl.split('/').pop() : '');
  } else {
    toEmail = toEmailOrOptions;
    resetToken = maybeResetToken;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    // Explicitly enforce verified test sender for Resend without a custom domain
    from: 'Second Brain <onboarding@resend.dev>',
    to: toEmail,
    subject: 'Reset Your Second Brain Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `,
  };

  // Inspect exact payload sent to Resend's SMTP relay
  console.log('Sending email with options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const EmailService = {
  sendPasswordResetEmail,
};

export default {
  sendPasswordResetEmail,
  EmailService,
};
