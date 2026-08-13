import React, { useState } from 'react';
import { Device, AlarmEvent } from '../types';
import {
  Play,
  Pause,
  Cloud,
  HardDrive,
  Download,
  Calendar,
  FastForward,
  Rewind,
  Clock,
  Sparkles,
  ShieldCheck,
  Film
} from 'lucide-react';

interface TimelinePlaybackProps {
  device: Device;
  events: AlarmEvent[];
  onExportClip: (title: string, durationSec: number) => void;
  onAnalyzeWithAi?: (event: AlarmEvent) => void;
}

export const TimelinePlayback: React.FC<TimelinePlaybackProps> = ({
  device,
  events,
  onExportClip,
  onAnalyzeWithAi,
}) => {
  const [source, setSource] = useState<'cloud' | 'sd'>('cloud');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedHour, setSelectedHour] = useState<number>(14); // 0-23
  const [selectedMinute, setSelectedMinute] = useState<number>(15); // 0-59
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-28');

  // Device alarm events for selected camera
  const cameraEvents = events.filter((e) => e.deviceId === device.id);

  const speeds = [0.5, 1, 2, 4, 8];

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const totalMinutes = Math.round(ratio * 24 * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    setSelectedHour(h);
    setSelectedMinute(m);
    setIsPlaying(true);
  };

  const formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}:00`;

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow-xl text-zinc-100 flex flex-col gap-4">
      {/* Top Header: Source Selector & Date Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#09090b] p-3 rounded-xl border border-zinc-800">
        {/* Storage Source Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setSource('cloud')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              source === 'cloud'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Playback</span>
            <span className="text-[10px] bg-[#09090b]/40 px-1.5 py-0.2 rounded text-blue-300">AES-256</span>
          </button>

          <button
            onClick={() => setSource('sd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              source === 'sd'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>MicroSD Card ({device.storage.sdCardUsedGB}GB / {device.storage.sdCardSizeGB}GB)</span>
          </button>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs">
          <Calendar className="w-4 h-4 text-blue-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-zinc-200 font-mono outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Interactive 24-Hour Scrubbable Timeline Ruler */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2 font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-zinc-200 font-bold text-sm">{formattedTime}</span>
            <span className="text-zinc-500">({selectedDate})</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Continuous
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Human Motion
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span> Sound Spike
            </span>
          </div>
        </div>

        {/* Ruler Bar Container */}
        <div
          onClick={handleTimelineClick}
          className="relative h-14 bg-[#09090b] rounded-xl border border-zinc-800 overflow-hidden cursor-pointer select-none group"
        >
          {/* Continuous Record Background Spans */}
          <div className="absolute top-2 bottom-2 left-[5%] right-[10%] bg-blue-600/40 rounded-sm"></div>

          {/* Motion Event Highlights (Red and Amber bars) */}
          <div className="absolute top-1 bottom-1 left-[32%] w-3 bg-rose-500 rounded shadow-md shadow-rose-500/50"></div>
          <div className="absolute top-1 bottom-1 left-[58%] w-4 bg-rose-500 rounded shadow-md shadow-rose-500/50"></div>
          <div className="absolute top-1 bottom-1 left-[24%] w-2 bg-amber-400 rounded"></div>
          <div className="absolute top-1 bottom-1 left-[75%] w-3 bg-rose-500 rounded"></div>

          {/* Hour Tick Marks (00 to 24) */}
          <div className="absolute inset-0 flex justify-between items-end px-1 pb-1 pointer-events-none">
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-0.5 h-3 bg-zinc-700"></div>
                <span className="text-[9px] font-mono text-zinc-500">{String(i * 2).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>

          {/* Selected Time Scrub Cursor Pin */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 shadow-[0_0_10px_#2563eb]"
            style={{ left: `${((selectedHour * 60 + selectedMinute) / (24 * 60)) * 100}%` }}
          >
            <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-zinc-950"></div>
          </div>
        </div>
      </div>

      {/* Playback Controls & Speed Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#09090b]/60 p-3 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          {/* Rewind 10s */}
          <button
            onClick={() => setSelectedMinute((m) => Math.max(0, m - 1))}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-transform active:scale-95 shadow-lg shadow-blue-900/30"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
          </button>

          {/* Fast Forward 10s */}
          <button
            onClick={() => setSelectedMinute((m) => Math.min(59, m + 1))}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <span className="text-[10px] text-zinc-400 px-2 font-medium">Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition-all ${
                speed === s ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Download Clip */}
        <button
          onClick={() => onExportClip(`Replay_${device.name.replace(/\s+/g, '_')}_${selectedDate}_${selectedHour}h`, 30)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Save Clip to Album</span>
        </button>
      </div>

      {/* Alarm Events Logged at Selected Replay Time */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-400">Motion Alerts Recorded on {selectedDate}:</span>
        {cameraEvents.length === 0 ? (
          <p className="text-xs text-zinc-500 italic bg-[#09090b] p-3 rounded-xl border border-zinc-800">
            No motion alert events recorded on this date for {device.name}.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cameraEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#09090b] p-3 rounded-xl border border-zinc-800 flex items-start justify-between gap-2 hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-bold text-zinc-200 capitalize">
                      {evt.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{evt.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">{evt.aiAnalysis}</p>
                </div>

                {onAnalyzeWithAi && (
                  <button
                    onClick={() => onAnalyzeWithAi(evt)}
                    className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 text-blue-300 text-[10px] font-medium flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3 h-3 text-blue-400" /> AI Check
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
