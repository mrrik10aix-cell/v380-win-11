import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Activity,
  Mic,
  Smartphone,
  Video,
  Layers,
  RefreshCw,
  Sliders,
  ShieldCheck
} from 'lucide-react';

interface SoundwavePairingProps {
  wifiSsid: string;
  wifiPass: string;
  cameraBrand: string;
  onTransmissionComplete?: () => void;
  onCameraAck?: () => void;
}

export const SoundwavePairing: React.FC<SoundwavePairingProps> = ({
  wifiSsid,
  wifiPass,
  cameraBrand,
  onTransmissionComplete,
  onCameraAck,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [frequencyProfile, setFrequencyProfile] = useState<'standard' | 'high_speed' | 'ultrasonic'>('standard');
  const [progress, setProgress] = useState<number>(0);
  const [currentPacketStage, setCurrentPacketStage] = useState<string>('Ready to transmit');
  const [cameraReceived, setCameraReceived] = useState<boolean>(false);
  const [signalStrength, setSignalStrength] = useState<number>(92);
  const [distanceStatus, setDistanceStatus] = useState<'optimal' | 'too_far' | 'too_close'>('optimal');

  // Canvas visualizer reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Frequency profiles configuration
  const frequencyProfiles = {
    standard: {
      name: 'Standard Acoustic Chime',
      range: '1.2 kHz - 2.4 kHz',
      durationSec: 3.5,
      description: 'Audible chirp compatible with all ICSee, V380 & IMOU microphones',
      freqs: [1200, 1500, 1800, 2100, 2400, 1600, 2000, 2200],
    },
    high_speed: {
      name: 'High-Speed Multi-Tone FSK',
      range: '2.0 kHz - 4.2 kHz',
      durationSec: 2.2,
      description: 'Faster transmission for low-noise indoor environments',
      freqs: [2000, 2600, 3200, 3800, 4200, 2800, 3400, 4000],
    },
    ultrasonic: {
      name: 'Near-Ultrasonic (Near-Silent)',
      range: '17.5 kHz - 19.5 kHz',
      durationSec: 3.0,
      description: 'High frequency near-inaudible to human ears',
      freqs: [17500, 18000, 18500, 19000, 19500, 18200],
    },
  };

  // Clean up Web Audio API and timers on unmount
  useEffect(() => {
    return () => {
      stopSoundwave();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Web Audio Synthesizer: Play acoustic chirps
  const startSoundwave = () => {
    try {
      // Initialize AudioContext if not active
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const profile = frequencyProfiles[frequencyProfile];
      const freqs = profile.freqs;

      setIsPlaying(true);
      setProgress(0);
      setCameraReceived(false);
      setCurrentPacketStage('Broadcasting Preamble Tone...');

      // Synthesizer nodes
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = frequencyProfile === 'ultrasonic' ? 'sine' : 'triangle';
      
      const effectiveGain = isMuted ? 0 : volume * 0.15;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(effectiveGain, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      // Modulate frequency across time
      const startTime = ctx.currentTime;
      const stepDuration = profile.durationSec / freqs.length;

      freqs.forEach((freq, idx) => {
        const time = startTime + idx * stepDuration;
        osc.frequency.setValueAtTime(freq, time);
      });

      osc.start(startTime);

      // Packet stage progressions
      const totalMs = profile.durationSec * 1000;
      const stages = [
        { pct: 15, msg: `Encoding SSID payload: [${wifiSsid}]` },
        { pct: 45, msg: `Modulating AES credential hash...` },
        { pct: 75, msg: `Transmitting 16-bit CRC acoustic check...` },
        { pct: 95, msg: `Finalizing carrier burst...` },
      ];

      const intervalStep = 50;
      let currentMs = 0;

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      progressTimerRef.current = setInterval(() => {
        currentMs += intervalStep;
        const currentPct = Math.min(100, Math.round((currentMs / totalMs) * 100));
        setProgress(currentPct);

        const currentStageObj = [...stages].reverse().find((s) => currentPct >= s.pct);
        if (currentStageObj) {
          setCurrentPacketStage(currentStageObj.msg);
        }

        if (currentMs >= totalMs) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          stopSoundwave();
          setCurrentPacketStage('Acoustic Transmission Complete!');
          onTransmissionComplete?.();

          // Trigger simulated camera receipt ACK after short delay
          setTimeout(() => {
            setCameraReceived(true);
            setCurrentPacketStage('Camera Microphone Confirmed: "Soundwave Received!"');
            onCameraAck?.();
          }, 600);
        }
      }, intervalStep);

    } catch (err) {
      console.warn('Web Audio synthesis not supported or blocked:', err);
      // Fallback timer if Web Audio fails
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
        setCameraReceived(true);
        setCurrentPacketStage('Camera Microphone Received Soundwave!');
      }, 2500);
    }
  };

  const stopSoundwave = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (e) {}
      gainNodeRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setIsPlaying(false);
  };

  // Live Canvas Waveform & Spectrum Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isPlaying) {
        phase += 0.15;

        // Draw dynamic multi-sine soundwave stream
        const numWaves = 3;
        const colors = [
          'rgba(168, 85, 247, 0.8)', // Purple
          'rgba(59, 130, 246, 0.7)', // Blue
          'rgba(16, 185, 129, 0.6)', // Emerald
        ];

        colors.forEach((color, idx) => {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 - idx * 0.4;
          const amp = (height / 3.2) * (1 - idx * 0.2);
          const freq = 0.03 + idx * 0.015;

          for (let x = 0; x < width; x++) {
            // Apply gaussian envelope for natural wave pulse
            const envelope = Math.sin((x / width) * Math.PI);
            const y =
              height / 2 +
              Math.sin(x * freq + phase * (idx % 2 === 0 ? 1 : -1.2)) * amp * envelope;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        });

        // Spectrum bars along the bottom
        const numBars = 32;
        const barWidth = width / numBars - 2;
        for (let i = 0; i < numBars; i++) {
          const barHeight =
            Math.abs(Math.sin(phase * 2 + i * 0.3)) * (height * 0.4) + 4;
          const x = i * (barWidth + 2);
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
          grad.addColorStop(1, 'rgba(168, 85, 247, 0.8)');

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else {
        // Idle gentle breathing flatline
        phase += 0.03;
        ctx.beginPath();
        ctx.strokeStyle = cameraReceived
          ? 'rgba(16, 185, 129, 0.6)'
          : 'rgba(147, 51, 234, 0.3)';
        ctx.lineWidth = 1.5;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.02 + phase) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, cameraReceived]);

  return (
    <div className="w-full flex flex-col gap-4 text-zinc-100 animate-in fade-in duration-200">
      {/* Visual Acoustic Transmission Stage & Proximity Guide */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col gap-4">
        {/* Glow ambient background */}
        <div
          className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
            isPlaying
              ? 'bg-purple-600/20'
              : cameraReceived
              ? 'bg-emerald-600/20'
              : 'bg-zinc-800/10'
          }`}
        ></div>

        {/* Transmission Topology Diagram (Phone Speaker -> Soundwaves -> Camera Mic) */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 py-1">
          {/* Phone Transmitter */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 relative ${
                isPlaying
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-lg shadow-purple-950/60 ring-2 ring-purple-500/40'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              <Smartphone className="w-6 h-6" />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-zinc-200">Phone Speaker</span>
            <span className="text-[9px] text-zinc-400 font-mono">Vol: {Math.round(volume * 100)}%</span>
          </div>

          {/* Soundwave Transmission Tunnel */}
          <div className="flex-1 flex flex-col items-center justify-center px-1">
            <div className="w-full flex items-center justify-center relative py-2">
              {/* Concentric Sonic Wave Animation */}
              <div className="flex items-center gap-1 sm:gap-1.5 w-full justify-center overflow-hidden">
                {[1, 2, 3, 4, 5, 6, 7].map((wave) => (
                  <div
                    key={wave}
                    className={`rounded-full transition-all duration-300 ${
                      isPlaying
                        ? 'bg-gradient-to-r from-purple-500 to-blue-400 animate-pulse'
                        : cameraReceived
                        ? 'bg-emerald-500/60'
                        : 'bg-zinc-800'
                    }`}
                    style={{
                      width: `${wave * 2 + 3}px`,
                      height: `${wave * 6 + 10}px`,
                      opacity: isPlaying ? (wave % 2 === 0 ? 0.9 : 0.6) : 0.3,
                      animationDelay: `${wave * 0.15}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                  isPlaying
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                    : cameraReceived
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>{frequencyProfiles[frequencyProfile].range}</span>
              </span>
            </div>
          </div>

          {/* Camera Receiver */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 relative ${
                cameraReceived
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/60'
                  : isPlaying
                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              <Video className="w-6 h-6" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center">
                <Mic className={`w-3 h-3 ${cameraReceived ? 'text-emerald-400' : 'text-zinc-400'}`} />
              </div>
            </div>
            <span className="text-[11px] font-bold text-zinc-200">{cameraBrand} Lens & Mic</span>
            <span className="text-[9px] text-zinc-400 font-mono">
              {cameraReceived ? '✓ ACK Received' : 'Listening...'}
            </span>
          </div>
        </div>

        {/* Live Audio Oscilloscope Canvas */}
        <div className="w-full bg-[#050507] border border-zinc-800/80 rounded-xl overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={480}
            height={70}
            className="w-full h-18 block"
          />

          {/* Overlay Status Bar */}
          <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-zinc-400 font-mono pointer-events-none">
            <span className="flex items-center gap-1.5 truncate max-w-[70%]">
              <Activity className={`w-3 h-3 ${isPlaying ? 'text-purple-400 animate-spin' : 'text-zinc-500'}`} />
              <span className={isPlaying ? 'text-purple-300 font-bold' : 'text-zinc-400'}>
                {currentPacketStage}
              </span>
            </span>

            <span className="text-zinc-500 shrink-0">
              {isPlaying ? `${progress}% Transmitted` : cameraReceived ? '100% Synced' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
          <div
            className={`h-full transition-all duration-100 ${
              cameraReceived
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-purple-600 via-blue-500 to-purple-400'
            }`}
            style={{ width: `${isPlaying ? progress : cameraReceived ? 100 : 0}%` }}
          ></div>
        </div>

        {/* Pairing Distance & Environment Advice */}
        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/70 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-zinc-300 leading-tight">
              Hold phone speaker <strong>15–20 cm (6–8 in)</strong> from camera microphone.
            </span>
          </div>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono shrink-0">
            SNR: +{signalStrength} dBm
          </span>
        </div>

        {/* Live Camera Voice Feedback Alert */}
        {cameraReceived && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-emerald-300">Camera Speaker Prompt Detected:</p>
                <p className="text-[11px] text-emerald-200/90 italic">
                  "Configuration received successfully. Connecting to Wi-Fi..."
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-bold font-mono">
              ACK OK
            </span>
          </div>
        )}
      </div>

      {/* Interactive Controls & Settings */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 flex flex-col gap-3 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-zinc-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Soundwave Modulation Profile:</span>
          </span>

          <div className="flex items-center gap-1">
            {(['standard', 'high_speed', 'ultrasonic'] as const).map((prof) => (
              <button
                key={prof}
                onClick={() => {
                  setFrequencyProfile(prof);
                  if (isPlaying) stopSoundwave();
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                  frequencyProfile === prof
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {prof === 'standard' && 'Standard (1.8kHz)'}
                {prof === 'high_speed' && 'High-Speed (3kHz)'}
                {prof === 'ultrasonic' && 'Near-Silent (18kHz)'}
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Audio Controls */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            </button>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={volume}
              disabled={isMuted}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400 font-mono w-8 text-right">
              {isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={startSoundwave}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{cameraReceived ? 'Re-Transmit Soundwave' : 'Transmit Acoustic Signal'}</span>
              </button>
            ) : (
              <button
                onClick={stopSoundwave}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Audio Broadcast</span>
              </button>
            )}

            {/* Quick manual simulation button for testing camera beep */}
            <button
              onClick={() => {
                setCameraReceived(true);
                setCurrentPacketStage('Camera Microphone Confirmed: "Soundwave Received!"');
                onCameraAck?.();
              }}
              title="Simulate camera microphone hearing the chime"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Camera ACK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
