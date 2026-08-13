import React from 'react';
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
  Laptop
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
  onOpenAddDevice,
  onOpenGoogleHome,
  onOpenFaceLibrary,
  onOpenWin11Install,
  onClearData,
  onLoadDemoData,
}) => {
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
            <span>Cloud Vault</span>
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

        {/* Right Controls: Face Library, Google Home, Multi-Grid Mode & Add Device */}
        <div className="flex items-center gap-2">
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
