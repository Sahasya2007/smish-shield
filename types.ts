export type ThreatLevel = 'SAFE' | 'SUSPICIOUS' | 'CRITICAL_PHISHING';

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

export interface NationalThreatStats {
  totalScanned: number;
  totalBlocked: number;
  activeScamCampaigns: number;
  recentThreats: ScannedMessage[];
}

export interface ThreatBadgeProps {
  threatLevel: ThreatLevel;
  riskScore: number;
}

export interface NOCMetricsData {
  systemUptime: string;
  activeNodes: number;
  apiLatencyMs: number;
  packetLossPercentage: number;
}

export interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  systemStatus?: 'SECURE' | 'ELEVATED' | 'CRITICAL';
}