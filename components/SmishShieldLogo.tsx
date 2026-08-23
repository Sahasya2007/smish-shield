import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function SmishShieldLogo({
  className = "",
  size = 40,
  showText = true,
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Precision Geometric SVG Glyph */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        {/* Subtle Base Shadow Plate */}
        <rect width="48" height="48" rx="12" fill="#142820" />
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="11.5"
          stroke="#1B4332"
          strokeOpacity="0.4"
        />

        {/* Outer Sovereign Shield Perimeter */}
        <path
          d="M24 8L11 13.5V23.5C11 31.8 16.5 39.5 24 41.5C31.5 39.5 37 31.8 37 23.5V13.5L24 8Z"
          fill="#1B4332"
          stroke="#2D6A4F"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner Precision Isolation Core (The Pre-Click Gateway Barrier) */}
        <path
          d="M24 13L15 17V23.5C15 29.5 18.8 35.2 24 37C29.2 35.2 33 29.5 33 23.5V17L24 13Z"
          fill="#0D1F18"
          stroke="#40916C"
          strokeWidth="1"
        />

        {/* Telemetry Node & Triangulation Intercept Lines */}
        <path
          d="M24 18V31M19 24.5H29"
          stroke="#FAF8F5"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        
        {/* Core Detonation / Neutralization Anchor Point */}
        <circle cx="24" cy="24.5" r="2.5" fill="#52B788" />
        <circle cx="24" cy="24.5" r="5" stroke="#52B788" strokeWidth="0.75" strokeDasharray="2 2" />
      </svg>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-mono text-base font-bold tracking-tight text-[#081510]">
            SMISH<span className="text-[#2D6A4F]">SHIELD</span>
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#385348]">
            Zero-Trust Gateway
          </span>
        </div>
      )}
    </div>
  );
}