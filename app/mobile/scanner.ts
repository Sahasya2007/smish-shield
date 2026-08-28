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
// Valid Indian Telecom Service Provider & Circle 2-letter prefixes (TRAI NCCP standards)
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
// Hindi (हिंदी / Devanagari)
const PATTERN_HINDI = /\b(तुरंत|अति\s*आवश्यक|खाता\s*बंद|बिजली\s*कट|केवाईसी|लॉटरी|इनाम|ओटीपी|पैन\s*कार्ड|आयकर\s*रिफंड|रद्द|अमान्य|बैंक\s*खाता)\b/i;

// Odia (ଓଡ଼ିଆ)
const PATTERN_ODIA = /(ତୁରନ୍ତ|ଜରୁରୀ|ଖାତା\s*ବନ୍ଦ|ବିଦ୍ୟୁତ\s*କାଟ|ବିଜୁଳି|କେୱାଇସି|ପାସୱାର୍ଡ|ଇନାମ|ଓଟିପି|ବ୍ୟାଙ୍କ|ରଦ୍ଦ)/i;

// Tamil (தமிழ்)
const PATTERN_TAMIL = /(உடனடியாக|கணக்கு\s*முடக்கப்பட்டது|மின்சார\s*துண்டிப்பு|வங்கி|சரிபார்க்கவும்|பரிசு|ஓடிபி|வருமான\s*வரி)/i;

// Telugu (తెలుగు)
const PATTERN_TELUGU = /(వెంటనే|ఖాతా\s*నిలిపివేయబడింది|విద్యుత్\s*సరఫరా|బ్యాంక్|కేవైసీ|ధృవీకరించండి|బహుమతి|ఓటీపీ)/i;

// Bengali (বাংলা)
const PATTERN_BENGALI = /(অবিলম্বে|জরুরী|অ্যাকাউন্ট\s*ব্লক|বিদ্যুৎ\s*বিচ্ছিন্ন|কেওয়াইসি|লটারি|ব্যাংক|ওটিপি)/i;

// Hinglish / Phonetic Indian Urgency
const PATTERN_HINGLISH = /\b(turant|jaldi|khata\s*band|bijli\s*kat|inaam|katoti|sampark\s*kare|dhyan\s*de)\b/i;

// Global Phishing Targets & Urgency (English)
const PATTERN_SUSPICIOUS_DOMAINS =
  /\b(sbi-kyc|power-update|bank-alert|kyc-update|account-verify|secure-login|income-tax|tax-refund|gov-in|in-gov|epfo-update|jio-free|bill-desk|bescom-pay)\b|\.(top|site|xyz|click|link|live|online|club|work|net|cc|in\.net|fit|rest|tk|ml|ga)(?:[\/?#\s]|$)/i;

const PATTERN_URGENCY =
  /\b(urgent|immediate|immediately|blocked|suspended|cutoff|action required|pending|disconnection|permanently blocked|expires today|overdue)\b/i;

const PATTERN_FINANCIAL =
  /\b(bank|banking|account|mandate|refund|tax refund|itr|cashback|reward|won|prize|lottery|pan card|electricity|kyc|bill|pay|otp|password reset|subsidy)\b/i;

const PATTERN_ACTION_PROMPT =
  /\b(validate|verify|claim|update|authenticate|click here|re-verify|login|log in|download apk)\b/i;

const PATTERN_SHORTENERS =
  /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly|rb\.gy|t\.me)\b/i;

const URL_EXTRACT_REGEX = /(?:(?:https?:\/\/)|(?:www\.))?(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"']*)?|\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s<>"']*)?/gi;

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

  // 1. Multilingual Script Detection & Evaluation
  if (PATTERN_HINDI.test(text)) {
    score += 25;
    detectedLang = "Hindi (हिंदी)";
    reasons.push("Urgent lexical pattern detected in Hindi script");
  }
  if (PATTERN_ODIA.test(text)) {
    score += 25;
    detectedLang = "Odia (ଓଡ଼ିଆ)";
    reasons.push("Urgent lexical pattern detected in Odia script");
  }
  if (PATTERN_TAMIL.test(text)) {
    score += 25;
    detectedLang = "Tamil (தமிழ்)";
    reasons.push("Urgent threat indicator detected in Tamil script");
  }
  if (PATTERN_TELUGU.test(text)) {
    score += 25;
    detectedLang = "Telugu (తెలుగు)";
    reasons.push("Urgent threat indicator detected in Telugu script");
  }
  if (PATTERN_BENGALI.test(text)) {
    score += 25;
    detectedLang = "Bengali (বাংলা)";
    reasons.push("Urgent threat indicator detected in Bengali script");
  }
  if (PATTERN_HINGLISH.test(text)) {
    score += 20;
    detectedLang = "Hinglish (Transliterated)";
    reasons.push("Phonetic urgency indicators detected (Hinglish)");
  }

  // 2. English & Universal Lexical Checks
  if (PATTERN_URGENCY.test(text)) {
    score += 20;
    reasons.push("High-urgency framing pattern identified");
  }
  if (PATTERN_FINANCIAL.test(text)) {
    score += 20;
    reasons.push("Financial, identity, or utility impersonation target keywords detected");
  }
  if (PATTERN_ACTION_PROMPT.test(text)) {
    score += 15;
    reasons.push("Credential extraction or urgent action prompt detected");
  }

  // 3. Sender ID & TRAI DLT Telephony Heuristics
  let dltStatus: ThreatAssessment["dltStatus"] = "VERIFIED TRAI DLT";
  const cleanSender = senderHeader.trim().toUpperCase();

  if (/^\+?91?[6-9]\d{9}$/.test(cleanSender)) {
    // Commercial SMS sent from personal 10-digit mobile number
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
      reasons.push("Sender ID exceeds standard TRAI 6-character registration length");
    }
  }

  // 4. URL, Domain Impersonation & Fake SSL Inspection
  let extractedUrl: string | undefined;
  let sslStatus: ThreatAssessment["sslStatus"] = "NO_URL";

  const urlMatches = text.match(URL_EXTRACT_REGEX);
  if (urlMatches && urlMatches.length > 0) {
    extractedUrl = urlMatches[0].trim().replace(/[),.!?;:'"]+$/, "");
    if (!/^https?:\/\//i.test(extractedUrl)) {
      extractedUrl = `http://${extractedUrl}`;
    }

    // SSL / TLS Check
    if (extractedUrl.startsWith("http://")) {
      score += 25;
      sslStatus = "INSECURE_HTTP";
      reasons.push("Insecure unencrypted HTTP link detected (Missing SSL/TLS certificate)");
    } else if (extractedUrl.startsWith("https://")) {
      sslStatus = "SECURE_HTTPS";
    }

    // Raw IP Link Check (Phishing payload bypass)
    if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(extractedUrl)) {
      score += 40;
      sslStatus = "RAW_IP_PAYLOAD";
      reasons.push("Raw IP address used instead of legitimate hostname (Evasion tactic)");
    }

    // Shortener Check
    if (PATTERN_SHORTENERS.test(extractedUrl)) {
      score += 35;
      reasons.push("Uses URL shortener / redirect service to conceal destination");
    }

    // Phishing Domain / TLD Spoofing
    if (PATTERN_SUSPICIOUS_DOMAINS.test(extractedUrl)) {
      score += 40;
      reasons.push("Domain name spoofing brand or using high-risk untrusted TLD");
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