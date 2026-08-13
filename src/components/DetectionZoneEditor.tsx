import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import { Grid, ShieldCheck, RefreshCcw, X, Check } from 'lucide-react';

interface DetectionZoneEditorProps {
  device?: Device;
  isOpen: boolean;
  onClose: () => void;
  onSaveGrid: (newGrid: boolean[][]) => void;
}

export const DetectionZoneEditor: React.FC<DetectionZoneEditorProps> = ({
  device,
  isOpen,
  onClose,
  onSaveGrid,
}) => {
  const [grid, setGrid] = useState<boolean[][]>(
    device?.detectionZoneGrid || Array(6).fill(null).map(() => Array(6).fill(true))
  );

  useEffect(() => {
    if (device?.detectionZoneGrid) {
      setGrid(device.detectionZoneGrid);
    }
  }, [device]);

  if (!isOpen || !device) return null;

  const toggleCell = (r: number, c: number) => {
    const next = grid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? !val : val))
    );
    setGrid(next);
  };

  const selectAll = () => {
    setGrid(Array(6).fill(null).map(() => Array(6).fill(true)));
  };

  const clearAll = () => {
    setGrid(Array(6).fill(null).map(() => Array(6).fill(false)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-xl max-w-md w-full p-6 text-zinc-100 shadow-2xl relative flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">Motion Detection Zone Mask</h2>
            <p className="text-xs text-zinc-400">Red cells trigger motion alerts. Gray cells are ignored.</p>
          </div>
        </div>

        {/* Interactive Grid Representation */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-1.5">
          {grid.map((row, r) => (
            <div key={r} className="flex gap-1.5 justify-center">
              {row.map((active, c) => (
                <button
                  key={c}
                  onClick={() => toggleCell(r, c)}
                  className={`w-10 h-10 rounded-lg border text-xs font-mono font-bold transition-all active:scale-90 flex items-center justify-center ${
                    active
                      ? 'bg-rose-500/30 border-rose-500 text-rose-300 shadow-sm shadow-rose-500/20'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                  }`}
                >
                  {active ? 'ON' : 'OFF'}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Preset Selectors */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
          >
            Select All
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Save Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveGrid(grid);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Save Detection Zone
          </button>
        </div>
      </div>
    </div>
  );
};
