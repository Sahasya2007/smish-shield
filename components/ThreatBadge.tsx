import React from 'react';
import { ThreatLevel } from '../types';

interface ThreatBadgeProps {
  threatLevel: ThreatLevel;
  riskScore: number;
}

export default function ThreatBadge({ threatLevel, riskScore }: ThreatBadgeProps) {
  const isCritical = threatLevel === 'CRITICAL_PHISHING';
  const isSuspicious = threatLevel === 'SUSPICIOUS';

  const badgeStyles = isCritical
    ? 'bg-rose-100 text-rose-900 border-rose-300'
    : isSuspicious
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-emerald-100 text-emerald-900 border-emerald-300';

  const label = isCritical
    ? 'Critical Phishing'
    : isSuspicious
    ? 'Suspicious'
    : 'Safe';

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black font-mono border ${badgeStyles}`}>
        {riskScore}% Risk
      </span>
      <span className="text-[10px] font-semibold text-[#1B4332]/70 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}