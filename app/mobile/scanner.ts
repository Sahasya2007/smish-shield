// app/mobile/scanner.ts

export type ThreatStatus = 'Critical Threat' | 'High Risk' | 'Medium Risk' | 'Safe' | 'Safe Payload';

export interface ScanResult {
  riskScore: number;
  threatType: ThreatStatus;
  reasons: string[];
  extractedUrls: string[];
}

/**
 * On-device SMS payload threat heuristic analyzer
 */
export function scanMessageOnDevice(message: string): ScanResult {
  let score = 0;
  const reasons: string[] = [];
  const text = message.toLowerCase();

  // 1. Homoglyph / Non-ASCII Character Check (e.g. Cyrillic 'а', 'е', 'о' mixed in text or domain)
  const nonAsciiRegex = /[^\x00-\x7F]/;
  if (nonAsciiRegex.test(message)) {
    score += 40;
    reasons.push('Homoglyph anomaly detected: Uses non-standard Unicode/Cyrillic character substitutions');
  }

  // 2. URL Extraction and Untrusted Domain/Shortener Check
  const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi;
  const extractedUrls = message.match(urlRegex) || [];

  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'rb.gy'];
  const untrustedTlds = ['.top', '.xyz', '.cc', '.info', '.live', '.online', '.tk', '.cf', '.ga'];

  extractedUrls.forEach((url) => {
    const lowerUrl = url.toLowerCase();

    // Check for shorteners
    if (shorteners.some((s) => lowerUrl.includes(s))) {
      score += 35;
      reasons.push(`URL shortener detected (${url}): Obscures ultimate landing domain`);
    }

    // Check for untrusted/high-risk TLDs
    if (untrustedTlds.some((tld) => lowerUrl.includes(tld))) {
      score += 35;
      reasons.push(`Untrusted high-risk TLD detected in link (${url})`);
    }

    // Impersonation keyword inside domain check
    if (/(sbi|hdfc|icici|pan|kyc|aadhaar|electricity)/.test(lowerUrl) && !lowerUrl.includes('.co.in') && !lowerUrl.includes('.com')) {
      score += 30;
      reasons.push('Deceptive domain: Contains official brand keywords on suspicious host');
    }
  });

  // 3. Urgency & Coercion Heuristics
  const urgencyKeywords = ['urgent', 'immediately', 'blocked', 'suspended', 'disconnect', 'unpaid', 'tonight', 'today', '24 hours'];
  if (urgencyKeywords.some((keyword) => text.includes(keyword))) {
    score += 20;
    reasons.push('High-urgency psychological pressure detected');
  }

  // 4. Financial & Credential Harvesting Lures
  const lureKeywords = ['kyc', 'pan card', 'bill', 'account', 'clear dues', 'contact officer', 'reactivate', 'unpaid'];
  if (lureKeywords.some((keyword) => text.includes(keyword))) {
    score += 15;
    reasons.push('Credential/financial harvesting lure phrases identified');
  }

  // Cap score at 100
  const riskScore = Math.min(score, 100);

  // Categorize status matching the dashboard interface
  let threatType: ThreatStatus = 'Safe Payload';
  if (riskScore >= 75) threatType = 'Critical Threat';
  else if (riskScore >= 45) threatType = 'High Risk';
  else if (riskScore > 0) threatType = 'Medium Risk';

  return {
    riskScore,
    threatType,
    reasons: reasons.length > 0 ? reasons : ['No threat indicators detected in SMS payload.'],
    extractedUrls,
  };
}