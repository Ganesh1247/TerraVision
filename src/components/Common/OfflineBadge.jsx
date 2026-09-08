import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

export default function OfflineBadge({ className = '' }) {
  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium shadow-[0_0_12px_rgba(34,197,94,0.15)] ${className}`}
      title="Verified: System runs 100% locally with all network interfaces air-gapped."
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5" />
      <span className="tracking-wide uppercase font-semibold">OFFLINE MODE — No network dependency</span>
    </div>
  );
}
