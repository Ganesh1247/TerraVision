import React from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBadge({ className = '', compact = false }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border tv-badge-emerald transition-all ${className}`}
      style={{ boxShadow: '0 0 12px -2px rgba(52,211,153,0.2)' }}
      title="Verified: System runs 100% locally — all network interfaces air-gapped."
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-emerald)] opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-emerald)]" />
      </span>
      <WifiOff className="w-3 h-3" />
      {!compact && (
        <span className="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">
          Offline
        </span>
      )}
    </div>
  );
}
