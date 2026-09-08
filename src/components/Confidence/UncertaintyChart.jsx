import React from 'react';

export default function UncertaintyChart({ 
  mean = 18.4, 
  sigma = 0.35, 
  unit = 'm',
  confidencePct = 81 
}) {
  // Generate Gaussian normal distribution SVG path
  const width = 320;
  const height = 90;
  const numPoints = 60;
  const points = [];

  const minX = mean - sigma * 3.2;
  const maxX = mean + sigma * 3.2;

  for (let i = 0; i <= numPoints; i++) {
    const xVal = minX + (i / numPoints) * (maxX - minX);
    // Gaussian formula: f(x) = exp(-0.5 * ((x-mean)/sigma)^2)
    const z = (xVal - mean) / sigma;
    const yVal = Math.exp(-0.5 * z * z);
    
    // Scale to SVG viewport
    const svgX = (i / numPoints) * (width - 40) + 20;
    const svgY = height - 20 - (yVal * (height - 35));
    points.push(`${svgX},${svgY}`);
  }

  const pathD = `M ${points[0]} L ${points.join(' ')}`;
  const fillD = `${pathD} L ${width - 20},${height - 20} L 20,${height - 20} Z`;

  // 95% confidence bounds (mean ± 1.96*sigma)
  const left95X = ((mean - sigma * 1.96 - minX) / (maxX - minX)) * (width - 40) + 20;
  const right95X = ((mean + sigma * 1.96 - minX) / (maxX - minX)) * (width - 40) + 20;
  const meanX = ((mean - minX) / (maxX - minX)) * (width - 40) + 20;

  return (
    <div className="p-3 bg-dark-900/80 rounded-lg border border-slate-800 space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">Gaussian Probability Density P(x)</span>
        <span className="text-brand-cyan font-bold">95% Bound: [{(mean - sigma * 1.96).toFixed(2)} - {(mean + sigma * 1.96).toFixed(2)} {unit}]</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 overflow-visible">
        {/* Fill under curve */}
        <path d={fillD} fill="url(#cyanGlowGrad)" opacity="0.25" />
        
        {/* Stroke Curve */}
        <path d={pathD} fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />

        {/* 95% Interval Shaded Area */}
        <line x1={left95X} y1="12" x2={left95X} y2={height - 20} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" />
        <line x1={right95X} y1="12" x2={right95X} y2={height - 20} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,3" />
        
        {/* Center Mean Peak */}
        <line x1={meanX} y1="8" x2={meanX} y2={height - 20} stroke="#22D3EE" strokeWidth="2" />
        <circle cx={meanX} cy="8" r="3" fill="#22D3EE" />

        {/* Baseline */}
        <line x1="15" y1={height - 20} x2={width - 15} y2={height - 20} stroke="#334155" strokeWidth="1" />

        {/* Labels */}
        <text x={left95X} y={height - 6} fill="#F59E0B" fontSize="9" textAnchor="middle" fontFamily="monospace">
          -1.96σ
        </text>
        <text x={meanX} y={height - 6} fill="#22D3EE" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
          μ = {mean}{unit}
        </text>
        <text x={right95X} y={height - 6} fill="#F59E0B" fontSize="9" textAnchor="middle" fontFamily="monospace">
          +1.96σ
        </text>

        <defs>
          <linearGradient id="cyanGlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
