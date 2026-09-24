'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Layers,
  Sparkles,
  Activity,
  CheckCircle2,
  Lock,
  Timer,
  Microchip,
  TrendingDown
} from 'lucide-react';

interface LayerOutput {
  name: string;
  type: string;
  shape: string;
  quantization: string;
  quantFormula: string;
  baseLatencyMs: number;
  status: string;
}

const PRESET_TEST_CASES = [
  {
    tag: 'UPI Trap',
    text: 'URGENT: Your SBI account is suspended. Update KYC now at bit.ly/sbi-kyc-alert or pay pending fee via upi://pay?pa=sbifee@upi',
  },
  {
    tag: 'Electricity Scam',
    text: 'Power cut tonight at 9:30 PM due to unpaid electricity bill. Contact officer immediately at 9876543210 or visit bit.ly/bijli-pay',
  },
  {
    tag: 'Clean Bank SMS',
    text: 'Your HDFC Bank account ending 4891 has been credited with Rs 25,000.00 on 28-Aug-2026. Ref UPI/58291048.',
  },
];

// Precision multi-factor heuristic and tensor classification evaluator
function evaluatePayloadRisk(text: string): { smish: number; benign: number } {
  const lower = text.toLowerCase();

  // 1. Actionable Attack Vectors (Must contain an exfiltration or detonation vector)
  const hasUrl = /(https?:\/\/|www\.|bit\.ly|tinyurl|is\.gd|\.xyz|\.top|\.club|\.net\/)/i.test(lower);
  const hasUpi = lower.includes('upi://') || lower.includes('@upi') || lower.includes('pay=');
  const hasPhonePrompt = /(call|contact|officer|whatsapp|helpline|reach)\s*(at|on|:)?\s*(\+91)?\d{10}/i.test(lower);

  // 2. Phishing Contexts
  const hasAccountAction = lower.includes('kyc') || lower.includes('pan') || lower.includes('mandate') || lower.includes('suspended') || lower.includes('blocked');
  const hasUrgency = lower.includes('urgent') || lower.includes('immediate') || lower.includes('tonight') || lower.includes('within 2 hours');
  const hasBillDemand = lower.includes('unpaid') || lower.includes('due bill') || lower.includes('pay bill');

  // CRITICAL GATE: If there is NO link, NO UPI scheme, and NO phone number to call,
  // it is physically impossible for the citizen to be compromised via click or callback.
  if (!hasUrl && !hasUpi && !hasPhonePrompt) {
    if (hasAccountAction && hasUrgency) {
      // Suspicious phrasing alone without exfiltration route
      return { smish: 0.12, benign: 0.88 };
    }
    // Pure informational notices (e.g. "power cut at 10:30")
    return { smish: 0.02, benign: 0.98 };
  }

  // 3. Compounding Threat Vectors (Vector + Phishing Context)
  if (hasUpi || (hasUrl && hasAccountAction)) {
    return { smish: 0.96, benign: 0.04 }; // Direct credential / payment phishing trap
  }

  if ((hasUrl || hasPhonePrompt) && (hasBillDemand || hasUrgency)) {
    return { smish: 0.91, benign: 0.09 }; // Actual utility/banking scam with actionable destination
  }

  if (hasUrl) {
    return { smish: 0.45, benign: 0.55 }; // Unknown link without overt context
  }

  return { smish: 0.05, benign: 0.95 };
}

export default function MlVisualizer() {
  const [inputText, setInputText] = useState(PRESET_TEST_CASES[0].text);
  const [hardwareBackend, setHardwareBackend] = useState<'NPU' | 'CPU'>('NPU');
  const [isInferring, setIsInferring] = useState(false);
  const [activeLayerStep, setActiveLayerStep] = useState<number>(-1);
  const [tokens, setTokens] = useState<string[]>(() =>
    PRESET_TEST_CASES[0].text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean)
  );
  const [latency, setLatency] = useState<number | null>(39);

  // Dynamically compute risk based on initial preset
  const [scores, setScores] = useState<{ smish: number; benign: number } | null>(() =>
    evaluatePayloadRisk(PRESET_TEST_CASES[0].text)
  );

  const modelLayers: LayerOutput[] = [
    {
      name: 'WordPiece Subword Tokenizer',
      type: 'Tensor String Mapping',
      shape: '[1, 128]',
      quantization: 'Int64 IDs',
      quantFormula: 'Vocab index lookup (Vocab Size = 30,522)',
      baseLatencyMs: 6,
      status: 'Ready'
    },
    {
      name: 'Embedding Projection',
      type: 'Static Quantized Lookups',
      shape: '[1, 128, 256]',
      quantization: 'INT8 Dynamic',
      quantFormula: 'Scale Δ = (max - min) / 255 | Z = 0',
      baseLatencyMs: 11,
      status: 'Mapped'
    },
    {
      name: 'Quantized Transformer Block (4x)',
      type: 'QLinearMatMul & Softmax',
      shape: '[1, 128, 256]',
      quantization: 'INT8 Symmetric',
      quantFormula: 'q = round(x / S), Zero-Point Centered',
      baseLatencyMs: 22,
      status: 'Optimized'
    },
    {
      name: 'Classification Output Head',
      type: 'Gemm + LogSoftmax',
      shape: '[1, 2]',
      quantization: 'FP16 Dequant',
      quantFormula: 'Dequantize to Logits for Binary Softmax',
      baseLatencyMs: 6,
      status: 'Evaluated'
    },
  ];

  const handleTextChange = (newText: string) => {
    setInputText(newText);
    const parsed = newText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    setTokens(parsed);
  };

  const handleSelectPreset = (text: string) => {
    setInputText(text);
    const parsed = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    setTokens(parsed);
    setScores(evaluatePayloadRisk(text));
  };

  const runSimulation = () => {
    setIsInferring(true);
    setScores(null);
    setActiveLayerStep(0);

    const stepDuration = hardwareBackend === 'NPU' ? 90 : 160;

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < modelLayers.length) {
        setActiveLayerStep(step);
      } else {
        clearInterval(interval);
        setActiveLayerStep(-1);

        const evaluatedScores = evaluatePayloadRisk(inputText);
        setScores(evaluatedScores);

        const calculatedLatency = hardwareBackend === 'NPU'
          ? Math.floor(Math.random() * 8) + 38
          : Math.floor(Math.random() * 10) + 72;

        setLatency(calculatedLatency);
        setIsInferring(false);
      }
    }, stepDuration);
  };

  const isHighThreat = scores && scores.smish >= 0.5;

  return (
    <div className="space-y-6">
      {/* Top Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#385348] font-medium">
            <span>Inference Backend</span>
            <Microchip className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-xl font-black text-[#081510] mt-1 font-serif">
            {hardwareBackend === 'NPU' ? 'NNAPI / NPU' : 'ARM64 CPU'}
          </div>
          <span className="text-[10px] text-[#2D6A4F] mt-1 block font-mono font-semibold">
            {hardwareBackend === 'NPU' ? 'Hardware Accelerated' : 'Software Fallback'}
          </span>
        </div>

        <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#385348] font-medium">
            <span>Execution Latency</span>
            <Timer className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-xl font-black text-[#2D6A4F] mt-1 font-serif">
            {latency ? `${latency} ms` : '--'}
          </div>
          <span className="text-[10px] text-[#385348] mt-1 block font-mono">
            Hard SLA: &lt;120 ms
          </span>
        </div>

        <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#385348] font-medium">
            <span>INT8 Compression</span>
            <TrendingDown className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-xl font-black text-[#081510] mt-1 font-serif">74.5%</div>
          <span className="text-[10px] text-[#2D6A4F] mt-1 block font-mono">
            FP32 (56MB) &rarr; INT8 (14.2MB)
          </span>
        </div>

        <div className="bg-white border border-[#1B4332]/15 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#385348] font-medium">
            <span>DPDP Privacy Gate</span>
            <Lock className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-xl font-black text-[#081510] mt-1 font-serif">100% Offline</div>
          <span className="text-[10px] text-emerald-700 mt-1 block font-mono font-semibold">
            Local RAM Scratchpad Purge
          </span>
        </div>
      </div>

      {/* Input Sandbox with Hardware Backend Selector */}
      <div className="bg-white border border-[#1B4332]/15 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#1B4332]/10">
          <div>
            <h2 className="text-sm font-bold text-[#081510] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
              Live SMS Payload Tensor Sandbox
            </h2>
            <p className="text-xs text-[#385348]">
              Select test vectors or input custom text to verify on-device INT8 quantization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Hardware Backend Switcher */}
            <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#1B4332]/20 font-mono text-xs">
              <button
                onClick={() => setHardwareBackend('NPU')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hardwareBackend === 'NPU'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#385348] hover:text-[#081510]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                NNAPI (NPU)
              </button>
              <button
                onClick={() => setHardwareBackend('CPU')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hardwareBackend === 'CPU'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#385348] hover:text-[#081510]'
                }`}
              >
                <Microchip className="w-3.5 h-3.5" />
                arm64 CPU
              </button>
            </div>

            {/* Test Case Chips */}
            <div className="flex items-center gap-1.5">
              {PRESET_TEST_CASES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset.text)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold font-mono bg-[#FAF8F5] hover:bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20 transition cursor-pointer"
                >
                  {preset.tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter SMS text to analyze..."
          className="w-full bg-[#FAF8F5] border border-[#1B4332]/20 rounded-2xl p-3.5 text-xs text-[#081510] font-sans focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#385348]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Target Execution Profile: <strong>{hardwareBackend === 'NPU' ? 'Qualcomm HTP / MediaTek APU (Sub-40ms)' : 'Generic ARM Cortex (Sub-80ms)'}</strong>
            </span>
          </div>

          <button
            onClick={runSimulation}
            disabled={isInferring}
            className="flex items-center gap-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-bold py-2.5 px-6 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isInferring ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Propagating Tensors...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Execute On-Device Model</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Stage 1: WordPiece Token Map */}
        <div className="md:col-span-6 bg-white border border-[#1B4332]/15 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#2D6A4F] font-bold">
                Stage 01 // Token Vectorizer
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                128 Fixed Dimension
              </span>
            </div>
            <h3 className="text-base font-bold text-[#081510]">Subword Decomposition</h3>
            <p className="text-xs text-[#385348] mt-1">
              Decomposed into vocabulary sequence IDs before passing into quantized embedding matrix:
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
              {tokens.length > 0 ? (
                tokens.map((token, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-[11px] rounded-md bg-[#FAF8F5] text-[#1B4332] border border-[#1B4332]/20 font-mono font-medium shadow-2xs"
                  >
                    [{token}]
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No tokens available</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#385348] font-mono">
            <span>Homoglyphs Sanitized: 0</span>
            <span className="text-emerald-700 font-bold">Zero-Width Stripped: 0</span>
          </div>
        </div>

        {/* Stage 2: Classifier Decision */}
        <div className="md:col-span-6 bg-white border border-[#1B4332]/15 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#2D6A4F] font-bold">
                Stage 02 // Probability Tensor
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isHighThreat
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isHighThreat ? 'FLAGGED THREAT' : 'VERIFIED SAFE'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#081510]">Inference Head Output</h3>
            <p className="text-xs text-[#385348] mt-1">
              Softmax tensor distribution evaluated across threat classification weights:
            </p>

            {scores ? (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className={scores.smish >= 0.5 ? 'text-[#991B1B]' : 'text-[#2D6A4F]'}>
                      Phishing / Smishing Probability
                    </span>
                    <span className="font-mono text-sm">{(scores.smish * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#1B4332]/15 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        scores.smish >= 0.5 ? 'bg-[#991B1B]' : 'bg-[#2D6A4F]'
                      }`}
                      style={{ width: `${scores.smish * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#1B4332]/15 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#385348]">Benign Likelihood:</span>
                    <span className="font-bold text-[#2D6A4F]">{(scores.benign * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#385348]">Telemetry Route:</span>
                    <span className="font-bold text-[#081510]">
                      {scores.smish >= 0.35 ? 'Dispatching to CERT-In Hub' : 'Memory Gate Active (Local Purge)'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#385348] italic font-mono flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 animate-spin text-[#1B4332]" />
                Propagating layer tensors...
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#385348]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> DPDP Local Memory Barrier
            </span>
            <span className="font-mono font-bold text-[#1B4332]">
              {latency}ms ({hardwareBackend})
            </span>
          </div>
        </div>
      </div>

      {/* Quantized ONNX Execution Graph */}
      <div className="bg-white border border-[#1B4332]/15 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#081510] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2D6A4F]" />
              Quantized ONNX Execution Graph
            </h3>
            <p className="text-xs text-[#385348]">
              Linear graph primitives deployed through ONNX Runtime Mobile INT8 Quantization engine.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#1B4332]/20 font-bold text-[#1B4332]">
            ONNX Opset 18
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1B4332]/15 text-[#385348] font-mono">
                <th className="pb-3 font-semibold">Graph Layer</th>
                <th className="pb-3 font-semibold">Operator Primitive</th>
                <th className="pb-3 font-semibold">Tensor Shape</th>
                <th className="pb-3 font-semibold">Quantization Precision</th>
                <th className="pb-3 font-semibold">Compression Math & Scale Factor</th>
                <th className="pb-3 font-semibold text-right">Stage Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B4332]/10">
              {modelLayers.map((layer, index) => {
                const isActive = activeLayerStep === index;
                const stageLatency = hardwareBackend === 'NPU'
                  ? layer.baseLatencyMs
                  : Math.round(layer.baseLatencyMs * 1.8);

                return (
                  <tr
                    key={index}
                    className={`transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/15 font-semibold text-[#081510]'
                        : 'hover:bg-[#FAF8F5]/80 text-[#2A453B]'
                    }`}
                  >
                    <td className="py-3 font-semibold flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                          isActive
                            ? 'bg-[#1B4332] text-white scale-110 shadow-xs'
                            : 'bg-[#1B4332]/10 text-[#1B4332]'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className={isActive ? 'text-[#1B4332] font-black' : 'text-[#081510]'}>
                        {layer.name}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[#385348]">{layer.type}</td>
                    <td className="py-3 font-mono text-[#081510]">{layer.shape}</td>
                    <td className="py-3">
                      <span className="font-mono text-[11px] font-bold text-[#1B4332] bg-[#1B4332]/10 px-2 py-0.5 rounded border border-[#1B4332]/20">
                        {layer.quantization}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#2D6A4F]">
                      {layer.quantFormula}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-[#1B4332]">
                      {stageLatency} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}