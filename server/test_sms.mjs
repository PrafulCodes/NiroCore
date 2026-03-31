import { sendSMS } from './services/smsService.js';

async function test() {
  const to = '+911234567890'; // Representative number
  const message = 'Test SMS from NiroCore. Your subscription is renewing.';

  console.log('--- Testing SMS Delivery ---');
  const result = await sendSMS(to, message);
  console.log('Result:', result);
}

test();
