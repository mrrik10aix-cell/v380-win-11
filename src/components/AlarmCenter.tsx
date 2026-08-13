import React, { useState } from 'react';
import { AlarmEvent, Device } from '../types';
import {
  Bell,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Filter,
  CheckCircle2,
  Trash2,
  Play,
  Eye,
  AlertTriangle,
  Volume2,
  Lock,
  UserCheck,
  UserPlus
} from 'lucide-react';

interface AlarmCenterProps {
  events: AlarmEvent[];
  devices: Device[];
  onSelectEvent: (event: AlarmEvent) => void;
  onAnalyzeEventWithGemini: (event: AlarmEvent) => void;
  onMarkAllRead: () => void;
  onClearEvents: () => void;
  armMode: 'away' | 'home' | 'sleep';
  onChangeArmMode: (mode: 'away' | 'home' | 'sleep') => void;
  onNameFaceForEvent?: (event: AlarmEvent) => void;
}

export const AlarmCenter: React.FC<AlarmCenterProps> = ({
  events,
  devices,
  onSelectEvent,
  onAnalyzeEventWithGemini,
  onMarkAllRead,
  onClearEvents,
  armMode,
  onChangeArmMode,
  onNameFaceForEvent,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');

  const filteredEvents = events.filter((evt) => {
    if (filterType !== 'all' && evt.type !== filterType) return false;
    if (filterDevice !== 'all' && evt.deviceId !== filterDevice) return false;
    return true;
  });

  const unreadCount = events.filter((e) => !e.read).length;

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl text-zinc-100 flex flex-col gap-6">
      {/* Top Banner: Arming Status & Mode Switcher */}
      <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
              armMode === 'away'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : armMode === 'home'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">V380s Pro Guard Protection</h2>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-semibold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {armMode === 'away'
                ? 'Away Mode: Maximum sensitivity, instant push alerts enabled.'
                : armMode === 'home'
                ? 'Home Mode: Perimeter outdoor sensors active, indoor alerts silenced.'
                : 'Sleep Mode: Night vision IR & sound detection armed.'}
            </p>
          </div>
        </div>

        {/* Arming Mode Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => onChangeArmMode('away')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              armMode === 'away'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Away Arm
          </button>
          <button
            onClick={() => onChangeArmMode('home')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              armMode === 'home'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Home Arm
          </button>
          <button
            onClick={() => onChangeArmMode('sleep')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              armMode === 'sleep'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sleep Arm
          </button>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#09090b] p-3 rounded-xl border border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-zinc-300">Filter Alarms:</span>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-blue-500"
          >
            <option value="all">All Alert Types</option>
            <option value="motion_human">Human Motion</option>
            <option value="motion_vehicle">Vehicle Motion</option>
            <option value="motion_pet">Pet Motion</option>
            <option value="abnormal_sound">Abnormal Sound</option>
            <option value="tamper">Camera Tamper</option>
          </select>

          {/* Device Filter */}
          <select
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-blue-500"
          >
            <option value="all">All Cameras ({devices.length})</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-blue-400 font-semibold border border-zinc-700 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Read ({unreadCount})
            </button>
          )}

          <button
            onClick={onClearEvents}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors"
            title="Clear all alerts"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alarm Events Feed */}
      <div className="flex flex-col gap-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-[#09090b]/40 rounded-xl border border-zinc-800/60 p-6">
            <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-300">No Alarm Messages Found</p>
            <p className="text-xs text-zinc-500 mt-1">All monitored spaces are clear and secure.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                !evt.read
                  ? 'bg-[#09090b] border-blue-500/40 shadow-lg shadow-blue-900/10'
                  : 'bg-[#09090b]/60 border-zinc-800 opacity-90 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Event Type Badge Icon */}
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    evt.type === 'motion_human'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : evt.type === 'motion_vehicle'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : evt.type === 'abnormal_sound'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-zinc-100">{evt.deviceName}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 capitalize">
                      {evt.type.replace('_', ' ')}
                    </span>
                    {evt.isRecognizedPerson && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span>Recognized: {evt.recognizedFaceName}</span>
                      </span>
                    )}
                    {!evt.read && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Recognized Person Spotlight Card */}
                  {evt.isRecognizedPerson && evt.recognizedFaceAvatar && (
                    <div className="mt-2 bg-emerald-950/30 border border-emerald-500/30 p-2 rounded-xl flex items-center gap-2.5">
                      <img
                        src={evt.recognizedFaceAvatar}
                        alt={evt.recognizedFaceName}
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-500/50 shrink-0"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-emerald-200">Person Matched: {evt.recognizedFaceName}</p>
                        <p className="text-[10px] text-emerald-400/80 capitalize">
                          Category: {evt.recognizedFaceRole ?? 'Family'} • Triggered Personalized Alert Response
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 mt-1">{evt.aiAnalysis}</p>

                  {/* AI Tags */}
                  {evt.aiTags && evt.aiTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {evt.aiTags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-[11px] text-zinc-500 font-mono mt-1.5 block">{evt.timestamp}</span>
                </div>
              </div>

              {/* Event Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                {evt.type === 'motion_human' && !evt.isRecognizedPerson && onNameFaceForEvent && (
                  <button
                    onClick={() => onNameFaceForEvent(evt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    title="Enroll detected person face into Face Library"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Name Face</span>
                  </button>
                )}

                <button
                  onClick={() => onAnalyzeEventWithGemini(evt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Gemini Inspect</span>
                </button>

                <button
                  onClick={() => onSelectEvent(evt)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>View Clip</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
