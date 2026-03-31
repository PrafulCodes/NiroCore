/**
 * Centralized Reminder Template System for NiroCore.
 */

/**
 * Formats a Date object into a readable string (e.g., 12 Dec 2026).
 * @param {Date|string} date - The date to format
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Generates reminder content for Email, SMS, and WhatsApp.
 * @param {object} data - { serviceName, amount, nextRenewalDate, userName }
 * @returns {object} - { email: { subject, html }, sms: string, whatsapp: string }
 */
export function generateReminderTemplate(data) {
  const { serviceName, amount, nextRenewalDate } = data;
  const readableDate = formatDate(nextRenewalDate);

  // ─── EMAIL (HTML) ─────────────────────────────────────────────
  const emailSubject = `🔔 Reminder: Your ${serviceName} subscription is renewing soon`;
  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
             background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; 
                   overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
      .header { background: linear-gradient(135deg, #0040e0, #2e5bff); padding: 48px 32px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; }
      .header p { margin: 8px 0 0; font-size: 16px; opacity: 0.9; }
      .content { padding: 40px 32px; }
      .service-card { background: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center; }
      .service-name { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }
      .amount { font-size: 48px; font-weight: 800; color: #0040e0; margin: 12px 0; }
      .details { border-top: 1px solid #e2e8f0; padding-top: 24px; }
      .detail-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
      .detail-label { color: #64748b; font-weight: 500; }
      .detail-value { color: #0f172a; font-weight: 600; }
      .footer { background: #f8fafc; padding: 32px; text-align: center; font-size: 12px; color: #94a3b8; }
      .cta { display: inline-block; background: #0040e0; color: #ffffff !important; text-decoration: none; 
             padding: 16px 32px; border-radius: 12px; font-weight: 700; margin-top: 24px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔔 NiroCore Reminder</h1>
        <p>Your subscription is renewing soon!</p>
      </div>
      <div class="content">
        <div class="service-card">
          <p class="service-name">${serviceName}</p>
          <div class="amount">₹${amount}</div>
        </div>
        <div class="details">
          <div class="detail-item">
            <span class="detail-label">Renews On</span>
            <span class="detail-value">${readableDate}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="detail-value">Processing</span>
          </div>
        </div>
        <div style="text-align: center;">
          <a href="http://localhost:5173/dashboard" class="cta">Review Subscription</a>
        </div>
      </div>
      <div class="footer">
        Sent with ❤️ from NiroCore. You're receiving this because you've enabled reminders.
      </div>
    </div>
  </body>
  </html>`;

  // ─── SMS (Concise) ───────────────────────────────────────────
  const sms = `Reminder: ${serviceName} renews on ${readableDate}. Amount: ₹${amount}`;

  // ─── WHATSAPP (Emojis + Rich String) ─────────────────────────
  const whatsapp = `🔔 *Reminder*
  Your *${serviceName}* subscription renews on *${readableDate}*.
  *Amount:* ₹${amount}
  Tap to review: http://nirocore.app/dash`;

  return {
    email: {
      subject: emailSubject,
      html: emailHtml
    },
    sms,
    whatsapp
  };
}
