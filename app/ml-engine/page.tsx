import React from 'react';
import Link from 'next/link';
import MlVisualizer from '@/components/MlVisualizer';
import { Cpu, ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'On-Device ML Engine | SmishShield',
  description: 'Live ONNX INT8 threat classification pipeline inspection.',
};

export default function MlEnginePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2A453B] font-sans selection:bg-[#1B4332] selection:text-[#FAF8F5]">
      {/* Precision Geometric Grid Overlay */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(20, 40, 32, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 40, 32, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Banner Strip */}
      <div className="bg-[#FFFFFF] text-[#385348] text-[11px] font-mono py-1.5 px-6 border-b border-[#1B4332]/15 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
          <span className="font-semibold tracking-wider text-[#1B4332]">
            ONNX RUNTIME MOBILE • INT8 QUANTIZED EDGE NEURAL ACCELERATION
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-[#385348]">
          <span className="flex items-center gap-1 text-[#2D6A4F] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> DPDP ACT PRIVACY COMPLIANT (OFFLINE EXECUTION)
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 border-b border-[#1B4332]/15 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-[#1B4332] text-[#FAF8F5] flex items-center justify-center shadow-sm">
            <Cpu className="w-6 h-6 text-[#52B788]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#081510] tracking-tight font-serif">
              On-Device ML Inference Pipeline
            </h1>
            <p className="text-xs text-[#385348] font-medium">
              Zero-Cloud Threat Vectorization &bull; INT8 Quantized ONNX Tensor Execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#1B4332] text-xs font-semibold py-2 px-3.5 rounded-xl border border-[#1B4332]/20 transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Launchpad</span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-[#FAF8F5] text-xs font-semibold py-2 px-4 rounded-xl transition shadow-xs"
          >
            <span>SOC Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Inspection Canvas */}
      <main className="max-w-7xl mx-auto p-6">
        <MlVisualizer />
      </main>
    </div>
  );
}