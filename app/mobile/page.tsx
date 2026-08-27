'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Wifi, 
  Battery, 
  Radio, 
  AlertTriangle, 
  Terminal, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Smartphone,
  Send,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  UserX,
  FileText,
  Share2,
  Copy,
  MessageSquarePlus
} from 'lucide-react';
import { scanMessageOnDevice } from './scanner';
import { broadcastThreatLog, ThreatStatus } from '../dashboard/telemetry';
import { supabase } from '@/lib/supabase'; // Connected Supabase client

interface ExtendedScanHUD {
  riskScore: number;
  dltHeader: string;
  entropy: string;
  status: ThreatStatus;
  reasons: string[];
}

const PRESET_MESSAGES = [
  {
    id: 'MSG-8841',
    sender: 'AD-SBIALERT',
    text: 'Dear Customer, your SBI YONO account is suspended today due to pending KYC update. Verify immediately via sbi-kyc-update.in/auth',
  },
  {
    id: 'MSG-8842',
    sender: 'VM-JIOOFFER',
    text: 'Congratulations! You won Rs 5000 cashback reward. Claim your prize instantly at jio-free-rewards.xyz/claim',
  },
  {
    id: 'MSG-8843',
    sender: 'AX-INCOMETAX',
    text: 'Immediate tax refund of Rs 14,850 pending. Validate your bank mandate via income-tax-gov.in.net/portal',
  },
];

export default function MobileSimulator() {
  const [activeTab, setActiveTab] = useState<'intercept' | 'inspector'>('intercept');
  const [selectedMessage, setSelectedMessage] = useState(PRESET_MESSAGES[0]);
  const [customText, setCustomText] = useState('');
  const [customSender, setCustomSender] = useState('AD-BANKALERT');
  const [isQuarantined, setIsQuarantined] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [scanResult, setScanResult] = useState<ExtendedScanHUD>({
    riskScore: 92,
    dltHeader: 'FAIL (Spoofed)',
    entropy: '4.82 (High)',
    status: 'Critical Threat',
    reasons: [
      'Suspicious domain signature or untrusted TLD detected',
      'High-urgency framing pattern identified',
      'Financial, identity, or utility impersonation keywords detected'
    ]
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRunScan = async (textToScan: string, senderHeader: string) => {
    setIsScanning(true);
    setIsQuarantined(false);

    try {
      const result = scanMessageOnDevice(textToScan);

      const mappedStatus: ThreatStatus = 
        result.riskScore >= 70 
          ? 'Critical Threat' 
          : result.riskScore >= 35 
          ? 'High Risk' 
          : 'Safe';

      const hudData: ExtendedScanHUD = {
        riskScore: result.riskScore,
        dltHeader: /^(AD|AX|VM|VK|BW|DM)-/i.test(senderHeader) ? 'FAIL (Spoofed / Unverified)' : 'VERIFIED TRAI DLT',
        entropy: result.riskScore >= 70 ? '4.82 (High)' : result.riskScore >= 35 ? '3.14 (Moderate)' : '1.85 (Low)',
        status: mappedStatus,
        reasons: result.reasons
      };

      setScanResult(hudData);

      if (result.riskScore >= 45) {
        // 1. Cross-tab Broadcast Channel
        broadcastThreatLog({
          id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
          sender: senderHeader,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: textToScan,
          riskScore: result.riskScore,
          status: mappedStatus
        });

        // 2. Persist directly to Supabase Database
        if (supabase) {
          const { error } = await supabase
            .from('scanned_messages')
            .insert([
              {
                sender: senderHeader,
                text: textToScan,
                risk_score: result.riskScore,
                threat_type: mappedStatus,
                created_at: new Date().toISOString()
              }
            ]);

          if (error) {
            console.error('Supabase write error:', error.message);
          } else {
            console.log('Successfully recorded threat incident in Supabase.');
          }
        }
      }
    } catch (err) {
      console.error('Scan evaluation error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    handleRunScan(selectedMessage.text, selectedMessage.sender);
  }, []);

  const handleSelectPreset = (msg: typeof PRESET_MESSAGES[0]) => {
    setSelectedMessage(msg);
    setCustomText('');
    handleRunScan(msg.text, msg.sender);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const customObj = {
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: customSender || 'UNKNOWN-SMS',
      text: customText
    };
    setSelectedMessage(customObj);
    handleRunScan(customObj.text, customObj.sender);
  };

  const handleQuarantineAction = () => {
    setIsQuarantined(true);
    showToast('Payload successfully isolated & quarantined in local vault.');
  };

  const handleReport1930Action = () => {
    showToast('Redirecting packet telemetry to national portal...');
    setTimeout(() => {
      window.open('https://cybercrime.gov.in', '_blank');
    }, 800);
  };

  const handleFalsePositive = () => {
    showToast('Marked as False Positive. Heuristic whitelist updated.');
  };

  const handleBlockSender = () => {
    showToast(`Sender ID ${selectedMessage.sender} added to blackhole filter.`);
  };

  const handleViewRawHeaders = () => {
    setActiveTab('inspector');
    showToast('Loaded raw payload bytes into Byte Inspector.');
  };

  const handleShareIoC = () => {
    showToast('IoC bundle generated & copied for community feed sharing.');
  };

  const handleCopyPayload = () => {
    navigator.clipboard?.writeText(selectedMessage.text);
    showToast('Malicious text snippet copied to clipboard.');
  };

  const handleSimulateFollowUp = () => {
    const followUpText = "Urgent: Your account will be permanently blocked within 2 hours. Click here to re-verify: sbi-secure-update.com";
    const followUpObj = {
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: selectedMessage.sender,
      text: followUpText
    };
    setSelectedMessage(followUpObj);
    handleRunScan(followUpObj.text, followUpObj.sender);
    showToast('Injected sequential attacker follow-up SMS vector.');
  };

  const isCritical = scanResult.riskScore >= 70;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#081510] font-sans p-4 sm:p-8 relative">
      
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#142820] text-[#FAF8F5] border border-[#52B788]/40 shadow-2xl px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-[#142820] text-[#FAF8F5] rounded-2xl p-6 border border-[#1B4332]/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <svg className="w-10 h-10 shrink-0 shadow-md rounded-xl" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#142820"/>
              <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#1B4332" strokeOpacity="0.4"/>
              <path d="M24 8L11 13.5V23.5C11 31.8 16.5 39.5 24 41.5C31.5 39.5 37 31.8 37 23.5V13.5L24 8Z" fill="#1B4332" stroke="#2D6A4F" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M24 13L15 17V23.5C15 29.5 18.8 35.2 24 37C29.2 35.2 33 29.5 33 23.5V17L24 13Z" fill="#0D1F18" stroke="#40916C" strokeWidth="1"/>
              <path d="M24 18V31M19 24.5H29" stroke="#FAF8F5" strokeWidth="1.75" strokeLinecap="round"/>
              <circle cx="24" cy="24.5" r="2.5" fill="#52B788"/>
              <circle cx="24" cy="24.5" r="5" stroke="#52B788" strokeWidth="0.75" strokeDasharray="2 2"/>
            </svg>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest text-[#52B788] uppercase font-semibold">
                  On-Device Sandbox &amp; Neural Interceptor
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                SmishShield Mobile Client Simulator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0D1F18] p-1.5 rounded-xl border border-[#2D6A4F]/40">
            <button
              onClick={() => setActiveTab('intercept')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'intercept'
                  ? 'bg-[#1B4332] text-white shadow'
                  : 'text-[#FAF8F5]/70 hover:text-white'
              }`}
            >
              Native SMS View
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'inspector'
                  ? 'bg-[#1B4332] text-white shadow'
                  : 'text-[#FAF8F5]/70 hover:text-white'
              }`}
            >
              Byte Inspector HUD
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#2D6A4F]" />
                Select Smishing Test Vectors
              </h3>

              <div className="space-y-2.5">
                {PRESET_MESSAGES.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectPreset(msg)}
                    className={`w-full text-left p-3 rounded-xl border transition text-xs flex flex-col gap-1 ${
                      selectedMessage.id === msg.id
                        ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#081510] font-semibold'
                        : 'bg-[#FAF8F5] border-[#1B4332]/15 hover:border-[#1B4332]/40 text-[#081510]/80'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-[#1B4332] font-bold">{msg.sender}</span>
                      <span className="text-[10px] text-neutral-500">{msg.id}</span>
                    </div>
                    <p className="line-clamp-2 leading-relaxed text-[11px]">{msg.text}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-neutral-100 space-y-3">
                <span className="text-xs font-bold text-[#1B4332] block">Test Custom SMS Payload:</span>
                <input
                  type="text"
                  placeholder="Sender ID (e.g. AD-ICICI)"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#1B4332]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1B4332]"
                />
                <textarea
                  rows={2}
                  placeholder="Paste scam SMS message content here..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#1B4332]/20 rounded-xl p-3 text-xs focus:outline-none focus:border-[#1B4332]"
                />
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Heuristics...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Inject &amp; Scan Payload</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-center">
            
            {activeTab === 'intercept' ? (
              <div className="w-[350px] h-[570px] bg-[#081510] rounded-[36px] p-3 shadow-2xl border-4 border-[#2D6A4F]/40 relative flex flex-col overflow-hidden">
                
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-black rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-10 h-0.5 bg-neutral-800 rounded-full"></div>
                </div>

                <div className="pt-2 px-3 flex justify-between items-center text-white text-[9px] font-mono z-10">
                  <span>09:41</span>
                  <div className="flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-[#2D6A4F]" />
                    <Wifi className="w-2.5 h-2.5" />
                    <Battery className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div className="mt-3 px-3 py-1.5 bg-[#1B4332]/95 backdrop-blur-md rounded-t-lg border-b border-[#2D6A4F]/40 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#2D6A4F] flex items-center justify-center font-bold text-[10px]">
                      {selectedMessage.sender.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-tight">{selectedMessage.sender}</p>
                      <p className="text-[8px] text-[#FAF8F5]/70">Encrypted DLT Channel</p>
                    </div>
                  </div>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div>

                <div className="flex-1 bg-[#FAF8F5] p-2.5 overflow-y-auto flex flex-col gap-2">
                  <div className="text-center my-0.5">
                    <span className="text-[8px] bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full font-mono">Today 09:41 AM</span>
                  </div>

                  <div className={`max-w-[90%] bg-white rounded-xl rounded-tl-sm p-3 shadow-sm border transition-all ${isQuarantined ? 'opacity-40 border-dashed border-neutral-400' : 'border-neutral-200'} relative`}>
                    <p className="text-[11px] text-[#081510] leading-relaxed font-medium">
                      {isQuarantined ? '[QUARANTINED & SANITIZED BY SMISHSHIELD]' : selectedMessage.text}
                    </p>
                    <span className="text-[8px] text-neutral-400 block text-right mt-1 font-mono">09:41 AM</span>
                  </div>

                  <div className={`w-full rounded-xl p-2.5 shadow-sm border transition-all animate-fade-in ${
                    isQuarantined 
                      ? 'bg-neutral-100 border-neutral-300 text-neutral-600'
                      : isCritical 
                        ? 'bg-rose-50 border-rose-300 text-rose-950' 
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className={`p-1 rounded-lg mt-0.5 text-white ${isQuarantined ? 'bg-neutral-500' : isCritical ? 'bg-rose-700' : 'bg-amber-700'}`}>
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black">
                            {isQuarantined ? 'Payload Quarantined' : 'Blocked by SmishShield'}
                          </p>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isQuarantined ? 'bg-neutral-200 text-neutral-800' : isCritical ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                          }`}>
                            {scanResult.riskScore}% Risk
                          </span>
                        </div>
                        <p className="text-[10px] mt-0.5 opacity-90 leading-snug">
                          {isQuarantined ? 'Content neutralized successfully. No links accessible.' : `${scanResult.status}: Malicious payload quarantine triggered.`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-1 pt-2 border-t border-current/20">
                      <button 
                        onClick={handleQuarantineAction}
                        disabled={isQuarantined}
                        className="bg-white hover:bg-neutral-100 disabled:opacity-50 text-[8px] font-bold py-1 px-0.5 rounded border border-current/20 text-center transition"
                      >
                        {isQuarantined ? 'Quarantined' : 'Quarantine'}
                      </button>
                      <button 
                        onClick={handleReport1930Action}
                        className="bg-white hover:bg-neutral-100 text-[8px] font-bold py-1 px-0.5 rounded border border-current/20 text-center transition"
                      >
                        Report 1930
                      </button>
                      <button 
                        onClick={() => setActiveTab('inspector')} 
                        className={`text-white text-[8px] font-bold py-1 px-0.5 rounded text-center transition flex items-center justify-center gap-0.5 ${
                          isCritical ? 'bg-rose-800 hover:bg-rose-900' : 'bg-amber-800 hover:bg-amber-900'
                        }`}
                      >
                        Inspect <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-1 bg-white border border-neutral-200 rounded-xl p-2.5 shadow-sm space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Quick Actions &amp; Overrides</p>
                      <span className="text-[8px] font-mono text-[#2D6A4F] bg-[#1B4332]/10 px-1.5 py-0.5 rounded">Active Sandbox</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={handleFalsePositive}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg py-1.5 px-1 text-[8px] font-bold flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                      >
                        <ShieldOff className="w-3.5 h-3.5 text-emerald-600" />
                        <span>False Positive</span>
                      </button>
                      <button
                        onClick={handleBlockSender}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg py-1.5 px-1 text-[8px] font-bold flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-600" />
                        <span>Block Sender</span>
                      </button>
                      <button
                        onClick={handleViewRawHeaders}
                        className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg py-1.5 px-1 text-[8px] font-bold flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        <span>Raw Headers</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-neutral-100">
                      <button
                        onClick={handleShareIoC}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg py-1.5 px-1 text-[8px] font-bold flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                      >
                        <Share2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Share IoC</span>
                      </button>
                      <button
                        onClick={handleCopyPayload}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg py-1.5 px-1 text-[8px] font-bold flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5 text-amber-600" />
                        <span>Copy Text</span>
                      </button>
                      <button
                        onClick={handleSimulateFollowUp}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 rounded-lg py-1.5 px-1 text-[8px] font-bold flex flex-col items-center justify-center gap-0.5 transition shadow-2xs"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Follow-up SMS</span>
                      </button>
                    </div>
                  </div>

                </div>

                <div className="py-2 bg-[#081510] text-center">
                  <div className="w-24 h-1 bg-white/30 rounded-full mx-auto"></div>
                </div>

              </div>
            ) : (
              <div className="w-full bg-white p-6 rounded-2xl border border-[#1B4332]/20 shadow-sm space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#2D6A4F]" />
                    <h3 className="text-sm font-bold text-[#1B4332]">Real-Time Heuristic Packet &amp; Domain Inspector</h3>
                  </div>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full font-mono uppercase">
                    STATUS: {scanResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#1B4332]/10">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">DLT Header Status</span>
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-4 h-4" /> {scanResult.dltHeader}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#1B4332]/10">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">Domain Entropy</span>
                    <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1 mt-1">
                      <Lock className="w-4 h-4 text-[#2D6A4F]" /> {scanResult.entropy}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#1B4332]">Heuristic Analysis Breakdown:</span>
                  <div className="bg-[#081510] text-emerald-400 font-mono text-xs p-4 rounded-xl space-y-2">
                    {scanResult.reasons.map((reason, idx) => (
                      <p key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500">&bull;</span> {reason}
                      </p>
                    ))}
                    <p className="text-amber-400 pt-2 border-t border-emerald-900">
                      <span className="text-neutral-500">[DISPATCH]</span> Section 79(3)(b) Telemetry packet synced to CERT-In Command Center.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#2D6A4F] font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Synchronized with Central Dashboard Feed</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('intercept')}
                    className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-sm"
                  >
                    Back to Mobile View
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}