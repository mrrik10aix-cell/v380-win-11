import React, { useState } from 'react';
import { Device } from '../types';
import {
  X,
  Tv,
  Cast,
  CheckCircle2,
  Mic,
  Sliders,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
  Globe,
  Radio,
  ExternalLink,
  Volume2
} from 'lucide-react';

interface GoogleHomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  activeDevice?: Device;
  onCastToTarget?: (deviceId: string, targetName: string) => void;
}

export const GoogleHomeModal: React.FC<GoogleHomeModalProps> = ({
  isOpen,
  onClose,
  devices,
  activeDevice,
  onCastToTarget,
}) => {
  const [isLinked, setIsLinked] = useState<boolean>(true);
  const [userEmail] = useState<string>('mrrik10aix@gmail.com');
  const [selectedTarget, setSelectedTarget] = useState<string>('Living Room Nest Hub Max');
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [castSuccessMessage, setCastSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const castTargets = [
    { id: 'nest-hub-1', name: 'Living Room Nest Hub Max', type: 'Nest Display', room: 'Living Room' },
    { id: 'chromecast-tv', name: 'Main Hallway TV (Chromecast 4K)', type: 'Google TV', room: 'Main Hall' },
    { id: 'nest-hub-2', name: 'Kitchen Smart Display', type: 'Nest Display', room: 'Kitchen' },
    { id: 'bedroom-tv', name: 'Master Bedroom Chromecast', type: 'Google TV', room: 'Master Bedroom' },
  ];

  const voiceCommands = [
    { command: '"Hey Google, show Front Porch ICSee camera on TV"', action: 'Casts 4K live RTSP/NETIP stream to TV' },
    { command: '"Hey Google, turn on Living Room spotlight"', action: 'Toggles camera dual white LED spotlight' },
    { command: '"Hey Google, stream Backyard camera on Nest Hub"', action: 'Displays live feed on Google Nest Hub Max' },
    { command: '"Hey Google, is Front Porch camera online?"', action: 'Google Assistant returns device status & battery %' },
  ];

  const handleStartCast = (targetName: string) => {
    setIsCasting(true);
    setCastSuccessMessage(null);
    setTimeout(() => {
      setIsCasting(false);
      setCastSuccessMessage(`Streaming live ICSee feed to "${targetName}" via Google Home Smart Cast!`);
      if (activeDevice && onCastToTarget) {
        onCastToTarget(activeDevice.id, targetName);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 text-zinc-100 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-500 p-0.5 shadow-lg shadow-blue-900/30">
            <div className="w-full h-full bg-[#121215] rounded-[14px] flex items-center justify-center text-blue-400">
              <Cast className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">Google Home & Nest Hub Smart Bridge</h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                COMPATIBLE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Sync IMOU Life, ICSee & V380 Pro cameras directly to Google Assistant and Nest Displays
            </p>
          </div>
        </div>

        {/* Google Account Link Card */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <span>Google Assistant Smart Home Action</span>
                {isLinked && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> LINKED
                  </span>
                )}
              </p>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Connected account: <span className="text-zinc-200 font-semibold">{userEmail}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLinked(!isLinked)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isLinked
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
            }`}
          >
            {isLinked ? 'Unlink Google Home' : 'Link Google Account'}
          </button>
        </div>

        {/* Cast Feed Target Switcher */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Tv className="w-4 h-4 text-blue-400" />
              <span>Stream Live Camera to Google Nest Hub / TV</span>
            </h3>
            {activeDevice && (
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                Active: {activeDevice.name} ({activeDevice.appBrand ?? 'ICSee'})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {castTargets.map((target) => (
              <button
                key={target.id}
                onClick={() => setSelectedTarget(target.name)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedTarget === target.name
                    ? 'bg-blue-950/40 border-blue-500 text-zinc-100 shadow-md ring-1 ring-blue-500/40'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${selectedTarget === target.name ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200">{target.name}</p>
                    <p className="text-[10px] text-zinc-400">{target.type} • {target.room}</p>
                  </div>
                </div>

                {selectedTarget === target.name && (
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {castSuccessMessage && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{castSuccessMessage}</span>
            </div>
          )}

          <button
            onClick={() => handleStartCast(selectedTarget)}
            disabled={isCasting || !isLinked}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              !isLinked
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-900/20 active:scale-95'
            }`}
          >
            <Cast className={`w-4 h-4 ${isCasting ? 'animate-spin' : ''}`} />
            <span>{isCasting ? 'Connecting Stream to Google Target...' : `Cast Live Feed to "${selectedTarget}"`}</span>
          </button>
        </div>

        {/* Google Assistant Voice Commands Quick Reference */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Google Assistant Voice Control Shortcuts</span>
            </h3>
            <span className="text-[10px] text-zinc-400">Hands-free Smart Home Control</span>
          </div>

          <div className="space-y-2">
            {voiceCommands.map((vc, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="font-mono text-amber-300 font-semibold">{vc.command}</span>
                </div>
                <span className="text-[11px] text-zinc-400">{vc.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Synced Devices Summary */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col gap-2.5">
          <h3 className="text-xs font-bold text-zinc-200">
            Synced Devices ({devices.length} Connected IMOU Life, ICSee & V380 Cameras)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {devices.map((d) => (
              <div
                key={d.id}
                className="bg-zinc-900/50 border border-zinc-800/60 p-2.5 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-zinc-200 text-xs">{d.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Brand: {d.appBrand ?? 'ICSee'} • {d.googleHome?.deviceType ?? 'camera'}
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-medium">
                  Synced
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
