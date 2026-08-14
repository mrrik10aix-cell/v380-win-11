import React, { useState, useEffect, useRef } from 'react';
import { DiscoveredNetworkDevice, SceneType } from '../types';
import {
  Search,
  RefreshCw,
  Server,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Zap,
  Globe,
  Sliders,
  Check
} from 'lucide-react';

interface NetworkScanDiscoveryProps {
  onSelectDevice: (device: DiscoveredNetworkDevice) => void;
  selectedDeviceId?: string;
}

const MOCK_DISCOVERED_POOL: DiscoveredNetworkDevice[] = [
  {
    id: 'disc-netip-01',
    ip: '192.168.1.145',
    mac: 'C4:09:38:A2:1F:00',
    model: 'ICSee Pro 4K Dual-Lens Speed Dome',
    brand: 'ICSee_Pro',
    protocol: 'NETIP_ICSee',
    ports: {
      primary: 34567,
      rtsp: 554,
      http: 80,
    },
    firmware: 'v5.08.R19.ICSEE_2026',
    signalDbm: -42,
    latencyMs: 12,
    isBound: false,
    resolution: '4K (3840x2160)',
    defaultName: 'Front Porch ICSee 4K PTZ',
    suggestedScene: 'front_porch',
  },
  {
    id: 'disc-v380-02',
    ip: '192.168.1.188',
    mac: 'A0:32:B1:C3:4D:11',
    model: 'V380 Pro Q7 Smart PTZ Dome',
    brand: 'V380_Pro',
    protocol: 'V380_SDK',
    ports: {
      primary: 8800,
      rtsp: 554,
      http: 80,
    },
    firmware: 'v3.80.2026.09.Q7',
    signalDbm: -55,
    latencyMs: 18,
    isBound: false,
    resolution: '4K Ultra HD',
    defaultName: 'Storefront V380 Q7 Camera',
    suggestedScene: 'store',
  },
  {
    id: 'disc-imou-03',
    ip: '192.168.1.205',
    mac: '3C:84:6A:90:5E:2B',
    model: 'IMOU Life Rex 3D 5MP AI PTZ',
    brand: 'Imou_Life',
    protocol: 'Imou_SDK',
    ports: {
      primary: 37777,
      rtsp: 554,
      http: 80,
    },
    firmware: 'v2.800.0000000.12.R',
    signalDbm: -38,
    latencyMs: 9,
    isBound: false,
    resolution: '5MP (2880x1620)',
    defaultName: 'Living Room IMOU Rex 3D',
    suggestedScene: 'living_room',
  },
  {
    id: 'disc-xmeye-04',
    ip: '192.168.1.72',
    mac: '00:12:17:88:99:AA',
    model: 'XMEye H.265 Outdoor Bullet Cam',
    brand: 'XMEye',
    protocol: 'NETIP_ICSee',
    ports: {
      primary: 34567,
      rtsp: 554,
      http: 80,
    },
    firmware: 'v4.02.R11.XMEYE',
    signalDbm: -61,
    latencyMs: 24,
    isBound: false,
    resolution: '1080p FHD',
    defaultName: 'Backyard XMEye Bullet Cam',
    suggestedScene: 'backyard',
  },
];

export const NetworkScanDiscovery: React.FC<NetworkScanDiscoveryProps> = ({
  onSelectDevice,
  selectedDeviceId,
}) => {
  const [subnet, setSubnet] = useState<string>('192.168.1.0/24');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scannedIpCount, setScannedIpCount] = useState<number>(0);
  const [currentScanningIp, setCurrentScanningIp] = useState<string>('192.168.1.1');
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredNetworkDevice[]>([]);
  const [autoAppliedId, setAutoAppliedId] = useState<string | null>(null);

  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = () => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);

    setIsScanning(true);
    setScanProgress(0);
    setScannedIpCount(0);
    setDiscoveredDevices([]);
    setAutoAppliedId(null);

    const baseSubnet = subnet.split('.')[0] + '.' + subnet.split('.')[1] + '.' + subnet.split('.')[2];
    let currentHost = 1;
    const totalHosts = 254;

    scanTimerRef.current = setInterval(() => {
      currentHost += 6; // Scan fast in batches
      if (currentHost > totalHosts) currentHost = totalHosts;

      const currentIp = `${baseSubnet}.${currentHost}`;
      setCurrentScanningIp(currentIp);
      setScannedIpCount(currentHost);
      const pct = Math.round((currentHost / totalHosts) * 100);
      setScanProgress(pct);

      // Progressively inject discovered cameras at certain milestones
      if (currentHost >= 45 && currentHost < 80) {
        setDiscoveredDevices((prev) => {
          if (!prev.some((d) => d.id === MOCK_DISCOVERED_POOL[0].id)) {
            return [...prev, MOCK_DISCOVERED_POOL[0]];
          }
          return prev;
        });
      } else if (currentHost >= 110 && currentHost < 160) {
        setDiscoveredDevices((prev) => {
          if (!prev.some((d) => d.id === MOCK_DISCOVERED_POOL[1].id)) {
            return [...prev, MOCK_DISCOVERED_POOL[1]];
          }
          return prev;
        });
      } else if (currentHost >= 180 && currentHost < 230) {
        setDiscoveredDevices((prev) => {
          if (!prev.some((d) => d.id === MOCK_DISCOVERED_POOL[2].id)) {
            return [...prev, MOCK_DISCOVERED_POOL[2]];
          }
          return prev;
        });
      } else if (currentHost >= 240) {
        setDiscoveredDevices((prev) => {
          if (!prev.some((d) => d.id === MOCK_DISCOVERED_POOL[3].id)) {
            return [...prev, MOCK_DISCOVERED_POOL[3]];
          }
          return prev;
        });
      }

      if (currentHost >= totalHosts) {
        if (scanTimerRef.current) clearInterval(scanTimerRef.current);
        setIsScanning(false);
        setScanProgress(100);
        // Ensure all discovered items are loaded
        setDiscoveredDevices(MOCK_DISCOVERED_POOL);
      }
    }, 60);
  };

  useEffect(() => {
    // Auto start on first mount
    startScan();
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, []);

  const handleApplyDevice = (device: DiscoveredNetworkDevice) => {
    setAutoAppliedId(device.id);
    onSelectDevice(device);
  };

  return (
    <div className="flex flex-col gap-4 text-zinc-100 animate-in fade-in duration-200">
      {/* Network Range Configuration Bar */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Globe className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-xs text-zinc-400 font-medium">Subnet:</span>
            <select
              value={subnet}
              disabled={isScanning}
              onChange={(e) => {
                setSubnet(e.target.value);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="192.168.1.0/24">192.168.1.0/24 (Default LAN)</option>
              <option value="192.168.0.0/24">192.168.0.0/24 (Secondary)</option>
              <option value="10.0.0.0/24">10.0.0.0/24 (Office Subnet)</option>
              <option value="172.16.0.0/24">172.16.0.0/24 (CCTV VLAN)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={startScan}
            disabled={isScanning}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isScanning
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isScanning ? 'Probing Subnet...' : 'Rescan Network'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Asynchronous Radar & Discovery Status */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 flex flex-col gap-2.5 relative overflow-hidden">
        {isScanning && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isScanning ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
            <span className="font-bold text-zinc-200">
              {isScanning ? 'Asynchronous LAN Discovery in Progress' : 'LAN Discovery Complete'}
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-400">
            {scannedIpCount}/254 Hosts Probed ({scanProgress}%)
          </span>
        </div>

        {/* Scan Progress Bar */}
        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
          <div
            className={`h-full transition-all duration-75 ${
              isScanning ? 'bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${scanProgress}%` }}
          />
        </div>

        {/* Live Port Discovery Probes */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
          <div className="flex items-center gap-2 truncate">
            <span className="text-zinc-500">Active Probe:</span>
            <span className="text-blue-300 font-bold">{currentScanningIp}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">NETIP 34567 • RTSP 554 • V380 8800 • IMOU 37777</span>
          </div>

          <span className="text-emerald-400 font-bold shrink-0">
            {discoveredDevices.length} Cameras Discovered
          </span>
        </div>
      </div>

      {/* Discovered Cameras Cards List */}
      <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
        {discoveredDevices.length === 0 && isScanning && (
          <div className="p-6 bg-[#09090b] border border-dashed border-zinc-800 rounded-xl text-center flex flex-col items-center justify-center gap-2">
            <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
            <p className="text-xs text-zinc-300 font-semibold">Broadcasting UDP Discovery Packets...</p>
            <p className="text-[10px] text-zinc-500 font-mono">Listening for NETIP / ONVIF / V380 beacon responses</p>
          </div>
        )}

        {discoveredDevices.length === 0 && !isScanning && (
          <div className="p-6 bg-[#09090b] border border-zinc-800 rounded-xl text-center flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-400" />
            <p className="text-xs text-zinc-300 font-semibold">No Unbound Cameras Responded</p>
            <p className="text-[10px] text-zinc-500">Check that cameras are powered on and on the same router subnet.</p>
          </div>
        )}

        {discoveredDevices.map((device) => {
          const isSelected = selectedDeviceId === device.id || autoAppliedId === device.id;

          const brandBadgeColor =
            device.brand === 'ICSee_Pro' || device.brand === 'ICSee'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              : device.brand === 'V380_Pro'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              : device.brand === 'Imou_Life'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

          return (
            <div
              key={device.id}
              onClick={() => handleApplyDevice(device)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 relative group ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-950/60'
                  : 'bg-[#09090b] hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Card Header: Model, Brand Badge & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                    <Server className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      <span>{device.model}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold ${brandBadgeColor}`}>
                        {device.brand.replace('_', ' ')}
                      </span>
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      IP: <strong className="text-zinc-200">{device.ip}</strong> • MAC: {device.mac}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                    {device.latencyMs}ms • {device.signalDbm}dBm
                  </span>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono bg-zinc-950/80 p-2 rounded-lg border border-zinc-800/80">
                <div>
                  <span className="text-zinc-500 block">Protocol:</span>
                  <span className="text-zinc-200 font-bold">{device.protocol}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Primary Port:</span>
                  <span className="text-amber-300 font-bold">{device.ports.primary}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Resolution:</span>
                  <span className="text-purple-300 font-bold">{device.resolution}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Firmware:</span>
                  <span className="text-zinc-300 truncate block">{device.firmware}</span>
                </div>
              </div>

              {/* Action Button: Auto-Populate */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/70">
                <span className="text-[10px] text-zinc-400 italic">
                  Suggested name: <strong>{device.defaultName}</strong>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyDevice(device);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-800 group-hover:bg-blue-600 text-zinc-200 group-hover:text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Parameters Populated</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Auto-Populate & Use</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
