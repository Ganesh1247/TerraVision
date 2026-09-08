import React, { useState } from 'react';
import { X, Copy, Download, Check, Code, FileJson } from 'lucide-react';

export default function JsonOutputModal({ isOpen, onClose, jsonResult }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !jsonResult) return null;

  const jsonString = JSON.stringify(jsonResult, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraVision_Person2_Analysis_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-dark-950 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-dark-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                Person 2 Analysis Result JSON
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ISO/SI Standard Compliant
                </span>
              </h3>
              <p className="text-xs text-slate-400">Complete metric scale, geometry, measurements & uncertainty payload</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-dark-950 border-b border-slate-800 text-xs font-mono">
          <div className="text-slate-400">
            Size: <strong className="text-white">{(jsonString.length / 1024).toFixed(1)} KB</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy JSON'}
            </button>
            <button
              onClick={handleDownload}
              className="py-1.5 px-3 rounded bg-brand-cyan hover:bg-brand-cyan/80 text-dark-950 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .json
            </button>
          </div>
        </div>

        {/* JSON Code Viewer Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-dark-950 font-mono text-xs text-emerald-400/90 leading-relaxed select-text">
          <pre className="whitespace-pre-wrap break-words">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-dark-900 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Terra Vision Offline Analysis Protocol v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
