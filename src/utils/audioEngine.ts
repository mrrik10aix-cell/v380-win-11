// Web Audio API Engine for Simultaneous Camera Microphone Streaming & Ambient Audio Monitoring
class CameraAudioEngine {
  private ctx: AudioContext | null = null;
  private cameraNodes: Map<string, { gain: GainNode; filter: BiquadFilterNode; noiseGain: GainNode; lfoGain: GainNode }> = new Map();
  private masterGain: GainNode | null = null;
  private isInitialized = false;
  private masterVolume = 0.6; // 0.0 to 1.0

  public init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization deferred:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Sync active camera microphone streams based on devices list
   */
  public syncCameraStreams(devices: { id: string; status: string; isMuted: boolean; isPrivacyMode?: boolean; sceneType?: string }[]) {
    if (!this.isInitialized || !this.ctx || !this.masterGain) {
      return;
    }

    this.resume();

    const activeIds = new Set<string>();

    for (const dev of devices) {
      const shouldStream = dev.status === 'online' && !dev.isMuted && !dev.isPrivacyMode;
      if (shouldStream) {
        activeIds.add(dev.id);
        if (!this.cameraNodes.has(dev.id)) {
          this.createCameraStream(dev.id, dev.sceneType || 'living_room');
        } else {
          // Unmute if existing
          const node = this.cameraNodes.get(dev.id)!;
          node.gain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.08);
        }
      } else {
        // Mute or remove
        if (this.cameraNodes.has(dev.id)) {
          const node = this.cameraNodes.get(dev.id)!;
          node.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
        }
      }
    }

    // Clean up disconnected or deleted cameras
    for (const [id, node] of this.cameraNodes.entries()) {
      if (!devices.some(d => d.id === id)) {
        try {
          node.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
          setTimeout(() => {
            node.gain.disconnect();
            this.cameraNodes.delete(id);
          }, 100);
        } catch (e) {}
      }
    }
  }

  private createCameraStream(deviceId: string, scene: string) {
    if (!this.ctx || !this.masterGain) return;

    try {
      // Create pink/brown ambient room noise buffer for realistic microphone ambience
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate room acoustics & microphone bandwidth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      if (scene === 'front_porch' || scene === 'backyard') {
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.2, this.ctx.currentTime);
      } else {
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        filter.Q.setValueAtTime(0.8, this.ctx.currentTime);
      }

      // LFO for natural ambient fluctuation
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2 + Math.random() * 0.3, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      lfo.connect(lfoGain.gain);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      const channelGain = this.ctx.createGain();
      channelGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      // Connect graph: noise -> filter -> noiseGain -> channelGain -> masterGain
      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(channelGain);
      channelGain.connect(this.masterGain);

      whiteNoise.start(0);
      lfo.start(0);

      this.cameraNodes.set(deviceId, {
        gain: channelGain,
        filter,
        noiseGain,
        lfoGain,
      });
    } catch (e) {
      console.warn('Failed to start camera audio stream:', e);
    }
  }

  public stopAll() {
    if (this.ctx && this.masterGain) {
      for (const [, node] of this.cameraNodes.entries()) {
        try {
          node.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        } catch (e) {}
      }
    }
  }
}

export const audioEngine = new CameraAudioEngine();
