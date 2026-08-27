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

// Cross-tab communication channel
const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('smishshield_telemetry_channel')
    : null;

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'NEW_THREAT_LOG') {
      const log = event.data.payload as ThreatLog;
      listeners.forEach((listener) => listener(log));
    }
  };
}

export function getStoredLogs(): ThreatLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed: ThreatLog[] = JSON.parse(raw);
    const uniqueLogs: ThreatLog[] = [];
    const seenMessages = new Set<string>();

    for (const log of parsed) {
      if (!seenMessages.has(log.message)) {
        seenMessages.add(log.message);
        uniqueLogs.push(log);
      }
    }

    return uniqueLogs;
  } catch {
    return [];
  }
}

export function saveLog(log: ThreatLog): void {
  if (typeof window === 'undefined') return;
  const current = getStoredLogs();

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
  
  // Notify same-tab subscribers
  listeners.forEach((listener) => listener(log));

  // Notify cross-tab subscribers
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'NEW_THREAT_LOG',
      payload: log
    });
  }
}