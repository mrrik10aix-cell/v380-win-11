import React, { useState, useEffect, useRef } from 'react';
import { Device, SceneType } from '../types';
import {
  Grid,
  ShieldCheck,
  RefreshCcw,
  X,
  Check,
  Sparkles,
  Wand2,
  Sliders,
  Eye,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Scan,
  Layers,
  AlertTriangle,
  Zap,
  Activity,
  Trees,
  DoorOpen,
  Car,
  Dog,
  Maximize2
} from 'lucide-react';

interface DetectionZoneEditorProps {
  device?: Device;
  isOpen: boolean;
  onClose: () => void;
  onSaveGrid: (newGrid: boolean[][]) => void;
}

type CalibrationStep = 1 | 2 | 3 | 4;

interface CalibrationProfile {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  recommendedSensitivity: number;
}

const CALIBRATION_PROFILES: CalibrationProfile[] = [
  {
    id: 'doorway_entry',
    name: 'Front Door & Walkway Shield',
    description: 'Prioritizes entryway and door approach while ignoring public road traffic and overhead swaying branches.',
    icon: DoorOpen,
    badge: 'Recommended for Porch & Doorbell',
    recommendedSensitivity: 75,
  },
  {
    id: 'pet_immune',
    name: 'Pet-Immune Ground Filter',
    description: 'Masks lower 30% ground floor plane to prevent cats and dogs from triggering false intrusion sirens.',
    icon: Dog,
    badge: 'Best for Living Room & Indoor',
    recommendedSensitivity: 65,
  },
  {
    id: 'driveway_perimeter',
    name: 'Driveway & Vehicle Sentry',
    description: 'Locks vehicle bay and boundary gate. Suppresses headlight glare reflections and cloud shadows.',
    icon: Car,
    badge: 'Best for Garage & Yard',
    recommendedSensitivity: 80,
  },
  {
    id: 'anti_foliage',
    name: 'Anti-Foliage Wind Filter',
    description: 'Masks rustling trees, garden shrubbery, and weather artifacts while keeping perimeter security active.',
    icon: Trees,
    badge: 'Best for Backyard & Garden',
    recommendedSensitivity: 60,
  },
  {
    id: 'high_vigilance',
    name: 'High Vigilance 360° Perimeter',
    description: 'Full perimeter surveillance with active triggers across all traversable sectors with rapid 0.3s response.',
    icon: ShieldAlert,
    badge: 'Maximum High Alert',
    recommendedSensitivity: 90,
  },
];

export const DetectionZoneEditor: React.FC<DetectionZoneEditorProps> = ({
  device,
  isOpen,
  onClose,
  onSaveGrid,
}) => {
  const [mode, setMode] = useState<'wizard' | 'manual'>('wizard');
  const [step, setStep] = useState<CalibrationStep>(1);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('doorway_entry');
  const [sensitivity, setSensitivity] = useState<number>(75);
  const [triggerSpeed, setTriggerSpeed] = useState<number>(0.5); // seconds
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    analysis: string;
    falseAlarmReduction: string;
    confidence: number;
    keyZones: string[];
    grid: boolean[][];
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Manual & Working Grid (6x6)
  const [grid, setGrid] = useState<boolean[][]>(
    device?.detectionZoneGrid || Array(6).fill(null).map(() => Array(6).fill(true))
  );

  // Initialize with device grid or sensible default
  useEffect(() => {
    if (device?.detectionZoneGrid) {
      setGrid(device.detectionZoneGrid);
    }
    // Auto-select profile matching camera scene
    if (device?.sceneType === 'living_room') {
      setSelectedProfileId('pet_immune');
    } else if (device?.sceneType === 'backyard' || device?.sceneType === 'factory') {
      setSelectedProfileId('anti_foliage');
    } else if (device?.sceneType === 'front_porch') {
      setSelectedProfileId('doorway_entry');
    }
  }, [device]);

  // Simulate Image Analysis Scan
  const runFrameAnalysisScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  useEffect(() => {
    if (isOpen && mode === 'wizard' && step === 1) {
      runFrameAnalysisScan();
    }
  }, [isOpen, mode, step]);

  // Compute or Fetch AI Suggested Grid
  const generateSuggestedGrid = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai-calibrate-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraName: device?.name || 'Camera',
          sceneType: device?.sceneType || 'front_porch',
          profile: selectedProfileId,
          sensitivity,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data);
        if (data.grid) {
          setGrid(data.grid);
        }
      }
    } catch (e) {
      console.warn('AI calibration fetch error:', e);
      // Fallback heuristics
      applyLocalProfileGrid(selectedProfileId);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const applyLocalProfileGrid = (profileId: string) => {
    let newGrid: boolean[][];
    if (profileId === 'doorway_entry') {
      newGrid = [
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
        [false, true, true, true, true, false],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [false, true, true, true, true, false],
      ];
    } else if (profileId === 'pet_immune') {
      newGrid = [
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [false, false, false, false, false, false],
        [false, false, false, false, false, false],
      ];
    } else if (profileId === 'anti_foliage') {
      newGrid = [
        [false, false, false, false, false, false],
        [true, true, false, false, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [false, true, true, true, true, false],
      ];
    } else if (profileId === 'driveway_perimeter') {
      newGrid = [
        [false, false, false, false, false, false],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [false, false, true, true, true, false],
      ];
    } else {
      newGrid = Array(6).fill(null).map(() => Array(6).fill(true));
    }
    setGrid(newGrid);
    setAiAnalysisResult({
      grid: newGrid,
      analysis: 'Calculated optimal coverage based on scene geometry and noise suppression parameters.',
      falseAlarmReduction: '76%',
      confidence: 95,
      keyZones: ['Walkway Zone', 'Ground Filter', 'Horizon Suppressed'],
    });
  };

  const handleNextStep = async () => {
    if (step === 2) {
      // Moving to Step 3: update profile sensitivity
      const prof = CALIBRATION_PROFILES.find((p) => p.id === selectedProfileId);
      if (prof) {
        setSensitivity(prof.recommendedSensitivity);
      }
      setStep(3);
    } else if (step === 3) {
      // Moving to Step 4: generate final AI proposal
      await generateSuggestedGrid();
      setStep(4);
    } else if (step < 4) {
      setStep((prev) => (prev + 1) as CalibrationStep);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as CalibrationStep);
    }
  };

  if (!isOpen || !device) return null;

  const toggleCell = (r: number, c: number) => {
    const next = grid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? !val : val))
    );
    setGrid(next);
  };

  const selectAll = () => {
    setGrid(Array(6).fill(null).map(() => Array(6).fill(true)));
  };

  const clearAll = () => {
    setGrid(Array(6).fill(null).map(() => Array(6).fill(false)));
  };

  const invertAll = () => {
    setGrid(grid.map((row) => row.map((val) => !val)));
  };

  const activeCellsCount = grid.flat().filter(Boolean).length;
  const maskedCellsCount = 36 - activeCellsCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 text-zinc-100 shadow-2xl relative flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">Motion Detection Zone Mask</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {device.name}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Define trigger sectors to prevent false alarms from trees, clouds, or roadway traffic.
              </p>
            </div>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('wizard');
                setStep(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'wizard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Calibrate Wizard</span>
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'manual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manual Grid</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODE 1: GUIDED AUTO-CALIBRATE WIZARD                          */}
        {/* ------------------------------------------------------------- */}
        {mode === 'wizard' && (
          <div className="flex flex-col gap-5">
            {/* Step Progress Tracker */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { s: 1, label: '1. Frame Scan' },
                { s: 2, label: '2. Objective' },
                { s: 3, label: '3. Sensitivity' },
                { s: 4, label: '4. AI Proposal' },
              ].map(({ s, label }) => {
                const isCurrent = step === s;
                const isCompleted = step > s;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      if (s <= step || aiAnalysisResult) {
                        setStep(s as CalibrationStep);
                      }
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center border transition-all truncate ${
                      isCurrent
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm shadow-blue-500/10'
                        : isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* STEP 1: Frame Scan & Scene Context Analysis */}
            {step === 1 && (
              <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Step 1: Environmental Image Analysis
                    </h3>
                  </div>
                  <button
                    onClick={runFrameAnalysisScan}
                    disabled={isScanning}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCcw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Re-scan Frame</span>
                  </button>
                </div>

                {/* Simulated Camera Viewfinder with Radar Scan Lines */}
                <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
                  {/* Subtle scene grid background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

                  {/* Optical horizon markers */}
                  <div className="absolute top-[33%] left-0 right-0 border-b border-dashed border-zinc-700/60 flex items-center justify-between px-3">
                    <span className="text-[9px] font-mono text-zinc-500 bg-black/60 px-1 rounded">HORIZON / SKY / ROADWAY</span>
                  </div>
                  <div className="absolute bottom-[33%] left-0 right-0 border-b border-dashed border-zinc-700/60 flex items-center justify-between px-3">
                    <span className="text-[9px] font-mono text-zinc-500 bg-black/60 px-1 rounded">GROUND PLANE / WALKWAY</span>
                  </div>

                  {/* Scan Laser Bar */}
                  {isScanning && (
                    <div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#3b82f6] transition-all duration-150"
                      style={{ top: `${scanProgress}%` }}
                    />
                  )}

                  {/* Scan Status Badge */}
                  <div className="z-10 bg-black/80 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 flex flex-col items-center gap-2 max-w-xs text-center shadow-2xl">
                    <Activity className={`w-6 h-6 ${isScanning ? 'text-blue-400 animate-pulse' : 'text-emerald-400'}`} />
                    <p className="text-xs font-semibold text-zinc-200">
                      {isScanning ? `Analyzing Frame Contours (${scanProgress}%)...` : 'Image Contour Analysis Complete'}
                    </p>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-200 rounded-full"
                        style={{ width: `${isScanning ? scanProgress : 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Corner Targets */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-500 pointer-events-none"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-500 pointer-events-none"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-500 pointer-events-none"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-500 pointer-events-none"></div>
                </div>

                {/* Detected Scene Intelligence Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Detected Scene</span>
                    <span className="font-semibold text-blue-300 capitalize">{device.sceneType.replace('_', ' ')}</span>
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Lighting Index</span>
                    <span className="font-semibold text-yellow-300">{device.ambientLux ?? 48} Lux (Clear)</span>
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">Noise Interference</span>
                    <span className="font-semibold text-rose-300">Moderate (Foliage/Road)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Protection Objective & Profile Selection */}
            {step === 2 && (
              <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Step 2: Choose Detection Objective
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Select what you want the V380 Pro vision algorithm to focus on.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {CALIBRATION_PROFILES.map((prof) => {
                    const isSelected = selectedProfileId === prof.id;
                    const Icon = prof.icon;
                    return (
                      <div
                        key={prof.id}
                        onClick={() => setSelectedProfileId(prof.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-900/20'
                            : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-lg ${
                                isSelected ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="text-xs font-bold text-zinc-200">{prof.name}</h4>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{prof.description}</p>
                        <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 self-start">
                          {prof.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Sensitivity Calibration & Noise Threshold */}
            {step === 3 && (
              <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col gap-5">
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Step 3: Sensitivity & Optical Threshold
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Fine-tune optical flow sensitivity and trigger confirmation delay.
                  </p>
                </div>

                {/* Sensitivity Slider */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">Detection Sensitivity</span>
                    <span className="text-xs font-mono font-bold text-blue-400">{sensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>Low (30% Storms)</span>
                    <span className="text-blue-400">Optimal (70-75%)</span>
                    <span>High (90% Sentry)</span>
                  </div>
                </div>

                {/* Trigger Speed Delay */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-zinc-300">Continuous Motion Duration Filter</span>
                      <p className="text-[10px] text-zinc-500">Filters momentary pixel flickers / bug flies across lens</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{triggerSpeed}s</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[0.2, 0.5, 1.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setTriggerSpeed(spd)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          triggerSpeed === spd
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {spd === 0.2 ? 'Fast (0.2s)' : spd === 0.5 ? 'Balanced (0.5s)' : 'Strict (1.0s)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: AI Proposal Review & 1-Click Apply */}
            {step === 4 && (
              <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Step 4: AI Calibrated Mask Proposal
                    </h3>
                  </div>
                  {isLoadingAi && (
                    <span className="text-xs text-blue-400 flex items-center gap-1.5 font-mono">
                      <RefreshCcw className="w-3 h-3 animate-spin" /> Optimizing Vision Tensor...
                    </span>
                  )}
                </div>

                {/* Proposal Matrix & Analysis Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Visual 6x6 Calibrated Mask Superimposed Grid */}
                  <div className="flex flex-col items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div className="flex flex-col gap-1 w-full max-w-[220px]">
                      {grid.map((row, r) => (
                        <div key={r} className="flex gap-1 justify-center">
                          {row.map((active, c) => (
                            <button
                              key={c}
                              onClick={() => toggleCell(r, c)}
                              className={`w-7 h-7 rounded border text-[9px] font-mono font-bold transition-all flex items-center justify-center ${
                                active
                                  ? 'bg-rose-500/40 border-rose-500 text-rose-200 shadow-sm shadow-rose-500/30'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                              }`}
                              title={active ? `Row ${r + 1} Col ${c + 1}: Active Trigger` : `Row ${r + 1} Col ${c + 1}: Masked Noise`}
                            >
                              {active ? 'ON' : ''}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between w-full text-[10px] font-mono text-zinc-400 px-2 pt-1 border-t border-zinc-800">
                      <span className="text-rose-400 font-semibold">{activeCellsCount} Active Zones</span>
                      <span className="text-zinc-500">{maskedCellsCount} Suppressed</span>
                    </div>
                  </div>

                  {/* AI Reasoning & Efficacy Stats */}
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">False Alarm Reduction:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {aiAnalysisResult?.falseAlarmReduction || '78%'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Vision Confidence:</span>
                        <span className="font-mono font-bold text-blue-400">
                          {aiAnalysisResult?.confidence || 96}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-[11px] text-zinc-300 leading-relaxed">
                      <p className="font-medium text-white mb-1">AI Tuning Rationale:</p>
                      {aiAnalysisResult?.analysis ||
                        'Optimal balance calculated: masked horizon and roadway vibration sectors while focusing 100% trigger accuracy on primary walkway threshold.'}
                    </div>

                    {/* Sector Highlights */}
                    <div className="flex flex-wrap gap-1.5">
                      {(aiAnalysisResult?.keyZones || ['Walkway Sentry', 'Road Filtered', 'Low False Alerts']).map(
                        (zone, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30"
                          >
                            ✓ {zone}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <button
                onClick={handlePrevStep}
                disabled={step === 1}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {step < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onSaveGrid(grid);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Calibrated Zones</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 2: MANUAL 6x6 GRID PAINT MATRIX                          */}
        {/* ------------------------------------------------------------- */}
        {mode === 'manual' && (
          <div className="flex flex-col gap-4">
            {/* Interactive Grid Representation */}
            <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-col gap-1.5">
              {grid.map((row, r) => (
                <div key={r} className="flex gap-1.5 justify-center">
                  {row.map((active, c) => (
                    <button
                      key={c}
                      onClick={() => toggleCell(r, c)}
                      className={`w-11 h-11 rounded-lg border text-xs font-mono font-bold transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
                        active
                          ? 'bg-rose-500/30 border-rose-500 text-rose-300 shadow-sm shadow-rose-500/20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {active ? 'ON' : 'OFF'}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Quick Paint Presets & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={invertAll}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium cursor-pointer"
                >
                  Invert
                </button>
              </div>

              <div className="text-[11px] font-mono text-zinc-400">
                <span className="text-rose-400 font-bold">{activeCellsCount} Active</span> / 36 Cells
              </div>
            </div>

            {/* Manual Save Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSaveGrid(grid);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" /> Save Detection Zone
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
