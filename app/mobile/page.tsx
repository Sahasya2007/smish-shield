'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  Copy, 
  Check, 
  X, 
  PhoneCall, 
  FileText,
  Globe,
  Link2
} from 'lucide-react';

// Relative imports matching local app routes
import { scanMessageOnDevice, ScanResult } from './scanner';
import { broadcastThreatLog, ThreatLog } from '../dashboard/telemetry';

const PRESET_MESSAGES = [
  {
    label: '🚨 Bank Scam',
    sender: 'AD-SBIALERT',
    text: 'Dear Customer, your SBI account has been blocked today. Update your PAN card immediately to reactivate: https://sbi-kyc-update.top/login',
  },
  {
    label: '⚡ Electricity Scam',
    sender: 'AX-POWER',
    text: 'Electricity supply will be disconnected tonight at 9:30 PM due to unpaid bill. Contact officer immediately at 9876543210 to clear dues.',
  },
  {
    label: '✅ Safe SMS',
    sender: 'AD-HDFCBK',
    text: 'Your account XX1234 has been credited with INR 5,000.00 on 24-Aug-2026. Available balance: INR 45,210.00.',
  },
];

export default function MobileSimulator() {
  const [sender, setSender] = useState(PRESET_MESSAGES[0].sender);
  const [message, setMessage] = useState(PRESET_MESSAGES[0].text);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleScan = () => {
    if (!message.trim()) return;

    const result = scanMessageOnDevice(message);
    setScanResult(result);

    const logStatus: ThreatLog['status'] =
      result.riskScore >= 75
        ? 'Critical Threat'
        : result.riskScore >= 45
        ? 'High Risk'
        : 'Safe';

    broadcastThreatLog({
      id: `TL-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: sender || 'UNKNOWN',
      message,
      riskScore: result.riskScore,
      status: logStatus,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handlePresetSelect = (preset: typeof PRESET_MESSAGES[0]) => {
    setSender(preset.sender);
    setMessage(preset.text);
    setScanResult(null);
  };

  const generateReportText = () => {
    return `[NATIONAL CYBER CRIME REPORT DRAFT - 1930 HELPLINE]
--------------------------------------------------
Incriminating Sender Header / ID: ${sender}
Timestamp: ${new Date().toLocaleString()}
Calculated Threat Risk Score: ${scanResult?.riskScore}% (${scanResult?.threatType})

[SUSPECT MESSAGE CONTENT]
"${message}"

[AUTOMATED DETECTED INDICATORS]
${scanResult?.reasons.map((r) => `- ${r}`).join('\n')}

Report Generated via SmishShield On-Device Telemetry System.
Targeted Action Requested: Block Sender ID & Freeze Malicious Web Domain.`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const extractedUrl = message.match(/https?:\/\/[^\s]+/g)?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Mobile Mockup Frame */}
      <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[760px] relative">
        {/* Status Bar */}
        <div className="bg-slate-950 px-6 py-2 flex justify-between items-center text-xs text-slate-400 border-b border-slate-800">
          <span>9:41 AM</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
              🛡️
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100">SmishShield Mobile</h1>
              <p className="text-[10px] text-slate-400">On-Device Privacy Engine</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
            Active
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block font-medium font-sans">Preset Test Scenarios:</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_MESSAGES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Sender Header</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. AD-SBIALERT"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Incoming SMS Message</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste SMS content here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              onClick={handleScan}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-colors"
            >
              <Send size={14} /> Scan SMS Payload
            </button>
          </div>

          {/* Scan Results Card */}
          {scanResult && (
            <div
              className={`p-3.5 rounded-xl border space-y-3 ${
                scanResult.riskScore >= 75
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  : scanResult.riskScore >= 45
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {scanResult.riskScore >= 75 ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  ) : scanResult.riskScore >= 45 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  )}
                  <span className="font-semibold text-xs">{scanResult.threatType}</span>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-950/60 px-2 py-0.5 rounded border border-slate-700">
                  {scanResult.riskScore}% Threat Risk
                </span>
              </div>

              <div className="space-y-1">
                {scanResult.reasons.map((reason, idx) => (
                  <p key={idx} className="text-[11px] opacity-90 flex items-start gap-1">
                    <span className="opacity-60">•</span> {reason}
                  </p>
                ))}
              </div>

              {/* URL Domain Inspector Sandbox */}
              {extractedUrl && (
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Globe size={11} className="text-cyan-400" /> URL Domain Sandbox Analysis
                    </span>
                    <span className="text-rose-400 font-mono text-[9px] bg-rose-950/60 px-1 rounded">UNTRUSTED TLD</span>
                  </div>
                  <div className="font-mono text-[10px] text-cyan-300 break-all flex items-center gap-1">
                    <Link2 size={10} className="shrink-0" /> {extractedUrl}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {scanResult.riskScore >= 45 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-1.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow transition-colors"
                >
                  <PhoneCall size={13} /> Draft 1930 Cyber Helpline Report
                </button>
              )}
            </div>
          )}

          {/* System Status Idle Widget */}
          {!scanResult && (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Engine Standing By
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Select a preset scenario above or paste any SMS payload to run real-time threat detection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 1930 HELPLINE REPORT POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">National Cyber Crime Helpline (1930)</h3>
                  <p className="text-[11px] text-slate-400">Pre-Formatted Cyber Fraud Incident Draft</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-2.5">
              <PhoneCall size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200 leading-snug">
                Immediate Action: Call <strong>1930</strong> within the financial golden hour or submit this report at <span className="underline font-mono">cybercrime.gov.in</span>.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-medium">Generated Evidence Draft:</label>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed selection:bg-cyan-900">
                {generateReportText()}
              </pre>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCopyReport}
                className="w-2/3 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-300" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Official Report Text
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}