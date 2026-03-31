import fs from 'fs';
import Tesseract from 'tesseract.js';

export async function extractFromImage(filePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    return text;
  } catch (err) {
    console.error('Tesseract error:', err);
    throw err;
  }
}

export function parseSubscriptionData(rawText) {
  let serviceName = null;
  let amount = null;
  let billingCycle = 'Monthly';
  let nextRenewalDate = null;
  let category = 'Other';

  const knownServices = [
    'Netflix', 'Spotify', 'Hotstar', 'Disney+', 'Amazon Prime',
    'YouTube Premium', 'Apple Music', 'Apple TV', 'Google One',
    'Swiggy One', 'Zomato Pro', 'Zee5', 'SonyLIV', 'JioCinema',
    'Adobe', 'Canva', 'Notion', 'Figma', 'Dropbox', 'iCloud',
    'Microsoft 365', 'LinkedIn Premium', 'Coursera', 'Udemy',
  ];

  // ==========================================
  // 1. SERVICE NAME
  // ==========================================
  for (const service of knownServices) {
    const regex = new RegExp(service.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (regex.test(rawText)) {
      serviceName = service;
      break;
    }
  }

  if (!serviceName) {
    const phraseMatch = rawText.match(/([A-Z][A-Za-z0-9\s]+?)\s*(?:₹|subscription)/i);
    if (phraseMatch && phraseMatch[1]) {
      serviceName = phraseMatch[1].trim();
    }
  }

  // ==========================================
  // 2. AMOUNT
  // ==========================================
  const amountRegexes = [
    /₹\s*(\d+(?:\.\d{1,2})?)/,
    /Rs\.?\s*(\d+(?:\.\d{1,2})?)/i,
    /INR\s*(\d+(?:\.\d{1,2})?)/i,
  ];

  for (const regex of amountRegexes) {
    const match = rawText.match(regex);
    if (match && match[1]) {
      amount = parseFloat(match[1]);
      break; 
    }
  }

  // ==========================================
  // 3. BILLING CYCLE
  // ==========================================
  const lowerText = rawText.toLowerCase();
  if (
    lowerText.includes('annual') ||
    lowerText.includes('yearly') ||
    lowerText.includes('/yr') ||
    lowerText.includes('per year')
  ) {
    billingCycle = 'Yearly';
  } else if (
    lowerText.includes('quarterly') ||
    lowerText.includes('3 months')
  ) {
    billingCycle = 'Quarterly';
  }

  // ==========================================
  // 4. RENEWAL DATE
  // ==========================================
  const dateRegexes = [
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i,
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/,
    /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/,
    /\b(\d{1,2}[\/\-]\d{4})\b/,
    /(?:renews on|next billing)\s*[-:]?\s*(\d{1,2}[\/\-\s][A-Za-z]{3,9}[\/\-\s]\d{2,4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i,
  ];

  for (const regex of dateRegexes) {
    const match = rawText.match(regex);
    if (match && match[1]) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) {
        nextRenewalDate = d.toISOString().split('T')[0];
        break;
      }
    }
  }

  // ==========================================
  // 5. CATEGORY
  // ==========================================
  const categoryMap = {
    'OTT': ['Netflix', 'Hotstar', 'Disney+', 'Amazon Prime', 'Zee5', 'SonyLIV', 'JioCinema', 'YouTube Premium'],
    'Music': ['Spotify', 'Apple Music', 'JioSaavn'],
    'Productivity': ['Adobe', 'Notion', 'Figma', 'Canva', 'Dropbox', 'Google One', 'iCloud', 'Microsoft 365'],
    'Food': ['Swiggy One', 'Zomato Pro'],
  };

  if (serviceName) {
    let foundCategory = false;
    for (const [cat, services] of Object.entries(categoryMap)) {
      if (services.some(s => s.toLowerCase() === serviceName.toLowerCase())) {
        category = cat;
        foundCategory = true;
        break;
      }
    }

    if (!foundCategory && serviceName.toLowerCase().match(/(fitness|gym|health)/)) {
      category = 'Fitness';
    }
  }

  // ==========================================
  // 6. CONFIDENCE
  // ==========================================
  let fieldsFound = 0;
  if (serviceName) fieldsFound++;
  if (amount) fieldsFound++;
  if (nextRenewalDate) fieldsFound++;

  let confidence = 'Low';
  if (fieldsFound === 3) {
    confidence = 'High';
  } else if (serviceName && amount && !nextRenewalDate) {
    confidence = 'Medium';
  }

  return {
    serviceName,
    amount,
    billingCycle,
    nextRenewalDate,
    category,
    confidence,
    rawText,
  };
}
