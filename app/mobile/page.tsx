'use client';

import React, { useState } from 'react';
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
  Languages
} from 'lucide-react';
import { scanMessageOnDevice, ThreatAssessment } from './scanner';
import { broadcastThreatLog, ThreatStatus } from '../dashboard/telemetry';

const PRESET_MESSAGES = [
  {
    id: 'MSG-8841',
    sender: 'AD-SBIALERT',
    lang: 'English',
    text: 'Dear Customer, your SBI YONO account is suspended today due to pending KYC update. Verify immediately via http://sbi-kyc-update.in/auth',
  },
  {
    id: 'MSG-8842',
    sender: 'VM-JIOOFFER',
    lang: 'English',
    text: 'Congratulations! You won Rs 5000 cashback reward. Claim your prize instantly at http://jio-free-rewards.xyz/claim',
  },
  {
    id: 'MSG-8843',
    sender: 'AX-INCOMETAX',
    lang: 'English',
    text: 'Immediate tax refund of Rs 14,850 pending. Validate your bank mandate via http://income-tax-gov.in.net/portal',
  },
  {
    id: 'MSG-8844',
    sender: '+919876543210',
    lang: 'Hindi (हिंदी)',
    text: 'अति आवश्यक सूचना: आपका बिजली कनेक्शन आज रात 9:30 बजे काट दिया जाएगा। तुरंत बिल भरें: http://192.168.1.1/pay',
  },
  {
    id: 'MSG-8845',
    sender: 'XX-ODISHA',
    lang: 'Odia (ଓଡ଼ିଆ)',
    text: 'ଜରୁରୀ ସୂଚନା: ଆପଣଙ୍କର ବ୍ୟାଙ୍କ ଖାତା ବନ୍ଦ ହୋଇଯାଇଛି। ତୁରନ୍ତ କେୱାଇସି ଅପଡେଟ୍ କରନ୍ତୁ: http://bank-update.top/od',
  },
  {
    id: 'MSG-8846',
    sender: '+919840123456',
    lang: 'Tamil (தமிழ்)',
    text: 'கணக்கு முடக்கப்பட்டது: உங்கள் வங்கி கணக்கு தற்காலிகமாக நிறுத்தப்பட்டுள்ளது. உடனடியாக சரிபார்க்கவும்: http://hdfc-verify.club/tn',
  }
];

export default function MobileSimulator() {
  const [activeTab, setActiveTab] = useState<'intercept' | 'inspector'>('intercept');
  const [selectedMessage, setSelectedMessage] = useState(PRESET_MESSAGES[0]);
  const [customText, setCustomText] = useState(PRESET_MESSAGES[0].text);
  const [customSender, setCustomSender] = useState(PRESET_MESSAGES[0].sender);
  const [isQuarantined, setIsQuarantined] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [scanResult, setScanResult] = useState<ThreatAssessment>(() => 
    scanMessageOnDevice(PRESET_MESSAGES[0].text, PRESET_MESSAGES[0].sender)
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRunScan = async (textToScan: string, senderHeader: string) => {
    if (!textToScan || !textToScan.trim()) return;

    setIsScanning(true);
    setIsQuarantined(false);

    // 1. Instant 100% Offline Local Scan Execution (0ms Latency)
    const localResult = scanMessageOnDevice(textToScan, senderHeader);
    setScanResult(localResult);

    const mappedStatus: ThreatStatus = 
      localResult.riskScore >= 70 
        ? 'Critical Threat' 
        : localResult.riskScore >= 35 
        ? 'High Risk' 
        : 'Safe';

    // 2. Asynchronous Telemetry Persistence to Database (Non-blocking)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: senderHeader,
          rawText: textToScan
        })
      });

      const data = await res.json();

      // 3. Local cross-tab broadcast for real-time monitoring
      if (localResult.riskScore >= 45) {
        broadcastThreatLog({
          id: data.id || `INC-${Math.floor(1000 + Math.random() * 9000)}`,
          sender: senderHeader,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: textToScan,
          riskScore: localResult.riskScore,
          status: mappedStatus
        });
      }

      showToast('Offline analysis complete & telemetry synced.');
    } catch {
      showToast('Offline analysis complete (Standalone Mode).');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPreset = (msg: typeof PRESET_MESSAGES[0]) => {
    setSelectedMessage(msg);
    setCustomText(msg.text);
    setCustomSender(msg.sender);
    handleRunScan(msg.text, msg.sender);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textToUse = customText.trim() || selectedMessage.text;
    const senderToUse = customSender.trim() || selectedMessage.sender;

    const customObj = {
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: senderToUse,
      lang: 'Custom',
      text: textToUse
    };

    setSelectedMessage(customObj);
    handleRunScan(textToUse, senderToUse);
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
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] flex items-center justify-center border border-[#2D6A4F]">
              <ShieldAlert className="w-6 h-6 text-[#52B788]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest text-[#52B788] uppercase font-semibold">
                  Zero-Latency On-Device Interceptor (Offline Ready)
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                SmishShield Multilingual Client Simulator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0D1F18] p-1.5 rounded-xl border border-[#2D6A4F]/40">
            <button
              onClick={() => setActiveTab('intercept')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'intercept' ? 'bg-[#1B4332] text-white shadow' : 'text-[#FAF8F5]/70 hover:text-white'
              }`}
            >
              Native SMS View
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'inspector' ? 'bg-[#1B4332] text-white shadow' : 'text-[#FAF8F5]/70 hover:text-white'
              }`}
            >
              Byte &amp; SSL Inspector
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Vectors List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#2D6A4F]" />
                  Select Test Vectors (Indic &amp; Spoof)
                </h3>
                <span className="text-[10px] bg-[#1B4332]/10 text-[#1B4332] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <Languages className="w-3 h-3" /> Multi-Script
                </span>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
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
                      <span className="text-[9px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded font-sans">
                        {msg.lang}
                      </span>
                    </div>
                    <p className="line-clamp-2 leading-relaxed text-[11px]">{msg.text}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-neutral-100 space-y-3">
                <span className="text-xs font-bold text-[#1B4332] block">Custom SMS Test:</span>
                <input
                  type="text"
                  placeholder="Sender ID (e.g. AD-SBI, +919876543210)"
                  value={customSender}
                  onChange={(e) => setCustomSender(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#1B4332]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1B4332]"
                />
                <textarea
                  rows={2}
                  placeholder="Paste message (English, Hindi, Odia, Tamil, etc.)..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#1B4332]/20 rounded-xl p-3 text-xs focus:outline-none focus:border-[#1B4332]"
                />
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning &amp; Dissecting...</span>
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

          {/* Device Mockup */}
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
                      <p className="text-[8px] text-[#FAF8F5]/70 font-mono">{scanResult.dltStatus}</p>
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

                  <div className={`w-full rounded-xl p-2.5 shadow-sm border transition-all ${
                    isCritical ? 'bg-rose-50 border-rose-300 text-rose-950' : scanResult.riskScore >= 35 ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className={`p-1 rounded-lg mt-0.5 text-white ${isCritical ? 'bg-rose-700' : scanResult.riskScore >= 35 ? 'bg-amber-700' : 'bg-emerald-700'}`}>
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black">
                            {isQuarantined ? 'Payload Quarantined' : scanResult.riskScore >= 35 ? 'Blocked by SmishShield' : 'Payload Verified'}
                          </p>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isCritical ? 'bg-rose-200 text-rose-900' : scanResult.riskScore >= 35 ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                          }`}>
                            {scanResult.riskScore}% Risk
                          </span>
                        </div>
                        <p className="text-[10px] mt-0.5 opacity-90 leading-snug">
                          {isQuarantined ? 'Threat neutralized in local secure vault.' : `${scanResult.threatType} (${scanResult.detectedLanguage})`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-1 pt-2 border-t border-current/20">
                      <button 
                        onClick={() => { setIsQuarantined(true); showToast('Isolated in local vault.'); }}
                        disabled={isQuarantined}
                        className="bg-white hover:bg-neutral-100 disabled:opacity-50 text-[8px] font-bold py-1 px-0.5 rounded border border-current/20 text-center transition"
                      >
                        {isQuarantined ? 'Quarantined' : 'Quarantine'}
                      </button>
                      <button 
                        onClick={() => window.open('https://cybercrime.gov.in', '_blank')}
                        className="bg-white hover:bg-neutral-100 text-[8px] font-bold py-1 px-0.5 rounded border border-current/20 text-center transition"
                      >
                        Report 1930
                      </button>
                      <button 
                        onClick={() => setActiveTab('inspector')} 
                        className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[8px] font-bold py-1 px-0.5 rounded text-center transition flex items-center justify-center gap-0.5"
                      >
                        Inspect <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="py-2 bg-[#081510] text-center">
                  <div className="w-24 h-1 bg-white/30 rounded-full mx-auto"></div>
                </div>
              </div>
            ) : (
              <div className="w-full bg-white p-6 rounded-2xl border border-[#1B4332]/20 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#2D6A4F]" />
                    <h3 className="text-sm font-bold text-[#1B4332]">Local Heuristic &amp; SSL Certificate Inspector</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono uppercase ${
                    isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {scanResult.threatType}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#1B4332]/10">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">TRAI DLT Telephony</span>
                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {scanResult.dltStatus}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#1B4332]/10">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">SSL / Transport</span>
                    <span className={`text-[11px] font-bold flex items-center gap-1 mt-1 ${
                      scanResult.sslStatus === 'INSECURE_HTTP' || scanResult.sslStatus === 'RAW_IP_PAYLOAD' ? 'text-rose-700' : 'text-[#1B4332]'
                    }`}>
                      <Lock className="w-3.5 h-3.5 shrink-0" /> {scanResult.sslStatus}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#1B4332]/10">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">Payload Language</span>
                    <span className="text-[11px] font-bold text-[#1B4332] flex items-center gap-1 mt-1">
                      <Languages className="w-3.5 h-3.5 shrink-0" /> {scanResult.detectedLanguage}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#1B4332]">On-Device Heuristic Indicators:</span>
                  <div className="bg-[#081510] text-emerald-400 font-mono text-xs p-4 rounded-xl space-y-2">
                    {scanResult.reasons.map((reason, idx) => (
                      <p key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500">&bull;</span> {reason}
                      </p>
                    ))}
                    {scanResult.extractedUrl && (
                      <p className="text-rose-400 pt-2 border-t border-emerald-900">
                        <span className="text-neutral-400">[EXTRACTED_URI]</span> {scanResult.extractedUrl}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#2D6A4F] font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Calculated entirely in-memory on device</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('intercept')}
                    className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold py-2 px-4 rounded-xl transition"
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