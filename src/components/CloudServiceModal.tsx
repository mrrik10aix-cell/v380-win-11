import React, { useState } from 'react';
import { CloudPlan } from '../types';
import { Cloud, ShieldCheck, Check, Sparkles, Lock, X, Zap, Award, HardDrive, CheckCircle2, RefreshCcw, ExternalLink, ArrowRight, AlertCircle, Ban } from 'lucide-react';

interface CloudServiceModalProps {
  plans: CloudPlan[];
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: CloudPlan) => void;
}

export const CloudServiceModal: React.FC<CloudServiceModalProps> = ({
  plans,
  isOpen,
  onClose,
  onSubscribe,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<'google_drive' | 'onedrive'>('google_drive');
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState<boolean>(true); // Authorized scope setup
  const [isOneDriveConnected, setIsOneDriveConnected] = useState<boolean>(false);
  const [autoSyncOnAlarm, setAutoSyncOnAlarm] = useState<boolean>(true);
  const [targetFolder, setTargetFolder] = useState<string>('My Drive/V380_Security_Backups');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now (OAuth Verified)');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestDriveSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
      setSyncStatusMsg(
        selectedProvider === 'google_drive'
          ? 'Successfully synced 3 security snapshots & 1 alarm clip to Google Drive folder!'
          : 'Successfully connected to Microsoft OneDrive security bucket!'
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 text-zinc-100 shadow-2xl relative overflow-hidden flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Glow Decor */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">Personal Cloud Storage Plugin</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                GOOGLE & MICROSOFT INTEGRATED
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Save CCTV alarm clips and high-definition snapshots directly to your personal cloud drive.
            </p>
          </div>
        </div>

        {/* Cloud Vault Disabled Status Alert */}
        <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <Ban className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-amber-300">V380 Paid Subscription Vault: Disabled / Paused</p>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                NO CHARGE
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
              Proprietary cloud vault subscriptions are currently disabled. Instead, store all security footage directly on your personal <strong>Google Drive</strong> or <strong>Microsoft OneDrive</strong> without monthly fee caps!
            </p>
          </div>
        </div>

        {/* Drive Plugin Integration Card */}
        <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Select Cloud Storage Provider</span>
            </span>
            <span className="text-[10px] text-zinc-400">Direct Backup Sync</span>
          </h3>

          {/* Provider Toggle Tabs */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Drive Option */}
            <button
              onClick={() => setSelectedProvider('google_drive')}
              className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between text-left ${
                selectedProvider === 'google_drive'
                  ? 'bg-emerald-950/20 border-emerald-500 text-zinc-100 ring-2 ring-emerald-500/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-100">Google Drive</p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {isGoogleDriveConnected ? 'OAuth Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              {selectedProvider === 'google_drive' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            </button>

            {/* OneDrive Option */}
            <button
              onClick={() => setSelectedProvider('onedrive')}
              className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between text-left ${
                selectedProvider === 'onedrive'
                  ? 'bg-blue-950/20 border-blue-500 text-zinc-100 ring-2 ring-blue-500/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-100">Microsoft OneDrive</p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {isOneDriveConnected ? 'OAuth Connected' : 'Available Plugin'}
                  </p>
                </div>
              </div>
              {selectedProvider === 'onedrive' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
            </button>
          </div>

          {/* Connected Provider Configuration Panel */}
          {selectedProvider === 'google_drive' && (
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-zinc-200">Google Drive Account Connected</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  drive.file Scope Authorized
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-[11px] font-medium">Backup Target Directory:</label>
                  <input
                    type="text"
                    value={targetFolder}
                    onChange={(e) => setTargetFolder(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 font-mono text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-[11px] font-medium">Automatic Motion Sync:</label>
                  <button
                    onClick={() => setAutoSyncOnAlarm(!autoSyncOnAlarm)}
                    className={`py-1.5 px-3 rounded-lg font-bold text-xs border transition-colors flex items-center justify-between ${
                      autoSyncOnAlarm
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <span>Auto-Upload Motion Clips</span>
                    <span>{autoSyncOnAlarm ? 'ENABLED' : 'MANUAL ONLY'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px]">
                <span className="text-zinc-400">Last Drive Sync: <strong className="text-zinc-200">{lastSyncTime}</strong></span>
                <button
                  onClick={handleTestDriveSync}
                  disabled={isSyncing}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing to Google Drive...' : 'Test Sync Now'}</span>
                </button>
              </div>

              {syncStatusMsg && (
                <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{syncStatusMsg}</span>
                </div>
              )}
            </div>
          )}

          {selectedProvider === 'onedrive' && (
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-zinc-200">Microsoft OneDrive Plugin</span>
                </div>
                <button
                  onClick={() => setIsOneDriveConnected(!isOneDriveConnected)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs border transition-colors ${
                    isOneDriveConnected
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-blue-600 text-white border-blue-500'
                  }`}
                >
                  {isOneDriveConnected ? 'Disconnect OneDrive' : 'Connect Microsoft Account'}
                </button>
              </div>

              <p className="text-[11px] text-zinc-400">
                Link your Microsoft 365 or personal OneDrive account to mirror all CCTV alarm event videos automatically.
              </p>
            </div>
          )}
        </div>

        {/* Disabled Vault Plans (Greyed out for reference) */}
        <div className="opacity-60 border border-zinc-800 rounded-xl p-3 bg-[#09090b]/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
              Legacy Proprietary Plans (Disabled)
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Replaced by Personal Cloud Drive</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {plans.map((p) => (
              <div key={p.id} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs">
                <p className="font-bold text-zinc-400 text-[11px]">{p.name}</p>
                <p className="text-[10px] text-zinc-500 line-through mt-0.5">{p.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
          >
            Close Window
          </button>

          <button
            onClick={onClose}
            className="flex-1 max-w-xs py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all text-center flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Cloud Drive Plugin Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

