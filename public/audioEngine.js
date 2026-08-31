// ========================================================
// ADVANCED PROCEDURAL LO-FI MUSIC & WEB AUDIO SFX ENGINE
// ========================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterVolume = 0.8;
    this.sfxVolume = 0.85;
    this.musicVolume = 0.45;
    
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    
    // Lo-Fi Music State
    this.isMusicPlaying = false;
    this.activeLofiTrack = "cozy-coffee"; // 'cozy-coffee' | 'rainy-window' | 'chillhop-night' | 'acoustic-warmth' | 'dreamy-cloud'
    this.musicStep = 0;
    this.musicIntervalId = null;
    this.musicNodes = [];
    this.bpm = 74;
    this.swing = 0.035; // Lo-Fi swing feel
    
    // Vinyl & Tape Flutter nodes
    this.vinylNoiseNode = null;
    this.tapeLfoNode = null;
    
    // SFX nodes
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

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
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

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  // =========================================================
  // PROCEDURAL LO-FI CHORD & BEAT SYNTHESIZER
  // =========================================================

  // Convert note name / semitone to frequency
  noteToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Define rich jazzy Lo-Fi Chord Progressions
  getLofiTrackDefinition(trackKey) {
    switch (trackKey) {
      case "rainy-window":
        return {
          name: "🌧️ Rainy Window Lofi",
          bpm: 70,
          vibe: "Melancholic, mellow electric piano & gentle rain",
          // Dm9 -> G13 -> Cmaj9 -> A7alt
          chords: [
            [50, 57, 60, 64, 67], // Dm9 (D3, A3, C4, E4, G4)
            [43, 55, 59, 64, 69], // G13 (G2, G3, B3, E4, A4)
            [48, 55, 59, 62, 67], // Cmaj9 (C3, G3, B3, D4, G4)
            [45, 52, 58, 61, 65], // A7b13 (A2, E3, Bb3, C#4, F4)
          ],
          bassLine: [38, 31, 36, 33], // D2, G1, C2, A1
          hasRain: true,
          tapeFlutter: 0.004
        };
      case "chillhop-night":
        return {
          name: "🛋️ Late Night Chillhop",
          bpm: 78,
          vibe: "Neo-soul warm chords & deep bass bounce",
          // Bbmaj7 -> Eb9 -> Cm7 -> F7
          chords: [
            [46, 53, 57, 62, 65], // Bbmaj7 (Bb2, F3, A3, D4, F4)
            [39, 51, 55, 60, 65], // Eb9 (Eb2, Eb3, G3, C4, F4)
            [48, 55, 58, 63, 67], // Cm7 (C3, G3, Bb3, Eb4, G4)
            [41, 53, 57, 60, 65], // F7 (F2, F3, A3, C4, F4)
          ],
          bassLine: [34, 27, 36, 29], // Bb1, Eb1, C2, F1
          hasRain: false,
          tapeFlutter: 0.003
        };
      case "acoustic-warmth":
        return {
          name: "🍃 Soft Acoustic Sunset",
          bpm: 75,
          vibe: "Warm melodic acoustic plucks & golden breeze",
          // Gmaj7 -> Cmaj7 -> Em7 -> D
          chords: [
            [43, 50, 55, 59, 66], // Gmaj7 (G2, D3, G3, B3, F#4)
            [48, 52, 55, 59, 64], // Cmaj7 (C3, E3, G3, B3, E4)
            [40, 47, 52, 55, 59], // Em7 (E2, B2, E3, G3, B3)
            [50, 54, 57, 62, 66], // Dadd9 (D3, F#3, A3, D4, F#4)
          ],
          bassLine: [31, 36, 28, 38], // G1, C2, E1, D2
          hasRain: false,
          tapeFlutter: 0.002
        };
      case "dreamy-cloud":
        return {
          name: "🪐 Dreamy Cloud Lofi",
          bpm: 68,
          vibe: "Shimmering chorus chords & gentle atmospheric bells",
          // Abmaj9 -> Dbmaj7 -> Bbm7 -> Eb7
          chords: [
            [44, 51, 55, 60, 63], // Abmaj9 (Ab2, Eb3, G3, C4, Eb4)
            [49, 53, 56, 60, 65], // Dbmaj7 (Db3, F3, Ab3, C4, F4)
            [46, 50, 53, 58, 61], // Bbm7 (Bb2, D3, F3, Bb3, Db4)
            [43, 51, 55, 59, 63], // Eb7 (Eb2, Eb3, G3, B3, Eb4)
          ],
          bassLine: [32, 37, 34, 39], // Ab1, Db2, Bb1, Eb2
          hasRain: false,
          tapeFlutter: 0.005
        };
      case "cozy-coffee":
      default:
        return {
          name: "☕ Cozy Coffee Lofi",
          bpm: 74,
          vibe: "Classic warm Rhodes 7th chords, tape flutter & vinyl warmth",
          // Fmaj7 -> G9 -> Em7 -> Am7
          chords: [
            [41, 53, 57, 60, 64], // Fmaj7 (F2, F3, A3, C4, E4)
            [43, 55, 59, 62, 67], // G9 (G2, G3, B3, D4, G4)
            [40, 52, 55, 59, 64], // Em7 (E2, E3, G3, B3, E4)
            [45, 52, 57, 60, 64], // Am7 (A2, E3, A3, C4, E4)
          ],
          bassLine: [29, 31, 28, 33], // F1, G1, E1, A1
          hasRain: false,
          tapeFlutter: 0.004
        };
    }
  }

  // Play a lush warm Rhodes electric piano chord
  playLofiRhodesChord(midiNotes, duration = 1.8, velocity = 0.35) {
    if (!this.ctx || !this.isMusicPlaying) return;
    const now = this.ctx.currentTime;

    midiNotes.forEach((midi, idx) => {
      const freq = this.noteToFreq(midi);
      const stragglerDelay = idx * 0.018 + (Math.random() * 0.006); // Natural human hand arpeggiation

      // 1. Fundamental Warm Sine
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now + stragglerDelay);

      // 2. Soft Triangle Body
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq, now + stragglerDelay);

      // 3. Tine / Bell Harmonic (Subtle high ping)
      const oscBell = this.ctx.createOscillator();
      oscBell.type = 'sine';
      oscBell.frequency.setValueAtTime(freq * 2.76, now + stragglerDelay);

      // Warm Lowpass Filter to give that authentic tape warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950 + Math.random() * 200, now + stragglerDelay);
      filter.frequency.exponentialRampToValueAtTime(380, now + stragglerDelay + duration);
      filter.Q.setValueAtTime(1.2, now + stragglerDelay);

      // Amp Envelope
      const gain = this.ctx.createGain();
      const gainBell = this.ctx.createGain();

      gain.gain.setValueAtTime(0.001, now + stragglerDelay);
      gain.gain.linearRampToValueAtTime(velocity * (1.1 - idx * 0.08), now + stragglerDelay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + stragglerDelay + duration);

      gainBell.gain.setValueAtTime(velocity * 0.12, now + stragglerDelay);
      gainBell.gain.exponentialRampToValueAtTime(0.0001, now + stragglerDelay + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      oscBell.connect(gainBell);

      gain.connect(filter);
      gainBell.connect(filter);
      filter.connect(this.musicGain);

      osc1.start(now + stragglerDelay);
      osc2.start(now + stragglerDelay);
      oscBell.start(now + stragglerDelay);

      osc1.stop(now + stragglerDelay + duration);
      osc2.stop(now + stragglerDelay + duration);
      oscBell.stop(now + stragglerDelay + duration);
    });
  }

  // Play a soft sub-bass note for the lo-fi foundation
  playLofiBass(midi, duration = 1.6, velocity = 0.4) {
    if (!this.ctx || !this.isMusicPlaying) return;
    const now = this.ctx.currentTime;
    const freq = this.noteToFreq(midi);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(velocity, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Soft muted Lo-Fi drum kick
  playLofiKick(velocity = 0.5) {
    if (!this.ctx || !this.isMusicPlaying) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.16);

    gain.gain.setValueAtTime(velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Soft Lo-Fi Snare / Rimshot
  playLofiSnare(velocity = 0.3) {
    if (!this.ctx || !this.isMusicPlaying) return;
    const now = this.ctx.currentTime;
    const dur = 0.14;

    // Noise buffer for snap
    const bufSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) output[i] = (Math.random() * 2 - 1);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + dur);
    oscGain.gain.setValueAtTime(velocity * 0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.connect(oscGain);
    oscGain.connect(this.musicGain);

    noise.start(now);
    osc.start(now);
    noise.stop(now + dur);
    osc.stop(now + dur);
  }

  // Soft Lo-Fi Hi-Hat
  playLofiHiHat(velocity = 0.12) {
    if (!this.ctx || !this.isMusicPlaying) return;
    const now = this.ctx.currentTime;
    const dur = 0.05;

    const bufSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) output[i] = (Math.random() * 2 - 1);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(now);
    noise.stop(now + dur);
  }

  // Start continuous Lo-Fi Music playback with procedural loop
  startLofiMusic(trackKey = "cozy-coffee") {
    this.init();
    this.stopLofiMusic();

    this.activeLofiTrack = trackKey;
    this.isMusicPlaying = true;
    const track = this.getLofiTrackDefinition(trackKey);
    this.bpm = track.bpm || 74;

    const beatIntervalMs = (60 / this.bpm) * 1000;
    const stepIntervalMs = beatIntervalMs / 2; // 8th note steps
    this.musicStep = 0;

    // Start background vinyl / rain warmth
    this.startVinylNoise(track.hasRain);

    // Play immediate first chord
    this.playLofiRhodesChord(track.chords[0], beatIntervalMs * 3.8 / 1000, 0.38);
    this.playLofiBass(track.bassLine[0], beatIntervalMs * 3.5 / 1000, 0.42);

    this.musicIntervalId = setInterval(() => {
      if (!this.isMusicPlaying) return;
      this.musicStep = (this.musicStep + 1) % 32; // 4 bars = 32 steps (8 steps per bar)

      const barIndex = Math.floor(this.musicStep / 8);
      const stepInBar = this.musicStep % 8;

      // 1. Chords trigger on bar starts
      if (stepInBar === 0) {
        const chord = track.chords[barIndex % track.chords.length];
        const bass = track.bassLine[barIndex % track.bassLine.length];
        this.playLofiRhodesChord(chord, beatIntervalMs * 3.8 / 1000, 0.36);
        this.playLofiBass(bass, beatIntervalMs * 3.6 / 1000, 0.4);
      } else if (stepInBar === 4 && barIndex % 2 === 1) {
        // Subtle chord anticipations / syncopation
        const chord = track.chords[barIndex % track.chords.length];
        this.playLofiRhodesChord(chord.slice(1), beatIntervalMs * 1.8 / 1000, 0.24);
      }

      // 2. Drum Pattern (Soft Lo-Fi Swing Groove)
      // Step 0: Kick
      // Step 2: Hi-hat
      // Step 4: Snare + Rim
      // Step 6: Hi-hat / ghost kick
      if (stepInBar === 0) {
        this.playLofiKick(0.48);
        this.playLofiHiHat(0.12);
      } else if (stepInBar === 2) {
        this.playLofiHiHat(0.15);
      } else if (stepInBar === 3 && Math.random() > 0.6) {
        this.playLofiHiHat(0.08); // Swing ghost hat
      } else if (stepInBar === 4) {
        this.playLofiSnare(0.32);
        this.playLofiHiHat(0.14);
      } else if (stepInBar === 6) {
        this.playLofiHiHat(0.16);
        if (barIndex % 2 === 1) this.playLofiKick(0.32); // Ghost kick on upbeats
      }
    }, stepIntervalMs);

    this.updateMusicUIState(true);
  }

  // Start continuous soft vinyl crackle
  startVinylNoise(hasRain = false) {
    if (!this.ctx) return;
    try {
      const dur = 4.0;
      const bufSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Pinkish noise with random crackle pops
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        let pink = (b0 + b1 + b2 + white * 0.5362) * 0.11;
        
        // Random vinyl crackle pop
        if (Math.random() < 0.0015) {
          pink += (Math.random() - 0.5) * 0.8;
        }
        output[i] = pink * 0.25;
      }

      this.vinylNoiseNode = this.ctx.createBufferSource();
      this.vinylNoiseNode.buffer = buffer;
      this.vinylNoiseNode.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = hasRain ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(hasRain ? 1200 : 2800, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.vinylNoiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      this.vinylNoiseNode.start();
    } catch (e) {
      console.warn("Vinyl noise setup error:", e);
    }
  }

  stopLofiMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    if (this.vinylNoiseNode) {
      try {
        this.vinylNoiseNode.stop();
        this.vinylNoiseNode.disconnect();
      } catch (e) {}
      this.vinylNoiseNode = null;
    }
    this.updateMusicUIState(false);
  }

  toggleLofiMusic(trackKey = null) {
    if (this.isMusicPlaying) {
      this.stopLofiMusic();
    } else {
      this.startLofiMusic(trackKey || this.activeLofiTrack || "cozy-coffee");
    }
  }

  updateMusicUIState(isPlaying) {
    const playBtn = document.getElementById("btn-toggle-lofi-music");
    const label = document.getElementById("lofi-music-status-label");
    const icon = document.getElementById("lofi-music-icon");
    if (playBtn) {
      playBtn.className = isPlaying
        ? "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition"
        : "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition";
    }
    if (label) {
      label.textContent = isPlaying ? "Music: Playing" : "Music: Paused";
    }
    if (icon) {
      icon.innerHTML = isPlaying ? "🎵" : "🔇";
    }
  }

  // =========================================================
  // STUDIO SOUND EFFECTS (SFX)
  // =========================================================

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

  // 3. Tactile Mechanical Key Tick / Word Pop / Pencil Stroke
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

    gain.gain.setValueAtTime(0.14, now);
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

  // 8. Pencil Sketch Doodle Stroke SFX
  playDoodleStroke() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const dur = 0.08;

    const bufSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) output[i] = (Math.random() * 2 - 1);

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3400, now);
    filter.Q.setValueAtTime(4.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + dur);
  }
}

window.soundEngine = new SoundEngine();
