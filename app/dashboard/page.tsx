'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  PieChart, 
  Building2, 
  Zap, 
  KeyRound,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Lock,
  FileCheck
} from 'lucide-react';
import Link from 'next/link';

// Relative import local to app/dashboard/
import { getStoredLogs, subscribeToLogs, ThreatLog } from './telemetry';

// Operational initial mock logs filtered STRICTLY to threat samples (riskScore >= 45)
const initialMockLogs: ThreatLog[] = [
  { 
    id: 'INC-9041', 
    sender: '+91 98765 43210', 
    message: 'URGENT: SBI account blocked. Update PAN at http://sbi-kyc.top', 
    riskScore: 92, 
    status: 'Critical Threat', 
    timestamp: '2 mins ago' 
  },
  { 
    id: 'INC-9042', 
    sender: 'AX-HDFCBK', 
    message: 'Your electricity bill is overdue. Pay via http://power-update.site', 
    riskScore: 84, 
    status: 'High Risk', 
    timestamp: '14 mins ago' 
  },
  { 
    id: 'INC-9043', 
    sender: '+91 70123 45678', 
    message: 'Congratulations! You won Rs 5000 cashback. Claim at http://bit.ly/claim', 
    riskScore: 65, 
    status: 'Medium Risk', 
    timestamp: '1 hour ago' 
  },
];

export default function AdminDashboard() {
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [totalIntercepts, setTotalIntercepts] = useState(14230);
  const [takedowns, setTakedowns] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CRITICAL' | 'BANKING' | 'UTILITY'>('ALL');

  useEffect(() => {
    // 1. Initial Load: Filter out any safe logs (< 45) to maintain strict citizen privacy
    const stored = getStoredLogs().filter((l) => l.riskScore >= 45);
    setLogs([...stored, ...initialMockLogs]);

    // 2. Real-Time Subscription: Privacy Gate prevents non-threat logs from hitting state
    const unsubscribe = subscribeToLogs((newLog) => {
      if (newLog.riskScore >= 45) {
        setLogs((prevLogs) => [newLog, ...prevLogs]);
        setTotalIntercepts((prev) => prev + 1);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTakedown = (id: string) => {
    setTakedowns((prev) => ({ ...prev, [id]: true }));
  };

  const exportCSV = () => {
    const headers = ['Incident ID,Sender Telephony,Message Content,Risk Score %,Classification,Timestamp\n'];
    const rows = logs.map(
      (l) => `"${l.id}","${l.sender}","${l.message.replace(/"/g, '""')}",${l.riskScore},"${l.status}","${l.timestamp}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smishshield_certin_incident_report_${Date.now()}.csv`;
    a.click();
  };

  // Enforce zero safe messages rendered regardless of user search filter
  const filteredLogs = logs
    .filter((log) => log.riskScore >= 45)
    .filter((log) => {
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterCategory === 'CRITICAL') return matchesSearch && log.riskScore >= 75;
      if (filterCategory === 'BANKING') return matchesSearch && /sbi|hdfc|bank|pan|kyc/i.test(log.message);
      if (filterCategory === 'UTILITY') return matchesSearch && /electricity|bill|power|water/i.test(log.message);
      return matchesSearch;
    });

  const totalThreats = logs.length || 1;
  const bankingCount = logs.filter((l) => /sbi|hdfc|bank|pan|kyc/i.test(l.message)).length;
  const utilityCount = logs.filter((l) => /electricity|bill|power|water/i.test(l.message)).length;

  const bankingPct = Math.round((bankingCount / totalThreats) * 100) || 45;
  const utilityPct = Math.round((utilityCount / totalThreats) * 100) || 35;
  const rewardPct = Math.max(0, 100 - (bankingPct + utilityPct));

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#081510] font-sans">
      {/* Institutional Top Classification Strip */}
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
      <header className="max-w-7xl mx-auto px-6 py-6 border-b border-[#1B4332]/15 flex items-center justify-between">
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
            <h1 className="text-xl font-extrabold text-[#081510] tracking-tight">
              SmishShield SOC Incident Dashboard
            </h1>
            <p className="text-xs text-[#1B4332]/70 font-medium">
              National Real-Time Smishing Payload Telemetry &amp; Regulatory Mitigation Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#FAF8F5] hover:bg-white text-[#1B4332] border border-[#1B4332]/30 text-xs font-bold py-2 px-3.5 rounded-xl transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CERT-In CSV</span>
          </button>

          <Link
            href="/mobile"
            target="_blank"
            className="flex items-center gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-semibold py-2 px-4 rounded-xl transition shadow-sm"
          >
            <span>Launch Phone Simulator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Editorial Telemetry Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-[#1B4332]/70 font-medium">Total Smishing Intercepts</span>
            <div className="text-2xl font-black text-[#081510] mt-1">{totalIntercepts.toLocaleString()}</div>
            <span className="text-[10px] text-[#2D6A4F] mt-1 block font-semibold">
              &uarr; Live telemetry stream sync
            </span>
          </div>

          <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-[#1B4332]/70 font-medium">High Risk Inceptions (&ge;45%)</span>
            <div className="text-2xl font-black text-rose-700 mt-1">{logs.length}</div>
            <span className="text-[10px] text-rose-600 mt-1 block font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 inline" /> Active threats flagged
            </span>
          </div>

          <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-[#1B4332]/70 font-medium">Avg Heuristic Engine Latency</span>
            <div className="text-2xl font-black text-[#1B4332] mt-1">12ms</div>
            <span className="text-[10px] text-[#2D6A4F] mt-1 block font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 inline" /> On-Device Model Verification
            </span>
          </div>

          <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-[#1B4332]/70 font-medium">CERT-In Takedowns Dispatched</span>
            <div className="text-2xl font-black text-[#D97706] mt-1">{Object.keys(takedowns).length}</div>
            <span className="text-[10px] text-[#D97706] mt-1 block font-semibold flex items-center gap-1">
              <FileCheck className="w-3 h-3 inline" /> Section 79(3)(b) Notices Issued
            </span>
          </div>
        </div>

        {/* Dynamic Threat Category Distribution */}
        <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#081510] uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#1B4332]" />
              Threat Vector Distribution
            </h2>
            <span className="text-[10px] text-[#1B4332]/70 font-mono">Dynamic Pattern Analysis</span>
          </div>

          <div className="h-3 w-full bg-[#FAF8F5] rounded-full overflow-hidden flex border border-[#1B4332]/20">
            <div style={{ width: `${bankingPct}%` }} className="bg-rose-800 transition-all duration-500" />
            <div style={{ width: `${utilityPct}%` }} className="bg-amber-600 transition-all duration-500" />
            <div style={{ width: `${rewardPct}%` }} className="bg-[#1B4332] transition-all duration-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#1B4332]/15">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-300">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#1B4332]/70 block font-medium">Banking &amp; KYC Spoofing</span>
                <span className="text-xs font-bold text-[#081510]">{bankingPct}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#1B4332]/15">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#1B4332]/70 block font-medium">Electricity &amp; Utilities</span>
                <span className="text-xs font-bold text-[#081510]">{utilityPct}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#1B4332]/15">
              <div className="p-1.5 rounded-lg bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#1B4332]/70 block font-medium">Rewards &amp; Lottery Scams</span>
                <span className="text-xs font-bold text-[#081510]">{rewardPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Intercept Table */}
        <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-[#081510] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1B4332]" />
              Live Intercept Telemetry Feed (Threats Only)
            </h2>
            <span className="text-xs text-[#2D6A4F] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse"></span>
              Listening for smishing triggers...
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#1B4332]/50" />
              <input
                type="text"
                placeholder="Search Incident ID, Header, or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#1B4332]/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#081510] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#1B4332]/15 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#1B4332]/50 ml-2" />
              {(['ALL', 'CRITICAL', 'BANKING', 'UTILITY'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    filterCategory === cat
                      ? 'bg-[#1B4332] text-white'
                      : 'text-[#1B4332]/70 hover:text-[#081510]'
                  }`}
                >
                  {cat === 'ALL'
                    ? 'ALL ACTIVE THREATS'
                    : cat === 'CRITICAL'
                    ? 'CRITICAL (>=75%)'
                    : cat === 'BANKING'
                    ? 'BANKING / KYC'
                    : 'UTILITY SPOOFING'}
                </button>
              ))}
            </div>
          </div>

          {/* Table / List Container */}
          <div className="space-y-2.5">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center bg-[#FAF8F5] border border-dashed border-[#1B4332]/20 rounded-xl space-y-2">
                <AlertTriangle className="w-8 h-8 text-[#1B4332]/40 mx-auto" />
                <p className="text-xs font-semibold text-[#081510]">
                  No matching malicious signatures detected across active intercept streams.
                </p>
                <p className="text-[11px] text-[#1B4332]/60">
                  Non-threat SMS messages are automatically suppressed for citizen privacy.
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isCritical = log.riskScore >= 75;
                const isTakedownDone = takedowns[log.id];

                // Extract malicious URL pattern if present
                const extractedUrlMatch = log.message.match(/https?:\/\/[^\s]+/i);
                const extractedUrl = extractedUrlMatch ? extractedUrlMatch[0] : null;

                return (
                  <div
                    key={log.id}
                    className="flex flex-col md:flex-row md:items-center justify-between bg-[#FAF8F5] border border-[#1B4332]/15 p-4 rounded-xl hover:border-[#1B4332]/40 transition gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-black font-mono border ${
                            isCritical
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {log.riskScore}%
                        </span>
                        <span className="text-[9px] font-mono text-[#1B4332]/60 font-bold">{log.id}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#081510] font-mono">{log.sender}</span>
                          <span className="text-[10px] text-[#1B4332]/60">&bull; {log.timestamp}</span>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                              isCritical ? 'bg-rose-900 text-white' : 'bg-amber-700 text-white'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-[#081510] leading-relaxed max-w-2xl font-medium">
                          {log.message}
                        </p>

                        {extractedUrl && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 w-fit">
                            <span>Suspect Payload URL:</span>
                            <span className="font-bold underline">{extractedUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end md:justify-center">
                      <button
                        onClick={() => handleTakedown(log.id)}
                        disabled={isTakedownDone}
                        className={`text-xs px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 border ${
                          isTakedownDone
                            ? 'bg-emerald-800 text-white border-emerald-900 cursor-default'
                            : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] border-[#1B4332]'
                        }`}
                      >
                        {isTakedownDone ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            <span>CERT-In Freezed &amp; Logged</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Dispatch Section 79(3)(b) Notice</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}