import React from 'react';
import { MOCK_DATASETS } from '../../data/mockDatasets';
import { Film, Zap, Compass, AlertTriangle, Moon, Mountain, Building2 } from 'lucide-react';

export default function PresetSelector({ 
  selectedDataset, 
  onSelectDataset, 
  isProcessing 
}) {
  const getIcon = (id) => {
    if (id.includes('substation')) return <Zap className="w-4 h-4 text-brand-cyan" />;
    if (id.includes('urbancanyon')) return <Building2 className="w-4 h-4 text-blue-400" />;
    if (id.includes('nightfactory')) return <Moon className="w-4 h-4 text-amber-400" />;
    return <Mountain className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-brand-cyan" />
          Field Mission Presets (1-Click Test)
        </label>
        <span className="text-[10px] font-mono text-slate-400">
          Pre-validated datasets
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {MOCK_DATASETS.map((dataset) => {
          const isSelected = selectedDataset.id === dataset.id;
          return (
            <button
              key={dataset.id}
              disabled={isProcessing}
              onClick={() => onSelectDataset(dataset)}
              className={`text-left p-2.5 rounded-lg border transition-all relative overflow-hidden ${
                isSelected 
                  ? 'bg-dark-800 border-brand-cyan shadow-[0_0_12px_rgba(34,211,238,0.15)] ring-1 ring-brand-cyan/50' 
                  : 'bg-dark-850/70 border-slate-800 hover:border-slate-700 hover:bg-dark-800'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-brand-cyan rounded-bl" />
              )}
              
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded bg-dark-900 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(dataset.id)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate flex items-center justify-between">
                    <span>{dataset.name.split(':')[0]}</span>
                    <span className="text-[10px] font-mono text-slate-400">{dataset.duration}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {dataset.name.split(':')[1]}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                    <span className="text-brand-cyan">{dataset.resolution.split(' ')[0]}</span>
                    <span>·</span>
                    <span className={dataset.hasImu ? 'text-emerald-400' : 'text-amber-400'}>
                      {dataset.hasImu ? 'IMU 200Hz' : 'No IMU (Visual)'}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
