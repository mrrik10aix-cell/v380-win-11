import React, { useState, useEffect } from 'react';
import { FaceProfile, AlarmEvent, Device } from '../types';
import {
  UserCheck,
  UserPlus,
  Sparkles,
  X,
  Plus,
  Trash2,
  Edit2,
  Bell,
  Volume2,
  ShieldCheck,
  Tag,
  Check,
  Search,
  Camera,
  Image,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FaceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  faces: FaceProfile[];
  unassignedEvents: AlarmEvent[];
  onAddFace: (face: FaceProfile) => void;
  onUpdateFace: (face: FaceProfile) => void;
  onDeleteFace: (id: string) => void;
  onEnrollFromEvent?: (event: AlarmEvent, name: string, role: FaceProfile['role'], priority: FaceProfile['alertPriority']) => void;
  preselectedEventForEnroll?: AlarmEvent | null;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80',
];

export const FaceLibraryModal: React.FC<FaceLibraryModalProps> = ({
  isOpen,
  onClose,
  faces,
  unassignedEvents,
  onAddFace,
  onUpdateFace,
  onDeleteFace,
  onEnrollFromEvent,
  preselectedEventForEnroll,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'enroll' | 'unassigned'>('library');
  const [editingFace, setEditingFace] = useState<FaceProfile | null>(null);

  // New Face Form State
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<FaceProfile['role']>('family');
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>(PRESET_AVATARS[0]);
  const [newAlertPriority, setNewAlertPriority] = useState<FaceProfile['alertPriority']>('normal');
  const [newNotes, setNewNotes] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (preselectedEventForEnroll) {
      setActiveTab('enroll');
      setSelectedEventId(preselectedEventForEnroll.id);
      if (preselectedEventForEnroll.snapshotUrl) {
        setNewAvatarUrl(preselectedEventForEnroll.snapshotUrl);
      }
      setNewName('');
    }
  }, [preselectedEventForEnroll]);

  if (!isOpen) return null;

  const handleSaveNewFace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (editingFace) {
      onUpdateFace({
        ...editingFace,
        name: newName,
        role: newRole,
        avatarUrl: newAvatarUrl,
        alertPriority: newAlertPriority,
        notes: newNotes,
      });
      setEditingFace(null);
    } else {
      const createdFace: FaceProfile = {
        id: `face-${Date.now()}`,
        name: newName,
        role: newRole,
        avatarUrl: newAvatarUrl,
        registeredDate: new Date().toISOString().split('T')[0],
        taggedCount: 1,
        confidenceScore: 98.6,
        alertPriority: newAlertPriority,
        notes: newNotes,
      };

      if (selectedEventId && onEnrollFromEvent) {
        const evt = unassignedEvents.find((e) => e.id === selectedEventId);
        if (evt) {
          onEnrollFromEvent(evt, newName, newRole, newAlertPriority);
        }
      }

      onAddFace(createdFace);
    }

    // Reset Form
    setNewName('');
    setNewNotes('');
    setSelectedEventId(null);
    setActiveTab('library');
  };

  const handleStartEdit = (face: FaceProfile) => {
    setEditingFace(face);
    setNewName(face.name);
    setNewRole(face.role);
    setNewAvatarUrl(face.avatarUrl);
    setNewAlertPriority(face.alertPriority);
    setNewNotes(face.notes || '');
    setActiveTab('enroll');
  };

  const filteredFaces = faces.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleBadges: Record<FaceProfile['role'], { label: string; color: string }> = {
    family: { label: 'Family', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    friend: { label: 'Friend', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    delivery: { label: 'Delivery', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    frequent_visitor: { label: 'Visitor', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    vip: { label: 'VIP', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    other: { label: 'Other', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 text-zinc-100 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-100">AI Face Library & Person Recognition</h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                IMOU & NETIP AI ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Name faces to convert generic motion alarms into personalized "Recognized Person" alerts
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#09090b] p-1.5 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditingFace(null);
                setActiveTab('library');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'library'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Enrolled Faces ({faces.length})</span>
            </button>

            <button
              onClick={() => {
                setEditingFace(null);
                setActiveTab('unassigned');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === 'unassigned'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Unassigned Motion Faces</span>
              {unassignedEvents.length > 0 && (
                <span className="bg-amber-500 text-zinc-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {unassignedEvents.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              setEditingFace(null);
              setNewName('');
              setActiveTab('enroll');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enroll New Face</span>
          </button>
        </div>

        {/* TAB 1: Enrolled Face Library Grid */}
        {activeTab === 'library' && (
          <div className="flex flex-col gap-4">
            {/* Search Filter */}
            <div className="flex items-center gap-2 bg-[#09090b] px-3 py-2 rounded-xl border border-zinc-800 text-xs">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search faces by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-zinc-100 placeholder-zinc-500 outline-none w-full"
              />
            </div>

            {filteredFaces.length === 0 ? (
              <div className="text-center py-10 bg-[#09090b]/50 border border-zinc-800 rounded-xl p-6">
                <UserCheck className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-300">No Enrolled Faces Found</p>
                <p className="text-xs text-zinc-500 mt-1">Enroll your first family member or courier to start personalized face alerts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredFaces.map((face) => (
                  <div
                    key={face.id}
                    className="bg-[#09090b] border border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 flex items-start gap-3.5 relative group transition-all"
                  >
                    <img
                      src={face.avatarUrl}
                      alt={face.name}
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-700 shadow-md shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-zinc-100 truncate">{face.name}</h4>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-md font-bold border ${
                            roleBadges[face.role]?.color ?? 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {roleBadges[face.role]?.label ?? face.role}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-zinc-400 font-mono">
                        <span>Confidence: <strong className="text-emerald-400">{face.confidenceScore}%</strong></span>
                        <span>•</span>
                        <span>Sightings: <strong className="text-blue-300">{face.taggedCount}x</strong></span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                        <span className="text-zinc-500 font-medium">Alert Action:</span>
                        <span className="font-bold text-zinc-300 capitalize bg-zinc-900 border border-zinc-800 px-1.5 py-0.2 rounded">
                          {face.alertPriority.replace('_', ' ')}
                        </span>
                      </div>

                      {face.notes && (
                        <p className="text-[10px] text-zinc-500 mt-1 italic truncate">{face.notes}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(face)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        title="Edit Face Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteFace(face.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Delete Face Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Enroll / Edit Face Form */}
        {activeTab === 'enroll' && (
          <form onSubmit={handleSaveNewFace} className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>{editingFace ? `Edit Profile: ${editingFace.name}` : 'Enroll New Person Face into AI Library'}</span>
            </h3>

            {/* Avatar Preview & Picker */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
              <div className="relative">
                <img
                  src={newAvatarUrl}
                  alt="Selected Avatar"
                  className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-zinc-950 p-1 rounded-full text-[10px] font-bold">
                  <Check className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 w-full flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-300">Choose Face Snapshot Photo:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewAvatarUrl(url)}
                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                        newAvatarUrl === url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                          : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-300">Person's Name / Alias:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah (Mom), Alex Courier..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-300">Relationship Category / Role:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as FaceProfile['role'])}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                >
                  <option value="family">Family Member</option>
                  <option value="friend">Friend / Relative</option>
                  <option value="delivery">Delivery Courier / Service</option>
                  <option value="frequent_visitor">Frequent Visitor / Neighbor</option>
                  <option value="vip">VIP Guest</option>
                  <option value="other">Other / Staff</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-300">Personalized Camera Alert Preference:</label>
                <select
                  value={newAlertPriority}
                  onChange={(e) => setNewAlertPriority(e.target.value as FaceProfile['alertPriority'])}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                >
                  <option value="welcome_chime">Play Welcome Chime on Camera Speaker</option>
                  <option value="priority_push">Priority Mobile Push Alert</option>
                  <option value="normal">Normal Motion Alert</option>
                  <option value="silent">Silent Log (Do Not Disturb)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-300">Notes & Special Instructions:</label>
                <input
                  type="text"
                  placeholder="e.g. Front porch delivery authorization..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>{editingFace ? 'Save Profile Changes' : 'Enroll Face Profile'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Unassigned Motion Face Snapshots */}
        {activeTab === 'unassigned' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-400 bg-[#09090b] p-3 rounded-xl border border-zinc-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>These are recent camera motion clips where an unidentified human face was detected. Click <strong>"+ Name Face"</strong> on any clip to save them directly to your Face Library!</span>
            </p>

            {unassignedEvents.length === 0 ? (
              <div className="text-center py-10 bg-[#09090b]/50 border border-zinc-800 rounded-xl p-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-200">All Motion Faces Are Named!</p>
                <p className="text-xs text-zinc-500 mt-1">There are currently no unrecognized face clips pending enrollment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unassignedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-[#09090b] border border-zinc-800 rounded-xl p-3 flex gap-3 items-center"
                  >
                    <img
                      src={evt.snapshotUrl || PRESET_AVATARS[0]}
                      alt={evt.deviceName}
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-700 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate">{evt.deviceName}</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{evt.timestamp}</p>
                      <span className="inline-block text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold mt-1">
                        UNASSIGNED FACE
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        if (evt.snapshotUrl) setNewAvatarUrl(evt.snapshotUrl);
                        setNewName('');
                        setActiveTab('enroll');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 shadow-md transition-all flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Name Face</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
