import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  Terminal,
  ArrowUpRight,
  Lock,
  Zap,
  Radio,
  Database,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#142820] selection:bg-[#1B4332] selection:text-[#FAF8F5] font-sans antialiased flex flex-col justify-between">
      {/* Precision Geometric Grid Overlay */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(20, 40, 32, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 40, 32, 0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Navbar */}
      <nav className="border-b border-[#1B4332]/10 bg-[#FAF8F5]/90 backdrop-blur-md px-6 py-4 sm:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B4332] text-[#FAF8F5] shadow-sm ring-1 ring-[#1B4332]/20">
              <ShieldCheck className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold tracking-tight text-[#0D1F18]">
                SMISH<span className="text-[#2D6A4F]">SHIELD</span>
              </span>
              <span className="ml-2 rounded border border-[#1B4332]/20 bg-[#1B4332]/5 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wide text-[#1B4332]">
                PROTOTYPE v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#1B4332]/15 bg-[#1B4332]/5 px-3 py-1 text-[#1B4332]">
              <span className="h-2 w-2 rounded-full bg-[#2D6A4F] animate-pulse" />
              Engine Online
            </div>
            <div className="text-right">
              <span className="text-[#0D1F18] font-bold tracking-tight">Team CodeCrusaders</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-12 lg:py-16">
        {/* Hero Section */}
        <div className="mb-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1B4332]/15 bg-[#1B4332]/5 px-3.5 py-1 font-mono text-xs font-semibold text-[#1B4332] mb-6">
            <Radio className="h-3.5 w-3.5 text-[#2D6A4F] animate-pulse" />
            Zero-Trust SMS Threat Neutralization
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#081510] leading-[1.08] font-serif">
            Stop SMS Phishing <br />
            <span className="text-[#2D6A4F] italic font-normal">
              Before Citizen Clicks.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#2A453B] leading-relaxed max-w-2xl">
            Autonomous threat gateway designed to simulate on-device link quarantine for citizens while syncing live incident telemetry directly to cyber command cells.
          </p>
        </div>

        {/* Dual Primary Portals */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Card 1: Mobile Simulator */}
          <Link
            href="/mobile"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1B4332]/15 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#1B4332]/40 hover:shadow-xl hover:shadow-[#1B4332]/5"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/15 text-[#1B4332] transition-all duration-200 group-hover:bg-[#1B4332] group-hover:text-[#FAF8F5] group-hover:shadow-md">
                  <Smartphone className="h-6 w-6" />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#1B4332] font-semibold bg-[#1B4332]/5 px-2.5 py-1 rounded-md border border-[#1B4332]/15">
                  Client View
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#081510] tracking-tight transition-colors duration-200 group-hover:text-[#1B4332]">
                Citizen Mobile Shield
              </h2>
              <p className="mt-3 text-sm text-[#385348] leading-relaxed">
                Test inbound SMS payloads, view pre-click threat quarantine, and inspect link neutralization on an interactive smartphone simulator.
              </p>

              <div className="mt-6 space-y-2.5 font-mono text-xs text-[#2A453B] border-t border-[#1B4332]/10 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0" />
                  <span>Simulated Inbox &amp; Quarantine Box</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0" />
                  <span>Real-Time URL Detonation</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#1B4332]/10 pt-4 font-mono text-xs font-semibold text-[#1B4332]">
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                Launch Simulator
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>

          {/* Card 2: Cyber Dashboard */}
          <Link
            href="/dashboard"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1B4332]/15 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#1B4332]/40 hover:shadow-xl hover:shadow-[#1B4332]/5"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B4332]/5 border border-[#1B4332]/15 text-[#1B4332] transition-all duration-200 group-hover:bg-[#1B4332] group-hover:text-[#FAF8F5] group-hover:shadow-md">
                  <Terminal className="h-6 w-6" />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#1B4332] font-semibold bg-[#1B4332]/5 px-2.5 py-1 rounded-md border border-[#1B4332]/15">
                  Command View
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#081510] tracking-tight transition-colors duration-200 group-hover:text-[#1B4332]">
                Cyber Cell Telemetry
              </h2>
              <p className="mt-3 text-sm text-[#385348] leading-relaxed">
                Aggregated threat streams, real-time campaign velocity analytics, compromised domain feeds, and automated takedown reporting.
              </p>

              <div className="mt-6 space-y-2.5 font-mono text-xs text-[#2A453B] border-t border-[#1B4332]/10 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0" />
                  <span>Live Threat Stream &amp; Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0" />
                  <span>CERT-In Standard Export Schema</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#1B4332]/10 pt-4 font-mono text-xs font-semibold text-[#1B4332]">
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                Open Command Center
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer Strip */}
      <footer className="border-t border-[#1B4332]/10 bg-white/70 backdrop-blur-sm px-6 py-6 sm:px-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#385348]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-[#1B4332]">
              <Lock className="h-3.5 w-3.5" /> Pre-Click Sandbox
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#1B4332]">
              <Zap className="h-3.5 w-3.5" /> Sub-Second Heuristics
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#1B4332]">
              <Database className="h-3.5 w-3.5" /> Supabase Realtime
            </span>
          </div>
          <div className="font-semibold text-[#081510]">
            Team CodeCrusaders &bull; Cybersecurity Division
          </div>
        </div>
      </footer>
    </main>
  );
}