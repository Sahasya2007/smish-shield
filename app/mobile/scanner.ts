export interface ThreatAssessment {
  riskScore: number;
  threatType: "Safe Payload" | "High Risk SMS Payload" | "Critical Smishing Threat";
  dltStatus: "VERIFIED TRAI DLT" | "SUSPICIOUS DLT SENDER" | "SPOOFED / UNREGISTERED SENDER";
  detectedLanguage: string;
  reasons: string[];
  extractedUrl?: string;
  sslStatus: "SECURE_HTTPS" | "INSECURE_HTTP" | "RAW_IP_PAYLOAD" | "NO_URL";
}

// -------------------------------------------------------------
// 1. TRAI DLT TELEPHONY & SENDER ID HEURISTICS
// -------------------------------------------------------------
const TRAI_OPERATOR_PREFIXES = new Set([
  "AD", "AX", "AT", "AL", "AM", "AP", "AR", "AS", "AW", // Airtel
  "VM", "VK", "VN", "VD", "VR", "VF", "VS", "VG", "VP", // Vi (Vodafone Idea)
  "JD", "JM", "JK", "JS", "JZ", "JY", "JW", "JI",       // Reliance Jio
  "BW", "BM", "BK", "BS", "BR", "BL", "BP",             // BSNL
  "MD", "MM", "MK", "MS", "MT"                          // MTNL
]);

// -------------------------------------------------------------
// 2. MULTILINGUAL & MULTI-SCRIPT SMISHING LEXICONS
// -------------------------------------------------------------
const PATTERN_HINDI = /\b(तुरंत|अति\s*आवश्यक|खाता\s*बंद|बिजली\s*कट|केवाईसी|लॉटरी|इनाम|ओटीपी|पैन\s*कार्ड|आयकर\s*रिफंड|रद्द|अमान्य|बैंक\s*खाता)\b/i;
const PATTERN_ODIA = /(ତୁରନ୍ତ|ଜରୁରୀ|ଖାତା\s*ବନ୍ଦ|ବିଦ୍ୟୁତ\s*କାଟ|ବିଜୁଳି|କେୱାଇସି|ପାସୱାର୍ଡ|ଇନାମ|ଓଟିପି|ବ୍ୟାଙ୍କ|ରଦ୍ଦ)/i;
const PATTERN_TAMIL = /(உடனடியாக|கணக்கு\s*முடக்கப்பட்டது|மின்சார\s*துண்டிப்பு|வங்கி|சரிபார்க்கவும்|பரிசு|ஓடிபி|வருமான\s*வரி)/i;
const PATTERN_TELUGU = /(వెంటనే|ఖాతా\s*నిలిపివేయబడింది|విద్యుత్\s*సరఫరా|బ్యాంక్|కేవైసీ|ధృవీకరించండి|బహుమతి|ఓటీపీ)/i;
const PATTERN_BENGALI = /(অবিলম্বে|জরুরী|অ্যাকাউন্ট\s*ব্লক|বিদ্যুৎ\s*বিচ্ছিন্ন|কেওয়াইসি|লটারি|ব্যাংক|ওটিপি)/i;
const PATTERN_HINGLISH = /\b(turant|jaldi|khata\s*band|bijli\s*kat|inaam|katoti|sampark\s*kare|dhyan\s*de)\b/i;

const PATTERN_SUSPICIOUS_DOMAINS =
  /\b(sbi-kyc|power-update|bank-alert|kyc-update|account-verify|secure-login|income-tax|tax-refund|gov-in|in-gov|epfo-update|jio-free|bill-desk|bescom-pay)\b|\.(top|site|xyz|click|link|live|online|club|work|net|cc|in\.net|fit|rest|tk|ml|ga)(?:[\/?#\s]|$)/i;

const PATTERN_URGENCY =
  /\b(urgent|immediate|immediately|blocked|suspended|cutoff|action required|pending|disconnection|permanently blocked|expires today|overdue)\b/i;

// Phishing action prompts (only malicious when paired with links or panic)
const PATTERN_CALL_TO_ACTION =
  /\b(click here|download apk|validate mandate|re-verify pan|claim prize|claim reward)\b/i;

const PATTERN_SHORTENERS =
  /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly|rb\.gy|t\.me)\b/i;

const URL_EXTRACT_REGEX = /(?:(?:https?:\/\/)|(?:www\.))?(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"']*)?|\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s<>"']*)?/gi;

// Safe standard banking indicators
const PATTERN_LEGITIMATE_BANKING = /\b(credited with|debited for|one time password|otp is valid|ref upi|do not share otp|avl bal)\b/i;

// -------------------------------------------------------------
// ZERO-LATENCY LOCAL SCANNER
// -------------------------------------------------------------
export function scanMessageOnDevice(text?: string | null, senderHeader: string = "UNKNOWN"): ThreatAssessment {
  if (!text || !text.trim()) {
    return {
      riskScore: 0,
      threatType: "Safe Payload",
      dltStatus: "VERIFIED TRAI DLT",
      detectedLanguage: "Unknown",
      reasons: ["No payload content to evaluate"],
      sslStatus: "NO_URL",
    };
  }

  let score = 0;
  const reasons: string[] = [];
  let detectedLang = "English";

  // 1. Sender ID & TRAI DLT Telephony Heuristics
  let dltStatus: ThreatAssessment["dltStatus"] = "VERIFIED TRAI DLT";
  const cleanSender = senderHeader.trim().toUpperCase();

  if (/^\+?91?[6-9]\d{9}$/.test(cleanSender)) {
    score += 30;
    dltStatus = "SPOOFED / UNREGISTERED SENDER";
    reasons.push("Sent from personal 10-digit mobile number (Unregistered Telemarketer / UCC)");
  } else if (cleanSender.includes("-")) {
    const [prefix, header] = cleanSender.split("-");
    if (!TRAI_OPERATOR_PREFIXES.has(prefix)) {
      score += 25;
      dltStatus = "SPOOFED / UNREGISTERED SENDER";
      reasons.push(`Invalid TRAI operator circle prefix (${prefix})`);
    } else if (header && header.length > 8) {
      score += 20;
      dltStatus = "SUSPICIOUS DLT SENDER";
      reasons.push("Sender ID exceeds standard TRAI registration format");
    }
  }

  // 2. URL, Domain Impersonation & SSL Inspection
  let extractedUrl: string | undefined;
  let sslStatus: ThreatAssessment["sslStatus"] = "NO_URL";

  const urlMatches = text.match(URL_EXTRACT_REGEX);
  if (urlMatches && urlMatches.length > 0) {
    extractedUrl = urlMatches[0].trim().replace(/[),.!?;:'"]+$/, "");
    if (!/^https?:\/\//i.test(extractedUrl)) {
      extractedUrl = `http://${extractedUrl}`;
    }

    if (extractedUrl.startsWith("http://")) {
      score += 25;
      sslStatus = "INSECURE_HTTP";
      reasons.push("Insecure unencrypted HTTP link (Missing SSL/TLS certificate)");
    } else if (extractedUrl.startsWith("https://")) {
      sslStatus = "SECURE_HTTPS";
    }

    if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(extractedUrl)) {
      score += 40;
      sslStatus = "RAW_IP_PAYLOAD";
      reasons.push("Raw IP address link detected (Evasion tactic)");
    }

    if (PATTERN_SHORTENERS.test(extractedUrl)) {
      score += 35;
      reasons.push("Uses URL shortener to conceal final target");
    }

    if (PATTERN_SUSPICIOUS_DOMAINS.test(extractedUrl)) {
      score += 40;
      reasons.push("Domain name spoofing brand or using high-risk untrusted TLD");
    }
  }

  // 3. Indic Scripts & Regional Languages
  if (PATTERN_HINDI.test(text)) {
    detectedLang = "Hindi (हिंदी)";
    if (extractedUrl || dltStatus !== "VERIFIED TRAI DLT") {
      score += 25;
      reasons.push("Urgent threat indicators detected in Hindi script");
    }
  }
  if (PATTERN_ODIA.test(text)) {
    detectedLang = "Odia (ଓଡ଼ିଆ)";
    if (extractedUrl || dltStatus !== "VERIFIED TRAI DLT") {
      score += 25;
      reasons.push("Urgent threat indicators detected in Odia script");
    }
  }
  if (PATTERN_TAMIL.test(text)) {
    detectedLang = "Tamil (தமிழ்)";
    if (extractedUrl || dltStatus !== "VERIFIED TRAI DLT") {
      score += 25;
      reasons.push("Urgent threat indicators detected in Tamil script");
    }
  }
  if (PATTERN_TELUGU.test(text)) {
    detectedLang = "Telugu (తెలుగు)";
    if (extractedUrl || dltStatus !== "VERIFIED TRAI DLT") {
      score += 25;
      reasons.push("Urgent threat indicators detected in Telugu script");
    }
  }
  if (PATTERN_BENGALI.test(text)) {
    detectedLang = "Bengali (বাংলা)";
    if (extractedUrl || dltStatus !== "VERIFIED TRAI DLT") {
      score += 25;
      reasons.push("Urgent threat indicators detected in Bengali script");
    }
  }
  if (PATTERN_HINGLISH.test(text)) {
    detectedLang = "Hinglish (Transliterated)";
    if (extractedUrl || dltStatus !== "VERIFIED TRAI DLT") {
      score += 20;
      reasons.push("Phonetic urgency indicators detected (Hinglish)");
    }
  }

  // 4. Lexical Phishing Hooks
  if (PATTERN_URGENCY.test(text)) {
    score += 20;
    reasons.push("Urgency & panic trigger pattern identified");
  }
  if (PATTERN_CALL_TO_ACTION.test(text)) {
    score += 20;
    reasons.push("Deceptive call-to-action prompt detected");
  }

  // 5. Legitimate Transactional / OTP Whitelist Mitigation
  const isLegitTransactional = PATTERN_LEGITIMATE_BANKING.test(text) && !extractedUrl && dltStatus === "VERIFIED TRAI DLT";
  if (isLegitTransactional) {
    score = Math.max(0, score - 30);
    if (score === 0) {
      reasons.length = 0;
      reasons.push("Standard transactional OTP / banking format with verified DLT header");
    }
  }

  const finalScore = Math.min(score, 99);

  return {
    riskScore: finalScore,
    threatType:
      finalScore >= 70
        ? "Critical Smishing Threat"
        : finalScore >= 35
        ? "High Risk SMS Payload"
        : "Safe Payload",
    dltStatus,
    detectedLanguage: detectedLang,
    sslStatus,
    extractedUrl,
    reasons: reasons.length > 0 ? Array.from(new Set(reasons)) : ["No suspicious signatures detected"],
  };
}