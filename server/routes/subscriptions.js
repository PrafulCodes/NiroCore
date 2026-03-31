import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { subscriptionRules, validate } from '../middleware/validate.js';

const router = Router();

// ─── helpers ────────────────────────────────────────────────────
function getDaysUntilRenewal(nextRenewalDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(nextRenewalDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function getRiskLevel(daysUntilRenewal) {
  if (daysUntilRenewal <= 3) return 'high';
  if (daysUntilRenewal <= 7) return 'medium';
  return 'low';
}

function enrichSubscription(sub) {
  const daysUntilRenewal = getDaysUntilRenewal(sub.nextRenewalDate);
  return {
    ...sub,
    daysUntilRenewal,
    riskLevel: getRiskLevel(daysUntilRenewal),
  };
}

function toMonthlyEquivalent(amount, cycle) {
  if (cycle === 'Quarterly') return amount / 3;
  if (cycle === 'Yearly') return amount / 12;
  return amount; // Monthly
}

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  return null;
}

// ─── GET /  — list all ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { nextRenewalDate: 'asc' },
    });

    res.json(subscriptions.map(enrichSubscription));
  } catch (err) {
    console.error('GET /api/subscriptions error:', err);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// ─── GET /stats  — aggregated dashboard stats ───────────────────
router.get('/stats', async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany();

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let monthlyTotal = 0;
    let yearlyTotal = 0;
    let upcomingCount = 0;
    let activeCount = 0;
    let highRiskCount = 0;
    const byCategory = {};

    for (const sub of subscriptions) {
      const monthly = toMonthlyEquivalent(sub.amount, sub.billingCycle);

      if (sub.status === 'active') {
        monthlyTotal += monthly;
        yearlyTotal += monthly * 12;
        activeCount++;
      }

      const days = getDaysUntilRenewal(sub.nextRenewalDate);
      if (days <= 7) upcomingCount++;
      if (days <= 3) highRiskCount++;

      // Category totals (monthly-equivalent, all statuses)
      byCategory[sub.category] = (byCategory[sub.category] || 0) + monthly;
    }

    res.json({
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      yearlyTotal: Math.round(yearlyTotal * 100) / 100,
      upcomingCount,
      activeCount,
      highRiskCount,
      byCategory,
    });
  } catch (err) {
    console.error('GET /api/subscriptions/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── GET /:id  — single subscription ────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: req.params.id },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(enrichSubscription(subscription));
  } catch (err) {
    console.error('GET /api/subscriptions/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// ─── POST /  — create ───────────────────────────────────────────
router.post(
  '/',
  subscriptionRules,
  validate,
  async (req, res) => {
    try {
      const { serviceName, category, amount, billingCycle, nextRenewalDate, sourceType, notes } = req.body;

      const subscription = await prisma.subscription.create({
        data: {
          serviceName,
          category,
          amount: parseFloat(amount),
          billingCycle,
          nextRenewalDate: new Date(nextRenewalDate),
          sourceType: sourceType || 'manual',
          notes: notes || null,
        },
      });

      res.status(201).json(enrichSubscription(subscription));
    } catch (err) {
      console.error('POST /api/subscriptions error:', err);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  },
);

// ─── PATCH /:id  — partial update ────────────────────────────────

const patchRules = [
  body('serviceName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Service name must be 1-100 characters.'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01.'),
  body('billingCycle').optional().isIn(['Monthly', 'Quarterly', 'Yearly']).withMessage('Invalid billing cycle.'),
  body('nextRenewalDate').optional().isISO8601().withMessage('Must be a valid ISO8601 date.'),
  body('category').optional().isIn(['OTT', 'Music', 'Food', 'Productivity', 'Cloud', 'Fitness', 'Gaming', 'Other']).withMessage('Invalid category.'),
  body('status').optional().isString()
];

router.patch(
  '/:id',
  patchRules,
  validate,
  async (req, res) => {
    try {
      const existing = await prisma.subscription.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      const allowedFields = [
        'serviceName', 'category', 'amount', 'billingCycle',
        'nextRenewalDate', 'sourceType', 'status', 'notes',
      ];

      const data = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (field === 'amount') {
            data[field] = parseFloat(req.body[field]);
          } else if (field === 'nextRenewalDate') {
            data[field] = new Date(req.body[field]);
          } else {
            data[field] = req.body[field];
          }
        }
      }

      const updated = await prisma.subscription.update({
        where: { id: req.params.id },
        data,
      });

      res.json(enrichSubscription(updated));
    } catch (err) {
      console.error('PATCH /api/subscriptions/:id error:', err);
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  }
);

// ─── DELETE /:id  — hard delete ──────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.subscription.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await prisma.subscription.delete({
      where: { id: req.params.id },
    });

    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/subscriptions/:id error:', err);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

export default router;
