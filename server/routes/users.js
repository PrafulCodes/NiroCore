import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';

const router = Router();

// Validation rules for phone update
const phoneUpdateRules = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('phone')
    .notEmpty().withMessage('Phone number is required.')
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error('Phone number cannot contain spaces.');
      }
      return true;
    })
    .matches(/^\+91\d{10}$/).withMessage('Phone must be in format +91XXXXXXXXXX'),
  body('name').optional().isString()
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

/**
 * POST /api/user/update-phone
 * Updates or creates a user with the provided phone number.
 */
router.post('/update-phone', phoneUpdateRules, validate, async (req, res) => {
  try {
    const { email, phone, name } = req.body;

    const user = await prisma.user.upsert({
      where: { email },
      update: { phone, name: name || email.split('@')[0] },
      create: { 
        email, 
        phone, 
        name: name || email.split('@')[0] 
      },
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error('POST /api/user/update-phone error:', err);
    res.status(500).json({ error: 'Failed to update phone number' });
  }
});

/**
 * GET /api/user/:email
 * Get user profile by email
 */
router.get('/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in NiroCore database.' });
    }

    res.json(user);
  } catch (err) {
    console.error('GET /api/user/:email error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
