'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  ExternalLink, 
  Download, 
  PieChart, 
  Building2, 
  Zap, 
  KeyRound,
  ShieldAlert,
  Clock,
  FileCheck,
  ArrowRight,
  Radio,
  CheckCircle,
  RefreshCw,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { getStoredLogs, ThreatLog } from './telemetry';

const TAKEDOWN_STORAGE_KEY = 'smishshield_dispatched_takedowns_v2';

export default function AdminDashboard() {
  const [totalIntercepts, setTotalIntercepts] = useState(14230);
  const [threatCount, setThreatCount] = useState(0);
  const [dispatchedTakedowns, setDispatchedTakedowns] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SYNCED'>('IDLE');

  useEffect(() => {
    const stored = getStoredLogs().filter((l) => l.riskScore >= 45);
    setThreatCount(stored.length + 3);

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(TAKEDOWN_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setDispatchedTakedowns(Object.keys(parsed).length);
        } else {
          localStorage.setItem(TAKEDOWN_STORAGE_KEY, JSON.stringify({}));
          setDispatchedTakedowns(0);
        }
      } catch {}
    }
  }, []);

  const handleGatewaySync = () => {
    setSyncStatus('SYNCING');
    setTimeout(() => {
      setSyncStatus('SYNCED');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2A453B] font-sans selection:bg-[#1B4332] selection:text-[#FAF8F5]">
      {/* Top Banner Strip */}
      <div className="bg-[#FFFFFF] text-[#385348] text-[11px] font-mono py-1.5 px-6 border-b border-[#1B4332]/15 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
          <span className="font-semibold tracking-wider text-[#1B4332]">
            GOVERNMENT OF INDIA • I4C / CERT-IN SMISHING COMMAND CELL
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-[#385348]">
          <span>CLASSIFICATION: RESTRICTED // LAW ENFORCEMENT &amp; TRAI TELECOM AGGREGATION</span>
          <span className="text-[#2D6A4F] font-bold">SECURE CHANNEL ACTIVE</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 border-b border-[#1B4332]/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 flex-shrink-0">
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#FAF8F5"/>
              <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#1B4332" strokeOpacity="0.2"/>
              <path d="M24 8L11 13.5V23.5C11 31.8 16.5 39.5 24 41.5C31.5 39.5 37 31.8 37 23.5V13.5L24 8Z" fill="#1B4332" stroke="#2D6A4F" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M24 13L15 17V23.5C15 29.5 18.8 35.2 24 37C29.2 35.2 33 29.5 33 23.5V17L24 13Z" fill="#FFFFFF" stroke="#40916C" strokeWidth="1"/>
              <path d="M24 18V31M19 24.5H29" stroke="#1B4332" strokeWidth="1.75" strokeLinecap="round"/>
              <circle cx="24" cy="24.5" r="2.5" fill="#2D6A4F"/>
              <circle cx="24" cy="24.5" r="5" stroke="#2D6A4F" strokeWidth="0.75" strokeDasharray="2 2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#081510] tracking-tight font-serif">
              SmishShield SOC Incident Dashboard
            </h1>
            <p className="text-xs text-[#385348] font-medium">
              National Real-Time Smishing Payload Telemetry &amp; Regulatory Mitigation Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mobile"
            target="_blank"
            className="flex items-center gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-semibold py-2 px-4 rounded-xl transition shadow-xs"
          >
            <span>Launch Phone Simulator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Hero Banner Section */}
        <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 bg-[#ECFDF5] border border-[#2D6A4F]/20 px-3 py-1 rounded-full text-[11px] font-mono text-[#2D6A4F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse" />
              National Defense Grid Live
            </div>
            <h2 className="text-3xl font-black text-[#081510] tracking-tight font-serif">
              Protecting Citizens Against Advanced Smishing Vectors
            </h2>
            <p className="text-sm text-[#385348] leading-relaxed">
              SmishShield integrates on-device heuristics with real-time telecom gateway enforcement to intercept malicious payloads before they compromise consumer credentials.
            </p>
          </div>

          <div className="z-10 flex-shrink-0">
            <Link
              href="/dashboard/monitor"
              className="flex items-center gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold py-3 px-5 rounded-xl transition shadow-xs"
            >
              <span>View Live Telemetry Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Editorial Telemetry Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-[#385348] font-medium">Total Smishing Intercepts</span>
            <div className="text-2xl font-black text-[#081510] mt-1 font-serif">{totalIntercepts.toLocaleString()}</div>
            <span className="text-[10px] text-[#2D6A4F] mt-1 block font-semibold">
              &uarr; Live telemetry stream sync
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-[#385348] font-medium">High Risk Inceptions (&ge;45%)</span>
            <div className="text-2xl font-black text-[#991B1B] mt-1 font-serif">{threatCount}</div>
            <span className="text-[10px] text-[#991B1B] mt-1 block font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 inline" /> Active threats flagged
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-[#385348] font-medium">Avg Heuristic Engine Latency</span>
            <div className="text-2xl font-black text-[#2D6A4F] mt-1 font-serif">12ms</div>
            <span className="text-[10px] text-[#385348] mt-1 block font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 inline" /> On-Device Model Verification
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-[#385348] font-medium">CERT-In Takedowns Dispatched</span>
            <div className="text-2xl font-black text-[#B45309] mt-1 font-serif">{dispatchedTakedowns}</div>
            <span className="text-[10px] text-[#B45309] mt-1 block font-semibold flex items-center gap-1">
              <FileCheck className="w-3 h-3 inline" /> Section 79(3)(b) Notices Issued
            </span>
          </div>
        </div>

        {/* Dynamic Threat Category Distribution */}
        <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#081510] uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#2D6A4F]" />
              Threat Vector Distribution
            </h2>
            <span className="text-[10px] text-[#385348] font-mono">Dynamic Pattern Analysis</span>
          </div>

          <div className="h-3 w-full bg-[#FAF8F5] rounded-full overflow-hidden flex border border-[#1B4332]/15">
            <div style={{ width: '45%' }} className="bg-[#991B1B] transition-all duration-500" />
            <div style={{ width: '35%' }} className="bg-[#B45309] transition-all duration-500" />
            <div style={{ width: '20%' }} className="bg-[#2D6A4F] transition-all duration-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#1B4332]/15">
              <div className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#991B1B] border border-[#991B1B]/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#385348] block font-medium">Banking &amp; KYC Spoofing</span>
                <span className="text-xs font-bold text-[#081510]">45%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#1B4332]/15">
              <div className="p-1.5 rounded-lg bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#385348] block font-medium">Electricity &amp; Utilities</span>
                <span className="text-xs font-bold text-[#081510]">35%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#1B4332]/15">
              <div className="p-1.5 rounded-lg bg-[#ECFDF5] text-[#2D6A4F] border border-[#2D6A4F]/20">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#385348] block font-medium">Rewards &amp; Lottery Scams</span>
                <span className="text-xs font-bold text-[#081510]">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telecom Operator & Gateway Synchronization Hub */}
        <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1B4332]/15">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#2D6A4F] border border-[#2D6A4F]/20">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#081510]">TRAI &amp; Telecom Operator Gateway Synchronization</h2>
                <p className="text-xs text-[#385348]">
                  Enforce header blacklisting and instant SMS block rule-pushes across major telecom providers (Jio, Airtel, Vi, BSNL).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGatewaySync}
                disabled={syncStatus === 'SYNCING'}
                className={`text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-2 border ${
                  syncStatus === 'SYNCED'
                    ? 'bg-[#ECFDF5] text-[#2D6A4F] border-[#2D6A4F]/30'
                    : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] border-[#1B4332]'
                }`}
              >
                {syncStatus === 'SYNCING' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing Gateways...</span>
                  </>
                ) : syncStatus === 'SYNCED' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Gateways Synchronized</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Force Operator Sync</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#1B4332]/15 flex items-center justify-between">
              <span className="text-[#385348] font-medium">Jio Gateway</span>
              <span className="text-[#2D6A4F] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" /> Connected
              </span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#1B4332]/15 flex items-center justify-between">
              <span className="text-[#385348] font-medium">Airtel MSC</span>
              <span className="text-[#2D6A4F] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" /> Connected
              </span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#1B4332]/15 flex items-center justify-between">
              <span className="text-[#385348] font-medium">Vi Enterprise</span>
              <span className="text-[#2D6A4F] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" /> Connected
              </span>
            </div>
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#1B4332]/15 flex items-center justify-between">
              <span className="text-[#385348] font-medium">BSNL Routing</span>
              <span className="text-[#2D6A4F] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" /> Connected
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}