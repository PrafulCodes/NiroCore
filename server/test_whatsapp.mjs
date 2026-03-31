import { sendWhatsApp } from './services/whatsappService.js';

async function test() {
  const to = '+911234567890'; // Representative number
  const message = 'Test WhatsApp from NiroCore Sandbox. Your subscription is renewing.';

  console.log('--- Testing WhatsApp Delivery ---');
  const result = await sendWhatsApp(to, message);
  console.log('Result:', result);
}

test();
