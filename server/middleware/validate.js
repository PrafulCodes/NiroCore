import { body, validationResult } from 'express-validator';

export const subscriptionRules = [
  body('serviceName')
    .trim()
    .notEmpty().withMessage('Service name is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Service name must be 1-100 characters.'),
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01.'),
  body('billingCycle')
    .isIn(['Monthly', 'Quarterly', 'Yearly']).withMessage('Invalid billing cycle.'),
  body('nextRenewalDate')
    .notEmpty().withMessage('Renewal date is required.')
    .isISO8601().withMessage('Must be a valid ISO8601 date.'),
  body('category')
    .isIn(['OTT', 'Music', 'Food', 'Productivity', 'Cloud', 'Fitness', 'Gaming', 'Other'])
    .withMessage('Invalid category.'),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return structured array exactly as specified
    return res.status(422).json({
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};
