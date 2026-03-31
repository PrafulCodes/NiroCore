import prisma from '../lib/prisma.js';
import { sendRenewalEmail } from './emailService.js';
import { sendSmsMessage } from './smsService.js';

function getDaysUntilRenewal(nextRenewalDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(nextRenewalDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export async function sendReminderForSubscription(subscription) {
  const daysUntil = getDaysUntilRenewal(subscription.nextRenewalDate);

  // 1. Send Email
  const emailResult = await sendRenewalEmail(subscription);

  // 2. Send SMS
  const smsResult = await sendSmsMessage(subscription, daysUntil);

  // 3. Log to ReminderLog table
  await prisma.reminderLog.create({
    data: {
      subscriptionId: subscription.id,
      channel: 'email',
      status: emailResult.success ? 'sent' : 'failed',
    },
  });

  await prisma.reminderLog.create({
    data: {
      subscriptionId: subscription.id,
      channel: smsResult.simulated ? 'simulated' : 'sms',
      status: smsResult.success ? 'sent' : 'failed',
    },
  });

  return { emailResult, smsResult };
}
