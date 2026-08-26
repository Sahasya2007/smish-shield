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

const TAKEDOWN_STORAGE_KEY = 'smishshield_dispatched_takedowns';

export default function AdminDashboard() {
  const [totalIntercepts, setTotalIntercepts] = useState(14230);
  const [threatCount, setThreatCount] = useState(0);
  const [dispatchedTakedowns, setDispatchedTakedowns] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SYNCED'>('IDLE');

  useEffect(() => {
    const stored = getStoredLogs().filter((l) => l.riskScore >= 45);
    setThreatCount(stored.length + 3);

    // Load shared takedown count starting from 0
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(TAKEDOWN_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setDispatchedTakedowns(Object.keys(parsed).length);
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
    <div className="min-h-screen bg-[#0D1F18] text-[#FAF8F5] font-sans">
      {/* Top Banner Strip */}
      <div className="bg-[#142820] text-[#FAF8F5] text-[11px] font-mono py-1.5 px-6 border-b border-[#1B4332]/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider text-[#52B788]">
            GOVERNMENT OF INDIA • I4C / CERT-IN SMISHING COMMAND CELL
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-[#FAF8F5]/70">
          <span>CLASSIFICATION: RESTRICTED // LAW ENFORCEMENT &amp; TRAI TELECOM AGGREGATION</span>
          <span className="text-[#52B788] font-bold">SECURE CHANNEL ACTIVE</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 border-b border-[#1B4332]/40 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 flex-shrink-0">
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#142820"/>
              <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#1B4332" strokeOpacity="0.4"/>
              <path d="M24 8L11 13.5V23.5C11 31.8 16.5 39.5 24 41.5C31.5 39.5 37 31.8 37 23.5V13.5L24 8Z" fill="#1B4332" stroke="#2D6A4F" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M24 13L15 17V23.5C15 29.5 18.8 35.2 24 37C29.2 35.2 33 29.5 33 23.5V17L24 13Z" fill="#0D1F18" stroke="#40916C" strokeWidth="1"/>
              <path d="M24 18V31M19 24.5H29" stroke="#FAF8F5" strokeWidth="1.75" strokeLinecap="round"/>
              <circle cx="24" cy="24.5" r="2.5" fill="#52B788"/>
              <circle cx="24" cy="24.5" r="5" stroke="#52B788" strokeWidth="0.75" strokeDasharray="2 2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              SmishShield SOC Incident Dashboard
            </h1>
            <p className="text-xs text-emerald-400/80 font-medium">
              National Real-Time Smishing Payload Telemetry &amp; Regulatory Mitigation Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mobile"
            target="_blank"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-4 rounded-xl transition shadow-sm"
          >
            <span>Launch Phone Simulator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Hero Banner Section */}
        <div className="bg-gradient-to-r from-[#142820] to-[#1B4332] border border-[#2D6A4F]/40 rounded-3xl p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              National Defense Grid Live
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Protecting Citizens Against Advanced Smishing Vectors
            </h2>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              SmishShield integrates on-device heuristics with real-time telecom gateway enforcement to intercept malicious payloads before they compromise consumer credentials.
            </p>
          </div>

          <div className="z-10 flex-shrink-0">
            <Link
              href="/dashboard/monitor"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-5 rounded-xl transition shadow-md"
            >
              <span>View Live Telemetry Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Editorial Telemetry Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#142820]/90 border border-[#1B4332] rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-emerald-300/70 font-medium">Total Smishing Intercepts</span>
            <div className="text-2xl font-black text-white mt-1">{totalIntercepts.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">
              &uarr; Live telemetry stream sync
            </span>
          </div>

          <div className="bg-[#142820]/90 border border-[#1B4332] rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-emerald-300/70 font-medium">High Risk Inceptions (&ge;45%)</span>
            <div className="text-2xl font-black text-rose-400 mt-1">{threatCount}</div>
            <span className="text-[10px] text-rose-400 mt-1 block font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 inline" /> Active threats flagged
            </span>
          </div>

          <div className="bg-[#142820]/90 border border-[#1B4332] rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-emerald-300/70 font-medium">Avg Heuristic Engine Latency</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">12ms</div>
            <span className="text-[10px] text-emerald-300/70 mt-1 block font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 inline" /> On-Device Model Verification
            </span>
          </div>

          {/* CERT-In Takedowns Dispatched (Starts at 0 and increments with clicks) */}
          <div className="bg-[#142820]/90 border border-[#1B4332] rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-emerald-300/70 font-medium">CERT-In Takedowns Dispatched</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{dispatchedTakedowns}</div>
            <span className="text-[10px] text-amber-400 mt-1 block font-semibold flex items-center gap-1">
              <FileCheck className="w-3 h-3 inline" /> Section 79(3)(b) Notices Issued
            </span>
          </div>
        </div>

        {/* Dynamic Threat Category Distribution */}
        <div className="bg-[#142820]/90 border border-[#1B4332] rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Threat Vector Distribution
            </h2>
            <span className="text-[10px] text-emerald-300/70 font-mono">Dynamic Pattern Analysis</span>
          </div>

          <div className="h-3 w-full bg-[#0D1F18] rounded-full overflow-hidden flex border border-[#1B4332]">
            <div style={{ width: '45%' }} className="bg-rose-600 transition-all duration-500" />
            <div style={{ width: '35%' }} className="bg-amber-500 transition-all duration-500" />
            <div style={{ width: '20%' }} className="bg-emerald-500 transition-all duration-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2 bg-[#0D1F18] p-2.5 rounded-xl border border-[#1B4332]">
              <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Banking &amp; KYC Spoofing</span>
                <span className="text-xs font-bold text-white">45%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#0D1F18] p-2.5 rounded-xl border border-[#1B4332]">
              <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Electricity &amp; Utilities</span>
                <span className="text-xs font-bold text-white">35%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#0D1F18] p-2.5 rounded-xl border border-[#1B4332]">
              <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Rewards &amp; Lottery Scams</span>
                <span className="text-xs font-bold text-white">20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telecom Operator & Gateway Synchronization Hub */}
        <div className="bg-[#142820]/90 border border-[#1B4332] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1B4332]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">TRAI &amp; Telecom Operator Gateway Synchronization</h2>
                <p className="text-xs text-slate-300">
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
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                }`}
              >
                {syncStatus === 'SYNCING' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing Gateways...</span>
                  </>
                ) : syncStatus === 'SYNCED' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
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
            <div className="bg-[#0D1F18] p-3 rounded-xl border border-[#1B4332] flex items-center justify-between">
              <span className="text-slate-300 font-medium">Jio Gateway</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
              </span>
            </div>
            <div className="bg-[#0D1F18] p-3 rounded-xl border border-[#1B4332] flex items-center justify-between">
              <span className="text-slate-300 font-medium">Airtel MSC</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
              </span>
            </div>
            <div className="bg-[#0D1F18] p-3 rounded-xl border border-[#1B4332] flex items-center justify-between">
              <span className="text-slate-300 font-medium">Vi Enterprise</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
              </span>
            </div>
            <div className="bg-[#0D1F18] p-3 rounded-xl border border-[#1B4332] flex items-center justify-between">
              <span className="text-slate-300 font-medium">BSNL Routing</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}