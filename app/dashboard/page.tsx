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
  Filter
} from 'lucide-react';
import Link from 'next/link';

// Relative import local to app/dashboard/
import { getStoredLogs, subscribeToLogs, ThreatLog } from './telemetry';

const initialMockLogs: ThreatLog[] = [
  { id: '1', sender: '+91 98765 43210', message: 'URGENT: SBI account blocked. Update PAN at http://sbi-kyc.top', riskScore: 92, status: 'Critical Threat', timestamp: '2 mins ago' },
  { id: '2', sender: 'AX-HDFCBK', message: 'Your electricity bill is overdue. Pay via http://power-update.site', riskScore: 84, status: 'High Risk', timestamp: '14 mins ago' },
  { id: '3', sender: '+91 70123 45678', message: 'Congratulations! You won Rs 5000 cashback. Claim at http://bit.ly/claim', riskScore: 65, status: 'Medium Risk', timestamp: '1 hour ago' },
  { id: '4', sender: 'VM-JIO', message: 'Your daily 2GB data pack is exhausted. Recharge at jio.com', riskScore: 5, status: 'Safe', timestamp: '3 hours ago' },
];

export default function AdminDashboard() {
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [totalIntercepts, setTotalIntercepts] = useState(14230);
  const [takedowns, setTakedowns] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CRITICAL' | 'BANKING'>('ALL');

  useEffect(() => {
    const stored = getStoredLogs();
    setLogs([...stored, ...initialMockLogs]);

    const unsubscribe = subscribeToLogs((newLog) => {
      setLogs((prevLogs) => [newLog, ...prevLogs]);
      setTotalIntercepts((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  const handleTakedown = (id: string) => {
    setTakedowns((prev) => ({ ...prev, [id]: true }));
  };

  const exportCSV = () => {
    const headers = ['ID,Sender,Message,Risk Score,Status,Timestamp\n'];
    const rows = logs.map(l => `"${l.id}","${l.sender}","${l.message.replace(/"/g, '""')}",${l.riskScore},"${l.status}","${l.timestamp}"`);
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smishshield_threat_report_${Date.now()}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.sender.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterCategory === 'CRITICAL') return matchesSearch && log.riskScore >= 75;
    if (filterCategory === 'BANKING') return matchesSearch && /sbi|hdfc|bank|pan|kyc/i.test(log.message);
    return matchesSearch;
  });

  const totalThreats = logs.filter(l => l.riskScore >= 45).length || 1;
  const bankingCount = logs.filter(l => /sbi|hdfc|bank|pan|kyc/i.test(l.message)).length;
  const utilityCount = logs.filter(l => /electricity|bill|power|water/i.test(l.message)).length;

  const bankingPct = Math.round((bankingCount / totalThreats) * 100) || 45;
  const utilityPct = Math.round((utilityCount / totalThreats) * 100) || 35;
  const rewardPct = Math.min(100 - (bankingPct + utilityPct), 20) || 20;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="max-w-7xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SmishShield Cyber Intelligence Center</h1>
            <p className="text-xs text-slate-400">National Smishing Threat Monitoring & Telemetry Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold py-2 px-3 rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          
          <Link 
            href="/mobile" 
            target="_blank"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-xl transition"
          >
            <span>Open Phone Simulator</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Total Scams Intercepted</span>
            <div className="text-2xl font-bold text-white mt-1">{totalIntercepts.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-400 mt-1 block">↑ Live syncing with app</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">High Risk Payloads</span>
            <div className="text-2xl font-bold text-red-400 mt-1">
              {logs.filter(l => l.riskScore >= 45).length}
            </div>
            <span className="text-[10px] text-red-400 mt-1 block">Threat detected</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Engine Latency</span>
            <div className="text-2xl font-bold text-blue-400 mt-1">12ms</div>
            <span className="text-[10px] text-blue-400 mt-1 block">On-Device Heuristics</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400">Active Takedowns</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {Object.keys(takedowns).length}
            </div>
            <span className="text-[10px] text-amber-400 mt-1 block">Flagged for CERT-In</span>
          </div>
        </div>

        {/* Dynamic Threat Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Threat Category Vector Distribution
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Dynamic Pattern Analysis</span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div style={{ width: `${bankingPct}%` }} className="bg-rose-500 transition-all duration-500" />
            <div style={{ width: `${utilityPct}%` }} className="bg-amber-500 transition-all duration-500" />
            <div style={{ width: `${rewardPct}%` }} className="bg-cyan-500 transition-all duration-500" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Banking & KYC</span>
                <span className="text-xs font-bold text-slate-100">{bankingPct}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Electricity / Utility</span>
                <span className="text-xs font-bold text-slate-100">{utilityPct}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Rewards & Lottery</span>
                <span className="text-xs font-bold text-slate-100">{rewardPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Intercept Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Live Intercept Feed (Real-Time Sync)
            </h2>
            <span className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Listening for scans...
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search sender or SMS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
              {(['ALL', 'CRITICAL', 'BANKING'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    filterCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold font-mono ${
                      log.riskScore >= 75
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : log.riskScore >= 45
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {log.riskScore}%
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{log.sender}</span>
                      <span className="text-[10px] text-slate-500">• {log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xl truncate">{log.message}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleTakedown(log.id)}
                  disabled={takedowns[log.id]}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    takedowns[log.id]
                      ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {takedowns[log.id] ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      CERT-In Flagged
                    </>
                  ) : (
                    'Initiate Takedown'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}