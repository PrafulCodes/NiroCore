import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

let twilioClient = null;
if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

function buildSmsMessage(subscription, daysUntil) {
  const { serviceName, amount } = subscription;
  
  if (daysUntil === 0) {
    return `${serviceName} renews TODAY for ₹${amount}. Open NiroCore to review.`;
  }
  
  if (daysUntil === 1) {
    return `${serviceName} renews TOMORROW for ₹${amount}. Tap to review.`;
  }
  
  return `${serviceName} renews in ${daysUntil} days for ₹${amount}. NiroCore reminder.`;
}

export async function sendSmsMessage(subscription, daysUntil) {
  const message = buildSmsMessage(subscription, daysUntil);

  if (twilioClient) {
    try {
      // Using a dummy destination if not specified in schema relation
      const targetPhone = process.env.TWILIO_TARGET_PHONE || '+1234567890';
      const fromPhone = process.env.TWILIO_PHONE;
      
      await twilioClient.messages.create({
        body: message,
        from: fromPhone,
        to: targetPhone,
      });
      return { success: true };
    } catch (err) {
      console.error('[SMS REAL FAILED]', err);
      return { success: false, error: err.message };
    }
  } else {
    // Simulated SMS logic
    console.log('[SMS SIMULATED]', message);
    return { success: true, simulated: true };
  }
}
