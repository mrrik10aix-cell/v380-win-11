import React, { useRef, useEffect, useState } from 'react';
import { Device } from '../types';
import { RefreshCw, Camera, Mic, Volume2, ShieldAlert, Sparkles, Move, Eye, EyeOff, Radio, Sun, Moon, Lock, ShieldCheck } from 'lucide-react';

interface CameraStreamCanvasProps {
  device?: Device;
  onPanTiltChange?: (pan: number, tilt: number) => void;
  onTakeSnapshot?: () => void;
  isRecording?: boolean;
  showDetectionGridOverlay?: boolean;
  className?: string;
  gridMode?: boolean;
  onTogglePrivacyMode?: () => void;
}

export const CameraStreamCanvas: React.FC<CameraStreamCanvasProps> = ({
  device,
  onPanTiltChange,
  onTakeSnapshot,
  isRecording = false,
  showDetectionGridOverlay = false,
  className = '',
  gridMode = false,
  onTogglePrivacyMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPan: number; initialTilt: number }>({
    x: 0,
    y: 0,
    initialPan: device?.pan ?? 0,
    initialTilt: device?.tilt ?? 0,
  });

  // Motion target simulation state
  const targetPosRef = useRef({ x: 300, y: 200, vx: 1.5, vy: 0.8, size: 60 });

  useEffect(() => {
    if (!device) return;
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;

      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Check if Privacy Mode is active
      if (device.isPrivacyMode) {
        // Draw dark privacy canvas background
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, w, h);

        // Draw mechanical shutter lines / diagonal grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let i = -h; i < w + h; i += 24) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + h, h);
          ctx.stroke();
        }

        // Draw Lens Closed Graphic in center
        ctx.save();
        ctx.translate(w / 2, h / 2);

        // Outer aperture ring
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.fill();

        // Closed aperture blades
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.lineWidth = 2;
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
          ctx.lineTo(Math.cos(angle + 0.8) * 45, Math.sin(angle + 0.8) * 45);
          ctx.stroke();
        }

        // Center lock icon dot
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Privacy Mode OSD
        drawOSDOverlay(ctx, w, h, device, false, gridMode);

        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.save();

      // Apply PTZ offset
      const panOffset = ((device.pan % 360) - 180) * (w / 360) * 0.6;
      const tiltOffset = (device.tilt / 90) * (h / 4) * 0.6;
      const zoomScale = device.zoom || 1;

      ctx.translate(w / 2, h / 2);
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-w / 2 + panOffset, -h / 2 + tiltOffset);

      // Draw Room Background according to sceneType
      drawSceneBackground(ctx, w, h, device.sceneType, frameCount);

      // Update & Draw Simulated Motion Target if tracking is active
      if (device.isMotionTrackingEnabled) {
        let t = targetPosRef.current;
        t.x += t.vx;
        t.y += t.vy;

        if (t.x < 80 || t.x > w - 120) t.vx *= -1;
        if (t.y < 80 || t.y > h - 120) t.vy *= -1;

        // Target avatar (simulated person/pet walking)
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(t.x, t.y - 20, 12, 0, Math.PI * 2); // Head
        ctx.fill();
        ctx.fillRect(t.x - 10, t.y - 8, 20, 30); // Body
        ctx.restore();

        // Motion bounding box & tracking reticle
        ctx.strokeStyle = '#22c55e'; // neon green
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(t.x - 22, t.y - 38, 44, 66);
        ctx.setLineDash([]);

        // Label tag
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(t.x - 22, t.y - 54, 80, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('HUMAN 94%', t.x - 18, t.y - 42);

        // Motion Trajectory Line
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(t.x - t.vx * 15, t.y - t.vy * 15);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }

      ctx.restore(); // Restore transform before drawing night vision / spotlight overlays

      // 1. Spotlight Effect (if light is turned on)
      if (device.isLightOn) {
        const lightGradient = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.5);
        lightGradient.addColorStop(0, 'rgba(255, 253, 220, 0.25)');
        lightGradient.addColorStop(0.5, 'rgba(255, 248, 180, 0.1)');
        lightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Night Vision Filter
      const ambientLux = device.ambientLux ?? 15;
      const isSmartMode = device.nightVisionMode === 'smart';
      const isInfraredMode =
        device.nightVisionMode === 'infrared' ||
        (isSmartMode && ambientLux < 25 && !device.isLightOn);
      const isFullColorNightMode =
        device.nightVisionMode === 'fullColor' ||
        (isSmartMode && (ambientLux >= 25 || device.isLightOn));

      if (device.isNightVision || isSmartMode) {
        if (isInfraredMode) {
          // Monochrome IR filter (Greenish / B&W tint with noise and vignetting)
          const imageData = ctx.getImageData(0, 0, w, h);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // B&W with greenish security tint
            data[i] = avg * 0.8;       // R
            data[i + 1] = avg * 1.1;   // G
            data[i + 2] = avg * 0.9;   // B
          }
          ctx.putImageData(imageData, 0, 0);

          // IR Glow Center & Noise
          ctx.fillStyle = 'rgba(16, 185, 129, 0.08)'; // Emerald tint overlay
          ctx.fillRect(0, 0, w, h);
        } else if (isFullColorNightMode) {
          // Full Color Night Vision (Enhanced brightness + slight blue twilight tint)
          ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
          ctx.fillRect(0, 0, w, h);
        }
      }

      // 3. Detection Zone Grid Mask Overlay (if editing detection zone)
      if (showDetectionGridOverlay && device.detectionZoneGrid) {
        const rows = 6;
        const cols = 6;
        const cellW = w / cols;
        const cellH = h / rows;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const active = device.detectionZoneGrid[r]?.[c];
            if (active) {
              ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; // Red mask for alert trigger zone
              ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
              ctx.strokeRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
            } else {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
              ctx.strokeRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
            }
          }
        }
      }

      // 4. Siren / Alarm Flash Effect
      if (device.isSirenOn && Math.floor(frameCount / 15) % 2 === 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, w, h);
      }

      // 5. OSD Overlay Data (Timestamps, Watermark, Quality, Bitrate)
      drawOSDOverlay(ctx, w, h, device, isRecording, gridMode);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [device, isRecording, showDetectionGridOverlay, gridMode]);

  // Handle Drag / Touch PTZ Pan-Tilt
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPan: device.pan,
      initialTilt: device.tilt,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !onPanTiltChange) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    let newPan = (dragStartRef.current.initialPan + dx * 0.4) % 360;
    if (newPan < 0) newPan += 360;
    let newTilt = Math.max(-80, Math.min(80, dragStartRef.current.initialTilt - dy * 0.4));

    onPanTiltChange(Math.round(newPan), Math.round(newTilt));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={`relative overflow-hidden bg-[#09090b] rounded-xl select-none group border border-zinc-800 shadow-2xl ${className}`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-auto aspect-video cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Drag Hint */}
      {!gridMode && !device.isPrivacyMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-zinc-300 flex items-center gap-1.5 border border-zinc-700/50">
          <Move className="w-3 h-3 text-blue-400" />
          <span>Drag screen to pan/tilt camera</span>
        </div>
      )}

      {/* Privacy Mode Overlay */}
      {device.isPrivacyMode && (
        <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 border border-zinc-800 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3 shadow-xl shadow-blue-900/20">
            <EyeOff className="w-7 h-7" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-zinc-100 mb-1 flex items-center gap-2">
            <span>PRIVACY MODE ENABLED</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
              LENS & MIC OFF
            </span>
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
            Camera lens and audio microphone are shut off. The device remains online and registered in your V380 network.
          </p>
          {onTogglePrivacyMode && (
            <button
              onClick={onTogglePrivacyMode}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Eye className="w-4 h-4" /> Turn Lens Back On
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Helper: Draw realistic room scenes on HTML5 Canvas
function drawSceneBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: string,
  frameCount: number
) {
  // Floor and Wall base
  const horizon = h * 0.55;

  // Wall
  const wallGradient = ctx.createLinearGradient(0, 0, 0, horizon);
  wallGradient.addColorStop(0, '#1e293b');
  wallGradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, w, horizon);

  // Floor
  const floorGradient = ctx.createLinearGradient(0, horizon, 0, h);
  floorGradient.addColorStop(0, '#334155');
  floorGradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, horizon, w, h - horizon);

  // Baseboard line
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(w, horizon);
  ctx.stroke();

  if (scene === 'living_room') {
    // Window
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w * 0.65, h * 0.12, 180, 140);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.strokeRect(w * 0.65, h * 0.12, 180, 140);

    // Sofa
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(120, horizon - 40, 240, 70, 8);
    ctx.fill();
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(100, horizon - 75, 280, 45, 10); // Backrest
    ctx.fill();

    // TV Unit
    ctx.fillStyle = '#09090b';
    ctx.fillRect(w * 0.08, h * 0.15, 140, 85);
    ctx.strokeStyle = '#3f3f46';
    ctx.strokeRect(w * 0.08, h * 0.15, 140, 85);
  } else if (scene === 'front_porch') {
    // Outdoor Driveway & Pillars
    ctx.fillStyle = '#64748b';
    ctx.fillRect(60, horizon - 120, 60, 200); // Left Pillar
    ctx.fillRect(w - 120, horizon - 120, 60, 200); // Right Pillar

    // Porch Light Lamp
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(80, horizon - 140, 14, 0, Math.PI * 2);
    ctx.fill();

    // Doorway
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(w * 0.4, horizon - 130, 110, 150);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(w * 0.4 + 95, horizon - 55, 5, 0, Math.PI * 2); // Door handle
    ctx.fill();
  } else if (scene === 'backyard') {
    // Swimming pool
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, horizon + 80, 220, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Water ripple
    const rippleRadius = (frameCount % 60) * 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, horizon + 80, rippleRadius, rippleRadius * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (scene === 'store') {
    // Checkout Counter
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w * 0.2, horizon - 30, 320, 80);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w * 0.25, horizon - 60, 80, 35); // Cash Register
    ctx.fillStyle = '#10b981';
    ctx.fillRect(w * 0.26, horizon - 55, 40, 20); // Screen green
  } else if (scene === 'factory') {
    // Conveyor belt
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, horizon + 20, w, 40);
    ctx.fillStyle = '#0284c7';
    // Moving boxes on line
    const boxX = (frameCount * 2) % w;
    ctx.fillRect(boxX, horizon - 10, 45, 30);
    ctx.fillRect((boxX + 250) % w, horizon - 10, 45, 30);
  } else {
    // Office
    ctx.fillStyle = '#334155';
    ctx.fillRect(w * 0.3, horizon - 35, 260, 65); // Office Desk
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w * 0.45, horizon - 80, 75, 45); // Laptop
  }
}

// Helper: Render OSD camera info & timestamp ticker
function drawOSDOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  device: Device,
  isRecording: boolean,
  gridMode: boolean
) {
  const dateNow = new Date();
  const dateStr = dateNow.toISOString().slice(0, 10);
  const timeStr = dateNow.toTimeString().slice(0, 8);
  const msStr = String(Math.floor(dateNow.getMilliseconds() / 10)).padStart(2, '0');
  const fullStamp = `${dateStr} ${timeStr}.${msStr}`;

  ctx.save();

  // Top Bar Gradient overlay for text readability
  const topGrad = ctx.createLinearGradient(0, 0, 0, 48);
  topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, 48);

  // Bottom Bar Gradient
  const botGrad = ctx.createLinearGradient(0, h - 36, 0, h);
  botGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  botGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, h - 36, w, 36);

  // Camera Name & Watermark
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 3;
  ctx.fillText(device.name, 12, 22);

  // V380 Pro Logo Badge & Night Vision Indicator
  ctx.fillStyle = '#06b6d4'; // Cyan
  ctx.font = 'bold 10px monospace';
  ctx.fillText('V380 Pro', 12, 36);

  // Smart Night Vision OSD Tag
  const lux = device.ambientLux ?? 15;
  if (device.nightVisionMode === 'smart') {
    const isIR = lux < 25 && !device.isLightOn;
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = isIR ? '#c084fc' : '#60a5fa'; // purple for IR, blue for Color
    ctx.fillText(`[SMART NV] ${isIR ? 'IR SENSOR' : 'COLOR SENSOR'} (${lux} LUX)`, 75, 36);
  } else if (device.nightVisionMode === 'infrared') {
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('[NV] IR 850nm', 75, 36);
  } else if (device.nightVisionMode === 'fullColor') {
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('[NV] FULL COLOR', 75, 36);
  }

  // Timestamp on Top Right
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#fef08a'; // yellow ticker
  ctx.textAlign = 'right';
  ctx.fillText(fullStamp, w - 12, 22);

  // Recording status
  if (isRecording || device.isRecording) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(w - 180, 18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('REC', w - 158, 22);
  }

  // Bottom info (Bitrate, FPS, Signal, Quality)
  if (!gridMode) {
    ctx.textAlign = 'left';
    ctx.font = '11px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`${device.quality} | ${device.fps} FPS | ${device.bitrate}`, 12, h - 12);

    ctx.textAlign = 'right';
    ctx.fillText(`WiFi: ${device.signalStrength}% | ${device.ipAddress}`, w - 12, h - 12);
  }

  ctx.restore();
}
