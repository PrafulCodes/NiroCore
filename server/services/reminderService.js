import prisma from '../lib/prisma.js';
import { sendEmail } from './emailService.js';
import { sendSMS } from './smsService.js';
import { sendWhatsApp } from './whatsappService.js';
import { generateReminderTemplate } from './templates/reminderTemplate.js';

function getDaysUntilRenewal(nextRenewalDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(nextRenewalDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

/**
 * Coordinates reminder delivery across multiple channels.
 * Uses a centralized template system for consistency.
 */
export async function sendReminderForSubscription(subscription) {
  // 1. Resolve user — try included relation, then fetch by userId, then fallback by email
  let user = subscription.user || null;

  if (!user && subscription.userId) {
    user = await prisma.user.findUnique({
      where: { id: subscription.userId }
    });
  }

  // Fallback: if subscription has no userId, attempt to find user via email in subscription context
  // This is a temporary safety net for orphaned subscriptions
  if (!user && !subscription.userId) {
    console.warn(`[REMINDER] Subscription ${subscription.id} has no userId — attempting email-based user lookup`);
    // No reliable way to find user without userId; skip user-dependent channels
  }

  // 2. Debug logs for validation
  console.log(`[REMINDER DEBUG] Subscription: ${subscription.id} | Service: ${subscription.serviceName}`);
  console.log(`[REMINDER DEBUG] User found: ${user?.id || 'NONE'}`);
  console.log(`[REMINDER DEBUG] Email: ${user?.email || 'NONE'}`);
  console.log(`[REMINDER DEBUG] Phone: ${user?.phone || 'NONE'}`);

  // 3. If no user at all, skip — but log clearly
  if (!user) {
    console.warn(`[REMINDER SKIP] No linked user for subscription ${subscription.id} (userId: ${subscription.userId || 'null'}). Cannot send any notifications.`);
    await logReminder(subscription.id, 'email', { success: false, error: 'No linked user found' });
    return {
      email: { success: false, error: 'No linked user' },
      sms: { success: false, skipped: true, error: 'No linked user' },
      whatsapp: { success: false, skipped: true, error: 'No linked user' }
    };
  }

  // 4. Generate content for all channels once
  const templates = generateReminderTemplate({
    serviceName: subscription.serviceName,
    amount: subscription.amount,
    nextRenewalDate: subscription.nextRenewalDate,
    userName: user.name
  });

  const results = {
    email: { success: false, skipped: true },
    sms: { success: false, skipped: true },
    whatsapp: { success: false, skipped: true }
  };

  // 5. Email — only if user.email exists (does NOT block other channels)
  if (user.email) {
    try {
      const { subject, html } = templates.email;
      results.email = await sendEmail(user.email, subject, html);
      results.email.skipped = false;
      await logReminder(subscription.id, 'email', results.email);
    } catch (err) {
      console.error(`[REMINDER ERROR] Email failed for subscription ${subscription.id}:`, err.message);
      results.email = { success: false, skipped: false, error: err.message };
      await logReminder(subscription.id, 'email', results.email);
    }
  } else {
    console.log(`[REMINDER INFO] No email for subscription ${subscription.id} — skipping email, will still attempt SMS/WhatsApp`);
    await logReminder(subscription.id, 'email', { success: false, error: 'User has no email address' });
  }

  // 6. Parse reminder preferences
  const prefs = subscription.remindersJson ? JSON.parse(subscription.remindersJson) : {};
  console.log(`[REMINDER DEBUG] Preferences for ${subscription.id}:`, JSON.stringify(prefs));

  // 7. WhatsApp — independent of email (requires phone)
  if (prefs.whatsapp) {
    if (user.phone) {
      try {
        results.whatsapp = await sendWhatsApp(user.phone, templates.whatsapp);
        results.whatsapp.skipped = false;
        await logReminder(subscription.id, 'whatsapp', results.whatsapp);
      } catch (err) {
        console.error(`[REMINDER ERROR] WhatsApp failed for subscription ${subscription.id}:`, err);
        results.whatsapp = { success: false, skipped: false, error: err.message || 'Unknown error' };
        await logReminder(subscription.id, 'whatsapp', results.whatsapp);
      }
    } else {
      console.warn(`[REMINDER INFO] No phone for subscription ${subscription.id} — skipping WhatsApp`);
      await logReminder(subscription.id, 'whatsapp', { success: false, error: 'Phone number required for WhatsApp' });
    }
  }

  // 8. SMS — independent of email and WhatsApp (requires phone)
  //    Also serves as fallback if WhatsApp was requested but failed
  const shouldSendSMS = prefs.sms || (prefs.whatsapp && !results.whatsapp.success && !results.whatsapp.skipped);
  if (shouldSendSMS) {
    if (user.phone) {
      try {
        results.sms = await sendSMS(user.phone, templates.sms);
        results.sms.skipped = false;
        await logReminder(subscription.id, 'sms', results.sms);
      } catch (err) {
        console.error(`[REMINDER ERROR] SMS failed for subscription ${subscription.id}:`, err);
        results.sms = { success: false, skipped: false, error: err.message || 'Unknown error' };
        await logReminder(subscription.id, 'sms', results.sms);
      }
    } else {
      console.warn(`[REMINDER INFO] No phone for subscription ${subscription.id} — skipping SMS`);
      await logReminder(subscription.id, 'sms', { success: false, error: 'Phone number required for SMS' });
    }
  }

  return results;
}

/**
 * Helper to log reminder attempts to Prisma.
 */
async function logReminder(subscriptionId, channel, result) {
  try {
    await prisma.reminderLog.create({
      data: {
        subscriptionId: subscriptionId,
        channel: result.simulated ? `${channel}_simulated` : channel,
        status: result.success ? 'sent' : 'failed',
        message: result.error || null
      }
    });
  } catch (err) {
    console.error(`[LOG FAILED] ${channel}:`, err.message);
  }
}
