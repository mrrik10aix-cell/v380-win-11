import React from 'react';
import { Device } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { WifiSignalIcon } from './WifiSignalIcon';
import { Volume2, VolumeX, Maximize2, Plus } from 'lucide-react';

interface MultiViewGridProps {
  devices: Device[];
  activeDeviceId: string;
  gridMode: '1' | '4' | '9';
  onSelectDevice: (deviceId: string) => void;
  onOpenAddDevice: () => void;
}

export const MultiViewGrid: React.FC<MultiViewGridProps> = ({
  devices,
  activeDeviceId,
  gridMode,
  onSelectDevice,
  onOpenAddDevice,
}) => {
  if (gridMode === '1') return null; // Single view is rendered directly in main container

  const totalSlots = gridMode === '4' ? 4 : 9;
  const gridColsClass = gridMode === '4' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  // Fill array up to totalSlots
  const slots: (Device | null)[] = [];
  for (let i = 0; i < totalSlots; i++) {
    slots.push(devices[i] || null);
  }

  return (
    <div className={`grid ${gridColsClass} gap-3 w-full my-3`}>
      {slots.map((device, idx) => {
        if (!device) {
          return (
            <div
              key={`empty-${idx}`}
              onClick={onOpenAddDevice}
              className="aspect-video bg-[#121215]/60 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 cursor-pointer transition-all p-4 group"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-blue-600/10 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 mb-2 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">Add Channel #{idx + 1}</span>
            </div>
          );
        }

        const isActive = device.id === activeDeviceId;

        return (
          <div
            key={device.id}
            onClick={() => onSelectDevice(device.id)}
            className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
              isActive ? 'border-blue-600 shadow-xl shadow-blue-900/30 ring-2 ring-blue-600/30' : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {/* Live Feed Canvas */}
            <CameraStreamCanvas device={device} gridMode={true} />

            {/* Tile Info Banner */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-xs text-white pointer-events-none">
              <span className="bg-[#09090b]/80 backdrop-blur-md px-2 py-0.5 rounded font-medium border border-zinc-700/50 truncate max-w-[150px]">
                {device.name}
              </span>
              <div className="flex items-center gap-1.5 bg-[#09090b]/80 backdrop-blur-md px-2 py-0.5 rounded border border-zinc-700/50">
                <WifiSignalIcon
                  signalStrength={device.signalStrength}
                  pingMs={device.pingMs}
                  status={device.status}
                  showLatency={true}
                  size="sm"
                  variant="wifi"
                />
                <span className="text-[10px] font-mono">{device.quality}</span>
              </div>
            </div>

            {/* Quick Select Overlay */}
            {!isActive && (
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" /> Tap to Control
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
