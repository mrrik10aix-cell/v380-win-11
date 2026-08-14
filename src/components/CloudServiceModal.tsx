import React, { useState } from 'react';
import { Device, CloudSyncSettings } from '../types';
import { CloudSyncStatusBadge } from './CloudSyncStatusBadge';
import {
  Cloud,
  HardDrive,
  CheckCircle2,
  RefreshCcw,
  ExternalLink,
  ShieldCheck,
  Folder,
  Sliders,
  Check,
  X,
  UploadCloud,
  Smartphone,
  Wifi,
  FileVideo,
  FileImage,
  Layers,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Database,
  Lock
} from 'lucide-react';

interface CloudServiceModalProps {
  devices: Device[];
  isOpen: boolean;
  onClose: () => void;
  syncSettings: CloudSyncSettings;
  onUpdateSyncSettings: (settings: CloudSyncSettings) => void;
  onUpdateDevice: (deviceId: string, updated: Partial<Device>) => void;
}

export const CloudServiceModal: React.FC<CloudServiceModalProps> = ({
  devices,
  isOpen,
  onClose,
  syncSettings,
  onUpdateSyncSettings,
  onUpdateDevice,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<'google_drive' | 'onedrive'>(
    syncSettings.activeDefaultProvider || 'google_drive'
  );
  const [isSyncingTest, setIsSyncingTest] = useState<boolean>(false);
  const [testSyncResult, setTestSyncResult] = useState<{
    success: boolean;
    provider: string;
    uploadedFiles: string[];
    time: string;
    targetFolder: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'provider' | 'cameras' | 'logs'>('provider');

  // Simulated Sync logs
  const [syncLogs, setSyncLogs] = useState<Array<{
    id: string;
    timestamp: string;
    cameraName: string;
    provider: 'Google Drive' | 'OneDrive';
    fileName: string;
    sizeMB: number;
    status: 'success' | 'uploading';
  }>>([
    {
      id: 'log-1',
      timestamp: '2 mins ago',
      cameraName: devices[0]?.name || 'Living Room ICSee',
      provider: 'Google Drive',
      fileName: 'MOTION_ALARM_20260814_104218.mp4',
      sizeMB: 3.4,
      status: 'success',
    },
    {
      id: 'log-2',
      timestamp: '14 mins ago',
      cameraName: devices[1]?.name || 'Front Porch ICSee',
      provider: 'OneDrive',
      fileName: 'HUMAN_DETECT_20260814_103005.jpg',
      sizeMB: 0.8,
      status: 'success',
    },
  ]);

  if (!isOpen) return null;

  const currentProviderConfig =
    selectedProvider === 'google_drive' ? syncSettings.googleDrive : syncSettings.oneDrive;

  const handleToggleProvider = (prov: 'google_drive' | 'onedrive') => {
    setSelectedProvider(prov);
    onUpdateSyncSettings({
      ...syncSettings,
      activeDefaultProvider: prov,
    });
  };

  const handleTestCloudSync = () => {
    setIsSyncingTest(true);
    setTestSyncResult(null);

    setTimeout(() => {
      const activeDevName = devices[0]?.name || 'CCTV Camera 01';
      const providerName = selectedProvider === 'google_drive' ? 'Google Drive' : 'Microsoft OneDrive';
      const folder =
        selectedProvider === 'google_drive'
          ? syncSettings.googleDrive.targetFolder
          : syncSettings.oneDrive.targetFolder;
      const newFile1 = `ALARM_CLIP_${Date.now().toString().slice(-4)}.mp4 (3.2 MB)`;
      const newFile2 = `SNAPSHOT_HD_${Date.now().toString().slice(-4)}.jpg (0.9 MB)`;

      setIsSyncingTest(false);
      setTestSyncResult({
        success: true,
        provider: providerName,
        uploadedFiles: [newFile1, newFile2],
        time: new Date().toLocaleTimeString(),
        targetFolder: folder,
      });

      // Append to logs
      setSyncLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: 'Just now',
          cameraName: activeDevName,
          provider: providerName as any,
          fileName: newFile1,
          sizeMB: 3.2,
          status: 'success',
        },
        ...prev,
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-3xl w-full p-5 sm:p-6 text-zinc-100 shadow-2xl relative overflow-hidden flex flex-col gap-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shrink-0">
            <UploadCloud className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-zinc-100">Personal Cloud Storage Sync</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold font-mono">
                NO SUBSCRIPTION REQUIRED
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sync security alarm clips, snapshots, and recordings directly to your personal Google Drive or Microsoft OneDrive.
            </p>
          </div>
        </div>

        {/* Zero-Subscription Guarantee Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">Free Personal Cloud Backup (BYOS - Bring Your Own Storage)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                100% FREE
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-1 leading-relaxed">
              Paid proprietary subscriptions have been replaced with direct personal cloud integration. All motion alarms and snapshots upload automatically to your personal cloud folders without recurring fees.
            </p>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-800 pb-1">
          <button
            onClick={() => setActiveTab('provider')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'provider'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Cloud Accounts & Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('cameras')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cameras'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Camera Sync Rules ({devices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>Recent Upload Logs ({syncLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: CLOUD PROVIDERS & ACCOUNT CONFIG */}
        {activeTab === 'provider' && (
          <div className="flex flex-col gap-4">
            {/* Storage Provider Selection Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Google Drive Option */}
              <button
                onClick={() => handleToggleProvider('google_drive')}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${
                  selectedProvider === 'google_drive'
                    ? 'bg-emerald-950/20 border-emerald-500 text-zinc-100 ring-2 ring-emerald-500/20'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-zinc-100">Google Drive</p>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                        GOOGLE CLOUD
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {syncSettings.googleDrive.connected ? syncSettings.googleDrive.accountEmail : 'Not Connected'}
                    </p>
                  </div>
                </div>
                {selectedProvider === 'google_drive' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              </button>

              {/* Microsoft OneDrive Option */}
              <button
                onClick={() => handleToggleProvider('onedrive')}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${
                  selectedProvider === 'onedrive'
                    ? 'bg-blue-950/20 border-blue-500 text-zinc-100 ring-2 ring-blue-500/20'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-zinc-100">Microsoft OneDrive</p>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono font-bold">
                        MICROSOFT 365
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {syncSettings.oneDrive.connected ? syncSettings.oneDrive.accountEmail : 'Not Connected'}
                    </p>
                  </div>
                </div>
                {selectedProvider === 'onedrive' && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
              </button>
            </div>

            {/* Provider Configuration Details */}
            {selectedProvider === 'google_drive' && (
              <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-4 text-xs">
                {/* Account details & Quota */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div>
                      <p className="font-bold text-zinc-100">Connected: {syncSettings.googleDrive.accountEmail}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">OAuth 2.0 (drive.file scope authorized)</p>
                    </div>
                  </div>

                  {/* Quota Bar */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                        <span>Personal Drive Quota:</span>
                        <span className="text-zinc-200 font-bold">
                          {syncSettings.googleDrive.quotaUsedGB} GB / {syncSettings.googleDrive.quotaTotalGB} GB
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{
                            width: `${(syncSettings.googleDrive.quotaUsedGB / syncSettings.googleDrive.quotaTotalGB) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Directory & Upload Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-300 font-medium text-xs flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-amber-400" />
                      <span>Destination Google Drive Folder:</span>
                    </label>
                    <input
                      type="text"
                      value={syncSettings.googleDrive.targetFolder}
                      onChange={(e) =>
                        onUpdateSyncSettings({
                          ...syncSettings,
                          googleDrive: {
                            ...syncSettings.googleDrive,
                            targetFolder: e.target.value,
                          },
                        })
                      }
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-300 font-medium text-xs flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                      <span>Automatic Motion Alarm Sync:</span>
                    </label>
                    <button
                      onClick={() =>
                        onUpdateSyncSettings({
                          ...syncSettings,
                          googleDrive: {
                            ...syncSettings.googleDrive,
                            autoUploadAlarms: !syncSettings.googleDrive.autoUploadAlarms,
                          },
                        })
                      }
                      className={`px-3 py-2 rounded-lg font-bold text-xs border transition-colors flex items-center justify-between cursor-pointer ${
                        syncSettings.googleDrive.autoUploadAlarms
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <span>Upload on Motion Trigger</span>
                      <span>{syncSettings.googleDrive.autoUploadAlarms ? 'ENABLED' : 'PAUSED'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedProvider === 'onedrive' && (
              <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-4 text-xs">
                {/* Account details & Quota */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                    <div>
                      <p className="font-bold text-zinc-100">Connected: {syncSettings.oneDrive.accountEmail}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">Microsoft Graph API (Files.ReadWrite authorized)</p>
                    </div>
                  </div>

                  {/* Quota Bar */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                        <span>OneDrive Free Storage:</span>
                        <span className="text-zinc-200 font-bold">
                          {syncSettings.oneDrive.quotaUsedGB} GB / {syncSettings.oneDrive.quotaTotalGB} GB
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{
                            width: `${(syncSettings.oneDrive.quotaUsedGB / syncSettings.oneDrive.quotaTotalGB) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Directory & Upload Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-300 font-medium text-xs flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-blue-400" />
                      <span>Destination OneDrive Folder:</span>
                    </label>
                    <input
                      type="text"
                      value={syncSettings.oneDrive.targetFolder}
                      onChange={(e) =>
                        onUpdateSyncSettings({
                          ...syncSettings,
                          oneDrive: {
                            ...syncSettings.oneDrive,
                            targetFolder: e.target.value,
                          },
                        })
                      }
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-300 font-medium text-xs flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                      <span>Automatic Motion Alarm Sync:</span>
                    </label>
                    <button
                      onClick={() =>
                        onUpdateSyncSettings({
                          ...syncSettings,
                          oneDrive: {
                            ...syncSettings.oneDrive,
                            autoUploadAlarms: !syncSettings.oneDrive.autoUploadAlarms,
                          },
                        })
                      }
                      className={`px-3 py-2 rounded-lg font-bold text-xs border transition-colors flex items-center justify-between cursor-pointer ${
                        syncSettings.oneDrive.autoUploadAlarms
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <span>Upload on Motion Trigger</span>
                      <span>{syncSettings.oneDrive.autoUploadAlarms ? 'ENABLED' : 'PAUSED'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Global Sync Preferences */}
            <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-3 text-xs">
              <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Upload Quality & Bandwidth Preferences</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-200">Sync Video Quality</p>
                    <p className="text-[10px] text-zinc-400">Stream resolution sent to cloud drive</p>
                  </div>
                  <select
                    value={syncSettings.syncResolution}
                    onChange={(e) =>
                      onUpdateSyncSettings({
                        ...syncSettings,
                        syncResolution: e.target.value as any,
                      })
                    }
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-blue-400 font-mono font-bold outline-none cursor-pointer"
                  >
                    <option value="original">Original 4K / HD</option>
                    <option value="fhd">FHD (1080p Balanced)</option>
                    <option value="hd">HD (720p Saver)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-200">Wi-Fi Only Sync</p>
                    <p className="text-[10px] text-zinc-400">Prevent cellular data consumption</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={syncSettings.wifiOnlySync}
                    onChange={(e) =>
                      onUpdateSyncSettings({
                        ...syncSettings,
                        wifiOnlySync: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Test Sync Trigger Section */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                    <RefreshCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Cloud Drive Upload Test</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Test connection and upload a sample security snapshot & 10s video clip to {selectedProvider === 'google_drive' ? 'Google Drive' : 'OneDrive'}.
                  </p>
                </div>

                <button
                  onClick={handleTestCloudSync}
                  disabled={isSyncingTest}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isSyncingTest ? 'animate-spin' : ''}`} />
                  <span>{isSyncingTest ? 'Uploading to Drive...' : 'Run Test Sync Now'}</span>
                </button>
              </div>

              {testSyncResult && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex flex-col gap-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Sync Successful to {testSyncResult.provider}!</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{testSyncResult.time}</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 font-mono">
                    Target: {testSyncResult.targetFolder}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {testSyncResult.uploadedFiles.map((file, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-900/40 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] text-emerald-300 font-mono flex items-center gap-1"
                      >
                        {file.includes('.mp4') ? <FileVideo className="w-3 h-3 text-emerald-400" /> : <FileImage className="w-3 h-3 text-emerald-400" />}
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CAMERAS SYNC ASSIGNMENTS */}
        {activeTab === 'cameras' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-400">
              Configure which cameras mirror their video alarms directly to your personal cloud drive:
            </p>

            <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
              {devices.length === 0 ? (
                <div className="p-8 text-center bg-[#09090b] rounded-xl border border-zinc-800">
                  <p className="text-xs text-zinc-400">No cameras connected yet.</p>
                </div>
              ) : (
                devices.map((device) => {
                  const isSyncEnabled = device.storage?.cloudSyncActive ?? true;
                  const currentDevProvider = device.storage?.cloudProvider ?? 'Google_Drive';

                  return (
                    <div
                      key={device.id}
                      className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <CloudSyncStatusBadge device={device} size="lg" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-zinc-100">{device.name}</h4>
                            <span className="text-[9px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded font-mono">
                              {device.model}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            Last synced: {device.storage?.lastSyncTime || 'Active'} • SD Card: {device.storage?.sdCardUsedGB || 24}GB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Target Provider Selector */}
                        <select
                          value={currentDevProvider}
                          onChange={(e) =>
                            onUpdateDevice(device.id, {
                              storage: {
                                ...device.storage,
                                cloudProvider: e.target.value as any,
                              },
                            })
                          }
                          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1 outline-none font-mono cursor-pointer"
                        >
                          <option value="Google_Drive">Google Drive</option>
                          <option value="OneDrive">OneDrive</option>
                          <option value="None">Disabled</option>
                        </select>

                        {/* Enable/Disable Toggle */}
                        <button
                          onClick={() =>
                            onUpdateDevice(device.id, {
                              storage: {
                                ...device.storage,
                                cloudSyncActive: !isSyncEnabled,
                              },
                            })
                          }
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            isSyncEnabled
                              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {isSyncEnabled ? 'SYNC ON' : 'PAUSED'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD LOGS */}
        {activeTab === 'logs' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Security Footage Files Automatically Synced to Cloud:</span>
              <span className="text-[10px] text-zinc-500 font-mono">Zero Subscription Fees</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto">
              {syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#09090b] border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                      {log.fileName.includes('.mp4') ? (
                        <FileVideo className="w-4 h-4 text-blue-400" />
                      ) : (
                        <FileImage className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200">{log.fileName}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {log.provider}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        {log.cameraName} • {log.sizeMB} MB • {log.timestamp}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    ✓ SYNCED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={onClose}
            className="flex-1 max-w-xs py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Cloud Drive Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
