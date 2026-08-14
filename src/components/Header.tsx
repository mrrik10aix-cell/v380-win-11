import React, { useState, useRef, useEffect } from 'react';
import { AppTab } from '../types';
import {
  Video,
  Bell,
  Cloud,
  Image,
  Sliders,
  Plus,
  ShieldCheck,
  Grid,
  Maximize2,
  Radio,
  Wifi,
  Cast,
  UserCheck,
  Trash2,
  RotateCcw,
  Monitor,
  Laptop,
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  MicOff,
  ChevronDown,
  Activity,
  Check
} from 'lucide-react';

interface HeaderProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  gridMode: '1' | '4' | '9';
  onChangeGridMode: (mode: '1' | '4' | '9') => void;
  unreadAlarmsCount: number;
  onlineCount: number;
  totalCount: number;
  faceCount?: number;
  isGlobalAudioActive?: boolean;
  unmutedCamerasCount?: number;
  totalAudioCamerasCount?: number;
  masterVolume?: number;
  onToggleGlobalAudio?: () => void;
  onChangeMasterVolume?: (volume: number) => void;
  onMuteAllAudio?: () => void;
  onUnmuteAllAudio?: () => void;
  onOpenAddDevice: () => void;
  onOpenGoogleHome?: () => void;
  onOpenFaceLibrary?: () => void;
  onOpenWin11Install?: () => void;
  onClearData?: () => void;
  onLoadDemoData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  gridMode,
  onChangeGridMode,
  unreadAlarmsCount,
  onlineCount,
  totalCount,
  faceCount = 0,
  isGlobalAudioActive = false,
  unmutedCamerasCount = 0,
  totalAudioCamerasCount = 0,
  masterVolume = 0.6,
  onToggleGlobalAudio,
  onChangeMasterVolume,
  onMuteAllAudio,
  onUnmuteAllAudio,
  onOpenAddDevice,
  onOpenGoogleHome,
  onOpenFaceLibrary,
  onOpenWin11Install,
  onClearData,
  onLoadDemoData,
}) => {
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const audioMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (audioMenuRef.current && !audioMenuRef.current.contains(e.target as Node)) {
        setIsAudioMenuOpen(false);
      }
    };
    if (isAudioMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isAudioMenuOpen]);
  return (
    <header className="bg-[#121215]/95 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40 px-4 py-3 text-zinc-100 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-900/20 flex items-center justify-center text-white shrink-0">
            <Video className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-1.5">
                <span>IMOU Life, ICSee & V380</span>
                <span className="text-zinc-500 font-normal text-xs">/ Smart Cam Station</span>
              </h1>
              <span className="text-[10px] bg-orange-900/30 text-orange-400 border border-orange-800/60 px-2 py-0.5 rounded font-mono font-medium">
                IMOU + NETIP + V380
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{onlineCount}/{totalCount} Cameras Online</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <Cast className="w-3 h-3" /> Google Home Ready
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-zinc-800 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => onChangeTab('devices')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'devices'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Remote Live</span>
          </button>

          <button
            onClick={() => onChangeTab('events')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all relative ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alarm Messages</span>
            {unreadAlarmsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold animate-bounce">
                {unreadAlarmsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onChangeTab('cloud')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'cloud'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloud Sync</span>
          </button>

          <button
            onClick={() => onChangeTab('album')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'album'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>My Album</span>
          </button>
        </nav>

        {/* Right Controls: Global Audio Toggle, Win11 Install, Face Library, Google Home, Multi-Grid Mode & Add Device */}
        <div className="flex items-center gap-2">
          {/* Global Audio Toggle for Simultaneous Monitoring across all Camera Windows */}
          {onToggleGlobalAudio && (
            <div className="relative" ref={audioMenuRef}>
              <div className="flex items-center rounded-xl overflow-hidden border border-zinc-700/80 shadow-sm transition-all">
                {/* Primary Global Audio Toggle Button */}
                <button
                  onClick={onToggleGlobalAudio}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                    isGlobalAudioActive
                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-r border-emerald-500/30'
                      : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-400 hover:text-zinc-200 border-r border-zinc-700'
                  }`}
                  title={
                    isGlobalAudioActive
                      ? `Global Audio ON (${unmutedCamerasCount}/${totalAudioCamerasCount} camera mics streaming) - Click to Mute All`
                      : `Global Audio Muted - Click to Enable Simultaneous Audio Monitoring across all cameras`
                  }
                >
                  {isGlobalAudioActive ? (
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {/* Live Audio Equalizer animation bars */}
                      <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0">
                        <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-full"></span>
                        <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-2/3"></span>
                        <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-4/5"></span>
                      </div>
                    </div>
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}

                  <span className="hidden sm:inline font-bold">
                    {isGlobalAudioActive ? 'Global Audio' : 'Audio'}
                  </span>

                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isGlobalAudioActive
                        ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40'
                        : 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/40'
                    }`}
                  >
                    {isGlobalAudioActive ? `${unmutedCamerasCount}/${totalAudioCamerasCount} ON` : 'OFF'}
                  </span>
                </button>

                {/* Audio Options / Volume Dropdown Trigger */}
                <button
                  onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                  className={`px-1.5 py-2 transition-colors flex items-center justify-center ${
                    isGlobalAudioActive
                      ? 'bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300'
                      : 'bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Global Audio Settings & Master Volume"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAudioMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Dropdown Popover */}
              {isAudioMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-zinc-100">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Simultaneous Audio Monitor
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">
                      Web Audio Mix
                    </span>
                  </div>

                  {/* Master Volume Slider */}
                  <div className="my-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Master Stream Volume</span>
                      <span className="font-mono text-blue-400 font-bold">{Math.round(masterVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={masterVolume}
                      onChange={(e) => onChangeMasterVolume?.(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Quick Batch Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        onUnmuteAllAudio?.();
                        setIsAudioMenuOpen(false);
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Unmute All</span>
                    </button>
                    <button
                      onClick={() => {
                        onMuteAllAudio?.();
                        setIsAudioMenuOpen(false);
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Mute All</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500 mt-2.5 leading-relaxed">
                    Enables live microphone audio streaming across all active camera windows simultaneously (1CH, 4CH & 9CH multi-view).
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Windows 11 Native App Install Button */}
          {onOpenWin11Install && (
            <button
              onClick={onOpenWin11Install}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium text-xs transition-all active:scale-95 shrink-0 shadow-sm"
              title="Install V380 Pro Desktop App on Windows 11"
            >
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline font-bold">Win 11 App</span>
              <span className="bg-cyan-500/30 text-cyan-200 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                Setup
              </span>
            </button>
          )}

          {/* AI Face Library Button */}
          <button
            onClick={onOpenFaceLibrary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium text-xs transition-all active:scale-95 shrink-0"
            title="AI Face Library & Person Recognition"
          >
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline font-bold">Face Library</span>
            <span className="bg-indigo-500/30 text-indigo-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {faceCount}
            </span>
          </button>

          {/* Google Home Smart Bridge Modal Button */}
          <button
            onClick={onOpenGoogleHome}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-xs transition-all active:scale-95 shrink-0"
            title="Google Home & Nest Hub Stream Bridge"
          >
            <Cast className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-bold">Google Home</span>
          </button>

          {activeTab === 'devices' && (
            <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-zinc-800 text-xs">
              {(['1', '4', '9'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onChangeGridMode(m)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                    gridMode === m
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={`${m}-channel layout view`}
                >
                  {m === '1' ? '1CH' : `${m}CH`}
                </button>
              ))}
            </div>
          )}

          {/* Clear / Reset Data Button */}
          {onClearData && (
            <button
              onClick={onClearData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700/80 hover:border-rose-500/40 font-medium text-xs transition-all active:scale-95 shrink-0"
              title="Clear all devices, alarm messages, and demo data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear Data</span>
            </button>
          )}

          <button
            onClick={onOpenAddDevice}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-900/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Device</span>
          </button>
        </div>
      </div>
    </header>
  );
};
