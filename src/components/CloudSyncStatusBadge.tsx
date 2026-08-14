import React, { useState } from 'react';
import {
  Cloud,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Clock,
  UploadCloud,
  Activity,
  Wifi,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Device } from '../types';

interface CloudSyncStatusBadgeProps {
  device: Device;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const CloudSyncStatusBadge: React.FC<CloudSyncStatusBadgeProps> = ({
  device,
  size = 'md',
  showLabel = false,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const storage = device.storage || {
    cloudSyncActive: true,
    cloudProvider: 'Google_Drive' as const,
    lastSyncTime: '2 mins ago',
    lastSuccessfulSyncTime: '2026-08-14 04:15:00',
    pendingUploads: 0,
    syncHealth: 'optimal' as const,
    sdCardSizeGB: 128,
    sdCardUsedGB: 32,
  };

  const isSyncActive = storage.cloudSyncActive ?? true;
  const provider = storage.cloudProvider ?? 'Google_Drive';
  const pendingUploads = storage.pendingUploads ?? (isSyncActive ? (device.id === 'dev-2' ? 2 : 0) : 0);
  const lastSuccessTime = storage.lastSuccessfulSyncTime || storage.lastSyncTime || '2 mins ago';
  const syncHealth = storage.syncHealth ?? (isSyncActive ? (pendingUploads > 0 ? 'syncing' : 'optimal') : 'paused');
  const uploadBandwidth = storage.uploadBandwidthKbps ?? (isSyncActive ? 4200 : 0);

  const providerName = provider === 'Google_Drive' ? 'Google Drive' : provider === 'OneDrive' ? 'Microsoft OneDrive' : 'Disabled';
  const isGoogle = provider === 'Google_Drive';

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Trigger Icon with pulsing status dot */}
      <button
        type="button"
        aria-label="Cloud sync health status"
        className={`group flex items-center gap-1.5 rounded-lg transition-all cursor-pointer relative ${
          size === 'sm'
            ? 'p-1'
            : size === 'lg'
            ? 'p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
            : 'p-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 rounded-lg'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isGoogle ? (
            <Cloud
              className={`${
                size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
              } transition-transform group-hover:scale-110 ${
                isSyncActive ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            />
          ) : (
            <HardDrive
              className={`${
                size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
              } transition-transform group-hover:scale-110 ${
                isSyncActive ? 'text-blue-400' : 'text-zinc-500'
              }`}
            />
          )}

          {/* Micro Status Dot */}
          <span
            className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-zinc-950 ${
              !isSyncActive
                ? 'bg-zinc-500'
                : pendingUploads > 0
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
        </div>

        {showLabel && (
          <span className="text-[11px] font-medium text-zinc-300 font-mono">
            {isSyncActive ? (pendingUploads > 0 ? `Syncing (${pendingUploads})` : 'Synced') : 'Paused'}
          </span>
        )}
      </button>

      {/* Rich Health Tooltip Overlay */}
      {isHovered && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-[#09090b]/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.8))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center ${
                  isGoogle
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {isGoogle ? <Cloud className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-100 leading-none">{providerName}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{device.name}</p>
              </div>
            </div>

            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono uppercase ${
                !isSyncActive
                  ? 'bg-zinc-800 text-zinc-400'
                  : syncHealth === 'optimal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : syncHealth === 'syncing'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isSyncActive ? (pendingUploads > 0 ? 'Syncing...' : 'Healthy') : 'Sync Paused'}
            </span>
          </div>

          {/* Metric Rows */}
          <div className="flex flex-col gap-1.5 text-xs">
            {/* Last Successful Sync */}
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-zinc-900/90 border border-zinc-800/60">
              <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Last Successful Sync:</span>
              </span>
              <span className="font-mono text-zinc-200 text-[11px] font-semibold">
                {lastSuccessTime}
              </span>
            </div>

            {/* Pending Uploads Queue */}
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-zinc-900/90 border border-zinc-800/60">
              <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
                <span>Pending Uploads:</span>
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  pendingUploads > 0 ? 'text-amber-300' : 'text-emerald-400'
                }`}
              >
                {pendingUploads > 0 ? `${pendingUploads} clips queued` : '0 (Up to date)'}
              </span>
            </div>

            {/* Bandwidth / Sync Health */}
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-zinc-900/90 border border-zinc-800/60">
              <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Bandwidth:</span>
              </span>
              <span className="font-mono text-zinc-300 text-[11px]">
                {isSyncActive ? `${(uploadBandwidth / 1000).toFixed(1)} MB/s` : '0 KB/s'}
              </span>
            </div>

            {/* Local SD Mirror Sync */}
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-zinc-900/90 border border-zinc-800/60">
              <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>SD Storage Mirror:</span>
              </span>
              <span className="font-mono text-zinc-300 text-[11px]">
                {storage.sdCardUsedGB || 32}GB / {storage.sdCardSizeGB || 128}GB
              </span>
            </div>
          </div>

          {/* Footer status notice */}
          <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>TLS 1.3 AES Encrypted</span>
            <span className="text-emerald-400/90">Direct API Push</span>
          </div>

          {/* Tooltip Downward Arrow pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-700/80 pointer-events-none" />
        </div>
      )}
    </div>
  );
};
