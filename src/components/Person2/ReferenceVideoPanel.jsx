import React, { useState } from 'react';
import { Film, Image as ImageIcon, Upload, CheckCircle2, Eye } from 'lucide-react';

export default function ReferenceVideoPanel({ onVideoUploaded, externalFile }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  React.useEffect(() => {
    if (externalFile) {
      setVideoFile(externalFile);
      const url = URL.createObjectURL(externalFile);
      setVideoUrl(url);
    }
  }, [externalFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (onVideoUploaded) onVideoUploaded(file);
    }
  };

  return (
    <div className="bg-dark-950/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Optional Reference Video / Image Channel
            </h3>
            <p className="text-[11px] text-slate-400">Auxiliary visual input for semantic verification (No cloud processing)</p>
          </div>
        </div>
      </div>

      {!videoUrl ? (
        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-brand-cyan/50 rounded-lg cursor-pointer bg-dark-900/50 hover:bg-dark-900 transition-colors text-center space-y-2">
          <Upload className="w-5 h-5 text-brand-cyan" />
          <div className="text-xs font-mono text-slate-300 font-semibold">
            Upload Reference Video (.mp4, .webm) or Keyframe (.jpg, .png)
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Used strictly for side-by-side visual reference & semantic feature alignment.
          </p>
          <input
            type="file"
            accept="video/*,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Loaded: {videoFile?.name}
            </span>
            <button
              onClick={() => {
                setVideoFile(null);
                setVideoUrl(null);
              }}
              className="text-[10px] text-slate-400 hover:text-red-400 cursor-pointer"
            >
              Remove
            </button>
          </div>

          <div className="rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
            {videoFile?.type.startsWith('video') ? (
              <video src={videoUrl} controls className="w-full h-full object-contain" />
            ) : (
              <img src={videoUrl} alt="Reference keyframe" className="w-full h-full object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
