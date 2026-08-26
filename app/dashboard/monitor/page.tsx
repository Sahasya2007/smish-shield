'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  CheckCircle2, 
  Search,
  Filter,
  AlertTriangle,
  Lock,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { getStoredLogs, subscribeToLogs, ThreatLog } from '../telemetry';

const TAKEDOWN_STORAGE_KEY = 'smishshield_dispatched_takedowns';

const initialMockLogs: ThreatLog[] = [
  { 
    id: 'INC-9041', 
    sender: 'AD-SBIALERT', 
    message: 'URGENT: SBI account blocked. Update PAN at http://sbi-kyc.top', 
    riskScore: 92, 
    status: 'Critical Threat', 
    timestamp: '2 mins ago' 
  },
  { 
    id: 'INC-9042', 
    sender: 'VM-BESCOM', 
    message: 'Your electricity bill is overdue. Disconnection tonight. Pay via http://power-update.site', 
    riskScore: 84, 
    status: 'High Risk', 
    timestamp: '14 mins ago' 
  },
  { 
    id: 'INC-9043', 
    sender: 'JD-LUCKYWIN', 
    message: 'Congratulations! You won Rs 5000 cashback reward. Claim at http://bit.ly/claim-cash', 
    riskScore: 65, 
    status: 'Medium Risk', 
    timestamp: '1 hour ago' 
  },
  { 
    id: 'INC-9044', 
    sender: 'VM-HDFCKYC', 
    message: 'Dear Customer, your HDFC netbanking is suspended. Verify credentials at http://hdfc-net-secure.in', 
    riskScore: 90, 
    status: 'Critical Threat', 
    timestamp: '3 hours ago' 
  },
];

export default function MonitorLandingPage() {
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [takedowns, setTakedowns] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CRITICAL' | 'BANKING' | 'UTILITY'>('ALL');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(TAKEDOWN_STORAGE_KEY);
        if (saved) {
          setTakedowns(JSON.parse(saved));
        }
      } catch {}
    }

    const stored = getStoredLogs().filter((l) => l.riskScore >= 45);
    const combined = [...stored, ...initialMockLogs];
    const uniqueMap = new Map();
    combined.forEach((item) => {
      if (!uniqueMap.has(item.message)) {
        uniqueMap.set(item.message, item);
      }
    });

    setLogs(Array.from(uniqueMap.values()));

    const unsubscribe = subscribeToLogs((newLog) => {
      if (newLog.riskScore >= 45) {
        setLogs((prevLogs) => {
          if (prevLogs.length > 0 && prevLogs[0].message === newLog.message) {
            return prevLogs;
          }
          return [newLog, ...prevLogs];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTakedown = (id: string) => {
    const updatedTakedowns = { ...takedowns, [id]: true };
    setTakedowns(updatedTakedowns);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TAKEDOWN_STORAGE_KEY, JSON.stringify(updatedTakedowns));
    }
  };

  // Starts from 0 and increments with each unique dispatched notice
  const dispatchedCount = Object.keys(takedowns).length;

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

  const filteredLogs = logs
    .filter((log) => log.riskScore >= 45)
    .filter((log) => {
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterCategory === 'CRITICAL') return matchesSearch && log.riskScore >= 75;
      if (filterCategory === 'BANKING') return matchesSearch && /sbi|hdfc|bank|pan|kyc/i.test(log.message);
      if (filterCategory === 'UTILITY') return matchesSearch && /electricity|bill|power|water|bescom/i.test(log.message);
      return matchesSearch;
    });

  return (
    <div className="min-h-screen bg-[#0D1F18] text-[#FAF8F5] font-sans">
      {/* Top Bar */}
      <div className="bg-[#142820] text-[#FAF8F5] text-[11px] font-mono py-1.5 px-6 border-b border-[#1B4332]/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider text-[#52B788]">
            CERT-IN SECURE TELEMETRY FEED // ISOLATED MONITORING PAGE
          </span>
        </div>
        <Link href="/dashboard" className="text-emerald-400 hover:underline flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>
      </div>

      <header className="max-w-7xl mx-auto px-6 py-6 border-b border-[#1B4332]/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Live Threat Intercept Telemetry Feed
            </h1>
            <p className="text-xs text-emerald-400/80 font-medium">
              Real-time feed filtering logs with risk score &ge; 45%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#142820] border border-[#1B4332] px-4 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-emerald-300/70 block uppercase font-mono">CERT-IN TAKEDOWNS</span>
            <span className="text-sm font-black text-amber-400">{dispatchedCount}</span>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#142820] hover:bg-[#1B4332] text-white border border-[#1B4332] text-xs font-bold py-2 px-3.5 rounded-xl transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CERT-In CSV</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="bg-[#142820]/90 border border-[#1B4332] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400/50" />
            <input
              type="text"
              placeholder="Search Incident ID, Header, or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0D1F18] border border-[#1B4332] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0D1F18] p-1 rounded-xl border border-[#1B4332] text-xs">
            <Filter className="w-3.5 h-3.5 text-emerald-400/50 ml-2" />
            {(['ALL', 'CRITICAL', 'BANKING', 'UTILITY'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
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

        {/* Intercept Feed Table */}
        <div className="bg-[#142820]/90 border border-[#1B4332] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#1B4332]">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Stream Active (Total Records: {filteredLogs.length})
            </h2>
            <span className="text-[10px] text-emerald-400 font-mono">SECURE FEED ENCRYPTION ENABLED</span>
          </div>

          <div className="space-y-2.5">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center bg-[#0D1F18] border border-dashed border-[#1B4332] rounded-xl space-y-2">
                <AlertTriangle className="w-8 h-8 text-emerald-500/40 mx-auto" />
                <p className="text-xs font-semibold text-white">
                  No matching malicious signatures detected across active intercept streams.
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isCritical = log.riskScore >= 75;
                const isTakedownDone = takedowns[log.id];
                const extractedUrlMatch = log.message.match(/https?:\/\/[^\s]+/i);
                const extractedUrl = extractedUrlMatch ? extractedUrlMatch[0] : null;

                return (
                  <div
                    key={log.id}
                    className="flex flex-col md:flex-row md:items-center justify-between bg-[#0D1F18] border border-[#1B4332] p-4 rounded-xl hover:border-emerald-600/40 transition gap-3"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-black font-mono border ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {log.riskScore}%
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 font-bold">{log.id}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">{log.sender}</span>
                          <span className="text-[10px] text-slate-400">&bull; {log.timestamp}</span>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                              isCritical ? 'bg-rose-900 text-white' : 'bg-amber-800 text-white'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-200 leading-relaxed max-w-2xl font-medium">
                          {log.message}
                        </p>

                        {extractedUrl && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900 w-fit">
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
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
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