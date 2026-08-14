import React, { useState, useEffect } from 'react';
import { Device, SavedGridLayout } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { WifiSignalIcon } from './WifiSignalIcon';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Plus,
  GripVertical,
  SlidersHorizontal,
  Bookmark,
  Check,
  RotateCcw,
  Trash2,
  LayoutGrid,
  Lock,
  Unlock,
  Move,
  Info,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';

interface MultiViewGridProps {
  devices: Device[];
  activeDeviceId: string;
  gridMode: '1' | '4' | '9';
  onSelectDevice: (deviceId: string) => void;
  onOpenAddDevice: () => void;
  onToggleMuteDevice?: (deviceId: string) => void;
}

const STORAGE_KEY_CUSTOM_LAYOUTS = 'cctv_saved_grid_layouts_v1';
const STORAGE_KEY_ACTIVE_ORDER_4 = 'cctv_grid_order_4_v1';
const STORAGE_KEY_ACTIVE_ORDER_9 = 'cctv_grid_order_9_v1';

export const MultiViewGrid: React.FC<MultiViewGridProps> = ({
  devices,
  activeDeviceId,
  gridMode,
  onSelectDevice,
  onOpenAddDevice,
  onToggleMuteDevice,
}) => {
  if (gridMode === '1') return null; // Single view rendered in main container

  const totalSlots = gridMode === '4' ? 4 : 9;
  const storageOrderKey = gridMode === '4' ? STORAGE_KEY_ACTIVE_ORDER_4 : STORAGE_KEY_ACTIVE_ORDER_9;

  // Custom ordered device IDs
  const [slotDeviceIds, setSlotDeviceIds] = useState<string[]>([]);
  const [isCustomizeMode, setIsCustomizeMode] = useState<boolean>(false);
  const [draggedSlotIdx, setDraggedSlotIdx] = useState<number | null>(null);
  const [dragOverSlotIdx, setDragOverSlotIdx] = useState<number | null>(null);

  // Saved presets list
  const [savedLayouts, setSavedLayouts] = useState<SavedGridLayout[]>([]);
  const [activeLayoutName, setActiveLayoutName] = useState<string>('Default Layout');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [newLayoutName, setNewLayoutName] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Load saved custom layouts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_LAYOUTS);
      if (stored) {
        setSavedLayouts(JSON.parse(stored));
      } else {
        // Seed default presets
        const defaultPresets: SavedGridLayout[] = [
          {
            id: 'preset-perimeter',
            name: 'Perimeter Focus',
            gridMode: '4',
            order: devices.slice(0, 4).map(d => d.id),
            updatedAt: 'Default',
          },
        ];
        setSavedLayouts(defaultPresets);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize or synchronize order based on current devices & grid mode
  useEffect(() => {
    try {
      const storedOrder = localStorage.getItem(storageOrderKey);
      if (storedOrder) {
        const parsed: string[] = JSON.parse(storedOrder);
        // Ensure all valid devices are present or filled
        const validIds = parsed.filter(id => devices.some(d => d.id === id));
        const missingIds = devices.map(d => d.id).filter(id => !validIds.includes(id));
        setSlotDeviceIds([...validIds, ...missingIds]);
      } else {
        setSlotDeviceIds(devices.map(d => d.id));
      }
    } catch {
      setSlotDeviceIds(devices.map(d => d.id));
    }
  }, [devices, gridMode, storageOrderKey]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Reorder slots
  const handleSwapSlots = (sourceIdx: number, targetIdx: number) => {
    if (sourceIdx === targetIdx) return;

    setSlotDeviceIds(prev => {
      const currentList = [...prev];
      // Expand list to at least target index if needed
      while (currentList.length < totalSlots) {
        currentList.push('');
      }

      const sourceId = currentList[sourceIdx] || '';
      const targetId = currentList[targetIdx] || '';

      currentList[sourceIdx] = targetId;
      currentList[targetIdx] = sourceId;

      // Filter empty strings and persist
      const cleanList = currentList.filter(Boolean);
      try {
        localStorage.setItem(storageOrderKey, JSON.stringify(cleanList));
      } catch {
        // ignore
      }

      showToast(`Swapped Channel ${sourceIdx + 1} ⇄ Channel ${targetIdx + 1}`);
      return cleanList;
    });
  };

  // Save current order as a new custom layout
  const handleSaveCurrentLayout = () => {
    if (!newLayoutName.trim()) return;

    const newLayout: SavedGridLayout = {
      id: `layout-${Date.now()}`,
      name: newLayoutName.trim(),
      gridMode,
      order: [...slotDeviceIds],
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...savedLayouts.filter(l => l.name !== newLayout.name), newLayout];
    setSavedLayouts(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LAYOUTS, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setActiveLayoutName(newLayout.name);
    setIsSaveModalOpen(false);
    setNewLayoutName('');
    showToast(`Saved personalized layout "${newLayout.name}"`);
  };

  // Apply a saved layout
  const handleApplyLayout = (layout: SavedGridLayout) => {
    const validIds = layout.order.filter(id => devices.some(d => d.id === id));
    const missingIds = devices.map(d => d.id).filter(id => !validIds.includes(id));
    const merged = [...validIds, ...missingIds];

    setSlotDeviceIds(merged);
    setActiveLayoutName(layout.name);
    try {
      localStorage.setItem(storageOrderKey, JSON.stringify(merged));
    } catch {
      // ignore
    }
    showToast(`Applied layout "${layout.name}"`);
  };

  // Reset to default device ordering
  const handleResetDefaultLayout = () => {
    const defaultIds = devices.map(d => d.id);
    setSlotDeviceIds(defaultIds);
    setActiveLayoutName('Default Layout');
    try {
      localStorage.removeItem(storageOrderKey);
    } catch {
      // ignore
    }
    showToast('Reset grid positions to default channel order');
  };

  // Delete custom layout
  const handleDeleteLayout = (layoutId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedLayouts.filter(l => l.id !== layoutId);
    setSavedLayouts(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LAYOUTS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (activeLayoutName === savedLayouts.find(l => l.id === layoutId)?.name) {
      setActiveLayoutName('Default Layout');
    }
    showToast('Deleted custom layout preset');
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (idx: number, e: React.DragEvent) => {
    setDraggedSlotIdx(idx);
    e.dataTransfer.setData('text/plain', idx.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlotIdx !== idx) {
      setDragOverSlotIdx(idx);
    }
  };

  const handleDragLeave = (idx: number) => {
    if (dragOverSlotIdx === idx) {
      setDragOverSlotIdx(null);
    }
  };

  const handleDrop = (targetIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    const sourceIdxStr = e.dataTransfer.getData('text/plain');
    const sourceIdx = parseInt(sourceIdxStr, 10);

    if (!isNaN(sourceIdx)) {
      handleSwapSlots(sourceIdx, targetIdx);
    }

    setDraggedSlotIdx(null);
    setDragOverSlotIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedSlotIdx(null);
    setDragOverSlotIdx(null);
  };

  // Build slots array based on custom slotDeviceIds
  const orderedDevices: (Device | null)[] = [];
  for (let i = 0; i < totalSlots; i++) {
    const id = slotDeviceIds[i];
    const dev = devices.find(d => d.id === id) || null;
    orderedDevices.push(dev);
  }

  const gridColsClass = gridMode === '4' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="flex flex-col gap-3 w-full my-2">
      {/* Custom Grid Layout Toolbar */}
      <div className="bg-[#121215] border border-zinc-800 rounded-xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-lg">
        {/* Left: Layout Info & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-100">
                Multi-View Matrix ({gridMode}-Grid)
              </span>
              <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full text-zinc-300 font-medium">
                {activeLayoutName}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {isCustomizeMode
                ? 'Drag and drop camera tiles or empty channels to customize screen positions'
                : 'Personalized multi-camera positions active'}
            </p>
          </div>
        </div>

        {/* Right: Actions & Preset Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Layouts Dropdown / Pills */}
          <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={handleResetDefaultLayout}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                activeLayoutName === 'Default Layout'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Reset to default channel arrangement"
            >
              Default
            </button>

            {savedLayouts
              .filter(l => l.gridMode === gridMode)
              .map(l => (
                <div key={l.id} className="relative group flex items-center">
                  <button
                    onClick={() => handleApplyLayout(l)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                      activeLayoutName === l.name
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Bookmark className="w-3 h-3 text-amber-400" />
                    <span>{l.name}</span>
                  </button>

                  {/* Delete layout button */}
                  {l.updatedAt !== 'Default' && (
                    <button
                      onClick={(e) => handleDeleteLayout(l.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-rose-400 transition-opacity ml-0.5"
                      title="Delete preset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Save Layout Button */}
          <button
            onClick={() => {
              setNewLayoutName(`Layout ${savedLayouts.length + 1}`);
              setIsSaveModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700/80 transition-all cursor-pointer"
            title="Save current camera screen positions as a custom layout"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Save Layout</span>
          </button>

          {/* Reorder / Lock Mode Toggle */}
          <button
            onClick={() => setIsCustomizeMode(!isCustomizeMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isCustomizeMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40 animate-pulse'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
            title={isCustomizeMode ? 'Click to lock positions' : 'Click to enable drag and drop reordering'}
          >
            {isCustomizeMode ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Reordering Active</span>
              </>
            ) : (
              <>
                <Move className="w-3.5 h-3.5 text-blue-400" />
                <span>Reorder Grid</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Feedback Toast */}
      {feedbackToast && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xl self-center animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Reorder Hint Banner when in Customize Mode */}
      {isCustomizeMode && (
        <div className="bg-blue-950/40 border border-blue-500/40 rounded-xl p-2.5 text-xs text-blue-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-blue-400 animate-bounce shrink-0" />
            <span>
              <strong>Drag and Drop Mode Enabled:</strong> Grab any camera header or tile and drop it onto another channel position to swap positions.
            </span>
          </div>
          <button
            onClick={() => setIsCustomizeMode(false)}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shrink-0"
          >
            Done Reordering
          </button>
        </div>
      )}

      {/* Grid Matrix with Drag and Drop */}
      <div className={`grid ${gridColsClass} gap-3.5 w-full`}>
        {orderedDevices.map((device, idx) => {
          const isDragging = draggedSlotIdx === idx;
          const isDragOver = dragOverSlotIdx === idx && draggedSlotIdx !== idx;

          if (!device) {
            return (
              <div
                key={`empty-slot-${idx}`}
                onDragOver={(e) => isCustomizeMode && handleDragOver(idx, e)}
                onDragLeave={() => isCustomizeMode && handleDragLeave(idx)}
                onDrop={(e) => isCustomizeMode && handleDrop(idx, e)}
                onClick={onOpenAddDevice}
                className={`aspect-video rounded-xl flex flex-col items-center justify-center transition-all p-4 group relative border-2 ${
                  isDragOver
                    ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/50 scale-[1.02]'
                    : isCustomizeMode
                    ? 'bg-[#121215]/80 border-dashed border-blue-500/40 hover:border-blue-400 cursor-move'
                    : 'bg-[#121215]/60 border-dashed border-zinc-800 hover:border-zinc-700 cursor-pointer'
                }`}
              >
                {/* Channel Label */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                  CH {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </div>

                {isDragOver ? (
                  <div className="flex flex-col items-center gap-1 text-emerald-300">
                    <ArrowLeftRight className="w-6 h-6 animate-pulse" />
                    <span className="text-xs font-bold">Drop to Assign to Channel {idx + 1}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-blue-600/10 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 mb-2 transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-200">
                      Add Camera to Slot #{idx + 1}
                    </span>
                    {isCustomizeMode && (
                      <span className="text-[10px] text-blue-400 mt-1 font-mono">
                        (Or drag camera here)
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          }

          const isActive = device.id === activeDeviceId;

          return (
            <div
              key={device.id}
              draggable={isCustomizeMode}
              onDragStart={(e) => isCustomizeMode && handleDragStart(idx, e)}
              onDragOver={(e) => isCustomizeMode && handleDragOver(idx, e)}
              onDragLeave={() => isCustomizeMode && handleDragLeave(idx)}
              onDrop={(e) => isCustomizeMode && handleDrop(idx, e)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectDevice(device.id)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                isDragging
                  ? 'opacity-40 scale-95 border-amber-500 shadow-2xl'
                  : isDragOver
                  ? 'border-emerald-400 ring-4 ring-emerald-500/40 scale-[1.02] shadow-2xl'
                  : isActive
                  ? 'border-blue-600 shadow-xl shadow-blue-900/30 ring-2 ring-blue-600/30'
                  : 'border-zinc-800 hover:border-zinc-700'
              } ${isCustomizeMode ? 'cursor-grab active:cursor-grabbing hover:border-blue-400' : 'cursor-pointer'}`}
            >
              {/* Live Feed Canvas */}
              <CameraStreamCanvas device={device} gridMode={true} />

              {/* Drag Over Overlay Prompt */}
              {isDragOver && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-200 z-30 pointer-events-none animate-in fade-in duration-150">
                  <ArrowLeftRight className="w-8 h-8 mb-1 text-emerald-400 animate-bounce" />
                  <span className="text-xs font-bold">Swap Position with Channel #{idx + 1}</span>
                  <span className="text-[10px] text-emerald-300 font-mono">Release to place "{device.name}"</span>
                </div>
              )}

              {/* Tile Top Info Banner & Drag Handle */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-xs text-white pointer-events-none z-10">
                <div className="flex items-center gap-1.5">
                  {/* Channel Number Badge */}
                  <span className="bg-[#09090b]/90 backdrop-blur-md px-1.5 py-0.5 rounded font-mono text-[10px] text-blue-400 border border-blue-500/30 font-bold">
                    CH {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>

                  {/* Camera Name */}
                  <span className="bg-[#09090b]/80 backdrop-blur-md px-2 py-0.5 rounded font-medium border border-zinc-700/50 truncate max-w-[130px] sm:max-w-[160px]">
                    {device.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isCustomizeMode && (
                    <div className="bg-blue-600 text-white p-1 rounded backdrop-blur-md flex items-center gap-1 pointer-events-auto cursor-grab active:cursor-grabbing shadow">
                      <GripVertical className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold pr-0.5">DRAG</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-[#09090b]/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-zinc-700/50">
                    <WifiSignalIcon
                      signalStrength={device.signalStrength}
                      pingMs={device.pingMs}
                      status={device.status}
                      showLatency={true}
                      size="sm"
                      variant="wifi"
                    />
                    <span className="text-[9px] font-mono">{device.quality}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Controls Ribbon (Live Mic VU Meter & Audio Toggle) */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
                {onToggleMuteDevice && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMuteDevice(device.id);
                    }}
                    className={`px-2 py-1 rounded-lg backdrop-blur-md text-[10px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shadow-lg ${
                      !device.isMuted && !device.isPrivacyMode
                        ? 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40'
                        : 'bg-[#09090b]/80 hover:bg-zinc-800 text-zinc-400 border-zinc-700/60'
                    }`}
                    title={!device.isMuted ? 'Microphone Audio Streaming - Click to Mute' : 'Microphone Muted - Click to Unmute'}
                  >
                    {!device.isMuted && !device.isPrivacyMode ? (
                      <>
                        <Volume2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <div className="flex items-end gap-0.5 h-2.5 w-2.5">
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-full"></span>
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-2/3"></span>
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-pulse h-4/5"></span>
                        </div>
                        <span className="font-mono">MIC ON</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="font-mono">MUTED</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Quick Select Overlay when not in Customize Mode */}
              {!isActive && !isCustomizeMode && (
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

      {/* Save Layout Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 text-zinc-100 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Save Custom Grid Layout</h3>
                <p className="text-[11px] text-zinc-400">Save screen channel positioning for quick recall</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300">Layout Preset Name:</label>
              <input
                type="text"
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="e.g. Front Gate & Yard Patrol"
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400">
              <p className="font-mono text-zinc-300 mb-1">Channels in this preset:</p>
              <div className="flex flex-wrap gap-1">
                {orderedDevices.map((d, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-zinc-900 rounded text-[10px] text-zinc-300 font-mono">
                    CH{i + 1}: {d ? d.name.slice(0, 10) + '...' : 'Empty'}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentLayout}
                disabled={!newLayoutName.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Layout Preset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
