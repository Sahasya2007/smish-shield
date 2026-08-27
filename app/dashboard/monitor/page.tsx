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
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { subscribeToLogs, ThreatLog } from '../telemetry';
import { supabase } from '@/lib/supabase';

const TAKEDOWN_STORAGE_KEY = 'smishshield_dispatched_takedowns_v2';

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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial incidents from Supabase
  const loadDatabaseIncidents = async () => {
    try {
      if (!supabase) {
        setLogs(initialMockLogs);
        return;
      }

      const { data, error } = await supabase
        .from('scanned_messages')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(30);

      if (error || !data || data.length === 0) {
        setLogs(initialMockLogs);
      } else {
        const mappedFromDb: ThreatLog[] = data.map((item) => ({
          id: `INC-${item.id.slice(0, 4).toUpperCase()}`,
          sender: item.sender,
          message: item.raw_text,
          riskScore: item.risk_score,
          status: item.threat_level === 'CRITICAL_PHISHING' 
            ? 'Critical Threat' 
            : item.threat_level === 'SUSPICIOUS' 
            ? 'High Risk' 
            : 'Safe',
          timestamp: new Date(item.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        // Merge DB logs with fallback mock logs (preventing duplicate text)
        const combined = [...mappedFromDb, ...initialMockLogs];
        const uniqueMap = new Map<string, ThreatLog>();
        combined.forEach((entry) => {
          if (!uniqueMap.has(entry.message)) {
            uniqueMap.set(entry.message, entry);
          }
        });

        setLogs(Array.from(uniqueMap.values()));
      }
    } catch (e) {
      setLogs(initialMockLogs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(TAKEDOWN_STORAGE_KEY);
        if (saved) {
          setTakedowns(JSON.parse(saved));
        } else {
          localStorage.setItem(TAKEDOWN_STORAGE_KEY, JSON.stringify({}));
          setTakedowns({});
        }
      } catch {}
    }

    loadDatabaseIncidents();

    // 1. Listen via Cross-Tab Broadcast Channel
    const unsubscribeBroadcast = subscribeToLogs((newLog) => {
      if (newLog.riskScore >= 45) {
        setLogs((prev) => {
          if (prev.some((l) => l.message === newLog.message)) return prev;
          return [newLog, ...prev];
        });
      }
    });

    // 2. Listen via Supabase Realtime WebSocket
    let realtimeChannel: any = null;
    if (supabase) {
      realtimeChannel = supabase
        .channel('realtime_monitor_feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'scanned_messages' },
          (payload) => {
            const newItem = payload.new;
            const newLogEntry: ThreatLog = {
              id: `INC-${newItem.id.slice(0, 4).toUpperCase()}`,
              sender: newItem.sender,
              message: newItem.raw_text,
              riskScore: newItem.risk_score,
              status: newItem.threat_level === 'CRITICAL_PHISHING' ? 'Critical Threat' : 'High Risk',
              timestamp: new Date(newItem.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setLogs((prev) => {
              if (prev.some((l) => l.message === newLogEntry.message)) return prev;
              return [newLogEntry, ...prev];
            });
          }
        )
        .subscribe();
    }

    return () => {
      unsubscribeBroadcast();
      if (supabase && realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const handleTakedown = (id: string) => {
    const updatedTakedowns = { ...takedowns, [id]: true };
    setTakedowns(updatedTakedowns);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TAKEDOWN_STORAGE_KEY, JSON.stringify(updatedTakedowns));
    }
  };

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
    <div className="min-h-screen bg-[#FAF8F5] text-[#2A453B] font-sans selection:bg-[#1B4332] selection:text-[#FAF8F5]">
      {/* Top Bar */}
      <div className="bg-[#FFFFFF] text-[#385348] text-[11px] font-mono py-1.5 px-6 border-b border-[#1B4332]/15 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
          <span className="font-semibold tracking-wider text-[#1B4332]">
            CERT-IN SECURE TELEMETRY FEED // ISOLATED MONITORING PAGE
          </span>
        </div>
        <Link href="/dashboard" className="text-[#2D6A4F] hover:underline flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>
      </div>

      <header className="max-w-7xl mx-auto px-6 py-6 border-b border-[#1B4332]/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-[#2D6A4F]" />
          <div>
            <h1 className="text-xl font-extrabold text-[#081510] tracking-tight font-serif">
              Live Threat Intercept Telemetry Feed
            </h1>
            <p className="text-xs text-[#385348] font-medium">
              Real-time feed filtering logs with risk score &ge; 45%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#FFFFFF] border border-[#1B4332]/15 px-4 py-1.5 rounded-xl text-right shadow-xs">
            <span className="text-[10px] text-[#385348] block uppercase font-mono">CERT-IN TAKEDOWNS</span>
            <span className="text-sm font-black text-[#B45309] font-serif">{dispatchedCount}</span>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#081510] border border-[#1B4332]/15 text-xs font-bold py-2 px-3.5 rounded-xl transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Export CERT-In CSV</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#385348]/70" />
            <input
              type="text"
              placeholder="Search Incident ID, Header, or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#1B4332]/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#081510] focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#1B4332]/15 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#385348]/70 ml-2" />
            {(['ALL', 'CRITICAL', 'BANKING', 'UTILITY'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterCategory === cat
                    ? 'bg-[#1B4332] text-[#FAF8F5]'
                    : 'text-[#385348] hover:text-[#081510]'
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
        <div className="bg-[#FFFFFF] border border-[#1B4332]/15 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#1B4332]/15">
            <h2 className="text-xs font-bold text-[#081510] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse"></span>
              Live Stream Active (Total Records: {filteredLogs.length})
            </h2>
            <span className="text-[10px] text-[#2D6A4F] font-mono">SECURE FEED ENCRYPTION ENABLED</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#385348] flex items-center justify-center gap-2 font-mono">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching incidents from Supabase...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center bg-[#FAF8F5] border border-dashed border-[#1B4332]/20 rounded-xl space-y-2">
              <AlertTriangle className="w-8 h-8 text-[#385348]/40 mx-auto" />
              <p className="text-xs font-semibold text-[#081510]">
                No matching malicious signatures detected across active intercept streams.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log) => {
                const isCritical = log.riskScore >= 75;
                const isTakedownDone = takedowns[log.id];
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
                              ? 'bg-[#FEF2F2] text-[#991B1B] border-[#991B1B]/30'
                              : 'bg-[#FFFBEB] text-[#B45309] border-[#B45309]/30'
                          }`}
                        >
                          {log.riskScore}%
                        </span>
                        <span className="text-[9px] font-mono text-[#385348] font-bold">{log.id}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#081510] font-mono">{log.sender}</span>
                          <span className="text-[10px] text-[#385348]">&bull; {log.timestamp}</span>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                              isCritical ? 'bg-[#991B1B] text-[#FFFFFF]' : 'bg-[#B45309] text-[#FFFFFF]'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-[#2A453B] leading-relaxed max-w-2xl font-medium">
                          {log.message}
                        </p>

                        {extractedUrl && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-[#991B1B] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#991B1B]/20 w-fit">
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
                            ? 'bg-[#ECFDF5] text-[#2D6A4F] border-[#2D6A4F]/30 cursor-default'
                            : 'bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] border-[#1B4332]'
                        }`}
                      >
                        {isTakedownDone ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
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
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}