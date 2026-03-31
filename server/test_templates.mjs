import { generateReminderTemplate } from './services/templates/reminderTemplate.js';

function test() {
  const data = {
    serviceName: 'Netflix',
    amount: 499,
    nextRenewalDate: new Date('2026-12-12'),
    userName: 'Praful'
  };

  const t = generateReminderTemplate(data);

  console.log('--- EMAIL SUBJECT ---');
  console.log(t.email.subject);
  
  console.log('\n--- EMAIL HTML (first 100 chars) ---');
  console.log(t.email.html.substring(0, 100) + '...');

  console.log('\n--- SMS ---');
  console.log(t.sms);

  console.log('\n--- WHATSAPP ---');
  console.log(t.whatsapp);

  console.log('\n--- VERIFICATION PASSED ---');
}

test();
