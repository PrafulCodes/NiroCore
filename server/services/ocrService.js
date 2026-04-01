import fs from 'fs';
import Tesseract from 'tesseract.js';

export async function extractFromImage(filePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    console.log('[Autopay Scan] Extracted Text from Image:', text.substring(0, 100).replace(/\n/g, ' '));
    return text;
  } catch (err) {
    console.error('Tesseract error:', err);
    throw err;
  }
}

export function parseSubscriptionData(rawText) {
  const safeRawText = typeof rawText === 'string' ? rawText : '';
  const lowerText = safeRawText.toLowerCase();

  const upiAutoPayKeywords = [
    'autopay',
    'upi',
    'mandate',
    'as presented',
    'debit as and when required',
  ];

  const mode = upiAutoPayKeywords.some((k) => lowerText.includes(k))
    ? 'UPI_AUTOPAY'
    : 'NORMAL_SUBSCRIPTION';

  let serviceName = null;
  let amount = null;
  let amountType = null;
  let billingCycle = 'Unknown';
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
    if (regex.test(safeRawText)) {
      serviceName = service;
      break;
    }
  }

  // UPI/bank fallback patterns: "To Google Play", "Billed to XYZ"
  if (!serviceName) {
    const upiPartyMatch = safeRawText.match(/(?:\bto\b|\bbilled\s+to\b)\s+([A-Za-z][A-Za-z0-9&+.'\-/\s]{1,80})/i);
    if (upiPartyMatch && upiPartyMatch[1]) {
      serviceName = upiPartyMatch[1]
        .split(/\n|\r|autopay|mandate|upi|debit|amount|₹|rs\.?|inr/i)[0]
        .trim()
        .replace(/\s{2,}/g, ' ')
        .replace(/\b(no|for|from|via|by|to)$/i, '')
        .trim();
    }
  }

  if (!serviceName) {
    const phraseMatch = safeRawText.match(/([A-Z][A-Za-z0-9\s&+.'\-/]{1,80}?)\s*(?:₹|subscription)/i);
    if (phraseMatch && phraseMatch[1]) {
      serviceName = phraseMatch[1].trim();
    }
  }

  if (!serviceName) {
    serviceName = 'Unknown Service';
  }

  // ==========================================
  // 2. AMOUNT
  // ==========================================
  const amountRegexes = [
    /₹\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /Rs\.?\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /INR\s*([\d,]+(?:\.\d{1,2})?)/gi,
  ];

  const amountCandidates = [];
  for (const regex of amountRegexes) {
    for (const match of safeRawText.matchAll(regex)) {
      const rawAmount = match[1]?.replace(/,/g, '');
      const parsed = Number.parseFloat(rawAmount);
      if (!Number.isFinite(parsed)) continue;

      const idx = match.index ?? -1;
      const contextStart = Math.max(0, idx - 30);
      const contextEnd = Math.min(safeRawText.length, idx + 30);
      const context = safeRawText.slice(contextStart, contextEnd).toLowerCase();

      let score = 0;
      let type = 'exact';
      if (/(debited|charged|paid|payment)/.test(context)) {
        score = 3; // High priority actual charge/payment signal
      } else if (/(subscription|renewal)/.test(context)) {
        score = 2; // Medium priority recurring subscription context
      } else if (/(limit|up\s*to|max)/.test(context)) {
        score = 1; // Low priority but still valid for UPI autopay limits
        type = 'limit';
      }

      amountCandidates.push({ value: parsed, index: idx, context, score, type });
    }
  }

  const selectedAmount = amountCandidates
    .slice()
    .sort((a, b) => (b.score - a.score) || (b.value - a.value))[0];

  if (selectedAmount) {
    amount = selectedAmount.value;
    amountType = selectedAmount.type;
  }

  console.log('[Amount Extraction] All amounts:', amountCandidates);
  console.log('[Amount Extraction] Selected:', amount, amountType);

  // ==========================================
  // 3. BILLING CYCLE
  // ==========================================
  if (mode === 'UPI_AUTOPAY' && (lowerText.includes('as presented') || lowerText.includes('debit as and when required'))) {
    billingCycle = 'Variable';
  } else if (
    lowerText.includes('monthly') ||
    lowerText.includes('per month') ||
    lowerText.includes('/mo')
  ) {
    billingCycle = 'Monthly';
  } else if (
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scoredDates = [];
  const allDates = [];

  for (const regex of dateRegexes) {
    const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
    const globalRegex = new RegExp(regex.source, flags);
    const matches = [...safeRawText.matchAll(globalRegex)];

    for (const match of matches) {
      const rawDate = match[1];
      if (!rawDate) continue;

      const parsedDate = new Date(rawDate);
      if (isNaN(parsedDate.getTime())) continue;

      const idx = match.index ?? 0;
      const start = Math.max(0, idx - 30);
      const end = Math.min(safeRawText.length, idx + rawDate.length + 30);
      const context = safeRawText.slice(start, end).toLowerCase();

      let contextScore = 0;
      if (/(next\s+debit|renewal|debited\s+on)/.test(context)) {
        contextScore = 3;
      } else if (/(next\s+payment|payment)/.test(context)) {
        contextScore = 2;
      }

      allDates.push(rawDate);
      scoredDates.push({ date: parsedDate, score: contextScore });
    }
  }

  let selected = null;
  const contextMatches = scoredDates
    .filter((d) => d.score > 0)
    .sort((a, b) => (b.score - a.score) || (b.date - a.date));

  if (contextMatches.length > 0) {
    selected = contextMatches[0];
  } else {
    const futureDates = scoredDates.filter((d) => d.date >= today);
    if (futureDates.length > 0) {
      selected = futureDates.sort((a, b) => b.date - a.date)[0];
    }
  }

  console.log('[Date Extraction] All dates:', allDates);
  console.log('[Date Extraction] Selected:', selected);

  if (selected?.date) {
    const d = selected.date;
    const p = (n) => n.toString().padStart(2, '0');
    nextRenewalDate = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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
  const hasService = !!serviceName && serviceName !== 'Unknown Service';
  const hasAmount = Number.isFinite(amount);
  const hasDate = !!nextRenewalDate;

  let confidence = 'Low';
  const score = Number(hasService) + Number(hasAmount) + Number(hasDate);
  if (score === 3) {
    confidence = 'High';
  } else if (score === 2) {
    confidence = 'Medium';
  }

  console.log(`[AutoPay Mode] ${mode}`);
  console.log('[Extraction] Raw text:', safeRawText);
  console.log('[Extraction] All detected amounts:', amountCandidates.map((c) => c.value));
  console.log('[Extraction] Selected amount:', amount ?? null);
  console.log('[Extraction] Service name:', serviceName);

  const parsed = {
    mode,
    serviceName,
    amount: hasAmount ? amount : null,
    amountType,
    billingCycle,
    nextRenewalDate,
    category,
    confidence,
    rawText: safeRawText,
  };

  console.log('[Extraction] Final parsed object:', parsed);

  return parsed;
}
