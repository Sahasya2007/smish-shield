import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  Terminal,
  Activity,
  ArrowUpRight,
  Lock,
  Zap,
  Radar,
  GitBranch,
  ScanLine,
  Inbox,
  Ban,
  MapPinned,
  Gauge,
  FileLock2,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-zinc-200 selection:bg-amber-500/20 selection:text-amber-200">
      {/* Ambient background: cartographic grid + sapphire glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 90%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.16] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #1e3a8a 0%, #0f172a 55%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,transparent_0%,#030712_75%)]"
      />

      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800/60 py-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700/70 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <ShieldCheck className="h-[18px] w-[18px] text-amber-400/90" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-mono text-[13px] font-semibold tracking-tight text-zinc-100">
                SMISH<span className="text-amber-400/90">SHIELD</span>
              </span>
              <span className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Gateway Active — Telemetry Synced
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 sm:flex">
              <GitBranch className="h-3 w-3 text-cyan-400/80" strokeWidth={2} />
              Build 2.4.1 // Stable
            </div>
            <div className="text-right leading-tight">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                Team CodeCrusaders
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                Cyber Defense Division
              </p>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="grid grid-cols-1 gap-10 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300/90">
              <Radar className="h-3 w-3" strokeWidth={2} />
              National Fraud Telemetry Initiative
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Pre-Click SMS Triage &amp;{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-zinc-200 bg-clip-text text-transparent">
                National Fraud Telemetry.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-400">
              A zero-trust SMS interceptor that quarantines malicious links before a
              single tap, and a real-time gateway that routes verified fraud
              signals straight to law enforcement command.
            </p>

            {/* Live status pill */}
            <div className="mt-8 inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-zinc-800 bg-zinc-950/70 px-5 py-3 font-mono text-[11px] tracking-tight text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" strokeWidth={2} />
                Latency:{" "}
                <span className="text-zinc-200">1.2ms</span>
              </span>
              <span className="h-3 w-px bg-zinc-800" />
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
                Zero-Trust Intercept:{" "}
                <span className="text-emerald-400">ON</span>
              </span>
              <span className="h-3 w-px bg-zinc-800" />
              <span className="flex items-center gap-1.5">
                <ScanLine className="h-3.5 w-3.5 text-amber-400" strokeWidth={2} />
                Model:{" "}
                <span className="text-zinc-200">Heuristic v2.4</span>
              </span>
            </div>
          </div>

          {/* Right rail live readout */}
          <div className="flex flex-col justify-center gap-3 lg:pl-6 lg:pt-8">
            <div className="rounded-lg border border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                Threat Feed // Last 60s
              </p>
              <div className="mt-3 space-y-2.5">
                {[
                  { label: "Smishing links neutralized", value: "1,842", tone: "text-emerald-400" },
                  { label: "Suspicious senders flagged", value: "306", tone: "text-amber-400" },
                  { label: "Cases escalated to CERT-In", value: "14", tone: "text-cyan-400" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-t border-zinc-800/60 pt-2.5 first:border-t-0 first:pt-0">
                    <span className="text-[12px] text-zinc-500">{row.label}</span>
                    <span className={`font-mono text-[13px] font-medium ${row.tone}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dual Launch Portal */}
        <section className="grid grid-cols-1 gap-5 pb-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          {/* Card 1 — Citizen Mobile Shield */}
          <Link
            href="/mobile"
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-zinc-950 p-8 transition-colors duration-300 hover:border-emerald-500/30 sm:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-150"
            />
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-900">
                  <Smartphone className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300/90">
                  Citizen Layer
                </span>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
                Citizen Mobile Shield
              </h2>
              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-zinc-500">
                A simulated telephony inbox with pre-click quarantine. Every
                inbound link is detonated in an isolated vault and neutralized
                before it ever reaches the user.
              </p>

              <ul className="mt-6 space-y-2.5">
                <li className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                  <Inbox className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={2} />
                  Simulated SMS inbox with live triage states
                </li>
                <li className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                  <Ban className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={2} />
                  Pre-click quarantine vault for suspect payloads
                </li>
                <li className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={2} />
                  Automatic link neutralization on detection
                </li>
              </ul>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-zinc-800/70 pt-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                Route // /mobile
              </span>
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-200 transition-colors group-hover:text-emerald-300">
                Launch Device Simulator
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </div>
          </Link>

          {/* Card 2 — Cyber Cell Command Telemetry */}
          <Link
            href="/dashboard"
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-zinc-950 p-8 transition-colors duration-300 hover:border-amber-500/30 sm:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-150"
            />
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-900">
                  <Terminal className="h-5 w-5 text-amber-400" strokeWidth={1.75} />
                </div>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-300/90">
                  Command Layer
                </span>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
                Cyber Cell Command Telemetry
              </h2>
              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-zinc-500">
                Real-time fraud aggregation across states, with live attack
                heatmaps and takedown intelligence formatted to DoT and
                CERT-In reporting standards.
              </p>

              <ul className="mt-6 space-y-2.5">
                <li className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                  <MapPinned className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={2} />
                  Statewide attack heatmap, updated live
                </li>
                <li className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                  <Gauge className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={2} />
                  Aggregated fraud volume &amp; velocity metrics
                </li>
                <li className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                  <FileLock2 className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={2} />
                  DoT / CERT-In grade takedown case files
                </li>
              </ul>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-zinc-800/70 pt-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
                Route // /dashboard
              </span>
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-200 transition-colors group-hover:text-amber-300">
                Enter Command Dashboard
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </div>
          </Link>
        </section>

        {/* Trust bar */}
        <section className="mt-auto border-t border-zinc-800/60 py-8">
          <div className="grid grid-cols-1 divide-y divide-zinc-800/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-3 py-4 sm:py-0 sm:pr-6">
              <Zap className="h-4 w-4 shrink-0 text-amber-400/80" strokeWidth={1.75} />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                Zero-Trust Link Deactivation
              </span>
            </div>
            <div className="flex items-center gap-3 py-4 sm:py-0 sm:px-6">
              <Activity className="h-4 w-4 shrink-0 text-cyan-400/80" strokeWidth={1.75} />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                Sub-Second Heuristic Scans
              </span>
            </div>
            <div className="flex items-center gap-3 py-4 sm:py-0 sm:pl-6">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400/80" strokeWidth={1.75} />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                CERT-In Standard Telemetry Logs
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}