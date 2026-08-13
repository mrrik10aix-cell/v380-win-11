import React, { useState, useEffect } from 'react';
import { AppTab, Device, AlarmEvent, AlbumItem, CloudPlan, PresetPosition } from './types';
import {
  INITIAL_DEVICES,
  INITIAL_EVENTS,
  INITIAL_ALBUM,
  CLOUD_PLANS,
  INITIAL_FACE_LIBRARY,
  SAMPLE_DEMO_DEVICES,
  SAMPLE_DEMO_EVENTS,
  SAMPLE_DEMO_ALBUM,
  SAMPLE_DEMO_FACE_LIBRARY
} from './data/mockData';
import { FaceProfile } from './types';
import { Header } from './components/Header';
import { CameraStreamCanvas } from './components/CameraStreamCanvas';
import { CameraControls } from './components/CameraControls';
import { MultiViewGrid } from './components/MultiViewGrid';
import { TimelinePlayback } from './components/TimelinePlayback';
import { AlarmCenter } from './components/AlarmCenter';
import { CloudServiceModal } from './components/CloudServiceModal';
import { DeviceShareModal } from './components/DeviceShareModal';
import { AddDeviceWizard } from './components/AddDeviceWizard';
import { DetectionZoneEditor } from './components/DetectionZoneEditor';
import { AlbumGallery } from './components/AlbumGallery';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { AiSecurityReportModal } from './components/AiSecurityReportModal';
import { GoogleHomeModal } from './components/GoogleHomeModal';
import { FaceLibraryModal } from './components/FaceLibraryModal';
import { Win11InstallModal } from './components/Win11InstallModal';
import { WifiSignalIcon } from './components/WifiSignalIcon';

import {
  Video,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Wifi,
  HardDrive,
  Users,
  Sliders,
  Play,
  RotateCcw,
  Share2,
  Lock,
  Grid,
  CheckCircle2,
  Clock,
  Plus,
  EyeOff,
  Trash2
} from 'lucide-react';

export default function App() {
  // Local storage persistence (defaults to empty since demo data was removed)
  const [devices, setDevices] = useState<Device[]>(() => {
    const isCleared = localStorage.getItem('v380_demo_cleared_v2');
    if (!isCleared) {
      localStorage.removeItem('v380_devices');
      localStorage.removeItem('v380_events');
      localStorage.removeItem('v380_album');
      localStorage.removeItem('v380_faces');
      localStorage.setItem('v380_demo_cleared_v2', 'true');
      return [];
    }
    const saved = localStorage.getItem('v380_devices');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<AlarmEvent[]>(() => {
    const isCleared = localStorage.getItem('v380_demo_cleared_v2');
    if (!isCleared) return [];
    const saved = localStorage.getItem('v380_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [album, setAlbum] = useState<AlbumItem[]>(() => {
    const isCleared = localStorage.getItem('v380_demo_cleared_v2');
    if (!isCleared) return [];
    const saved = localStorage.getItem('v380_album');
    return saved ? JSON.parse(saved) : [];
  });

  const [faces, setFaces] = useState<FaceProfile[]>(() => {
    const isCleared = localStorage.getItem('v380_demo_cleared_v2');
    if (!isCleared) return [];
    const saved = localStorage.getItem('v380_faces');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeDeviceId, setActiveDeviceId] = useState<string>(devices[0]?.id || '');
  const [activeTab, setActiveTab] = useState<AppTab>('devices');
  const [gridMode, setGridMode] = useState<'1' | '4' | '9'>('1');
  const [armMode, setArmMode] = useState<'away' | 'home' | 'sleep'>('away');

  // Clear / Reset demo data helper
  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all devices, alarm messages, and demo data?')) {
      setDevices([]);
      setEvents([]);
      setAlbum([]);
      setFaces([]);
      setActiveDeviceId('');
      localStorage.setItem('v380_devices', JSON.stringify([]));
      localStorage.setItem('v380_events', JSON.stringify([]));
      localStorage.setItem('v380_album', JSON.stringify([]));
      localStorage.setItem('v380_faces', JSON.stringify([]));
      localStorage.setItem('v380_demo_cleared_v2', 'true');
    }
  };

  const handleLoadDemoData = () => {
    setDevices(SAMPLE_DEMO_DEVICES);
    setEvents(SAMPLE_DEMO_EVENTS);
    setAlbum(SAMPLE_DEMO_ALBUM);
    setFaces(SAMPLE_DEMO_FACE_LIBRARY);
    setActiveDeviceId(SAMPLE_DEMO_DEVICES[0]?.id || '');
    localStorage.setItem('v380_demo_cleared_v2', 'true');
  };

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTimeSec, setRecordingTimeSec] = useState<number>(0);

  // Modals
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDetectionZoneOpen, setIsDetectionZoneOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isDeviceSettingsOpen, setIsDeviceSettingsOpen] = useState(false);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [isGoogleHomeOpen, setIsGoogleHomeOpen] = useState(false);
  const [isFaceLibraryOpen, setIsFaceLibraryOpen] = useState(false);
  const [isWin11InstallOpen, setIsWin11InstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [selectedEventForAi, setSelectedEventForAi] = useState<AlarmEvent | null>(null);
  const [enrollEventForFace, setEnrollEventForFace] = useState<AlarmEvent | null>(null);

  // Detect PWA installability & Standalone display mode
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerPwaInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted Windows 11 App installation');
        }
        setDeferredPrompt(null);
      });
    } else {
      setIsWin11InstallOpen(true);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('v380_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('v380_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('v380_album', JSON.stringify(album));
  }, [album]);

  useEffect(() => {
    localStorage.setItem('v380_faces', JSON.stringify(faces));
  }, [faces]);

  // Periodic network ping latency simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.status !== 'online') return d;
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2 ms fluctuation
          const basePing = d.pingMs || Math.max(12, Math.round(200 - d.signalStrength * 1.8));
          const nextPing = Math.max(10, Math.min(300, basePing + delta));
          return { ...d, pingMs: nextPing };
        })
      );
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Recording timer tick
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTimeSec((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTimeSec(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Active Device Object
  const activeDevice = devices.find((d) => d.id === activeDeviceId) || devices[0];

  // Update device helper
  const handleUpdateDevice = (updated: Partial<Device>) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === activeDeviceId ? { ...d, ...updated } : d))
    );
  };

  // Take Snapshot
  const handleTakeSnapshot = () => {
    if (!activeDevice) return;
    const dateNow = new Date();
    const dateStr = dateNow.toISOString().replace('T', ' ').slice(0, 19);

    const newPhoto: AlbumItem = {
      id: `alb-${Date.now()}`,
      deviceId: activeDevice.id,
      deviceName: activeDevice.name,
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      timestamp: dateStr,
      title: `Snapshot_${activeDevice.name.replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}.jpg`,
      fileSizeMB: 2.4,
    };

    setAlbum((prev) => [newPhoto, ...prev]);
    alert(`📸 Snapshot saved to My Album gallery! (${newPhoto.title})`);
  };

  // Toggle Manual Recording
  const handleToggleRecord = () => {
    if (isRecording) {
      // Save recorded video clip
      const dateNow = new Date();
      const dateStr = dateNow.toISOString().replace('T', ' ').slice(0, 19);

      const newVideo: AlbumItem = {
        id: `alb-${Date.now()}`,
        deviceId: activeDevice.id,
        deviceName: activeDevice.name,
        type: 'video',
        url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
        timestamp: dateStr,
        title: `Clip_${activeDevice.name.replace(/\s+/g, '_')}_${recordingTimeSec}s.mp4`,
        fileSizeMB: parseFloat((recordingTimeSec * 1.2).toFixed(1)),
      };

      setAlbum((prev) => [newVideo, ...prev]);
      setIsRecording(false);
      alert(`🎥 Video clip recorded (${recordingTimeSec}s) and saved to My Album!`);
    } else {
      setIsRecording(true);
    }
  };

  // Export clip from replay timeline
  const handleExportReplayClip = (title: string, durationSec: number) => {
    const newVideo: AlbumItem = {
      id: `alb-${Date.now()}`,
      deviceId: activeDevice.id,
      deviceName: activeDevice.name,
      type: 'video',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      title: `${title}.mp4`,
      fileSizeMB: 15.4,
    };
    setAlbum((prev) => [newVideo, ...prev]);
    alert(`💾 Cloud clip "${title}.mp4" exported successfully to My Album!`);
  };

  // Format SD Card
  const handleFormatSdCard = () => {
    if (confirm(`Format MicroSD Card for "${activeDevice.name}"? All local recordings will be erased.`)) {
      handleUpdateDevice({
        storage: {
          ...activeDevice.storage,
          sdCardUsedGB: 0.1,
        },
      });
      alert('MicroSD Card formatted cleanly.');
    }
  };

  // Face Library Handlers
  const handleAddFace = (newFace: FaceProfile) => {
    setFaces((prev) => [newFace, ...prev]);
  };

  const handleUpdateFace = (updatedFace: FaceProfile) => {
    setFaces((prev) => prev.map((f) => (f.id === updatedFace.id ? updatedFace : f)));
  };

  const handleDeleteFace = (id: string) => {
    setFaces((prev) => prev.filter((f) => f.id !== id));
  };

  const handleEnrollFromEvent = (
    event: AlarmEvent,
    name: string,
    role: FaceProfile['role'],
    priority: FaceProfile['alertPriority']
  ) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === event.id || (e.snapshotUrl && e.snapshotUrl === event.snapshotUrl)) {
          return {
            ...e,
            isRecognizedPerson: true,
            recognizedFaceName: name,
            recognizedFaceRole: role,
            recognizedFaceAvatar: event.snapshotUrl,
            aiAnalysis: `Recognized Person: ${name} detected by AI camera. Priority alert (${priority.replace('_', ' ')}) triggered.`,
            aiTags: Array.from(new Set(['Recognized Person', name, role, ...(e.aiTags || [])])),
          };
        }
        return e;
      })
    );
  };

  const unreadAlarmsCount = events.filter((e) => !e.read).length;
  const onlineCount = devices.filter((d) => d.status === 'online').length;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        gridMode={gridMode}
        onChangeGridMode={setGridMode}
        unreadAlarmsCount={unreadAlarmsCount}
        onlineCount={onlineCount}
        totalCount={devices.length}
        faceCount={faces.length}
        onOpenAddDevice={() => setIsAddDeviceOpen(true)}
        onOpenGoogleHome={() => setIsGoogleHomeOpen(true)}
        onOpenFaceLibrary={() => {
          setEnrollEventForFace(null);
          setIsFaceLibraryOpen(true);
        }}
        onOpenWin11Install={() => setIsWin11InstallOpen(true)}
        onClearData={handleClearAllData}
        onLoadDemoData={handleLoadDemoData}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* TAB 1: REMOTE LIVE STREAM MONITORING */}
        {activeTab === 'devices' && (
          !activeDevice ? (
            <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[440px] shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner">
                <Video className="w-8 h-8 text-blue-500/80" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">No Cameras Connected</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                  Your smart security station is empty. Add a new ICSee, V380 Pro, or IMOU camera via Wi-Fi QR code, Soundwave, LAN scan, or Bluetooth.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <button
                  onClick={() => setIsAddDeviceOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Smart Camera
                </button>
                <button
                  onClick={handleLoadDemoData}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Load Sample Demo Data
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Main Stream & Controls Area */}
            <div className="flex-1 w-full flex flex-col gap-6">
              {/* Multi-grid vs Single Stream Canvas */}
              {gridMode !== '1' ? (
                <MultiViewGrid
                  devices={devices}
                  activeDeviceId={activeDeviceId}
                  gridMode={gridMode}
                  onSelectDevice={setActiveDeviceId}
                  onOpenAddDevice={() => setIsAddDeviceOpen(true)}
                />
              ) : (
                <CameraStreamCanvas
                  device={activeDevice}
                  onPanTiltChange={(pan, tilt) => handleUpdateDevice({ pan, tilt })}
                  onTakeSnapshot={handleTakeSnapshot}
                  isRecording={isRecording}
                  showDetectionGridOverlay={false}
                  onTogglePrivacyMode={() => handleUpdateDevice({ isPrivacyMode: !activeDevice.isPrivacyMode })}
                />
              )}

              {/* Camera PTZ & Action Controls */}
              <CameraControls
                device={activeDevice}
                onUpdateDevice={handleUpdateDevice}
                onTakeSnapshot={handleTakeSnapshot}
                onToggleRecord={handleToggleRecord}
                isRecording={isRecording}
                recordingTimeSec={recordingTimeSec}
                onOpenDetectionZone={() => setIsDetectionZoneOpen(true)}
                onOpenAiReport={() => {
                  setSelectedEventForAi(null);
                  setIsAiReportOpen(true);
                }}
                onOpenShareModal={() => setIsShareOpen(true)}
                onOpenDeviceSettings={() => setIsDeviceSettingsOpen(true)}
              />

              {/* 24-Hour Timeline Playback Scrubber */}
              <TimelinePlayback
                device={activeDevice}
                events={events}
                onExportClip={handleExportReplayClip}
                onAnalyzeWithAi={(evt) => {
                  setSelectedEventForAi(evt);
                  setIsAiReportOpen(true);
                }}
              />
            </div>

            {/* Right Side Drawer: Camera Selection List & Device Stats */}
            <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
              {/* Arming Status Card */}
              <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-200">V380 Guard Mode</h3>
                    <p className="text-[10px] text-zinc-400 capitalize">{armMode} Protection Active</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('events')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-xs font-medium border border-zinc-700 transition-colors"
                >
                  Manage
                </button>
              </div>

              {/* Paired Cameras List */}
              <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-400" /> My Cameras ({devices.length})
                  </h3>
                  <button
                    onClick={() => setIsAddDeviceOpen(true)}
                    className="text-xs text-blue-400 hover:underline font-medium"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
                  {devices.map((d) => {
                    const isSelected = d.id === activeDeviceId;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setActiveDeviceId(d.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-zinc-800/80 border-blue-500 text-white shadow-lg shadow-blue-900/10'
                            : 'bg-[#09090b]/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              d.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                            }`}
                          ></span>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">{d.name}</h4>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-mono border ${
                                  d.appBrand === 'Imou_Life'
                                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                    : d.appBrand === 'V380_Pro'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                }`}
                              >
                                {d.appBrand === 'Imou_Life' ? 'IMOU' : d.appBrand === 'V380_Pro' ? 'V380' : 'ICSee'}
                              </span>
                              {d.isPrivacyMode && (
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5" title="Privacy Mode Active">
                                  <EyeOff className="w-2.5 h-2.5" /> Privacy
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {d.quality} | {d.bitrate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Wi-Fi Signal Icon with network latency badge */}
                          <WifiSignalIcon
                            signalStrength={d.signalStrength}
                            pingMs={d.pingMs}
                            status={d.status}
                            showLatency={true}
                            showPercentage={false}
                            size="sm"
                            variant="badge"
                          />

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDeviceId(d.id);
                              setIsShareOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-colors"
                            title="Share device"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDeviceId(d.id);
                              setIsDeviceSettingsOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-colors"
                            title="Device settings"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cloud Backup Promotion Banner */}
              <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow-xl text-zinc-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs font-semibold">Cloud Video Backup</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Encrypt & store continuous video recordings in secure cloud vault. Instant retrieval anytime.
                </p>
                <button
                  onClick={() => setIsCloudModalOpen(true)}
                  className="mt-1 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all"
                >
                  View Cloud Plans →
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* TAB 2: ALARM MESSAGES CENTER */}
        {activeTab === 'events' && (
          <AlarmCenter
            events={events}
            devices={devices}
            onSelectEvent={(evt) => {
              setActiveDeviceId(evt.deviceId);
              setActiveTab('devices');
            }}
            onAnalyzeEventWithGemini={(evt) => {
              setSelectedEventForAi(evt);
              setIsAiReportOpen(true);
            }}
            onMarkAllRead={() => {
              setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
            }}
            onClearEvents={() => setEvents([])}
            armMode={armMode}
            onChangeArmMode={setArmMode}
            onNameFaceForEvent={(evt) => {
              setEnrollEventForFace(evt);
              setIsFaceLibraryOpen(true);
            }}
          />
        )}

        {/* TAB 3: CLOUD VAULT */}
        {activeTab === 'cloud' && (
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#09090b] p-4 rounded-xl border border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-400" /> AES-256 Encrypted Cloud Video Vault
                </h2>
                <p className="text-xs text-zinc-400">
                  High-speed continuous loop recording backed up on global multi-region cloud servers.
                </p>
              </div>
              <button
                onClick={() => setIsCloudModalOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg"
              >
                Manage Cloud Subscription
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {devices.length === 0 ? (
                <div className="col-span-full text-center py-10 bg-[#09090b] rounded-xl border border-zinc-800 flex flex-col items-center gap-3">
                  <p className="text-xs text-zinc-400 font-medium">No cameras connected to Cloud Vault yet.</p>
                  <button
                    onClick={() => setIsAddDeviceOpen(true)}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Camera
                  </button>
                </div>
              ) : (
                devices.map((d) => (
                  <div key={d.id} className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">{d.name}</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`w-2 h-2 rounded-full ${d.storage.cloudActive ? 'bg-emerald-400' : 'bg-zinc-600'}`}></span>
                      <span className="text-xs text-zinc-300">
                        {d.storage.cloudActive
                          ? `Active (${d.storage.cloudExpiresDays} Days Left)`
                          : 'Cloud Storage Inactive'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveDeviceId(d.id);
                      setIsCloudModalOpen(true);
                    }}
                    className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-xs font-medium border border-zinc-700 transition-colors"
                  >
                    {d.storage.cloudActive ? 'Renew Cloud Vault' : 'Activate Cloud Storage'}
                  </button>
                </div>
              )))}
            </div>
          </div>
        )}

        {/* TAB 4: MY ALBUM GALLERY */}
        {activeTab === 'album' && (
          <AlbumGallery
            album={album}
            onDeleteMedia={(id) => setAlbum((prev) => prev.filter((a) => a.id !== id))}
          />
        )}
      </main>

      {/* MODALS */}
      <CloudServiceModal
        plans={CLOUD_PLANS}
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onSubscribe={(plan) => {
          handleUpdateDevice({
            storage: {
              ...activeDevice.storage,
              cloudActive: true,
              cloudExpiresDays: 30,
            },
          });
          alert(`🎉 Successfully subscribed to ${plan.name} for ${activeDevice.name}!`);
        }}
      />

      <DeviceShareModal
        device={activeDevice}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onUpdateDeviceSharing={(sharedUsers) => handleUpdateDevice({ sharedWith: sharedUsers })}
      />

      <AddDeviceWizard
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
        onAddDevice={(newDev) => {
          setDevices((prev) => [newDev, ...prev]);
          setActiveDeviceId(newDev.id);
        }}
      />

      <DetectionZoneEditor
        device={activeDevice}
        isOpen={isDetectionZoneOpen}
        onClose={() => setIsDetectionZoneOpen(false)}
        onSaveGrid={(newGrid) => handleUpdateDevice({ detectionZoneGrid: newGrid })}
      />

      <DeviceSettingsModal
        device={activeDevice}
        isOpen={isDeviceSettingsOpen}
        onClose={() => setIsDeviceSettingsOpen(false)}
        onUpdateDevice={handleUpdateDevice}
        onFormatSdCard={handleFormatSdCard}
      />

      <AiSecurityReportModal
        devices={devices}
        events={events}
        selectedEventForAnalysis={selectedEventForAi}
        isOpen={isAiReportOpen}
        onClose={() => {
          setIsAiReportOpen(false);
          setSelectedEventForAi(null);
        }}
      />

      <GoogleHomeModal
        devices={devices}
        activeDevice={activeDevice}
        isOpen={isGoogleHomeOpen}
        onClose={() => setIsGoogleHomeOpen(false)}
      />

      <FaceLibraryModal
        isOpen={isFaceLibraryOpen}
        onClose={() => {
          setIsFaceLibraryOpen(false);
          setEnrollEventForFace(null);
        }}
        faces={faces}
        unassignedEvents={events.filter((e) => e.type === 'motion_human' && !e.isRecognizedPerson)}
        onAddFace={handleAddFace}
        onUpdateFace={handleUpdateFace}
        onDeleteFace={handleDeleteFace}
        onEnrollFromEvent={handleEnrollFromEvent}
        preselectedEventForEnroll={enrollEventForFace}
      />

      <Win11InstallModal
        isOpen={isWin11InstallOpen}
        onClose={() => setIsWin11InstallOpen(false)}
        deferredPrompt={deferredPrompt}
        onTriggerPwaInstall={handleTriggerPwaInstall}
        isStandalone={isStandalone}
      />
    </div>
  );
}
