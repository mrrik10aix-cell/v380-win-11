import React, { useState } from 'react';
import { Device, NightVisionMode } from '../types';
import { WifiSignalIcon } from './WifiSignalIcon';
import { Sliders, Wifi, HardDrive, RefreshCcw, Shield, X, Moon, RotateCcw, Check, Cpu, Radio, Cast, Layers, CpuIcon, CheckCircle2, Sparkles, EyeOff, Volume2, Smartphone } from 'lucide-react';

interface DeviceSettingsModalProps {
  device?: Device;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDevice: (updated: Partial<Device>) => void;
  onFormatSdCard: () => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  device,
  isOpen,
  onClose,
  onUpdateDevice,
  onFormatSdCard,
}) => {
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('high');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isCheckingFirmware, setIsCheckingFirmware] = useState<boolean>(false);
  const [isUpdatingFirmware, setIsUpdatingFirmware] = useState<boolean>(false);
  const [firmwareCheckDone, setFirmwareCheckDone] = useState<boolean>(false);
  const [firmwareUpdated, setFirmwareUpdated] = useState<boolean>(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);

  if (!isOpen || !device) return null;

  const latestVersions: Record<string, { version: string; releaseNotes: string }> = {
    Imou_Life: {
      version: 'v2.20.R05.IMOU',
      releaseNotes: 'IMOU Sense AI human/pet algorithm patch, active 110dB strobe response optimization & lower P2P latency.',
    },
    ICSee: {
      version: 'v5.08.R19.ICSEE',
      releaseNotes: 'Xiongmai NETIP v4.2 dual-lens frame stitching fix, humanoid cordon alarm precision & fast Wi-Fi reconnect.',
    },
    ICSee_Pro: {
      version: 'v5.08.R19.ICSEE',
      releaseNotes: '4K PTZ motor smooth tracking calibration, H.265+ cloud compression improvement.',
    },
    XMEye: {
      version: 'v4.08.R12.XM',
      releaseNotes: 'ONVIF Profile T compatibility update, RTSP stream authentication patch.',
    },
    V380_Pro: {
      version: 'v3.80.2026.09',
      releaseNotes: 'V380 Cloud SDK stability fix, low-light full color night vision enhancement.',
    },
  };

  const brandKey = device.appBrand ?? 'ICSee';
  const latestInfo = latestVersions[brandKey] || latestVersions.ICSee;
  const isUpToDate = device.firmwareVersion.includes('Latest') || device.firmwareVersion === latestInfo.version;

  const handleCheckFirmware = () => {
    setIsCheckingFirmware(true);
    setFirmwareCheckDone(false);
    setTimeout(() => {
      setIsCheckingFirmware(false);
      setFirmwareCheckDone(true);
    }, 1000);
  };

  const handleStartUpdate = () => {
    setIsUpdatingFirmware(true);
    setUpdateProgress(0);
    const interval = setInterval(() => {
      setUpdateProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpdatingFirmware(false);
          setFirmwareUpdated(true);
          onUpdateDevice({ firmwareVersion: `${latestInfo.version} (Latest)` });
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-zinc-100 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">"{device.name}" Settings</h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                {device.appBrand ?? 'ICSee'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">Model: {device.model} | IP: {device.ipAddress}</p>
          </div>
        </div>

        {/* Camera Display Name Input & Brand */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">Camera Name:</label>
            <span className="text-[10px] text-zinc-400 font-mono">Protocol: {device.protocol ?? 'NETIP_ICSee'}</span>
          </div>
          <input
            type="text"
            value={device.name}
            onChange={(e) => onUpdateDevice({ name: e.target.value })}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 font-medium"
          />
        </div>

        {/* IMOU Life AI & Deterrence Protocol Settings */}
        {(device.appBrand === 'Imou_Life' || device.imouSettings) && (
          <div className="bg-[#09090b] p-4 rounded-xl border border-orange-500/30 flex flex-col gap-3 shadow-lg shadow-orange-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold text-zinc-100">IMOU Life Sense AI & Protection Settings</h3>
              </div>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded font-mono font-bold">
                DAHUA IMOU P2P
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[10px] block">IMOU Device ID:</span>
                <span className="font-mono text-orange-300 font-bold text-xs">{device.imouSettings?.imouDeviceId ?? device.id}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                <span className="text-zinc-400 text-[10px] block">Personal Cloud Sync:</span>
                <span className="font-mono text-emerald-400 font-bold text-xs">
                  {device.storage?.cloudSyncActive ? 'Google Drive / OneDrive' : 'Paused'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
                <div>
                  <p className="font-semibold text-zinc-200">Smart AI Human & Pet Tracking</p>
                  <p className="text-[10px] text-zinc-400">IMOU Sense algorithm smooth auto-rotation following motion</p>
                </div>
                <input
                  type="checkbox"
                  checked={device.imouSettings?.smartTracking ?? true}
                  onChange={(e) =>
                    onUpdateDevice({
                      imouSettings: {
                        imouDeviceId: device.imouSettings?.imouDeviceId ?? 'imou-9921',
                        petDetection: true,
                        activeDeterrenceStrobe: true,
                        alarmSoundProfile: '110dB_Siren',
                        cloudPlan: 'Imou_Protect_30Day',
                        privacyMasking: false,
                        ...device.imouSettings,
                        smartTracking: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
                <div>
                  <p className="font-semibold text-zinc-200">Active Deterrence Strobe Light & Siren</p>
                  <p className="text-[10px] text-zinc-400">Flashes 110dB white spotlight and siren upon intruder detection</p>
                </div>
                <input
                  type="checkbox"
                  checked={device.imouSettings?.activeDeterrenceStrobe ?? true}
                  onChange={(e) =>
                    onUpdateDevice({
                      imouSettings: {
                        imouDeviceId: device.imouSettings?.imouDeviceId ?? 'imou-9921',
                        smartTracking: true,
                        petDetection: true,
                        alarmSoundProfile: '110dB_Siren',
                        cloudPlan: 'Imou_Protect_30Day',
                        privacyMasking: false,
                        ...device.imouSettings,
                        activeDeterrenceStrobe: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
                <span className="text-zinc-300 font-medium">IMOU Alarm Siren Tone:</span>
                <select
                  value={device.imouSettings?.alarmSoundProfile ?? '110dB_Siren'}
                  onChange={(e) =>
                    onUpdateDevice({
                      imouSettings: {
                        imouDeviceId: device.imouSettings?.imouDeviceId ?? 'imou-9921',
                        smartTracking: true,
                        petDetection: true,
                        activeDeterrenceStrobe: true,
                        cloudPlan: 'Imou_Protect_30Day',
                        privacyMasking: false,
                        ...device.imouSettings,
                        alarmSoundProfile: e.target.value as any,
                      },
                    })
                  }
                  className="bg-zinc-900 border border-zinc-800 text-orange-300 text-xs font-bold rounded-lg px-2.5 py-1 outline-none"
                >
                  <option value="110dB_Siren">110dB High Decibel Siren</option>
                  <option value="Dog_Bark">Guard Dog Barking Sound</option>
                  <option value="Custom_Voice">Custom Audio Greeting</option>
                  <option value="Mute">Mute (Visual Strobe Only)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ICSee / Xiongmai Protocol & Dual-Lens Settings */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-zinc-200">ICSee & Xiongmai Protocol Settings</h3>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-bold">
              NETIP v4.2
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-900 border border-zinc-800/80 p-2.5 rounded-lg">
              <span className="text-zinc-400 text-[10px] block">NETIP Command Port:</span>
              <span className="font-mono text-zinc-200 font-bold text-xs">{device.icseeSettings?.netipPort ?? 34567}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800/80 p-2.5 rounded-lg">
              <span className="text-zinc-400 text-[10px] block">RTSP Video Port:</span>
              <span className="font-mono text-zinc-200 font-bold text-xs">{device.icseeSettings?.rtspPort ?? 554}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs">
              <div>
                <p className="font-semibold text-zinc-200">ICSee Dual-Lens View Sync</p>
                <p className="text-[10px] text-zinc-400">Synchronizes fixed wide-angle lens with PTZ zoom lens</p>
              </div>
              <input
                type="checkbox"
                checked={device.icseeSettings?.dualLensMode ?? true}
                onChange={(e) =>
                  onUpdateDevice({
                    icseeSettings: {
                      netipPort: 34567,
                      rtspPort: 554,
                      humanoidTracking: true,
                      cordonAlarm: true,
                      cloudProvider: 'ICSee_Cloud',
                      ...device.icseeSettings,
                      dualLensMode: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs">
              <div>
                <p className="font-semibold text-zinc-200">ICSee Humanoid Perimeter Cordon Alarm</p>
                <p className="text-[10px] text-zinc-400">Triggers siren when human crosses virtual boundary line</p>
              </div>
              <input
                type="checkbox"
                checked={device.icseeSettings?.cordonAlarm ?? true}
                onChange={(e) =>
                  onUpdateDevice({
                    icseeSettings: {
                      netipPort: 34567,
                      rtspPort: 554,
                      dualLensMode: true,
                      humanoidTracking: true,
                      cloudProvider: 'ICSee_Cloud',
                      ...device.icseeSettings,
                      cordonAlarm: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Google Home Ecosystem Integration Section */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cast className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-zinc-200">Google Home Smart Integration</h3>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
              NEST HUB READY
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <div>
              <p className="font-bold text-zinc-200 flex items-center gap-1.5">
                <span>Google Smart Home Sync</span>
                {device.googleHome?.linked && (
                  <span className="text-[10px] text-emerald-400 font-mono font-medium">✓ LINKED</span>
                )}
              </p>
              <p className="text-[10px] text-zinc-400">Stream on Nest Hub Max and execute voice controls</p>
            </div>
            <input
              type="checkbox"
              checked={device.googleHome?.linked ?? true}
              onChange={(e) =>
                onUpdateDevice({
                  googleHome: {
                    googleDeviceId: `gh-cam-${device.id}`,
                    voiceCommandsEnabled: true,
                    deviceType: 'camera',
                    ...device.googleHome,
                    linked: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400">Google Home Device Category:</span>
            <select
              value={device.googleHome?.deviceType ?? 'camera'}
              onChange={(e) =>
                onUpdateDevice({
                  googleHome: {
                    linked: true,
                    googleDeviceId: `gh-cam-${device.id}`,
                    voiceCommandsEnabled: true,
                    ...device.googleHome,
                    deviceType: e.target.value as any,
                  },
                })
              }
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 outline-none"
            >
              <option value="camera">Security Camera</option>
              <option value="doorbell">Smart Video Doorbell</option>
              <option value="floodlight">Floodlight Spotlight Cam</option>
            </select>
          </div>
        </div>

        {/* Wi-Fi & Network Performance Section */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiSignalIcon
              signalStrength={device.signalStrength}
              pingMs={device.pingMs}
              status={device.status}
              showLabel={true}
              showPercentage={true}
              size="md"
              variant="full"
            />
            <div>
              <p className="text-xs font-bold text-zinc-200">Wi-Fi Connection</p>
              <p className="text-[11px] text-zinc-400 font-mono">{device.ipAddress} • {device.macAddress}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const newPing = Math.max(10, Math.round((device.pingMs || 25) + (Math.random() * 14 - 7)));
              onUpdateDevice({ pingMs: newPing });
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1 shrink-0"
          >
            <Radio className="w-3.5 h-3.5" /> Test Latency
          </button>
        </div>

        {/* Night Vision Sensor Mode Option */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-zinc-200">Night Vision Sensor Mode</span>
            </div>
            <span className="text-blue-400 font-mono font-bold capitalize">{device.nightVisionMode}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'smart', label: 'Smart Night', desc: 'Auto IR/Color by Lux' },
              { id: 'fullColor', label: 'Full Color', desc: 'Dual White LED' },
              { id: 'infrared', label: 'Infrared IR', desc: 'Monochrome 850nm' },
              { id: 'auto', label: 'Standard Auto', desc: 'Default Switch' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() =>
                  onUpdateDevice({
                    nightVisionMode: m.id as NightVisionMode,
                    isNightVision: true,
                  })
                }
                className={`p-2 rounded-xl text-left font-medium border transition-all ${
                  device.nightVisionMode === m.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="font-bold text-xs">{m.label}</div>
                <div className="text-[10px] opacity-80 font-normal leading-tight mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Motion Sensitivity Slider */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200">Motion Detection Sensitivity</span>
            <span className="text-blue-400 font-mono font-bold capitalize">{sensitivity} Level</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {(['low', 'medium', 'high'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSensitivity(lvl)}
                className={`py-2 rounded-xl font-semibold capitalize border transition-all ${
                  sensitivity === lvl
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Image Mirroring / Flip Ceiling Mount */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-200">Ceiling Mount Invert Stream</h3>
            <p className="text-[11px] text-zinc-400">Rotate image 180° if camera is upside down</p>
          </div>
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isFlipped
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            {isFlipped ? 'Flipped 180°' : 'Normal'}
          </button>
        </div>

        {/* SD Card Storage Management */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-zinc-200">MicroSD Card Storage</span>
            </div>
            <span className="text-zinc-400 font-mono">
              {device.storage.sdCardUsedGB} GB / {device.storage.sdCardSizeGB} GB
            </span>
          </div>

          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${(device.storage.sdCardUsedGB / device.storage.sdCardSizeGB) * 100}%` }}
            ></div>
          </div>

          <button
            onClick={onFormatSdCard}
            className="w-fit px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            Format MicroSD Card
          </button>
        </div>

        {/* Firmware Version & OTA Update */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div>
                <p className="font-bold text-zinc-200">Camera Firmware & OTA Updates</p>
                <p className="text-[11px] font-mono text-zinc-400">
                  Current: <span className="text-zinc-200 font-semibold">{device.firmwareVersion}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckFirmware}
              disabled={isCheckingFirmware || isUpdatingFirmware}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-500/30 font-semibold transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isCheckingFirmware ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isCheckingFirmware ? 'Checking...' : 'Check for Updates'}</span>
            </button>
          </div>

          {firmwareCheckDone && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex flex-col gap-2.5 animate-in fade-in duration-200">
              {isUpToDate || firmwareUpdated ? (
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Your {device.appBrand ?? 'ICSee'} camera firmware is fully up to date ({device.firmwareVersion}).</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-300">New Firmware Update Available! ({latestInfo.version})</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      OTA READY
                    </span>
                  </div>

                  <div className="bg-black/40 border border-zinc-800/80 rounded-lg p-2.5 text-[11px] text-zinc-300 font-sans">
                    <p className="font-bold text-zinc-200 mb-0.5">Release Notes:</p>
                    <p className="text-zinc-400 leading-relaxed">{latestInfo.releaseNotes}</p>
                  </div>

                  {isUpdatingFirmware ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-purple-300 animate-pulse">Flashing OTA Package...</span>
                        <span className="text-zinc-200 font-bold">{updateProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${updateProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartUpdate}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Download & Flash OTA Firmware ({latestInfo.version})</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
};
