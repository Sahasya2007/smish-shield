import Link from 'next/link';
import { ShieldAlert, Smartphone, LayoutDashboard, Lock, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-rose-500 selection:text-white">
      {/* Team Header Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-6">
        <ShieldAlert className="w-4 h-4" />
        <span>Team CodeCrusaders &bull; Cybersecurity Division</span>
      </div>

      {/* Main Headline */}
      <div className="max-w-3xl text-center mb-12">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
          Smish<span className="text-rose-500">Shield</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Autonomous Zero-Trust SMS Smishing Triage &amp; Pre-Click Threat Gateway for Citizen Protection and National Telemetry.
        </p>
      </div>

      {/* Dual Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Card 1: Mobile Simulator */}
        <Link 
          href="/mobile" 
          className="group relative flex flex-col justify-between p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 transition-all duration-300 shadow-lg hover:shadow-rose-500/10"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-rose-400 transition-colors">
              Citizen Mobile Shield
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Interactive on-device smartphone simulator. Intercepts incoming SMS, detects high-urgency keywords, and isolates phishing links pre-click.
            </p>
          </div>
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <span>Launch Phone Simulator</span>
            <span>&rarr;</span>
          </div>
        </Link>

        {/* Card 2: Cyber Cell Dashboard */}
        <Link 
          href="/dashboard" 
          className="group relative flex flex-col justify-between p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
              Cyber Cell Telemetry
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Central command center. Aggregates live nationwide smishing feeds, threat heatmaps, active campaigns, and domain takedown notices.
            </p>
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <span>Open Command Dashboard</span>
            <span>&rarr;</span>
          </div>
        </Link>
      </div>

      {/* Footer Specs */}
      <div className="mt-16 flex items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Trust Client Isolation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-Time Heuristic Triage</span>
        </div>
      </div>
    </main>
  );
}