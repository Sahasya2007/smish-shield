import React from 'react';
import { NationalThreatStats } from '../types';

interface SOCMetricsProps {
  stats: NationalThreatStats;
}

export default function SOCMetrics({ stats }: SOCMetricsProps) {
  const metrics = [
    {
      title: 'Total Scanned',
      value: stats.totalScanned.toLocaleString(),
      change: '+12% today',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-900',
    },
    {
      title: 'Total Blocked',
      value: stats.totalBlocked.toLocaleString(),
      change: '99.4% efficacy',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-900',
    },
    {
      title: 'Active Scam Campaigns',
      value: stats.activeScamCampaigns.toLocaleString(),
      change: 'Monitored 24/7',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`bg-white/80 backdrop-blur-md p-4 rounded-xl border ${metric.borderColor} shadow-sm flex flex-col justify-between`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {metric.title}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-2xl font-black font-mono ${metric.textColor}`}>
              {metric.value}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}