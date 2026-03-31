import { sendEmail } from './services/emailService.js';

async function test() {
  const to = process.env.EMAIL_USER || 'prafulmohite2006@gmail.com';
  const subject = 'Test Styled Email from NiroCore';
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h1 style="color: #0040e0;">Hello from NiroCore</h1>
      <p>This is a test of the <strong>Styled Email Service</strong> using Nodemailer.</p>
      <p>Success confirms that your Gmail App Password is working correctly!</p>
    </div>
  `;

  console.log('--- Testing Email Delivery ---');
  const result = await sendEmail(to, subject, html);
  console.log('Result:', result);
}

test();
