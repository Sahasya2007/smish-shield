export interface ThreatLog {
  id: string;
  sender: string;
  message: string;
  riskScore: number;
  status: 'Critical Threat' | 'High Risk' | 'Medium Risk' | 'Safe';
  timestamp: string;
}

const STORAGE_KEY = 'smishshield_telemetry_intercepts';
const TELEMETRY_EVENT = 'smishshield_threat_intercepted';

/**
 * Retrieve stored logs from browser local storage
 */
export const getStoredLogs = (): ThreatLog[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Save a new log locally
 */
export const saveLog = (log: ThreatLog) => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredLogs();
    const updated = [log, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Handle quota errors silently
  }
};

/**
 * Broadcast threat telemetry across components
 */
export const broadcastThreatLog = (log: ThreatLog) => {
  if (typeof window === 'undefined') return;
  
  saveLog(log);

  const customEvent = new CustomEvent<ThreatLog>(TELEMETRY_EVENT, { detail: log });
  window.dispatchEvent(customEvent);
};

/**
 * Subscribe to real-time threat events in the dashboard
 */
export const subscribeToLogs = (callback: (log: ThreatLog) => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<ThreatLog>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener(TELEMETRY_EVENT, handleCustomEvent);
  return () => window.removeEventListener(TELEMETRY_EVENT, handleCustomEvent);
};