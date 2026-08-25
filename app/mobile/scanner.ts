export interface ScanResult {
  riskScore: number;
  threatType: string;
  reasons: string[];
}

export function scanMessageOnDevice(text: string): ScanResult {
  let score = 5;
  const reasons: string[] = [];
  const lower = text.toLowerCase();

  if (/sbi-kyc|power-update|bank-alert|kyc-update|\.top|\.site|\.xyz/i.test(lower)) {
    score += 50;
    reasons.push('Suspicious or untrusted domain extension detected');
  }

  if (/urgent|blocked|immediately|disconnected|action required/i.test(lower)) {
    score += 25;
    reasons.push('High-urgency framing pattern identified');
  }

  if (/account|pan|electricity|kyc|bill|pay/i.test(lower)) {
    score += 15;
    reasons.push('Financial or utility service impersonation keywords');
  }

  const finalScore = Math.min(score, 98);

  return {
    riskScore: finalScore,
    threatType: finalScore >= 75 ? 'Critical Smishing Threat' : finalScore >= 45 ? 'High Risk SMS Payload' : 'Safe Payload',
    reasons: reasons.length > 0 ? reasons : ['No suspicious signatures detected'],
  };
}