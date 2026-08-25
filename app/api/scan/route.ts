import { NextRequest, NextResponse } from "next/server";

// ==========================================
// Types
// ==========================================

export type ThreatLevel = "SAFE" | "SUSPICIOUS" | "CRITICAL_PHISHING";

export interface ScannedMessage {
  id: string;
  sender: string;
  rawText: string;
  receivedAt: string;
  extractedUrl?: string;
  threatLevel: ThreatLevel;
  riskScore: number;
  reasons: string[];
  isQuarantined: boolean;
}

export interface ScanMessageDTO {
  sender: string;
  rawText: string;
}

// ==========================================
// In-memory database
// ==========================================

const scannedMessagesDb: ScannedMessage[] = [];

// ==========================================
// Calculate threat level
// ==========================================

function calculateThreatLevel(riskScore: number): ThreatLevel {
  if (riskScore >= 75) {
    return "CRITICAL_PHISHING";
  }

  if (riskScore >= 35) {
    return "SUSPICIOUS";
  }

  return "SAFE";
}

// ==========================================
// Analyze message content
// ==========================================

function analyzeMessageContent(text: string): {
  riskScore: number;
  reasons: string[];
  extractedUrl?: string;
} {
  let riskScore = 0;
  const reasons: string[] = [];

  // Detect URLs
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const urls = text.match(urlRegex);

  const extractedUrl = urls ? urls[0] : undefined;

  // ------------------------------------------
  // URL detection
  // ------------------------------------------

  if (extractedUrl) {
    riskScore += 30;
    reasons.push("Contains external URL");

    const lowerUrl = extractedUrl.toLowerCase();

    if (
      lowerUrl.includes("bit.ly") ||
      lowerUrl.includes("tinyurl.com") ||
      lowerUrl.includes("t.co")
    ) {
      riskScore += 30;
      reasons.push("Uses shortened URL");
    }
  }

  // ------------------------------------------
  // Suspicious keywords
  // ------------------------------------------

  const suspiciousKeywords = [
    "urgent",
    "verify account",
    "bank",
    "lottery",
    "ssn",
    "password reset",
    "click here",
    "account suspended",
    "confirm your account",
    "login",
    "otp",
  ];

  const lowerText = text.toLowerCase();

  for (const keyword of suspiciousKeywords) {
    if (lowerText.includes(keyword)) {
      riskScore += 20;
      reasons.push(`Contains high-risk keyword: "${keyword}"`);
    }
  }

  // ------------------------------------------
  // Cap score at 100
  // ------------------------------------------

  riskScore = Math.min(riskScore, 100);

  if (reasons.length === 0) {
    reasons.push("No immediate threats detected");
  }

  return {
    riskScore,
    reasons,
    extractedUrl,
  };
}

// ==========================================
// POST /api/scan
// Scan a message
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const body: ScanMessageDTO = await request.json();

    const { sender, rawText } = body;

    // Validate input
    if (
      typeof sender !== "string" ||
      typeof rawText !== "string" ||
      !sender.trim() ||
      !rawText.trim()
    ) {
      return NextResponse.json(
        {
          error: "sender and rawText are required fields.",
        },
        { status: 400 }
      );
    }

    // Analyze message
    const {
      riskScore,
      reasons,
      extractedUrl,
    } = analyzeMessageContent(rawText);

    // Calculate threat level
    const threatLevel = calculateThreatLevel(riskScore);

    // Critical messages are quarantined
    const isQuarantined = threatLevel === "CRITICAL_PHISHING";

    // Create message
    const newMessage: ScannedMessage = {
      id: `msg_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`,

      sender: sender.trim(),

      rawText: rawText.trim(),

      receivedAt: new Date().toISOString(),

      extractedUrl,

      threatLevel,

      riskScore,

      reasons,

      isQuarantined,
    };

    // Store message
    scannedMessagesDb.unshift(newMessage);

    return NextResponse.json(newMessage, {
      status: 201,
    });
  } catch (error) {
    console.error("Scan API error:", error);

    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      {
        status: 400,
      }
    );
  }
}

// ==========================================
// GET /api/scan
// Return recent scanned messages
// ==========================================

export async function GET() {
  return NextResponse.json({
    totalScanned: scannedMessagesDb.length,
    recentMessages: scannedMessagesDb.slice(0, 10),
  });
}