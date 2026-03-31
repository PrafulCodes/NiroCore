import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

/**
 * Initialize Nodemailer transporter with Gmail SMTP.
 */
async function initTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  } else {
    // Fallback for development if no credentials provided
    console.warn('[EMAIL WARNING] No credentials found, using Ethereal test account.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
  return transporter;
}

/**
 * Reusable function to send any email.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content body
 */
export async function sendEmail(to, subject, html) {
  try {
    const t = await initTransporter();
    const info = await t.sendMail({
      from: `"NiroCore Reminders" <${process.env.EMAIL_USER || 'noreply@nirocore.app'}>`,
      to,
      subject,
      html,
    });

    console.log('[EMAIL SUCCESS]', info.messageId);
    
    // Log Ethereal preview URL if applicable
    if (info.messageId && !process.env.EMAIL_USER) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EMAIL FAILED]', err.message);
    return { success: false, error: err.message };
  }
}
