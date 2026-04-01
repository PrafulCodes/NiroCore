import { Router } from 'express';
import fs from 'fs';
import upload from '../middleware/upload.js';
import { extractFromImage, parseSubscriptionData } from '../services/ocrService.js';

const router = Router();

router.post('/extract', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.message === 'Only PNG and JPG images are allowed.') {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: 'File upload error.' });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided.' });
  }

  try {
    const rawText = await extractFromImage(req.file.path);
    // Added trace logging
    console.log('[Autopay Scan] Extracted text length:', rawText.length);
    const parsedData = parseSubscriptionData(rawText);
    console.log('[Autopay Scan] Parsed Result:', parsedData);

    const hasServiceName = !!parsedData.serviceName;
    const hasAmount = parsedData.amount !== null;
    const hasDate = !!parsedData.nextRenewalDate;
    
    // If no fields found at all or confidence is strictly null based on instructions (though mine is Low)
    if (!hasServiceName && !hasAmount && !hasDate) {
      return res.status(422).json({ error: 'Could not extract subscription data. Please use manual entry.' });
    }

    res.json(parsedData);
  } catch (err) {
    console.error('OCR Extraction error:', err);
    res.status(500).json({ error: 'Failed to extract data from image.' });
  } finally {
    // Clean up temporary file
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Failed to delete temp file:', unlinkErr);
      }
    }
  }
});

export default router;
