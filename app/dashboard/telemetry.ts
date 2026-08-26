// app/dashboard/telemetry.ts

export interface ThreatLog {
  id: string;
  sender: string;
  message: string;
  riskScore: number;
  status: 'Critical Threat' | 'High Risk' | 'Medium Risk' | 'Safe';
  timestamp: string;
}

const STORAGE_KEY = 'smishshield_logs';
type LogListener = (log: ThreatLog) => void;
const listeners: Set<LogListener> = new Set();

export function getStoredLogs(): ThreatLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLog(log: ThreatLog): void {
  if (typeof window === 'undefined') return;
  const current = getStoredLogs();
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