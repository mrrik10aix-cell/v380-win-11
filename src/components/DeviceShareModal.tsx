import React, { useState } from 'react';
import { Device, SharedUser } from '../types';
import { Users, QrCode, Plus, Trash2, Shield, X, Copy, Check, Share2 } from 'lucide-react';

interface DeviceShareModalProps {
  device?: Device;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDeviceSharing: (updatedSharedUsers: SharedUser[]) => void;
}

export const DeviceShareModal: React.FC<DeviceShareModalProps> = ({
  device,
  isOpen,
  onClose,
  onUpdateDeviceSharing,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Viewer' | 'Admin' | 'Family'>('Family');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !device) return null;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    const newUser: SharedUser = {
      id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      addedAt: new Date().toISOString().slice(0, 10),
    };

    onUpdateDeviceSharing([...device.sharedWith, newUser]);
    setNewName('');
    setNewEmail('');
  };

  const handleRemoveMember = (userId: string) => {
    onUpdateDeviceSharing(device.sharedWith.filter((u) => u.id !== userId));
  };

  const shareCode = `V380-SHARE-${device.id.toUpperCase()}-2026`;

  const copyShareCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-xl max-w-lg w-full p-6 text-zinc-100 shadow-2xl relative flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Share "{device.name}"</h2>
            <p className="text-xs text-zinc-400">Invite family members to view live camera & talkback</p>
          </div>
        </div>

        {/* QR Code Sharing Box */}
        <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
          <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
            {/* SVG Simulated QR Code */}
            <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" fill="white" />
              <rect x="10" y="10" width="30" height="30" fill="black" />
              <rect x="16" y="16" width="18" height="18" fill="white" />
              <rect x="20" y="20" width="10" height="10" fill="black" />

              <rect x="60" y="10" width="30" height="30" fill="black" />
              <rect x="66" y="16" width="18" height="18" fill="white" />
              <rect x="70" y="20" width="10" height="10" fill="black" />

              <rect x="10" y="60" width="30" height="30" fill="black" />
              <rect x="16" y="66" width="18" height="18" fill="white" />
              <rect x="20" y="70" width="10" height="10" fill="black" />

              <rect x="50" y="50" width="15" height="15" fill="black" />
              <rect x="70" y="50" width="15" height="15" fill="black" />
              <rect x="50" y="70" width="20" height="20" fill="black" />
            </svg>
          </div>

          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1">
              <QrCode className="w-4 h-4 text-blue-400" /> V380 Family QR Code
            </span>
            <p className="text-[11px] text-zinc-400">
              Family members can scan this QR code directly inside their V380 Pro App to pair instantly.
            </p>
            <button
              onClick={copyShareCode}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-xs font-mono font-semibold border border-zinc-700 w-fit transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Code Copied!' : shareCode}</span>
            </button>
          </div>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-zinc-300">Invite Family Account by Email:</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Name (e.g. Mom)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 flex-1"
            />
            <input
              type="email"
              placeholder="V380 Account Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-blue-500 flex-1"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 justify-center"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </form>

        {/* Current Shared Members List */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-zinc-300">Shared Members ({device.sharedWith.length}):</span>
          {device.sharedWith.length === 0 ? (
            <p className="text-xs text-zinc-500 italic bg-[#09090b] p-3 rounded-xl border border-zinc-800">
              No shared family accounts added yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {device.sharedWith.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#09090b] p-3 rounded-xl border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-200">{user.name}</span>
                      <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-blue-300 font-semibold">
                        {user.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">{user.email}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(user.id)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
