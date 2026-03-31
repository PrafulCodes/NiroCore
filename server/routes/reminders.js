import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { sendReminderForSubscription } from '../services/reminderService.js';

const router = Router();

// POST /api/reminders/trigger/:subscriptionId
router.post('/trigger/:subscriptionId', async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: req.params.subscriptionId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const { emailResult, smsResult } = await sendReminderForSubscription(subscription);

    res.json({ success: true, emailResult, smsResult });
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
