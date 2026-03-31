import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { sendReminderForSubscription } from '../services/reminderService.js';

const router = Router();

// POST /api/reminders/trigger/:subscriptionId
router.post('/trigger/:subscriptionId', async (req, res) => {
  try {
    let subscription = await prisma.subscription.findUnique({
      where: { id: req.params.subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Auto-link orphaned subscriptions: if no user is linked but client provides userEmail
    const { userEmail } = req.body;
    if (!subscription.user && !subscription.userId && userEmail) {
      console.log(`[REMINDER] Auto-linking orphaned subscription ${subscription.id} to user email: ${userEmail}`);
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (user) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { userId: user.id }
        });
        // Re-fetch with updated user relation
        subscription = await prisma.subscription.findUnique({
          where: { id: subscription.id },
          include: { user: true },
        });
        console.log(`[REMINDER] Successfully linked subscription ${subscription.id} to user ${user.id}`);
      } else {
        console.warn(`[REMINDER] Could not auto-link: no user found for email ${userEmail}`);
      }
    }

    const results = await sendReminderForSubscription(subscription);

    res.json({ success: true, ...results });
  } catch (err) {
    console.error('Manual trigger error:', err);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// GET /api/reminders/:subscriptionId
router.get('/:subscriptionId', async (req, res) => {
  try {
    const logs = await prisma.reminderLog.findMany({
      where: { subscriptionId: req.params.subscriptionId },
      orderBy: { sentAt: 'desc' },
      include: { subscription: { select: { serviceName: true } } },
    });

    res.json(logs);
  } catch (err) {
    console.error('Fetch reminders by id error:', err);
    res.status(500).json({ error: 'Failed to fetch reminder history' });
  }
});

// GET /api/reminders
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.reminderLog.findMany({
      orderBy: { sentAt: 'desc' },
      include: {
        subscription: {
          select: { serviceName: true },
        },
      },
    });

    res.json(logs);
  } catch (err) {
    console.error('Fetch all reminders error:', err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

export default router;
