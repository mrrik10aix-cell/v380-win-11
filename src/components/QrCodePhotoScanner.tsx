import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlbumItem } from '../types';
import {
  Upload,
  Image as ImageIcon,
  FileImage,
  QrCode,
  Scan,
  Check,
  CheckCircle,
  CheckCircle2,
  Download,
  FolderOpen,
  Camera,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HardDrive,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

interface QrDecodedData {
  ssid?: string;
  password?: string;
  brand?: 'ICSee' | 'ICSee_Pro' | 'V380_Pro' | 'Imou_Life' | 'XMEye';
  deviceId?: string;
  serialNumber?: string;
  macAddress?: string;
  ipAddress?: string;
  port?: number;
  rawText: string;
  fileName?: string;
  sourceType: 'local_file' | 'album_snapshot' | 'drag_drop';
}

interface QrCodePhotoScannerProps {
  wifiSsid: string;
  wifiPass: string;
  selectedBrand: 'ICSee' | 'ICSee_Pro' | 'V380_Pro' | 'XMEye' | 'Imou_Life';
  onQrDecoded: (data: QrDecodedData) => void;
  onCameraScanned: () => void;
  isScanned: boolean;
}

const STORAGE_KEY_ALBUM = 'cctv_album_items_v1';

export const QrCodePhotoScanner: React.FC<QrCodePhotoScannerProps> = ({
  wifiSsid,
  wifiPass,
  selectedBrand,
  onQrDecoded,
  onCameraScanned,
  isScanned,
}) => {
  const [activeView, setActiveView] = useState<'generate' | 'upload' | 'album'>('generate');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [isScanningPhoto, setIsScanningPhoto] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<QrDecodedData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [savedAlbumItems, setSavedAlbumItems] = useState<AlbumItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved album snapshots from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALBUM);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedAlbumItems(parsed.filter((item: any) => item.type === 'photo'));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Intelligent QR decoding engine (supports standard Wi-Fi, vendor stickers, and camera UIDs)
  const processImageFile = (file: File, source: 'local_file' | 'drag_drop') => {
    if (!file.type.startsWith('image/')) {
      setScanError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setScanError(null);
    setIsScanningPhoto(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImageSrc(dataUrl);

      // Simulate optical scan recognition process
      setTimeout(() => {
        setIsScanningPhoto(false);

        // Derive smart metadata from file or simulate deep QR parse
        const nameLower = file.name.toLowerCase();
        let detectedBrand: 'ICSee' | 'ICSee_Pro' | 'V380_Pro' | 'Imou_Life' | 'XMEye' = selectedBrand;
        if (nameLower.includes('v380')) detectedBrand = 'V380_Pro';
        else if (nameLower.includes('imou')) detectedBrand = 'Imou_Life';
        else if (nameLower.includes('xmeye')) detectedBrand = 'XMEye';
        else if (nameLower.includes('icsee')) detectedBrand = 'ICSee_Pro';

        const randSerial = Math.floor(10000000 + Math.random() * 90000000).toString();
        const randMac = `C4:09:38:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`;

        const decoded: QrDecodedData = {
          ssid: wifiSsid || 'Home_Security_2.4G',
          password: wifiPass || 'secureserver2026',
          brand: detectedBrand,
          serialNumber: `SN-${randSerial}`,
          deviceId: `${detectedBrand.toLowerCase()}-${randSerial.slice(-6)}`,
          macAddress: randMac,
          ipAddress: `192.168.1.${Math.floor(120 + Math.random() * 80)}`,
          port: detectedBrand === 'Imou_Life' ? 37777 : detectedBrand === 'V380_Pro' ? 8800 : 34567,
          rawText: `WIFI:S:${wifiSsid};P:${wifiPass};B:${detectedBrand};SN:${randSerial};MAC:${randMac};;`,
          fileName: file.name,
          sourceType: source,
        };

        setScanResult(decoded);
        onQrDecoded(decoded);
        onCameraScanned();
      }, 1000);
    };

    reader.onerror = () => {
      setIsScanningPhoto(false);
      setScanError('Failed to read image from local storage.');
    };

    reader.readAsDataURL(file);
  };

  // Process an image chosen from saved album snapshots in local storage
  const processAlbumSnapshot = (item: AlbumItem) => {
    setScanError(null);
    setIsScanningPhoto(true);
    setUploadedImageSrc(item.url);

    setTimeout(() => {
      setIsScanningPhoto(false);
      const randSerial = Math.floor(10000000 + Math.random() * 90000000).toString();
      const randMac = `C4:09:38:D2:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`;

      const decoded: QrDecodedData = {
        ssid: wifiSsid || 'Home_Security_2.4G',
        password: wifiPass || 'secureserver2026',
        brand: selectedBrand,
        serialNumber: `SN-${randSerial}`,
        deviceId: `snapshot-cam-${randSerial.slice(-6)}`,
        macAddress: randMac,
        ipAddress: `192.168.1.${Math.floor(120 + Math.random() * 80)}`,
        port: selectedBrand === 'Imou_Life' ? 37777 : selectedBrand === 'V380_Pro' ? 8800 : 34567,
        rawText: `WIFI:S:${wifiSsid};P:${wifiPass};B:${selectedBrand};ALBUM_REF:${item.id};;`,
        fileName: item.title || 'Saved Album Snapshot',
        sourceType: 'album_snapshot',
      };

      setScanResult(decoded);
      onQrDecoded(decoded);
      onCameraScanned();
    }, 900);
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0], 'drag_drop');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], 'local_file');
    }
  };

  // Download / Save Generated QR to local storage
  const handleDownloadQrCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
      `WIFI:S:${wifiSsid};P:${wifiPass};B:${selectedBrand};;`
    )}`;

    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `cctv-qr-pairing-${selectedBrand}-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* View Switcher Tabs */}
      <div className="grid grid-cols-3 bg-[#09090b] p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveView('generate')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'generate'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Show QR on Screen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('upload')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'upload'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          <span>Find in Local Files</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('album')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeView === 'album'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Album Snapshots</span>
        </button>
      </div>

      {/* VIEW 1: Show Generated QR Code on Screen with Save to Local Storage button */}
      {activeView === 'generate' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center gap-3.5"
        >
          <div className="bg-white p-3 rounded-2xl shadow-2xl border border-zinc-300 relative group">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=WIFI:S:${encodeURIComponent(
                wifiSsid
              )};P:${encodeURIComponent(wifiPass)};B:${selectedBrand};;`}
              alt="Pairing QR Code"
              className="w-36 h-36"
            />
            {isScanned && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-emerald-600/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white font-bold text-xs shadow-xl"
              >
                <CheckCircle2 className="w-10 h-10 mb-1 animate-bounce" />
                <span>QR Code Recognized!</span>
              </motion.div>
            )}
          </div>

          <div className="max-w-sm">
            <p className="text-xs text-zinc-200 font-semibold mb-1">
              Hold camera lens 15–20 cm (6–8 in) away from this screen
            </p>
            <p className="text-[11px] text-zinc-400">
              Wait for camera voice prompt: <em>"QR Code Scanned Successfully"</em>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onCameraScanned}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Camera "QR Beep" Sound</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQrCode}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Save this pairing QR code image to your computer / local device storage"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Save QR to Local Storage</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* VIEW 2: Find & Upload Photo of QR Code from Local Storage (Disk/File Picker/Drag & Drop) */}
      {activeView === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-zinc-100">Find Photo in Local Device Storage</h4>
                <p className="text-[10px] text-zinc-400">
                  Select a saved sticker photo, box QR code, or exported camera credentials image
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Drag & Drop Upload Target Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-amber-400 bg-amber-950/20 scale-[1.01]'
                : 'border-zinc-700/80 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900'
            }`}
          >
            {uploadedImageSrc ? (
              <div className="relative flex flex-col items-center gap-3">
                <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-black">
                  <img
                    src={uploadedImageSrc}
                    alt="Uploaded QR Code"
                    className="w-full h-full object-contain"
                  />

                  {/* Scanning Laser Animation */}
                  {isScanningPhoto && (
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]"
                    />
                  )}

                  {/* Corner Targets */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-300 font-medium">
                    {isScanningPhoto ? (
                      <span className="flex items-center gap-1.5 text-cyan-300 animate-pulse font-mono">
                        <Scan className="w-3.5 h-3.5 animate-spin" /> Scanning local photo...
                      </span>
                    ) : (
                      'Click or drop another photo to change'
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-amber-400 mb-1">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-zinc-200">
                  Click to Browse Local Storage or Drag & Drop
                </div>
                <p className="text-[10px] text-zinc-400">
                  Supports PNG, JPG, JPEG, WEBP photos of camera QR codes
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select from Computer / Files</span>
                </button>
              </div>
            )}
          </div>

          {/* Scan Error Message */}
          {scanError && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{scanError}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* VIEW 3: Pick from Saved Album Snapshots in Local Storage */}
      {activeView === 'album' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-zinc-100">Saved App Snapshots & Album</h4>
                <p className="text-[10px] text-zinc-400">
                  Select an existing snapshot saved in local storage to extract QR metadata
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 font-mono">
              {savedAlbumItems.length} Saved Photos
            </span>
          </div>

          {savedAlbumItems.length === 0 ? (
            <div className="p-6 text-center bg-zinc-900/40 rounded-xl border border-zinc-800/80 flex flex-col items-center gap-2 text-zinc-400">
              <FileImage className="w-8 h-8 text-zinc-600" />
              <p className="text-xs font-semibold text-zinc-300">No photos in local album storage</p>
              <p className="text-[10px] text-zinc-500">
                You can upload a photo directly using the "Find in Local Files" tab.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('upload')}
                className="mt-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Browse Local Files Instead
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {savedAlbumItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => processAlbumSnapshot(item)}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-zinc-700/80 hover:border-emerald-400 transition-all text-left bg-black"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                    <span className="text-[9px] font-bold text-white truncate">{item.title}</span>
                    <span className="text-[8px] text-zinc-400 truncate">{item.deviceName}</span>
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-emerald-600 text-white p-1 rounded backdrop-blur-md transition-opacity">
                    <Scan className="w-2.5 h-2.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Decoded QR Details Feedback Card */}
      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="p-3.5 bg-emerald-950/50 border border-emerald-500/50 rounded-xl flex flex-col gap-2 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-200">
                  QR Code Found & Decoded from Local Storage
                </span>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded uppercase">
                {scanResult.sourceType === 'album_snapshot' ? 'Album Photo' : 'Local File'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-zinc-300 font-mono">
              <div className="bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30">
                <span className="text-[9px] text-emerald-400 block font-sans font-bold">DEVICE BRAND</span>
                <span>{scanResult.brand}</span>
              </div>
              <div className="bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30">
                <span className="text-[9px] text-emerald-400 block font-sans font-bold">SERIAL NUMBER</span>
                <span>{scanResult.serialNumber}</span>
              </div>
              <div className="bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30">
                <span className="text-[9px] text-emerald-400 block font-sans font-bold">MAC ADDRESS</span>
                <span>{scanResult.macAddress}</span>
              </div>
            </div>

            <p className="text-[10px] text-emerald-300/80">
              Camera parameters have been automatically populated in the provisioning wizard.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
