import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

/**
 * WhatsApp service using Twilio Sandbox.
 */
let twilioClient = null;
if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

/**
 * Send a WhatsApp message using Twilio.
 * @param {string} to - Recipient phone number (+91XXXXXXXXXX)
 * @param {string} message - Message body
 */
export async function sendWhatsApp(phone, message) {
  if (!twilioClient) {
    console.log('[WHATSAPP SIMULATED]', { to: phone, message });
    return { success: true, simulated: true };
  }

  try {
    const response = await twilioClient.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phone}`,
      body: message
    });

    console.log('[WHATSAPP SUCCESS] SID:', response.sid);
    return { success: true, sid: response.sid };
  } catch (err) {
    console.error('[WHATSAPP FAILED] Full Error:', err);
    return { success: false, error: err.message };
  }
}
