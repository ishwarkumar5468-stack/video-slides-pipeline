// ========================================================
// ADVANCED PROCEDURAL WEB AUDIO SFX & AMBIENCE ENGINE
// ========================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterVolume = 0.8;
    this.sfxVolume = 0.85;
    this.ambientVolume = 0.35;
    
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    
    this.activeAmbientType = null;
    this.ambientNodes = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  setAmbientVolume(val) {
    this.ambientVolume = Math.max(0, Math.min(1, val));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.ambientVolume, this.ctx.currentTime, 0.05);
    }
  }

  // 1. Deep Sub Bass Impact / 808 Cinematic Drop
  playSubBassImpact() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    oscSub.type = 'triangle';

    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

    oscSub.frequency.setValueAtTime(65, now);
    oscSub.frequency.exponentialRampToValueAtTime(24, now + 0.8);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(gain);
    oscSub.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    oscSub.start(now);
    osc.stop(now + 0.85);
    oscSub.stop(now + 0.85);
  }

  // 2. High-Tech Laser Scan / Glitch Zap
  playLaserGlitch() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    mod.type = 'square';

    mod.frequency.setValueAtTime(80, now);
    mod.frequency.exponentialRampToValueAtTime(12, now + 0.22);

    modGain.gain.setValueAtTime(600, now);
    modGain.gain.exponentialRampToValueAtTime(20, now + 0.22);

    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);

    mod.connect(modGain);
    modGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    mod.start(now);
    osc.start(now);
    mod.stop(now + 0.25);
    osc.stop(now + 0.25);
  }

  // 3. Tactile Mechanical Key Tick / Word Pop
  playWordTick(pitch = 1800) {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.04);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 4. Celestial Harmonic Shimmer Chime
  playCelestialChime() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = i * 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.14 / (i + 1), now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.95);
    });
  }

  // 5. Stereo Wind Jet Whoosh
  playWhoosh(intensity = 1.0) {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const dur = 0.38;
    const bufSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) output[i] = (Math.random() * 2 - 1) * 0.8;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + dur * 0.45);
    filter.frequency.exponentialRampToValueAtTime(220, now + dur);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.35 * intensity, now + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + dur);
  }

  // 6. Ascending Tension Riser
  playRiser() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const dur = 0.65;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + dur);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + dur * 0.85);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  // 7. Camera Shutter Snapshot Click
  playCameraShutter() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    [0, 0.08].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, now + offset);
      osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.03);

      gain.gain.setValueAtTime(0.22, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.035);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.04);
    });
  }

  // AMBIENT SOUNDTRACK GENERATOR
  startAmbientTrack(theme = 'cyber') {
    if (!this.enabled) return;
    this.init();
    this.stopAmbientTrack();
    this.activeAmbientType = theme;
    const now = this.ctx.currentTime;

    if (theme === 'cyber' || theme === 'cyberpunk') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(65.4, now); // C2
      osc2.frequency.setValueAtTime(65.8, now); // Detuned

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);

      osc1.start();
      osc2.start();
      this.ambientNodes = [osc1, osc2, filter];
    } else if (theme === 'cosmic' || theme === 'space') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(55.0, now); // A1
      osc2.frequency.setValueAtTime(110.0, now); // A2

      osc1.connect(this.ambientGain);
      osc2.connect(this.ambientGain);

      osc1.start();
      osc2.start();
      this.ambientNodes = [osc1, osc2];
    } else if (theme === 'sunset' || theme === 'zen') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(130.81, now); // C3
      osc2.frequency.setValueAtTime(196.00, now); // G3

      osc1.connect(this.ambientGain);
      osc2.connect(this.ambientGain);

      osc1.start();
      osc2.start();
      this.ambientNodes = [osc1, osc2];
    } else {
      // Tech Pulse
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(48.0, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);

      osc.connect(filter);
      filter.connect(this.ambientGain);
      osc.start();
      this.ambientNodes = [osc, filter];
    }
  }

  stopAmbientTrack() {
    this.ambientNodes.forEach(node => {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (e) {}
    });
    this.ambientNodes = [];
    this.activeAmbientType = null;
  }
}

window.soundEngine = new SoundEngine();
