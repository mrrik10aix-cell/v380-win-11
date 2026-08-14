import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { Device, SavedGridLayout } from '../types';
import { CameraStreamCanvas } from './CameraStreamCanvas';
import { WifiSignalIcon } from './WifiSignalIcon';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Plus,
  GripVertical,
  Bookmark,
  Check,
  Trash2,
  LayoutGrid,
  Unlock,
  Move,
  ArrowLeftRight,
  Layers,
  Sparkles
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

// Spring transition settings for natural, high-performance UI morphing
const gridSpringTransition = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
  mass: 0.9,
};

const tileVariants = {
  initial: { opacity: 0, scale: 0.92, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.18,
      ease: 'easeOut' as const,
    },
  },
};

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
            order: devices.slice(0, 4).map((d) => d.id),
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
        const validIds = parsed.filter((id) => devices.some((d) => d.id === id));
        const missingIds = devices.map((d) => d.id).filter((id) => !validIds.includes(id));
        setSlotDeviceIds([...validIds, ...missingIds]);
      } else {
        setSlotDeviceIds(devices.map((d) => d.id));
      }
    } catch {
      setSlotDeviceIds(devices.map((d) => d.id));
    }
  }, [devices, gridMode, storageOrderKey]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Reorder slots
  const handleSwapSlots = (sourceIdx: number, targetIdx: number) => {
    if (sourceIdx === targetIdx) return;

    setSlotDeviceIds((prev) => {
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

    const updated = [...savedLayouts.filter((l) => l.name !== newLayout.name), newLayout];
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
    const validIds = layout.order.filter((id) => devices.some((d) => d.id === id));
    const missingIds = devices.map((d) => d.id).filter((id) => !validIds.includes(id));
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
    const defaultIds = devices.map((d) => d.id);
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
    const updated = savedLayouts.filter((l) => l.id !== layoutId);
    setSavedLayouts(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LAYOUTS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (activeLayoutName === savedLayouts.find((l) => l.id === layoutId)?.name) {
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
    const dev = devices.find((d) => d.id === id) || null;
    orderedDevices.push(dev);
  }

  const gridColsClass =
    gridMode === '4' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <LayoutGroup id="multiview-matrix-group">
      <motion.div
        layout
        transition={gridSpringTransition}
        className="flex flex-col gap-3 w-full my-2"
      >
        {/* Custom Grid Layout Toolbar */}
        <motion.div
          layout
          className="bg-[#121215] border border-zinc-800 rounded-xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-lg"
        >
          {/* Left: Layout Info & Status */}
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0"
            >
              <LayoutGrid className="w-4 h-4" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100">
                  Multi-View Matrix ({gridMode}-Grid)
                </span>
                <motion.span
                  key={activeLayoutName}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full text-zinc-300 font-medium"
                >
                  {activeLayoutName}
                </motion.span>
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
                type="button"
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
                .filter((l) => l.gridMode === gridMode)
                .map((l) => (
                  <div key={l.id} className="relative group flex items-center">
                    <button
                      type="button"
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
                        type="button"
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
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setNewLayoutName(`Layout ${savedLayouts.length + 1}`);
                setIsSaveModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700/80 transition-all cursor-pointer"
              title="Save current camera screen positions as a custom layout"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Save Layout</span>
            </motion.button>

            {/* Reorder / Lock Mode Toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
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
            </motion.button>
          </div>
        </motion.div>

        {/* Floating Feedback Toast with AnimatePresence */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xl self-center"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{feedbackToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reorder Hint Banner when in Customize Mode */}
        <AnimatePresence>
          {isCustomizeMode && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="bg-blue-950/40 border border-blue-500/40 rounded-xl p-2.5 text-xs text-blue-200 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-blue-400 animate-bounce shrink-0" />
                  <span>
                    <strong>Drag and Drop Mode Enabled:</strong> Grab any camera tile and drop it onto another channel position to swap views.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomizeMode(false)}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shrink-0 active:scale-95 transition-transform"
                >
                  Done Reordering
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Matrix with Motion Layout Animations */}
        <motion.div
          layout
          transition={gridSpringTransition}
          className={`grid ${gridColsClass} gap-3.5 w-full`}
        >
          <AnimatePresence mode="popLayout">
            {orderedDevices.map((device, idx) => {
              const isDragging = draggedSlotIdx === idx;
              const isDragOver = dragOverSlotIdx === idx && draggedSlotIdx !== idx;
              const itemKey = device ? `dev-${device.id}` : `empty-slot-ch-${idx}`;

              if (!device) {
                return (
                  <motion.div
                    key={itemKey}
                    layout
                    variants={tileVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={gridSpringTransition}
                    onDragOver={(e) => isCustomizeMode && handleDragOver(idx, e)}
                    onDragLeave={() => isCustomizeMode && handleDragLeave(idx)}
                    onDrop={(e) => isCustomizeMode && handleDrop(idx, e)}
                    onClick={onOpenAddDevice}
                    whileHover={{ scale: isCustomizeMode ? 1.01 : 1.005 }}
                    whileTap={{ scale: 0.98 }}
                    className={`aspect-video rounded-xl flex flex-col items-center justify-center transition-colors p-4 group relative border-2 ${
                      isDragOver
                        ? 'bg-emerald-950/50 border-emerald-400 ring-4 ring-emerald-500/50 scale-[1.02]'
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
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-1 text-emerald-300"
                      >
                        <ArrowLeftRight className="w-6 h-6 animate-pulse" />
                        <span className="text-xs font-bold">Drop to Assign to Channel {idx + 1}</span>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ rotate: 90, scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 350 }}
                          className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-blue-600/10 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 mb-2 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </motion.div>
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
                  </motion.div>
                );
              }

              const isActive = device.id === activeDeviceId;

              return (
                <motion.div
                  key={itemKey}
                  layout
                  variants={tileVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={gridSpringTransition}
                  draggable={isCustomizeMode}
                  onDragStart={(e) => isCustomizeMode && handleDragStart(idx, e)}
                  onDragOver={(e) => isCustomizeMode && handleDragOver(idx, e)}
                  onDragLeave={() => isCustomizeMode && handleDragLeave(idx)}
                  onDrop={(e) => isCustomizeMode && handleDrop(idx, e)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectDevice(device.id)}
                  whileHover={{ scale: isCustomizeMode ? 1.015 : 1.008 }}
                  whileTap={{ scale: 0.985 }}
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
                  <AnimatePresence>
                    {isDragOver && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-200 z-30 pointer-events-none"
                      >
                        <ArrowLeftRight className="w-8 h-8 mb-1 text-emerald-400 animate-bounce" />
                        <span className="text-xs font-bold">Swap Position with Channel #{idx + 1}</span>
                        <span className="text-[10px] text-emerald-300 font-mono">
                          Release to place "{device.name}"
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMuteDevice(device.id);
                        }}
                        className={`px-2 py-1 rounded-lg backdrop-blur-md text-[10px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shadow-lg active:scale-95 ${
                          !device.isMuted && !device.isPrivacyMode
                            ? 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40'
                            : 'bg-[#09090b]/80 hover:bg-zinc-800 text-zinc-400 border-zinc-700/60'
                        }`}
                        title={
                          !device.isMuted
                            ? 'Microphone Audio Streaming - Click to Mute'
                            : 'Microphone Muted - Click to Unmute'
                        }
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Save Layout Modal with AnimatePresence */}
        <AnimatePresence>
          {isSaveModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setIsSaveModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="relative bg-[#121215] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 text-zinc-100 shadow-2xl flex flex-col gap-4 z-10"
              >
                <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">Save Custom Grid Layout</h3>
                    <p className="text-[11px] text-zinc-400">
                      Save screen channel positioning for quick recall
                    </p>
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
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-zinc-900 rounded text-[10px] text-zinc-300 font-mono"
                      >
                        CH{i + 1}: {d ? d.name.slice(0, 10) + '...' : 'Empty'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSaveModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCurrentLayout}
                    disabled={!newLayoutName.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Layout Preset</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};
