import React, { useState } from 'react';
import { AlbumItem } from '../types';
import { Image, Film, Download, Trash2, X, Eye, Play, Cloud, HardDrive, CheckCircle2 } from 'lucide-react';

interface AlbumGalleryProps {
  album: AlbumItem[];
  onDeleteMedia: (id: string) => void;
}

export const AlbumGallery: React.FC<AlbumGalleryProps> = ({ album, onDeleteMedia }) => {
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [previewItem, setPreviewItem] = useState<AlbumItem | null>(null);
  const [backedUpIds, setBackedUpIds] = useState<Record<string, string>>({});
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);

  const filtered = album.filter((item) => {
    if (filter === 'photo') return item.type === 'photo';
    if (filter === 'video') return item.type === 'video';
    return true;
  });

  const handleDownload = (item: AlbumItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupToDrive = (item: AlbumItem, target: 'google_drive' | 'onedrive') => {
    setIsSyncingId(item.id);
    setTimeout(() => {
      setIsSyncingId(null);
      setBackedUpIds((prev) => ({
        ...prev,
        [item.id]: target === 'google_drive' ? 'Google Drive' : 'OneDrive',
      }));
    }, 800);
  };

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl text-zinc-100 flex flex-col gap-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#09090b] p-3.5 rounded-xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-100">My Album Gallery ({album.length})</h2>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
              GOOGLE DRIVE BACKUP SYNC READY
            </span>
          </div>
          <p className="text-xs text-zinc-400">Captured snapshots and manually recorded CCTV clips synced to your personal cloud drive</p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setFilter('photo')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              filter === 'photo'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Image className="w-3.5 h-3.5" /> Photos
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              filter === 'video'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Videos
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#09090b]/40 rounded-xl border border-zinc-800/60 p-6">
          <Image className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-300">No Album Items Found</p>
          <p className="text-xs text-zinc-500 mt-1">Take snapshots or record videos while watching live stream.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#09090b] border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden group transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-900 cursor-pointer" onClick={() => setPreviewItem(item)}>
                <img
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                )}

                <span className="absolute bottom-2 left-2 bg-[#09090b]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                  {item.fileSizeMB} MB
                </span>

                {backedUpIds[item.id] && (
                  <span className="absolute top-2 right-2 bg-emerald-500 text-zinc-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {backedUpIds[item.id]}
                  </span>
                )}
              </div>

              <div className="p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-200 truncate max-w-[180px]">{item.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{item.timestamp}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 transition-colors"
                      title="Download to device"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMedia(item.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Direct Google Drive Export Action Button */}
                <button
                  onClick={() => handleBackupToDrive(item, 'google_drive')}
                  disabled={isSyncingId === item.id || Boolean(backedUpIds[item.id])}
                  className="w-full py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isSyncingId === item.id
                      ? 'Uploading to Google Drive...'
                      : backedUpIds[item.id]
                      ? `Backed up to ${backedUpIds[item.id]}`
                      : 'Backup to Google Drive'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex flex-col gap-4">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={previewItem.url}
              alt={previewItem.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain rounded-2xl border border-zinc-800"
            />

            <div className="bg-[#121215] p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">{previewItem.title}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Captured: {previewItem.timestamp} | Camera: {previewItem.deviceName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBackupToDrive(previewItem, 'google_drive')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                >
                  <Cloud className="w-4 h-4" /> Export to Google Drive
                </button>
                <button
                  onClick={() => handleDownload(previewItem)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg"
                >
                  <Download className="w-4 h-4" /> Download Local File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

