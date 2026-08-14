import React, { useState, useEffect } from 'react';
import { Device, SceneType, DiscoveredNetworkDevice } from '../types';
import { SoundwavePairing } from './SoundwavePairing';
import { NetworkScanDiscovery } from './NetworkScanDiscovery';
import {
  QrCode,
  Wifi,
  Search,
  Hash,
  CheckCircle,
  X,
  Camera,
  Sparkles,
  Loader2,
  Volume2,
  Bluetooth,
  Cast,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Radio,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldCheck,
  Server,
  Zap,
  Globe,
  Sliders
} from 'lucide-react';

interface AddDeviceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevice: (newDev: Device) => void;
}

export const AddDeviceWizard: React.FC<AddDeviceWizardProps> = ({
  isOpen,
  onClose,
  onAddDevice,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedBrand, setSelectedBrand] = useState<'ICSee' | 'ICSee_Pro' | 'V380_Pro' | 'XMEye' | 'Imou_Life'>('ICSee_Pro');
  const [method, setMethod] = useState<'qr' | 'ap' | 'lan' | 'soundwave' | 'bt'>('qr');

  // Pre-pairing checklist checks
  const [powerChecked, setPowerChecked] = useState<boolean>(true);
  const [resetToneChecked, setResetToneChecked] = useState<boolean>(true);
  const [wifi24Checked, setWifi24Checked] = useState<boolean>(true);

  // Network & Camera Security State
  const [wifiSsid, setWifiSsid] = useState<string>('Home_Security_2.4G');
  const [wifiPass, setWifiPass] = useState<string>('secureserver2026');
  const [showWifiPass, setShowWifiPass] = useState<boolean>(false);
  const [devicePassword, setDevicePassword] = useState<string>('admin888');
  const [showDevicePass, setShowDevicePass] = useState<boolean>(false);

  // Device Customization & Discovered LAN parameters
  const [name, setName] = useState<string>('Front Porch ICSee 4K PTZ');
  const [sceneType, setSceneType] = useState<SceneType>('front_porch');
  const [enableGoogleHomeSync, setEnableGoogleHomeSync] = useState<boolean>(true);
  const [discoveredDevice, setDiscoveredDevice] = useState<DiscoveredNetworkDevice | null>(null);
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.145');
  const [macAddress, setMacAddress] = useState<string>('C4:09:38:A2:1F:00');
  const [primaryPort, setPrimaryPort] = useState<number>(34567);
  const [rtspPort, setRtspPort] = useState<number>(554);
  const [firmwareVersion, setFirmwareVersion] = useState<string>('v5.08.R19.ICSEE');
  const [autoPopulatedNotice, setAutoPopulatedNotice] = useState<string | null>(null);

  // Interactive pairing simulation
  const [pairingStage, setPairingStage] = useState<number>(0);
  const [isPairing, setIsPairing] = useState<boolean>(false);
  const [soundwavePlaying, setSoundwavePlaying] = useState<boolean>(false);
  const [qrScanned, setQrScanned] = useState<boolean>(false);

  // Reset wizard on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPairingStage(0);
      setIsPairing(false);
      setQrScanned(false);
      setSoundwavePlaying(false);
      setDiscoveredDevice(null);
      setAutoPopulatedNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isWifi5GWarning = wifiSsid.toLowerCase().includes('5g') || wifiSsid.toLowerCase().includes('5ghz');

  const handleSelectDiscoveredDevice = (device: DiscoveredNetworkDevice) => {
    setDiscoveredDevice(device);
    setSelectedBrand(device.brand);
    setName(device.defaultName);
    setSceneType(device.suggestedScene);
    setIpAddress(device.ip);
    setMacAddress(device.mac);
    setPrimaryPort(device.ports.primary);
    setRtspPort(device.ports.rtsp);
    setFirmwareVersion(device.firmware);
    setAutoPopulatedNotice(
      `Parameters Auto-Populated: ${device.model} (${device.ip}:${device.ports.primary})`
    );
  };

  const handleStartPairingProcess = () => {
    setStep(3);
    setIsPairing(true);
    setPairingStage(1);

    // Simulated 4-stage handshake logic
    setTimeout(() => setPairingStage(2), 1200);
    setTimeout(() => setPairingStage(3), 2400);
    setTimeout(() => {
      setPairingStage(4);
      setIsPairing(false);
    }, 3600);
  };

  const handleFinishAdd = () => {
    const isImou = selectedBrand === 'Imou_Life';
    const isICSee = selectedBrand === 'ICSee' || selectedBrand === 'ICSee_Pro' || selectedBrand === 'XMEye';
    const newDev: Device = {
      id: `dev-${Date.now()}`,
      name,
      model: discoveredDevice
        ? discoveredDevice.model
        : isImou
        ? 'IMOU Life Rex 3D 5MP AI PTZ'
        : isICSee
        ? 'ICSee Pro Dual-Lens 4K PTZ Speed Dome (NETIP)'
        : 'V380 Pro Q7 Smart PTZ 4K',
      status: 'online',
      isRecording: true,
      isMuted: false,
      isTalkbackActive: false,
      isMotionTrackingEnabled: true,
      isLightOn: false,
      isSirenOn: false,
      isNightVision: false,
      nightVisionMode: 'smart',
      quality: discoveredDevice?.resolution.includes('5MP') ? 'FHD' : '4K',
      fps: 30,
      bitrate: '2.5 MB/s',
      signalStrength: discoveredDevice ? Math.min(100, Math.max(70, 100 + (discoveredDevice.signalDbm + 40))) : 98,
      pingMs: discoveredDevice?.latencyMs || 14,
      appBrand: selectedBrand,
      protocol: discoveredDevice ? discoveredDevice.protocol : isImou ? 'Imou_SDK' : isICSee ? 'NETIP_ICSee' : 'V380_SDK',
      googleHome: {
        linked: enableGoogleHomeSync,
        googleDeviceId: `gh-cam-${Date.now().toString().slice(-4)}`,
        voiceCommandsEnabled: true,
        deviceType: 'camera',
      },
      imouSettings: isImou
        ? {
            imouDeviceId: `imou-${Date.now().toString().slice(-6)}`,
            smartTracking: true,
            petDetection: true,
            activeDeterrenceStrobe: true,
            alarmSoundProfile: '110dB_Siren',
            privacyMasking: false,
          }
        : undefined,
      icseeSettings: isICSee
        ? {
            netipPort: primaryPort,
            rtspPort: rtspPort,
            dualLensMode: true,
            humanoidTracking: true,
            cordonAlarm: true,
            cloudProvider: 'Google_Drive',
          }
        : undefined,
      storage: {
        cloudSyncActive: true,
        cloudProvider: 'Google_Drive',
        lastSyncTime: 'Just now',
        sdCardSizeGB: 128,
        sdCardUsedGB: 8.5,
      },
      presetPositions: [
        { id: 'p1', name: 'Main Entrance', pan: 180, tilt: 0 },
        { id: 'p2', name: 'Walkway Gate', pan: 90, tilt: -10 },
      ],
      pan: 180,
      tilt: 0,
      zoom: 1,
      detectionZoneGrid: Array(6).fill(null).map(() => Array(6).fill(true)),
      sharedWith: [],
      sceneType,
      ipAddress: ipAddress,
      macAddress: macAddress,
      firmwareVersion: firmwareVersion,
    };

    onAddDevice(newDev);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-xl w-full p-6 text-zinc-100 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">Smart Camera Onboarding Wizard</h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                STEP {step} OF 4
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {step === 1 && 'Select camera brand ecosystem & complete hardware checklist'}
              {step === 2 && 'Configure 2.4GHz Wi-Fi credentials & pairing method'}
              {step === 3 && 'Executing socket handshake & network provisioning'}
              {step === 4 && 'Assign camera name, location scene & Google Home sync'}
            </p>
          </div>
        </div>

        {/* STEP 1: Ecosystem Brand & Pre-requisites Checklist */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {/* Brand Ecosystem Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-200">1. Select Camera Ecosystem / Protocol Brand:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'ICSee_Pro', label: 'ICSee Pro', desc: '4K NETIP Dual-Lens' },
                  { id: 'ICSee', label: 'ICSee', desc: 'Xiongmai Speed Dome' },
                  { id: 'V380_Pro', label: 'V380 Pro', desc: 'V380 Cloud SDK' },
                  { id: 'Imou_Life', label: 'IMOU Life', desc: 'Dahua Imou AI' },
                  { id: 'XMEye', label: 'XMEye', desc: 'DVR / ONVIF NVR' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBrand(b.id as any);
                      if (b.id === 'Imou_Life') {
                        setName('Living Room IMOU Rex 3D');
                      } else if (b.id === 'ICSee' || b.id === 'ICSee_Pro') {
                        setName('Front Porch ICSee 4K PTZ');
                      } else {
                        setName('Store V380 Pro Camera');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedBrand === b.id
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/30 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{b.label}</div>
                    <div className="text-[9px] text-zinc-400 font-normal truncate">{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fast-Track LAN Network Scan Callout */}
            <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-purple-950/30 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    <span>Quick Network Scan (LAN Discovery)</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      Auto-Populate
                    </span>
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Scan local router for NETIP, V380, IMOU or ONVIF cameras and auto-fill parameters.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMethod('lan');
                  setStep(2);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 shadow-md shadow-blue-900/30 transition-all flex items-center gap-1 active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Scan LAN</span>
              </button>
            </div>

            {/* Hardware Checklist Before Connection */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2. Onboarding Readiness Checklist:</span>
              </span>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={powerChecked}
                  onChange={(e) => setPowerChecked(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span>Camera is plugged into power supply & red indicator LED is on</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetToneChecked}
                  onChange={(e) => setResetToneChecked(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span>Camera speaker prompt heard: <em>"Waiting for connection"</em> or <em>"Di-di chime"</em></span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wifi24Checked}
                  onChange={(e) => setWifi24Checked(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <span>Phone is connected to router 2.4GHz Wi-Fi band (5GHz not supported for setup)</span>
              </label>
            </div>

            <button
              disabled={!powerChecked || !resetToneChecked || !wifi24Checked}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Wi-Fi Credentials</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Wi-Fi Credentials & Pairing Method Selection */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Wi-Fi SSID & Password Form */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 flex flex-col gap-3 text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-blue-400" />
                <span>Router Wi-Fi Credentials (2.4GHz):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 font-medium">Wi-Fi Network Name (SSID):</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 font-medium">Wi-Fi Password:</label>
                  <div className="relative">
                    <input
                      type={showWifiPass ? 'text' : 'password'}
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-8 py-2 text-zinc-100 outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWifiPass(!showWifiPass)}
                      className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200"
                    >
                      {showWifiPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 5GHz Warning if detected */}
              {isWifi5GWarning && (
                <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    SSID contains "5G". Most CCTV cameras only connect to 2.4GHz bands. Ensure your router broadcasts dual-band.
                  </span>
                </div>
              )}

              {/* Security Password for Camera Admin */}
              <div className="border-t border-zinc-800 pt-2 flex flex-col gap-1">
                <label className="text-zinc-300 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Set Camera Admin Password (Device Encryption):</span>
                </label>
                <div className="relative max-w-xs">
                  <input
                    type={showDevicePass ? 'text' : 'password'}
                    value={devicePassword}
                    onChange={(e) => setDevicePassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-8 py-1.5 text-zinc-100 outline-none focus:border-purple-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDevicePass(!showDevicePass)}
                    className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showDevicePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Choose Pairing Method Tabs */}
            <span className="text-xs font-bold text-zinc-200">Select Pairing Transmission Method:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setMethod('qr')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  method === 'qr'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/20 shadow'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs">Smart QR Scan</span>
                <span className="text-[9px] text-zinc-400">Lens scans screen</span>
              </button>

              <button
                onClick={() => setMethod('soundwave')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  method === 'soundwave'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/20 shadow'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs">Soundwave</span>
                <span className="text-[9px] text-zinc-400">Ultrasonic chirp</span>
              </button>

              <button
                onClick={() => setMethod('bt')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  method === 'bt'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/20 shadow'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Bluetooth className="w-4 h-4 text-blue-400" />
                <span className="text-xs">BLE Scan</span>
                <span className="text-[9px] text-zinc-400">Bluetooth pairing</span>
              </button>

              <button
                onClick={() => setMethod('lan')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  method === 'lan'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/20 shadow'
                    : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span className="text-xs">LAN / NETIP</span>
                <span className="text-[9px] text-zinc-400">Port 34567 scan</span>
              </button>
            </div>

            {/* Auto-populated Parameters Notice Banner */}
            {autoPopulatedNotice && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-emerald-200">{autoPopulatedNotice}</p>
                    <p className="text-[10px] text-emerald-400/80 font-mono">
                      MAC: {macAddress} | Protocol: {discoveredDevice?.protocol || 'NETIP'} | RTSP: {rtspPort}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded uppercase">
                  LAN Linked
                </span>
              </div>
            )}

            {/* Dynamic Interactive Pairing Guide based on Method */}
            {method === 'soundwave' ? (
              <SoundwavePairing
                wifiSsid={wifiSsid}
                wifiPass={wifiPass}
                cameraBrand={
                  selectedBrand === 'Imou_Life'
                    ? 'IMOU'
                    : selectedBrand === 'V380_Pro'
                    ? 'V380'
                    : 'ICSee'
                }
                onCameraAck={() => setResetToneChecked(true)}
              />
            ) : method === 'lan' ? (
              <NetworkScanDiscovery
                onSelectDevice={handleSelectDiscoveredDevice}
                selectedDeviceId={discoveredDevice?.id}
              />
            ) : (
              <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center gap-3">
                {method === 'qr' && (
                  <>
                    <div className="bg-white p-3 rounded-xl shadow-xl border border-zinc-300 relative group">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WIFI:S:${encodeURIComponent(
                          wifiSsid
                        )};P:${encodeURIComponent(wifiPass)};B:${selectedBrand};;`}
                        alt="Pairing QR Code"
                        className="w-32 h-32"
                      />
                      {qrScanned && (
                        <div className="absolute inset-0 bg-emerald-600/90 rounded-xl flex flex-col items-center justify-center text-white font-bold text-xs">
                          <CheckCircle2 className="w-8 h-8 mb-1" />
                          <span>QR Code Scanned!</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300">
                      Hold phone screen <strong>15–20 cm (6–8 inches)</strong> in front of camera lens until camera speaks <em>"QR Code Scanned Successfully"</em>.
                    </p>
                    <button
                      onClick={() => setQrScanned(true)}
                      className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-bold transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      Simulate Camera "Beep / QR Scanned" Sound
                    </button>
                  </>
                )}

                {method === 'bt' && (
                  <div className="w-full flex flex-col items-center gap-2 py-2">
                    <Bluetooth className="w-8 h-8 text-blue-400 animate-pulse" />
                    <p className="text-xs text-zinc-300 font-bold">Bluetooth Advertising Signal Active</p>
                    <p className="text-[11px] text-zinc-400">Found: [ICSee_BT_Cam_9942] (Signal: -48dBm)</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleStartPairingProcess}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Start Camera Provisioning Handshake →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Real Multi-Stage Handshake Execution */}
        {step === 3 && (
          <div className="flex flex-col gap-5 py-4">
            <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Server className="w-4 h-4 text-blue-400" />
                <span>Executing Protocol Socket Handshake ({selectedBrand})</span>
              </h3>

              <div className="flex flex-col gap-3 text-xs">
                {/* Stage 1 */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      pairingStage > 1
                        ? 'bg-emerald-500 text-zinc-950'
                        : pairingStage === 1
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {pairingStage > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${pairingStage >= 1 ? 'text-zinc-100' : 'text-zinc-500'}`}>
                      Sending Wi-Fi Credentials via {method.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">SSID: {wifiSsid} (Encrypted payload)</p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      pairingStage > 2
                        ? 'bg-emerald-500 text-zinc-950'
                        : pairingStage === 2
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {pairingStage > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${pairingStage >= 2 ? 'text-zinc-100' : 'text-zinc-500'}`}>
                      Camera Connecting to Router Gateway
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">Assigned IP: 192.168.1.145</p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      pairingStage > 3
                        ? 'bg-emerald-500 text-zinc-950'
                        : pairingStage === 3
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {pairingStage > 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${pairingStage >= 3 ? 'text-zinc-100' : 'text-zinc-500'}`}>
                      Registering Device to Cloud Server
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {selectedBrand.startsWith('ICSee') ? 'Xiongmai NETIP Port 34567' : 'V380 / IMOU Cloud SDK'}
                    </p>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      pairingStage >= 4
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {pairingStage >= 4 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${pairingStage >= 4 ? 'text-zinc-100' : 'text-zinc-500'}`}>
                      Device Binding & Encryption Auth Complete
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">Admin Key: •••••••• (AES Encrypted)</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              disabled={isPairing || pairingStage < 4}
              onClick={() => setStep(4)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>Set Name & Location Scene</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: Camera Name, Scene & Smart Home Ecosystem Sync */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-zinc-200 block mb-1">Camera Display Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-200 block mb-1">Installation Location / Scene:</label>
                <select
                  value={sceneType}
                  onChange={(e) => setSceneType(e.target.value as SceneType)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-blue-500"
                >
                  <option value="front_porch">Front Porch / Main Gate</option>
                  <option value="living_room">Living Room</option>
                  <option value="backyard">Villa Backyard / Garden</option>
                  <option value="office">Working Office</option>
                  <option value="store">Store / Storefront Register</option>
                  <option value="factory">Factory Line</option>
                </select>
              </div>

              {/* Discovered / Configured Network Parameters */}
              <div className="border-t border-zinc-800 pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
                    <Server className="w-3.5 h-3.5 text-blue-400" />
                    <span>Connection & Protocol Parameters</span>
                  </span>
                  {discoveredDevice && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded font-mono">
                      LAN Discovered
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 text-[11px]">
                  <div>
                    <label className="text-zinc-400 block text-[10px]">Static / LAN IP Address:</label>
                    <input
                      type="text"
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-200 font-mono text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block text-[10px]">MAC Hardware Address:</label>
                    <input
                      type="text"
                      value={macAddress}
                      onChange={(e) => setMacAddress(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-200 font-mono text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block text-[10px]">Primary Socket Port / NETIP:</label>
                    <input
                      type="number"
                      value={primaryPort}
                      onChange={(e) => setPrimaryPort(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-200 font-mono text-xs focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block text-[10px]">RTSP Stream Port:</label>
                    <input
                      type="number"
                      value={rtspPort}
                      onChange={(e) => setRtspPort(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-200 font-mono text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Google Home Smart Bridge Option */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <Cast className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-bold text-zinc-200">Sync to Google Home & Nest Hub</p>
                    <p className="text-[10px] text-zinc-400">Voice command: "Hey Google, show camera stream"</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableGoogleHomeSync}
                  onChange={(e) => setEnableGoogleHomeSync(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleFinishAdd}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup & Start Live Stream</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

