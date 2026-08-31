// ========================================================
// ADVANCED AI VOICE & NATURAL SPEECH ENGINE
// ========================================================

class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.persona = "natural-male"; // 'natural-male' | 'natural-female' | 'movie-narrator' | 'hype-presenter' | 'cyber-ai'
    
    this.pitch = 1.0;
    this.rate = 1.02;
    this.volume = 1.0;
    this.enabled = true;
    this.isSpeaking = false;
    
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

    // Prefer high-quality English voices
    const naturalEnVoices = this.voices.filter(v => 
      v.lang.startsWith("en") && 
      (v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel") || v.name.includes("Guy") || v.name.includes("Jenny") || v.name.includes("Alex") || v.name.includes("Premium"))
    );

    if (naturalEnVoices.length > 0) {
      this.selectedVoice = naturalEnVoices[0];
    } else {
      const enVoices = this.voices.filter(v => v.lang.startsWith("en"));
      this.selectedVoice = enVoices[0] || this.voices[0];
    }
  }

  setPersona(personaKey) {
    this.persona = personaKey;
    if (!this.voices.length) this.loadVoices();

    const en = this.voices.filter(v => v.lang.startsWith("en"));

    switch (personaKey) {
      case "natural-female":
        this.selectedVoice = en.find(v => v.name.includes("Jenny") || v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Female") || v.name.includes("Zira")) || en[0] || this.voices[0];
        this.pitch = 1.05;
        this.rate = 1.04;
        break;
      case "movie-narrator":
        this.selectedVoice = en.find(v => v.name.includes("Daniel") || v.name.includes("Guy") || v.name.includes("David") || v.name.includes("Google US English") || v.name.includes("Alex")) || en[0] || this.voices[0];
        this.pitch = 0.82; // Deep authoritative tone
        this.rate = 0.94;
        break;
      case "hype-presenter":
        this.selectedVoice = en.find(v => v.name.includes("Ryan") || v.name.includes("George") || v.name.includes("Google")) || en[0] || this.voices[0];
        this.pitch = 1.1;
        this.rate = 1.15;
        break;
      case "cyber-ai":
        this.selectedVoice = en.find(v => v.name.includes("Google") || v.name.includes("Natural")) || en[0] || this.voices[0];
        this.pitch = 1.25;
        this.rate = 1.08;
        break;
      case "natural-male":
      default:
        this.selectedVoice = en.find(v => v.name.includes("Guy") || v.name.includes("Daniel") || v.name.includes("Natural") || v.name.includes("Google")) || en[0] || this.voices[0];
        this.pitch = 0.96;
        this.rate = 1.02;
        break;
    }
  }

  setVoiceByUri(voiceURI) {
    const v = this.voices.find(item => item.voiceURI === voiceURI || item.name === voiceURI);
    if (v) this.selectedVoice = v;
  }

  speak(text, onWord = null, onComplete = null) {
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

    const utterance = new SpeechSynthesisUtterance(clean);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    
    utterance.pitch = this.pitch;
    utterance.rate = this.rate;
    utterance.volume = this.volume;

    utterance.onboundary = (e) => {
      if (e.name === "word") {
        const charIndex = e.charIndex;
        // Find word index or word
        const words = clean.slice(0, charIndex + e.charLength || charIndex + 1).trim().split(/\s+/);
        const currentWordIndex = Math.max(0, words.length - 1);
        if (onWord) onWord(currentWordIndex, charIndex);
        if (window.soundEngine && window.soundEngine.enabled) {
          window.soundEngine.playWordTick(2100);
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
