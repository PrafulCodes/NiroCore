import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

/**
 * SMS service using Twilio.
 */
let twilioClient = null;
if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

/**
 * Send an SMS message using Twilio.
 * @param {string} to - Recipient phone number (+91XXXXXXXXXX)
 * @param {string} message - Message body
 */
export async function sendSMS(phone, message) {
  if (!twilioClient) {
    console.log('[SMS SIMULATED]', { to: phone, message });
    return { success: true, simulated: true };
  }

  // Ensure phone is: "+91XXXXXXXXXX", remove spaces, reject invalid
  const cleanPhone = phone.replace(/\s+/g, '');
  if (!/^\+91\d{10}$/.test(cleanPhone)) {
    console.error('[SMS FAILED] Invalid phone format. Must be +91 followed by 10 digits:', phone);
    return { success: false, error: 'Invalid phone format' };
  }

  try {
    const fromPhone = process.env.TWILIO_PHONE;

    // Log masked values to confirm they are loaded
    console.log(`[SMS DEBUG] Using SID: ${process.env.TWILIO_SID?.substring(0, 4)}...`);
    console.log(`[SMS DEBUG] Using From: ${fromPhone}`);

    const response = await twilioClient.messages.create({
      body: message,
      from: fromPhone,
      to: cleanPhone
    });

    console.log('[SMS SUCCESS] SID:', response.sid);
    return { success: true, sid: response.sid };
  } catch (err) {
    console.error('[SMS FAILED] Full Error:', err);
    return { success: false, error: err.message };
  }
}
