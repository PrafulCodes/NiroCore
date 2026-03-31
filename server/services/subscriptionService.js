import prisma from '../lib/prisma.js';

/**
 * Automatically increments nextRenewalDate for active subscriptions that are in the past.
 * This runs on every dashboard load to ensure the user always sees upcoming dates.
 */
export async function processAutoRenewals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Find active subscriptions where the renewal date has passed
  const pastDueSubs = await prisma.subscription.findMany({
    where: {
      status: 'active',
      nextRenewalDate: { lt: today }
    }
  });

  if (pastDueSubs.length === 0) return;

  console.log(`[Auto-Renewal] Checking ${pastDueSubs.length} past-due subscriptions...`);

  for (const sub of pastDueSubs) {
    let newDate = new Date(sub.nextRenewalDate);
    const originalDateString = newDate.toDateString();
    
    // 2. Increment the date based on billing cycle until it is in the future
    while (newDate < today) {
      if (sub.billingCycle === 'Monthly') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (sub.billingCycle === 'Quarterly') {
        newDate.setMonth(newDate.getMonth() + 3);
      } else if (sub.billingCycle === 'Yearly') {
        newDate.setFullYear(newDate.getFullYear() + 1);
      } else {
        // Fallback for safety to prevent infinite loops
        newDate.setMonth(newDate.getMonth() + 1);
      }
    }

    // 3. Persist the updated date
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { nextRenewalDate: newDate }
    });
    
    console.log(`[Auto-Renewal] Rolled over "${sub.serviceName}" from ${originalDateString} to ${newDate.toDateString()}`);
  }
}
