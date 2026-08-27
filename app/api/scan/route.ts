import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ======================================================
// TYPES
// ======================================================

export type ThreatLevel = "SAFE" | "SUSPICIOUS" | "CRITICAL_PHISHING";

export interface ScanMessageDTO {
  sender?: string;
  rawText?: string;
  message?: string;
  text?: string;
}

export interface ScannedMessageRow {
  id: string;
  sender: string;
  raw_text: string;
  received_at: string;
  extracted_url: string | null;
  threat_level: ThreatLevel;
  risk_score: number;
  reasons: string[];
  is_quarantined: boolean;
}

// ======================================================
// CONFIGURATION & HEURISTICS CONSTANTS
// ======================================================

const SHORTENED_DOMAINS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "cutt.ly", "rb.gy", "t.me"
]);

const SUSPICIOUS_TLDS = [".top", ".xyz", ".club", ".work", ".click", ".link", ".site", ".live", ".online"];

const SUSPICIOUS_HOST_KEYWORDS = ["kyc", "verify", "secure-login", "account-verify", "update-pan", "sbi-", "hdfc-"];

// Exact word-boundary patterns to prevent false positives
const KEYWORD_PATTERNS: Array<{ pattern: RegExp; keyword: string }> = [
  { pattern: /\burgent\b/i, keyword: "urgent" },
  { pattern: /\bverify(\s+your)?\s+account\b/i, keyword: "verify account" },
  { pattern: /\b(bank|banking)\b/i, keyword: "bank" },
  { pattern: /\blottery\b/i, keyword: "lottery" },
  { pattern: /\b(ssn|pan\s*card)\b/i, keyword: "sensitive identity token (PAN/SSN)" },
  { pattern: /\bpassword\s+reset\b/i, keyword: "password reset" },
  { pattern: /\bclick\s+here\b/i, keyword: "click here" },
  { pattern: /\baccount\s+(blocked|suspended|cutoff)\b/i, keyword: "account blocked/suspended" },
  { pattern: /\b(login|log\s*in)\b/i, keyword: "login" },
  { pattern: /\botp\b/i, keyword: "otp" },
  { pattern: /\bkyc(\s+update)?\b/i, keyword: "kyc" },
  { pattern: /\b(disconnect|electricity\s+supply)\b/i, keyword: "utility disconnection" },
];

const URL_REGEX = /(?:(?:https?:\/\/)|(?:www\.))?(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"']*)?/gi;

// ======================================================
// SAFE SUPABASE CLIENT
// ======================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

// ======================================================
// URL EXTRACTION & DOMAIN HEURISTICS
// ======================================================

function extractUrl(text: string): string | undefined {
  const matches = text.match(URL_REGEX);
  if (!matches || matches.length === 0) return undefined;

  let url = matches[0].trim().replace(/[),.!?;:'"]+$/, "");
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

function getHostname(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function isShortenedDomain(hostname: string): boolean {
  for (const domain of SHORTENED_DOMAINS) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      return true;
    }
  }
  return false;
}

// ======================================================
// MULTI-LAYERED HEURISTIC ENGINE
// ======================================================

function analyzeMessageContent(text: string): {
  riskScore: number;
  reasons: string[];
  extractedUrl?: string;
} {
  let riskScore = 0;
  const reasons: string[] = [];

  // 1. URL & Domain Sandbox Inspection
  const extractedUrl = extractUrl(text);
  if (extractedUrl) {
    riskScore += 25;
    reasons.push("Contains external link");

    const hostname = getHostname(extractedUrl);
    if (hostname) {
      if (isShortenedDomain(hostname)) {
        riskScore += 35;
        reasons.push("Uses URL shortener / redirect service");
      }

      if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
        riskScore += 25;
        reasons.push(`High-risk untrusted top-level domain (${hostname})`);
      }

      if (SUSPICIOUS_HOST_KEYWORDS.some((kw) => hostname.includes(kw))) {
        riskScore += 25;
        reasons.push("URL host matches credential phishing pattern");
      }
    }
  }

  // 2. Lexical & Panic Pattern Matching (Word-Boundary Protected)
  for (const item of KEYWORD_PATTERNS) {
    if (item.pattern.test(text)) {
      riskScore += 20;
      reasons.push(`High urgency trigger detected: "${item.keyword}"`);
    }
  }

  const normalizedScore = Math.min(riskScore, 100);

  if (reasons.length === 0) {
    reasons.push("No immediate threat indicators detected");
  }

  return {
    riskScore: normalizedScore,
    reasons: Array.from(new Set(reasons)),
    extractedUrl,
  };
}

function calculateThreatLevel(riskScore: number): ThreatLevel {
  if (riskScore >= 70) return "CRITICAL_PHISHING";
  if (riskScore >= 35) return "SUSPICIOUS";
  return "SAFE";
}

// ======================================================
// POST /api/scan (SMS Interception & Analysis)
// ======================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScanMessageDTO;

    const sender = typeof body.sender === "string" && body.sender.trim() ? body.sender.trim() : "UNKNOWN";
    const rawText = (typeof body.rawText === "string" ? body.rawText : body.message || body.text || "").trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "SMS message text is required (rawText, message, or text)." },
        { status: 400 }
      );
    }

    const { riskScore, reasons, extractedUrl } = analyzeMessageContent(rawText);
    const threatLevel = calculateThreatLevel(riskScore);
    const isQuarantined = threatLevel === "CRITICAL_PHISHING";
    const receivedAt = new Date().toISOString();

    const responsePayload = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender,
      rawText,
      receivedAt,
      extractedUrl: extractedUrl ?? undefined,
      threatLevel,
      riskScore,
      reasons,
      isQuarantined,
    };

    // PRIVACY POLICY:
    // Only persist to remote telemetry database if flagged as suspicious or critical threat (>= 35)
    const supabase = getSupabaseClient();
    if (supabase && riskScore >= 35) {
      try {
        const { data, error } = await supabase
          .from("scanned_messages")
          .insert({
            sender,
            raw_text: rawText,
            extracted_url: extractedUrl ?? null,
            threat_level: threatLevel,
            risk_score: riskScore,
            reasons,
            is_quarantined: isQuarantined,
          })
          .select("id")
          .single();

        if (!error && data) {
          responsePayload.id = (data as { id: string }).id;
        } else if (error) {
          console.error("Supabase insert error:", error.message);
        }
      } catch (dbErr) {
        console.warn("Supabase background telemetry sync skipped:", dbErr);
      }
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("Scan API parsing error:", error);
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }
}

// ======================================================
// GET /api/scan (National Cyber Cell Feed)
// ======================================================

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        total: 0,
        messages: [],
        status: "STANDALONE_MODE",
      });
    }

    const { data, error } = await supabase
      .from("scanned_messages")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: "Failed to query threat logs", details: error.message },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as ScannedMessageRow[];
    const messages = rows.map((item) => ({
      id: item.id,
      sender: item.sender,
      rawText: item.raw_text,
      receivedAt: item.received_at,
      extractedUrl: item.extracted_url ?? undefined,
      threatLevel: item.threat_level,
      riskScore: item.risk_score,
      reasons: item.reasons,
      isQuarantined: item.is_quarantined,
    }));

    return NextResponse.json({
      total: messages.length,
      messages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal telemetry pipeline failure" },
      { status: 500 }
    );
  }
}