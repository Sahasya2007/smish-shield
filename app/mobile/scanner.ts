export interface ScanResult {
  riskScore: number;
  threatType: "Safe Payload" | "High Risk SMS Payload" | "Critical Smishing Threat";
  reasons: string[];
}

// Pre-compiled regex patterns (compiled once at module load, zero allocation per scan)
const PATTERN_SUSPICIOUS_DOMAINS =
  /\b(sbi-kyc|power-update|bank-alert|kyc-update|account-verify|secure-login|income-tax|tax-refund|gov-in|in-gov|epfo-update|jio-free)\b|\.(top|site|xyz|click|link|live|online|club|work|net|cc|in\.net)(?:[\/?#\s]|$)/i;

const PATTERN_URGENCY =
  /\b(urgent|immediate|immediately|blocked|suspended|cutoff|action required|pending|disconnection|permanently blocked|expires today)\b/i;

const PATTERN_FINANCIAL_TARGETS =
  /\b(bank|banking|account|mandate|refund|tax refund|itr|cashback|reward|won|prize|pan card|electricity|kyc|bill|pay|otp|password reset)\b/i;

const PATTERN_CREDENTIAL_ACTION =
  /\b(validate|verify|claim|update|authenticate|click here|re-verify|login|log in)\b/i;

const PATTERN_URL_SHORTENER =
  /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly|rb\.gy|t\.me)\b/i;

/**
 * Ultra-fast, zero-allocation on-device heuristic SMS scanner.
 * Optimized for sub-millisecond execution in client-side UI and mobile simulators.
 */
export function scanMessageOnDevice(text?: string | null): ScanResult {
  // 1. Guard against empty / blank inputs
  if (!text || !text.trim()) {
    return {
      riskScore: 0,
      threatType: "Safe Payload",
      reasons: ["No content to analyze"],
    };
  }

  let score = 0;
  const reasons: string[] = [];

  // 2. URL Shortener Detection (+35)
  if (PATTERN_URL_SHORTENER.test(text)) {
    score += 35;
    reasons.push("Uses URL shortener / redirect service");
  }

  // 3. Phishing domain / untrusted TLD match (+40)
  if (PATTERN_SUSPICIOUS_DOMAINS.test(text)) {
    score += 40;
    reasons.push("Suspicious domain signature or untrusted TLD detected");
  }

  // 4. Urgency & panic phrasing (+25)
  if (PATTERN_URGENCY.test(text)) {
    score += 25;
    reasons.push("High-urgency framing pattern identified");
  }

  // 5. Targeted credential / financial / utility keywords (+20)
  if (PATTERN_FINANCIAL_TARGETS.test(text)) {
    score += 20;
    reasons.push("Financial, identity, or utility impersonation keywords detected");
  }

  // 6. Action & validation calls (+15)
  if (PATTERN_CREDENTIAL_ACTION.test(text)) {
    score += 15;
    reasons.push("Urgent action or credential validation prompt detected");
  }

  // 7. Normalize score between 0 and 99
  const finalScore = Math.min(score, 99);

  return {
    riskScore: finalScore,
    threatType:
      finalScore >= 70
        ? "Critical Smishing Threat"
        : finalScore >= 35
        ? "High Risk SMS Payload"
        : "Safe Payload",
    reasons: reasons.length > 0 ? reasons : ["No suspicious signatures detected"],
  };
}