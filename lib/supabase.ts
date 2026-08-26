import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

export type ThreatLevel = "SAFE" | "SUSPICIOUS" | "CRITICAL_PHISHING";

export interface ScannedMessage {
  id: string;
  sender: string;
  raw_text: string;
  extracted_url?: string | null;
  threat_level: ThreatLevel;
  risk_score: number;
  reasons: string[];
  is_quarantined: boolean;
  received_at: string;
}

/**
 * Fetches all quarantined / critical phishing SMS logs.
 */
export async function getQuarantinedLogs(): Promise<ScannedMessage[]> {
  const { data, error } = await supabase
    .from("scanned_messages")
    .select("*")
    .eq("is_quarantined", true)
    .order("received_at", { ascending: false });

  if (error) {
    console.error("Database Error (Fetching quarantined logs):", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Fetches all safe SMS logs.
 */
export async function getAllSafeLogs(): Promise<ScannedMessage[]> {
  const { data, error } = await supabase
    .from("scanned_messages")
    .select("*")
    .eq("threat_level", "SAFE")
    .order("received_at", { ascending: false });

  if (error) {
    console.error("Database Error (Fetching safe logs):", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Inserts a scanned SMS into the database.
 */
export async function insertSmsLog(payload: {
  sender: string;
  rawText: string;
  threatLevel: ThreatLevel;
  riskScore: number;
  reasons: string[];
  extractedUrl?: string | null;
  isQuarantined?: boolean;
}) {
  const { data, error } = await supabase
    .from("scanned_messages")
    .insert([
      {
        sender: payload.sender,
        raw_text: payload.rawText,
        extracted_url: payload.extractedUrl ?? null,
        threat_level: payload.threatLevel,
        risk_score: payload.riskScore,
        reasons: payload.reasons,
        is_quarantined: payload.isQuarantined ?? payload.threatLevel === "CRITICAL_PHISHING",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Database Error (Inserting log):", error.message);
    return null;
  }
  return data;
}

/**
 * Fast database-level counts for the dashboard (no in-memory downloads).
 */
export async function getDashboardStats() {
  const [totalRes, safeRes, quarantinedRes] = await Promise.all([
    supabase.from("scanned_messages").select("*", { count: "exact", head: true }),
    supabase.from("scanned_messages").select("*", { count: "exact", head: true }).eq("threat_level", "SAFE"),
    supabase.from("scanned_messages").select("*", { count: "exact", head: true }).eq("is_quarantined", true),
  ]);

  return {
    total: totalRes.count ?? 0,
    safe: safeRes.count ?? 0,
    quarantined: quarantinedRes.count ?? 0,
  };
}