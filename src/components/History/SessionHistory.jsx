import React, { useState } from 'react';
import { MOCK_JOBS } from '../../data/mockJobs';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Download, 
  Calendar, 
  Clock, 
  Database,
  Compass,
  ArrowRight
} from 'lucide-react';
import JobDetailModal from './JobDetailModal';

export default function SessionHistory({ onSelectJobForViewer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJobModal, setSelectedJobModal] = useState(null);

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch = job.datasetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-xl bg-dark-850 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-cyan" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Local Reconstruction Sessions Database
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              SQLite WAL Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, inspect, and export all offline 3D point cloud & mesh reconstruction sessions stored on this edge node.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job ID or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-dark-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-cyan w-48 sm:w-64"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-dark-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-brand-cyan"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="warning">Degraded Warning</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => {
          const isCompleted = job.status === 'completed';
          return (
            <div
              key={job.id}
              className="p-4 rounded-xl bg-dark-850 border border-slate-800 hover:border-brand-cyan/40 transition-all flex flex-col justify-between space-y-4 tech-panel-interactive"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-brand-cyan">
                    {job.id}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {job.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {job.datasetName}
                </h3>
                
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{job.timestamp}</span>
                  <span>·</span>
                  <Clock className="w-3 h-3" />
                  <span>{job.runtime}</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-dark-900/80 rounded-lg text-center font-mono text-[11px] border border-slate-800/80">
                <div>
                  <div className="text-[9px] text-slate-500">POINTS</div>
                  <div className="font-semibold text-slate-200">{job.pointCount.split(' ')[0]}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500">ACCURACY</div>
                  <div className="font-semibold text-emerald-400">{job.scaleUncertainty.split(' ')[1]}m</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500">CONFIDENCE</div>
                  <div className="font-semibold text-brand-cyan">{job.confidenceAvg}%</div>
                </div>
              </div>

              {/* Fallback badges */}
              <div className="flex flex-wrap gap-1">
                {job.degradedFlags.map((flag, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-900 border border-slate-800 text-slate-400">
                    {flag}
                  </span>
                ))}
              </div>

              {/* Actions CTA */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedJobModal(job)}
                  className="px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => onSelectJobForViewer(job)}
                  className="px-3 py-1.5 rounded-lg bg-brand-cyan hover:bg-brand-cyan-dark text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Load into 3D Viewer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for detail view */}
      <JobDetailModal
        job={selectedJobModal}
        isOpen={!!selectedJobModal}
        onClose={() => setSelectedJobModal(null)}
        onLoadIntoViewer={onSelectJobForViewer}
      />
    </div>
  );
}
