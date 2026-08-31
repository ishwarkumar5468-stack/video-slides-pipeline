// ========================================================
// ADVANCED NATURAL HUMAN VOICE & SPEECH SYNTHESIS ENGINE
// ========================================================

class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.persona = "natural-male"; // 'natural-male' | 'deep-baritone' | 'cinematic-movie' | 'calm-lofi' | 'energetic-creator'
    
    this.pitch = 0.94;
    this.rate = 0.98;
    this.volume = 1.0;
    this.enabled = true;
    this.isSpeaking = false;
    
    // Human Voice Warmth DSP chain (Web Audio EQ)
    this.audioCtx = null;
    this.warmthFilter = null;
    this.presenceFilter = null;
    
    this.onWordBoundary = null;
    this.onEnd = null;

    if (this.synth) {
      this.loadVoices();
      if (typeof this.synth.onvoiceschanged !== "undefined") {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices() || [];
    this.autoSelectOptimalVoice();
    return this.voices;
  }

  autoSelectOptimalVoice() {
    if (!this.voices.length) return;

    // Prioritize natural male human neural voices
    const maleNeuralPriority = [
      "Microsoft Guy Online (Natural)",
      "Microsoft Ryan Online (Natural)",
      "Google US English Male",
      "en-US-Neural2-D",
      "en-US-Neural2-J",
      "Daniel (Enhanced)",
      "Daniel",
      "Alex",
      "Tom (Enhanced)",
      "Tom",
      "Fred",
      "David",
      "Guy"
    ];

    for (const name of maleNeuralPriority) {
      const match = this.voices.find(v => v.name.includes(name) || (v.lang.startsWith("en") && v.name.toLowerCase().includes(name.toLowerCase())));
      if (match) {
        this.selectedVoice = match;
        return;
      }
    }

    // Fallback: any natural English male voice
    const naturalEn = this.voices.filter(v => 
      v.lang.startsWith("en") && 
      (v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Google") || v.name.includes("Daniel") || v.name.includes("Guy") || v.name.includes("Alex"))
    );

    if (naturalEn.length > 0) {
      this.selectedVoice = naturalEn[0];
    } else {
      const en = this.voices.filter(v => v.lang.startsWith("en"));
      this.selectedVoice = en[0] || this.voices[0];
    }
  }

  setPersona(personaKey) {
    this.persona = personaKey;
    if (!this.voices.length) this.loadVoices();

    const en = this.voices.filter(v => v.lang.startsWith("en"));
    const findVoice = (names) => {
      for (const n of names) {
        const found = en.find(v => v.name.toLowerCase().includes(n.toLowerCase()));
        if (found) return found;
      }
      return en[0] || this.voices[0];
    };

    switch (personaKey) {
      case "deep-baritone":
        // Deep masculine radio host / podcast presenter
        this.selectedVoice = findVoice(["Daniel", "David", "Guy", "Google US English", "Alex"]);
        this.pitch = 0.76; // Deep resonant baritone
        this.rate = 0.92;  // Deliberate, calm pacing
        break;

      case "cinematic-movie":
        // Movie trailer narrator with dramatic cadence
        this.selectedVoice = findVoice(["Daniel", "Alex", "David", "Guy", "Google"]);
        this.pitch = 0.80; // Heavy bass impact
        this.rate = 0.88;  // Dramatic cinematic pauses
        break;

      case "calm-lofi":
        // Gentle, soft, soothing human storyteller
        this.selectedVoice = findVoice(["Guy", "Daniel", "Natural", "Google", "Alex"]);
        this.pitch = 0.92;
        this.rate = 0.94;  // Relaxed intimate flow
        break;

      case "energetic-creator":
        // High-energy modern YouTuber / creator
        this.selectedVoice = findVoice(["Ryan", "Guy", "Google", "Natural", "Alex"]);
        this.pitch = 1.04;
        this.rate = 1.10;  // Upbeat, punchy delivery
        break;

      case "natural-male":
      default:
        // Studio professional human male narrator
        this.selectedVoice = findVoice(["Guy", "Daniel", "Natural", "Google US English", "Alex", "David"]);
        this.pitch = 0.92; // Natural masculine depth
        this.rate = 0.96;  // Organic conversational cadence
        break;
    }
  }

  setVoiceByUri(voiceURI) {
    const v = this.voices.find(item => item.voiceURI === voiceURI || item.name === voiceURI);
    if (v) this.selectedVoice = v;
  }

  setPitch(val) {
    this.pitch = Math.max(0.6, Math.min(1.5, parseFloat(val) || 0.92));
  }

  setRate(val) {
    this.rate = Math.max(0.7, Math.min(1.4, parseFloat(val) || 0.96));
  }

  // Speak with human natural pauses and punctuation prosody
  speak(text, onWord = null, onComplete = null, customModulation = {}) {
    if (!this.synth || !this.enabled || !text) {
      if (onComplete) onComplete();
      return;
    }

    this.stop();

    // Clean plain text narration
    const clean = text.replace(/<[^>]*>?/gm, "").trim();
    if (!clean) {
      if (onComplete) onComplete();
      return;
    }

    // Apply voice modulation parameters if provided by AI Brain
    let targetPitch = this.pitch;
    let targetRate = this.rate;

    if (customModulation.pitch) targetPitch = customModulation.pitch;
    if (customModulation.rate) targetRate = customModulation.rate;

    const utterance = new SpeechSynthesisUtterance(clean);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    
    utterance.pitch = targetPitch;
    utterance.rate = targetRate;
    utterance.volume = this.volume;

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        const charIndex = e.charIndex;
        // Find current word index
        const words = clean.slice(0, charIndex + (e.charLength || 1)).trim().split(/\s+/);
        const currentWordIndex = Math.max(0, words.length - 1);
        if (onWord) onWord(currentWordIndex, charIndex);
        if (window.soundEngine && window.soundEngine.enabled) {
          window.soundEngine.playWordTick(1900);
        }
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onComplete) onComplete();
    };

    utterance.onerror = (err) => {
      console.warn("[SpeechEngine] Utterance error:", err);
      this.isSpeaking = false;
      if (onComplete) onComplete();
    };

    this.isSpeaking = true;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

window.speechEngine = new SpeechEngine();
