import React, { useState } from 'react';
import { Device, PresetPosition, StreamQuality, NightVisionMode } from '../types';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Camera,
  Video,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Compass,
  Sliders,
  Maximize2,
  Grid,
  Eye,
  EyeOff
} from 'lucide-react';

interface CameraControlsProps {
  device?: Device;
  onUpdateDevice: (updated: Partial<Device>) => void;
  onTakeSnapshot: () => void;
  onToggleRecord: () => void;
  isRecording: boolean;
  recordingTimeSec: number;
  onOpenDetectionZone: () => void;
  onOpenAiReport: () => void;
  onOpenShareModal: () => void;
  onOpenDeviceSettings: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  device,
  onUpdateDevice,
  onTakeSnapshot,
  onToggleRecord,
  isRecording,
  recordingTimeSec,
  onOpenDetectionZone,
  onOpenAiReport,
  onOpenShareModal,
  onOpenDeviceSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'ptz' | 'presets' | 'settings'>('ptz');

  if (!device) return null;

  // PTZ Nudge
  const handleNudge = (dPan: number, dTilt: number) => {
    let newPan = (device.pan + dPan) % 360;
    if (newPan < 0) newPan += 360;
    let newTilt = Math.max(-80, Math.min(80, device.tilt + dTilt));
    onUpdateDevice({ pan: Math.round(newPan), tilt: Math.round(newTilt) });
  };

  // Move to Preset Position
  const handleSelectPreset = (preset: PresetPosition) => {
    onUpdateDevice({ pan: preset.pan, tilt: preset.tilt });
  };

  // Toggle Talkback Intercom
  const handleToggleTalkback = () => {
    onUpdateDevice({ isTalkbackActive: !device.isTalkbackActive });
  };

  // Toggle Siren
  const handleToggleSiren = () => {
    onUpdateDevice({ isSirenOn: !device.isSirenOn });
  };

  // Toggle Spotlight
  const handleToggleLight = () => {
    onUpdateDevice({ isLightOn: !device.isLightOn });
  };

  // Toggle Privacy Mode (turns off lens and microphone while keeping device registered)
  const handleTogglePrivacyMode = () => {
    const nextPrivacy = !device.isPrivacyMode;
    onUpdateDevice({
      isPrivacyMode: nextPrivacy,
      ...(nextPrivacy ? { isMuted: true, isTalkbackActive: false, isLightOn: false, isSirenOn: false } : {}),
    });
  };

  // Toggle Night Vision
  const cycleNightVision = () => {
    const modes: NightVisionMode[] = ['smart', 'fullColor', 'infrared', 'auto'];
    const nextIndex = (modes.indexOf(device.nightVisionMode) + 1) % modes.length;
    const nextMode = modes[nextIndex];
    onUpdateDevice({
      nightVisionMode: nextMode,
      isNightVision: true,
    });
  };

  // Format recording time HH:MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow-xl text-zinc-100 flex flex-col gap-4">
      {/* Top Action Ribbon (Record Timer, Quality, Audio, AI Guard) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#09090b] p-2.5 rounded-xl border border-zinc-800">
        {/* Stream Quality Selector */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          {(['SD', 'HD', 'FHD', '4K'] as StreamQuality[]).map((q) => (
            <button
              key={q}
              onClick={() => onUpdateDevice({ quality: q })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                device.quality === q
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Mute Audio Toggle */}
        <button
          onClick={() => onUpdateDevice({ isMuted: !device.isMuted })}
          className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-medium ${
            device.isMuted
              ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}
        >
          {device.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{device.isMuted ? 'Muted' : 'Audio On'}</span>
        </button>

        {/* AI Guard Summary Button */}
        <button
          onClick={onOpenAiReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-900/20 transition-all"
        >
          <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
          <span>Gemini AI Guard</span>
        </button>

        {/* Recording Timer Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-lg text-xs font-mono font-bold animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>REC {formatTime(recordingTimeSec)}</span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons (Snapshot, Record, Intercom, Spotlight, Siren, Privacy Mode) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
        {/* Snapshot */}
        <button
          onClick={onTakeSnapshot}
          disabled={device.isPrivacyMode}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group ${
            device.isPrivacyMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-800 hover:bg-zinc-700 active:scale-95 border-zinc-700 text-zinc-300'
          }`}
        >
          <Camera className={`w-5 h-5 mb-1 ${device.isPrivacyMode ? 'text-zinc-600' : 'text-blue-400 group-hover:scale-110 transition-transform'}`} />
          <span className="text-[11px] font-medium">Snapshot</span>
        </button>

        {/* Manual Record */}
        <button
          onClick={onToggleRecord}
          disabled={device.isPrivacyMode}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group ${
            device.isPrivacyMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : isRecording
              ? 'bg-rose-600/20 text-rose-300 border-rose-500 animate-pulse active:scale-95'
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 active:scale-95'
          }`}
        >
          <Video className={`w-5 h-5 mb-1 ${device.isPrivacyMode ? 'text-zinc-600' : isRecording ? 'text-rose-500' : 'text-zinc-300'}`} />
          <span className="text-[11px] font-medium">{isRecording ? 'Stop Rec' : 'Record'}</span>
        </button>

        {/* Intercom Talkback */}
        <button
          onClick={handleToggleTalkback}
          disabled={device.isPrivacyMode}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group ${
            device.isPrivacyMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : device.isTalkbackActive
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/40 active:scale-95'
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 active:scale-95'
          }`}
        >
          {device.isTalkbackActive ? (
            <Mic className="w-5 h-5 text-emerald-400 mb-1 animate-bounce" />
          ) : (
            <MicOff className={`w-5 h-5 mb-1 ${device.isPrivacyMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
          )}
          <span className="text-[11px] font-medium">{device.isTalkbackActive ? 'Talking...' : 'Intercom'}</span>
        </button>

        {/* Spotlight */}
        <button
          onClick={handleToggleLight}
          disabled={device.isPrivacyMode}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group ${
            device.isPrivacyMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : device.isLightOn
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20 active:scale-95'
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 active:scale-95'
          }`}
        >
          <Sun className={`w-5 h-5 mb-1 ${device.isPrivacyMode ? 'text-zinc-600' : device.isLightOn ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span className="text-[11px] font-medium">{device.isLightOn ? 'Spotlight On' : 'Light'}</span>
        </button>

        {/* Alarm Siren */}
        <button
          onClick={handleToggleSiren}
          disabled={device.isPrivacyMode}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all group ${
            device.isPrivacyMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              : device.isSirenOn
              ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/40 animate-bounce active:scale-95'
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 active:scale-95'
          }`}
        >
          <ShieldAlert className={`w-5 h-5 mb-1 ${device.isPrivacyMode ? 'text-zinc-600' : device.isSirenOn ? 'text-white' : 'text-rose-400'}`} />
          <span className="text-[11px] font-medium">{device.isSirenOn ? 'Siren Active' : 'Siren'}</span>
        </button>

        {/* Privacy Mode Toggle */}
        <button
          onClick={handleTogglePrivacyMode}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 group ${
            device.isPrivacyMode
              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/50'
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
          }`}
        >
          {device.isPrivacyMode ? (
            <EyeOff className="w-5 h-5 text-white mb-1 animate-pulse" />
          ) : (
            <Eye className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 mb-1 transition-colors" />
          )}
          <span className="text-[11px] font-medium">{device.isPrivacyMode ? 'Privacy On' : 'Privacy'}</span>
        </button>
      </div>

      {/* Privacy Mode Active Alert Banner */}
      {device.isPrivacyMode && (
        <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-blue-300 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-zinc-100 flex items-center gap-2">
                <span>Privacy Mode Active</span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                  Registered & Online
                </span>
              </p>
              <p className="text-[11px] text-zinc-400">Lens motor turned off & audio microphone suspended while remaining online.</p>
            </div>
          </div>
          <button
            onClick={handleTogglePrivacyMode}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Eye className="w-3.5 h-3.5" /> Resume Camera
          </button>
        </div>
      )}

      {/* Voice Talkback Frequency Wave Visualizer Bar when Active */}
      {device.isTalkbackActive && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">Voice Talkback Live... Speak clearly into microphone</span>
          </div>
          {/* Animated audio wave bars */}
          <div className="flex items-center gap-1 h-4">
            <div className="w-1 bg-emerald-400 h-2 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 bg-emerald-400 h-4 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 bg-emerald-400 h-3 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1 bg-emerald-400 h-4 animate-bounce" style={{ animationDelay: '450ms' }}></div>
          </div>
        </div>
      )}

      {/* Control Tabs: Joystick PTZ, Presets, Settings */}
      <div className="flex items-center border-b border-zinc-800 gap-4 text-xs font-semibold text-zinc-400 pt-2">
        <button
          onClick={() => setActiveTab('ptz')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'ptz' ? 'border-blue-500 text-blue-400' : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>PTZ Steering</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'presets' ? 'border-blue-500 text-blue-400' : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Preset Locations ({device.presetPositions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'border-blue-500 text-blue-400' : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Quick Adjustments</span>
        </button>
      </div>

      {/* Tab Content 1: PTZ Joystick */}
      {activeTab === 'ptz' && (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          {/* PTZ Steering Disk Joystick */}
          <div className="relative w-44 h-44 rounded-full bg-[#09090b] border-2 border-zinc-800 flex items-center justify-center shadow-inner">
            {/* Center Cruise Button */}
            <button
              onClick={() => handleNudge(180, 0)}
              title="360° Cruise Sweep"
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-90 border border-blue-500 flex flex-col items-center justify-center text-white shadow-lg shadow-blue-900/40 transition-all z-10"
            >
              <RotateCcw className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-bold tracking-tight">CRUISE</span>
            </button>

            {/* Up Direction */}
            <button
              onClick={() => handleNudge(0, 15)}
              className="absolute top-2 left-1/2 -translate-x-1/2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 active:scale-90 transition-all"
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            {/* Down Direction */}
            <button
              onClick={() => handleNudge(0, -15)}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 active:scale-90 transition-all"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            {/* Left Direction */}
            <button
              onClick={() => handleNudge(-20, 0)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 active:scale-90 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Direction */}
            <button
              onClick={() => handleNudge(20, 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 active:scale-90 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Current Coordinates & Zoom Slider */}
          <div className="flex flex-col gap-3 flex-1 min-w-[200px] bg-[#09090b] p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Pan Angle:</span>
              <span className="font-mono text-blue-400 font-bold">{device.pan}°</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Tilt Angle:</span>
              <span className="font-mono text-blue-400 font-bold">{device.tilt}°</span>
            </div>

            {/* Digital Zoom Slider */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Digital Zoom</span>
                <span className="font-mono text-blue-400 font-bold">{device.zoom}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={device.zoom}
                onChange={(e) => onUpdateDevice({ zoom: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Presets */}
      {activeTab === 'presets' && (
        <div className="flex flex-wrap gap-2 py-2">
          {device.presetPositions.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>{preset.name}</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                ({preset.pan}°, {preset.tilt}°)
              </span>
            </button>
          ))}

          <button
            onClick={() => {
              const name = prompt('Enter name for current position preset:');
              if (name) {
                const newPreset: PresetPosition = {
                  id: `p-${Date.now()}`,
                  name,
                  pan: device.pan,
                  tilt: device.tilt,
                };
                onUpdateDevice({ presetPositions: [...device.presetPositions, newPreset] });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-zinc-700 hover:border-blue-500/50 text-zinc-400 hover:text-blue-400 text-xs transition-all"
          >
            + Add Current Position
          </button>
        </div>
      )}

      {/* Tab Content 3: Quick Adjustments */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          {/* Smart Night Vision & Sensor Control Center */}
          <div className="sm:col-span-2 bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg border ${
                    device.nightVisionMode === 'smart'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                    <span>Night Vision Sensor Mode</span>
                    {device.nightVisionMode === 'smart' && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                        SMART ACTIVE
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {device.nightVisionMode === 'smart'
                      ? 'Switches between IR and Color night mode based on ambient light level (<25 Lux = IR)'
                      : device.nightVisionMode === 'fullColor'
                      ? 'Full-color night mode with spotlight enhancement'
                      : device.nightVisionMode === 'infrared'
                      ? 'Invisible 850nm IR array for stealth monochrome'
                      : 'Standard daylight auto sensor'}
                  </p>
                </div>
              </div>

              {/* Mode Selector Buttons */}
              <div className="flex flex-wrap items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                {[
                  { id: 'smart', label: 'Smart Night' },
                  { id: 'fullColor', label: 'Full Color' },
                  { id: 'infrared', label: 'Infrared IR' },
                  { id: 'auto', label: 'Auto' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      onUpdateDevice({
                        nightVisionMode: m.id as NightVisionMode,
                        isNightVision: true,
                      })
                    }
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      device.nightVisionMode === m.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Night Vision Sensor Status & Ambient Light Lux Simulator */}
            {(device.nightVisionMode === 'smart' || device.isNightVision) && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-medium">Ambient Light Sensor:</span>
                    <span className="font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      {device.ambientLux ?? 15} LUX
                    </span>
                  </div>

                  {/* Active Sensor State Indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">Current Sensor Output:</span>
                    {(device.ambientLux ?? 15) < 25 && !device.isLightOn ? (
                      <span className="text-[11px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Moon className="w-3 h-3 text-purple-400" /> Monochrome IR Mode (&lt;25 Lux)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sun className="w-3 h-3 text-blue-400" /> Full Color Night Sensor (&ge;25 Lux)
                      </span>
                    )}
                  </div>
                </div>

                {/* Ambient Light Level Slider (Lux) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Simulate Ambient Light Change (0 Lux = Pitch Dark, 100 Lux = Bright Light):</span>
                    <span className="font-mono text-zinc-300 font-semibold">{device.ambientLux ?? 15} Lux</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={device.ambientLux ?? 15}
                    onChange={(e) =>
                      onUpdateDevice({
                        ambientLux: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-blue-500 bg-zinc-800 rounded-lg h-1.5 cursor-pointer"
                  />
                  {/* Preset Lux Buttons */}
                  <div className="flex items-center justify-between text-[10px] gap-1 pt-1">
                    <button
                      onClick={() => onUpdateDevice({ ambientLux: 5 })}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-medium"
                    >
                      🌑 Pitch Dark (5 Lux)
                    </button>
                    <button
                      onClick={() => onUpdateDevice({ ambientLux: 20 })}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-medium"
                    >
                      🌆 Low Twilight (20 Lux)
                    </button>
                    <button
                      onClick={() => onUpdateDevice({ ambientLux: 45 })}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-medium"
                    >
                      💡 Porch Light (45 Lux)
                    </button>
                    <button
                      onClick={() => onUpdateDevice({ ambientLux: 85 })}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-medium"
                    >
                      ☀️ Bright Day (85 Lux)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Motion Tracking Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-zinc-800">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <div>
                <p className="font-semibold text-zinc-200">Motion Trajectory</p>
                <p className="text-[10px] text-zinc-400">
                  {device.isMotionTrackingEnabled ? 'Active Target Box' : 'Disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onUpdateDevice({ isMotionTrackingEnabled: !device.isMotionTrackingEnabled })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                device.isMotionTrackingEnabled
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {device.isMotionTrackingEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Detection Zone Mask Config */}
          <button
            onClick={onOpenDetectionZone}
            className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-xs">
              <Grid className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-semibold text-zinc-200">Motion Detection Zone</p>
                <p className="text-[10px] text-zinc-400">Configure sensitivity grid mask</p>
              </div>
            </div>
            <span className="text-xs text-blue-400 font-semibold">Edit Grid →</span>
          </button>

          {/* Device Settings */}
          <button
            onClick={onOpenDeviceSettings}
            className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-xs">
              <Sliders className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-semibold text-zinc-200">Device Hardware Settings</p>
                <p className="text-[10px] text-zinc-400">Wi-Fi, Firmware, Image Flip</p>
              </div>
            </div>
            <span className="text-xs text-blue-400 font-semibold">Manage →</span>
          </button>
        </div>
      )}
    </div>
  );
};
