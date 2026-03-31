import cron from 'node-cron';
import prisma from './lib/prisma.js';
import { sendReminderForSubscription } from './services/reminderService.js';

function getDaysUntilRenewal(nextRenewalDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(nextRenewalDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export function startScheduler() {
  console.log('[Scheduler] Initializing cron job: 0 9 * * *');
  
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Running daily reminder check...');
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { status: 'active' },
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      for (const sub of subscriptions) {
        const daysUntil = getDaysUntilRenewal(sub.nextRenewalDate);

        if ([0, 1, 3].includes(daysUntil)) {
          // Check if already sent today
          const sentToday = await prisma.reminderLog.findFirst({
            where: {
              subscriptionId: sub.id,
              sentAt: {
                gte: todayStart,
                lte: todayEnd,
              },
            },
          });

          if (!sentToday) {
            await sendReminderForSubscription(sub);
            console.log(`[Scheduler] Sent reminder for ${sub.serviceName} (${daysUntil} days left)`);
          }
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error running background check:', err);
    }
  });
}
