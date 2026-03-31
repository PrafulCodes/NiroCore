import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;

async function initTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail', // or appropriate service based on config
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Ethereal fallback
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
}

function buildEmailTemplate(subscription) {
  const { serviceName, amount, billingCycle, nextRenewalDate, category } = subscription;
  
  // Format the date for the template if it's a Date object or valid string
  let formattedDate = nextRenewalDate;
  if (nextRenewalDate) {
    const d = new Date(nextRenewalDate);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Inter, sans-serif; 
             background: #faf8ff; margin: 0; padding: 0; }
      .container { max-width: 480px; margin: 40px auto; 
                   background: white; border-radius: 16px; 
                   overflow: hidden; 
                   box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, 
                #0040e0, #2e5bff); padding: 32px; 
                color: white; }
      .header h1 { margin: 0; font-size: 24px; 
                   font-weight: 800; }
      .header p { margin: 8px 0 0; opacity: 0.8; }
      .body { padding: 32px; }
      .amount { font-size: 40px; font-weight: 800; 
                color: #191b24; margin: 16px 0; }
      .detail-row { display: flex; 
                    justify-content: space-between; 
                    padding: 12px 0; 
                    border-bottom: 1px solid #e1e1ef; 
                    font-size: 14px; }
      .btn { display: block; background: linear-gradient(
             135deg, #0040e0, #2e5bff); color: white; 
             text-align: center; padding: 16px; 
             border-radius: 999px; text-decoration: none; 
             font-weight: 700; font-size: 14px; 
             margin-top: 24px; letter-spacing: 0.1em; }
      .footer { background: #f3f2ff; padding: 24px 32px; 
                font-size: 12px; color: #747688; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>NiroCore</h1>
        <p>Subscription Renewal Alert</p>
      </div>
      <div class="body">
        <p style="color:#434656">Your subscription is 
        renewing soon.</p>
        <h2 style="margin:8px 0 0; font-size:28px">
          ${serviceName}
        </h2>
        <div class="amount">₹${amount}</div>
        <div class="detail-row">
          <span style="color:#747688">Billing Cycle</span>
          <span style="font-weight:600">${billingCycle}</span>
        </div>
        <div class="detail-row">
          <span style="color:#747688">Renews On</span>
          <span style="font-weight:600">
            ${formattedDate}
          </span>
        </div>
        <div class="detail-row">
          <span style="color:#747688">Category</span>
          <span style="font-weight:600">${category}</span>
        </div>
        <a class="btn" href="http://localhost:5173/dashboard">
          REVIEW NOW
        </a>
      </div>
      <div class="footer">
        Sent by NiroCore · You're receiving this because 
        you set up renewal reminders.
      </div>
    </div>
  </body>
  </html>`;
}

export async function sendRenewalEmail(subscription) {
  try {
    const t = await initTransporter();
    
    // Fallback email to send to if user doesn't have an email in schema (since subscription doesn't hold user email directly in our current simple schema)
    // We'll just send to a dummy or the configured user for demo purposes
    const targetEmail = process.env.EMAIL_USER || 'user@example.com';
    
    const html = buildEmailTemplate(subscription);
    
    const info = await t.sendMail({
      from: '"NiroCore Reminders" <noreply@nirocore.app>',
      to: targetEmail,
      subject: `Upcoming Renewal: ${subscription.serviceName}`,
      html,
    });

    // If using Ethereal, log preview URL
    if (info.messageId && !process.env.EMAIL_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL:', previewUrl);
      return { success: true, previewUrl };
    }

    return { success: true };
  } catch (err) {
    console.error('Email sending failed:', err);
    return { success: false, error: err.message };
  }
}
