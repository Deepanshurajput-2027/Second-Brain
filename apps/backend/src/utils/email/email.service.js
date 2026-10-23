import nodemailer from 'nodemailer';
import axios from 'axios';

// 1. Create Nodemailer Transporter with strict timeouts as a fallback
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // STARTTLS for 587
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000, // 5s max to connect
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

/**
 * Send Password Reset Email
 * Primary: Resend REST API (HTTPS port 443 - fast, non-blocking, never blocked by cloud firewalls)
 * Fallback: Nodemailer SMTP with strict 5s timeout
 *
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

  // Always log reset link to console for instant local testing and debugging
  console.log('\n======================================================');
  console.log(`🔑 PASSWORD RESET LINK for: ${toEmail}`);
  console.log(`🔗 URL: ${resetUrl}`);
  console.log('======================================================\n');

  const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;

  // 1. Try Resend REST API (preferred - fastest and bypasses SMTP port blocking)
  if (apiKey && apiKey.startsWith('re_')) {
    try {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: 'Second Brain <onboarding@resend.dev>',
          to: [toEmail],
          subject: 'Reset Your Second Brain Password',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
              <h2 style="color: #0f172a; margin-bottom: 16px;">Password Reset Request</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.5;">
                We received a request to reset your password for your Second Brain account. Click the button below to proceed:
              </p>
              <div style="margin: 28px 0;">
                <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #64748b; font-size: 13px;">
                If you did not request a password reset, you can safely ignore this email. This link will expire in 1 hour.
              </p>
              <p style="color: #94a3b8; font-size: 12px; word-break: break-all; margin-top: 20px;">
                Link: ${resetUrl}
              </p>
            </div>
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      console.log('✅ Password reset email dispatched via Resend REST API:', response.data?.id);
      return response.data;
    } catch (apiError) {
      const status = apiError.response?.status;
      const resendMsg = apiError.response?.data?.message || apiError.message;
      console.warn(`⚠️ Resend REST API error (${status}):`, resendMsg);

      if (status === 403) {
        console.warn(
          '💡 Note: Resend test domain (onboarding@resend.dev) only allows sending to the Resend account owner email. Use the console reset link above to test other accounts.'
        );
        return { message: resendMsg, resetUrl };
      }
    }
  }

  // 2. Fallback to Nodemailer SMTP
  try {
    const mailOptions = {
      from: 'Second Brain <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Reset Your Second Brain Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent via SMTP:', info.messageId);
    return info;
  } catch (smtpError) {
    console.error('❌ Failed to send email via SMTP:', smtpError.message);
    // Don't throw — link is already logged in console
    return { error: smtpError.message, resetUrl };
  }
};

export const EmailService = {
  sendPasswordResetEmail,
};

export default {
  sendPasswordResetEmail,
  EmailService,
};
