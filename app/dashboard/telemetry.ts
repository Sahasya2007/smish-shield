export type ThreatStatus = 'Critical Threat' | 'High Risk' | 'Medium Risk' | 'Safe';

export interface ThreatLog {
  id: string;
  sender: string;
  message: string;
  riskScore: number;
  status: ThreatStatus;
  timestamp: string;
}

const STORAGE_KEY = 'smishshield_logs';
type LogListener = (log: ThreatLog) => void;
const listeners: Set<LogListener> = new Set();

export function getStoredLogs(): ThreatLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed: ThreatLog[] = JSON.parse(raw);

    // Automatically filter out duplicates from existing storage so you don't have to manually clear it
    const uniqueLogs: ThreatLog[] = [];
    const seenMessages = new Set<string>();

    for (const log of parsed) {
      if (!seenMessages.has(log.message)) {
        seenMessages.add(log.message);
        uniqueLogs.push(log);
      }
    }

    // Save the cleaned version back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueLogs));
    return uniqueLogs;
  } catch {
    return [];
  }
}

export function saveLog(log: ThreatLog): void {
  if (typeof window === 'undefined') return;
  const current = getStoredLogs();

  // 1. Prevent consecutive duplicate
  if (current.length > 0 && current[0].message === log.message) {
    return;
  }

  // 2. Prevent duplicate message anywhere in storage
  if (current.some((item) => item.message === log.message)) {
    return;
  }

  const updated = [log, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
}

export function subscribeToLogs(listener: LogListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function broadcastThreatLog(log: ThreatLog): void {
  if (log.riskScore >= 45) {
    saveLog(log);
  }
  listeners.forEach((listener) => listener(log));
}