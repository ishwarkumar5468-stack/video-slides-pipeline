// ========================================================
// CORE STUDIO APPLICATION LOGIC & STAGE RENDERER
// ========================================================

const sampleScript = `Quantum computing is crossing from theoretical physics into production reality.
By utilizing superposition and entanglement, qubits process complex states simultaneously.
Recent breakthroughs achieved a ten-thousand-times speedup in molecular simulation.
Fault-tolerant quantum clusters will soon unlock breakthroughs in clean energy and medicine.
The era of exponential quantum acceleration has officially begun.`;

let scenes = [];
let currentSceneIndex = 0;
let isPlaying = false;
let playTimer = null;
let wordTimer = null;
let currentAspectRatio = "aspect-9-16"; // 9:16 default
let currentTheme = "cyberpunk";
let activeFontPairing = "font-space";
let activeFontSize = "text-xl md:text-2xl";
let activeTextAlign = "text-center";
let activeGlowColor = "pink-cyan";
let currentViewMode = "stage"; // 'stage' | 'storyboard'
let draggedSceneIndex = null;

// Active pictorial overlay per scene
let scenePictorials = {};

// Stock Video Background State (Pexels API)
let videoBgEnabled = true;
let videoOpacity = 0.40;
let modalTargetSceneIndex = 0;
let isAutoMatchingVideos = false;

// Media recorder for WebM export
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

// Color presets for glow highlights (explicit bg-gradient-to-r ensures text gradient renders crisp and visible)
const glowPresets = {
  "pink-cyan": "bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 text-transparent bg-clip-text font-black drop-shadow-[0_0_16px_rgba(236,72,153,0.7)]",
  "cyan-mint": "bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-transparent bg-clip-text font-black drop-shadow-[0_0_16px_rgba(6,182,212,0.7)]",
  "gold-fire": "bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 text-transparent bg-clip-text font-black drop-shadow-[0_0_16px_rgba(245,158,11,0.7)]",
  "cobalt-ice": "bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 text-transparent bg-clip-text font-black drop-shadow-[0_0_16px_rgba(59,130,246,0.7)]",
  "matrix-green": "bg-gradient-to-r from-emerald-400 via-green-300 to-lime-400 text-transparent bg-clip-text font-black drop-shadow-[0_0_16px_rgba(16,185,129,0.7)]"
};

// DOM Content Loaded Initializer
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  setupEventListeners();
  generateScenesFromScript(sampleScript);
  syncGlobalExportState();
});

// Helper to keep window export state in sync with core app state
function syncGlobalExportState() {
  window.scenes = scenes;
  window.currentAspectRatio = currentAspectRatio;
  window.currentTheme = currentTheme;
  window.activeFontPairing = activeFontPairing;
  window.activeGlowColor = activeGlowColor;
  window.glowPresets = glowPresets;
  window.videoBgEnabled = videoBgEnabled;
  window.videoOpacity = videoOpacity;
  window.currentSceneIndex = currentSceneIndex;
  window.getScenes = () => scenes;

  // Expose methods for AI Brain Engine and external controls
  window.setScenes = function(newScenes, theme, topicTitle) {
    if (!Array.isArray(newScenes) || newScenes.length === 0) return;
    scenes = newScenes.map((s, idx) => ({
      id: idx + 1,
      index: idx,
      narration: s.narration || "",
      glowWord: s.glowWord || (s.narration || "").split(" ")[0] || "Key",
      mood: s.mood || "kinetic",
      sfx: s.sfx || "whoosh",
      sceneVisualType: s.sceneVisualType || "rain_window",
      duration: s.duration || Math.max(3.5, Math.min(8.0, (s.narration || "").split(" ").length * 0.45)),
      videoQuery: s.videoQuery || topicTitle || "technology",
      pictorial: s.pictorial || {
        type: "tech_hud",
        label: "Analysis",
        value: "Active",
        subtext: "Verified Metric"
      },
      videoBg: s.videoBg || null
    }));

    currentSceneIndex = 0;
    if (theme && typeof window.setArtTheme === "function") {
      window.setArtTheme(theme);
    }

    renderSlideThumbs();
    renderStoryboardGrid();
    goToScene(0);
    updateStoryboardSummary();
    syncScenesToScript();
    syncGlobalExportState();

    if (window.sceneAnimationEngine) {
      window.sceneAnimationEngine.updateFromScene(scenes[0], topicTitle);
    }

    // Update scene count badges
    const badge = document.getElementById("scenes-summary-badge");
    if (badge) badge.textContent = `${scenes.length} Scenes Synthesized`;
  };

  window.goToScene = goToScene;
  window.renderCurrentSlide = renderCurrentSlide;
  window.renderSlideThumbs = renderSlideThumbs;
  window.renderStoryboardGrid = renderStoryboardGrid;
  window.updateStageVideo = updateStageVideo;
  window.playAllScenes = function() {
    setViewMode("stage");
    goToScene(0);
    if (!isPlaying) togglePlayPause();
  };

  if (window.videoExportEngine) {
    window.videoExportEngine.updateExportSummaryLabels();
  }
}

function initUI() {
  const scriptInput = document.getElementById("script-input");
  if (scriptInput) scriptInput.value = sampleScript;

  // Initialize Speech Persona
  if (window.speechEngine) {
    window.speechEngine.setPersona("natural-male");
    populateVoiceDropdown();
  }
}

function populateVoiceDropdown() {
  const voiceSelect = document.getElementById("voice-select");
  if (!voiceSelect || !window.speechEngine) return;

  const voices = window.speechEngine.loadVoices();
  voiceSelect.innerHTML = "";

  voices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.voiceURI || v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    if (window.speechEngine.selectedVoice && (v.voiceURI === window.speechEngine.selectedVoice.voiceURI || v.name === window.speechEngine.selectedVoice.name)) {
      opt.selected = true;
    }
    voiceSelect.appendChild(opt);
  });
}

function setupEventListeners() {
  // View Mode Toggles
  const btnViewStage = document.getElementById("view-toggle-stage");
  if (btnViewStage) {
    btnViewStage.addEventListener("click", () => setViewMode("stage"));
  }

  const btnViewStoryboard = document.getElementById("view-toggle-storyboard");
  if (btnViewStoryboard) {
    btnViewStoryboard.addEventListener("click", () => setViewMode("storyboard"));
  }

  // Quick Add Slide Buttons
  const btnQuickAdd = document.getElementById("btn-quick-add-slide");
  if (btnQuickAdd) {
    btnQuickAdd.addEventListener("click", () => addNewScene());
  }

  const btnStoryboardAdd = document.getElementById("btn-storyboard-add-slide");
  if (btnStoryboardAdd) {
    btnStoryboardAdd.addEventListener("click", () => addNewScene());
  }

  // Quick Sync Script Buttons
  const btnSyncQuick = document.getElementById("btn-sync-script-quick");
  if (btnSyncQuick) {
    btnSyncQuick.addEventListener("click", syncScenesToScript);
  }

  // Renumber in Storyboard
  const btnRenumber = document.getElementById("btn-storyboard-renumber");
  if (btnRenumber) {
    btnRenumber.addEventListener("click", renumberScenes);
  }

  // Play All from Storyboard
  const btnStoryboardPlayAll = document.getElementById("btn-storyboard-play-all");
  if (btnStoryboardPlayAll) {
    btnStoryboardPlayAll.addEventListener("click", () => {
      setViewMode("stage");
      goToScene(0);
      startPlayback();
    });
  }

  // Visual Layer Mode Toggles (Animation vs Hybrid vs Video)
  const btnVisAnim = document.getElementById("visual-mode-anim");
  const btnVisHybrid = document.getElementById("visual-mode-hybrid");
  const btnVisVideo = document.getElementById("visual-mode-video");

  function setVisualMode(mode) {
    const animCanvas = document.getElementById("stage-scene-canvas");
    const videoEl = document.getElementById("stage-bg-video");

    if (btnVisAnim) btnVisAnim.className = mode === "anim" ? "px-2 py-0.5 rounded font-medium bg-cyan-600 text-white transition text-[11px]" : "px-2 py-0.5 rounded font-medium text-slate-400 hover:text-white transition text-[11px]";
    if (btnVisHybrid) btnVisHybrid.className = mode === "hybrid" ? "px-2 py-0.5 rounded font-medium bg-indigo-600 text-white transition text-[11px]" : "px-2 py-0.5 rounded font-medium text-slate-400 hover:text-white transition text-[11px]";
    if (btnVisVideo) btnVisVideo.className = mode === "video" ? "px-2 py-0.5 rounded font-medium bg-cyan-600 text-white transition text-[11px]" : "px-2 py-0.5 rounded font-medium text-slate-400 hover:text-white transition text-[11px]";

    if (mode === "anim") {
      if (window.sceneAnimationEngine) {
        window.sceneAnimationEngine.isEnabled = true;
        window.sceneAnimationEngine.opacity = 0.95;
      }
      if (animCanvas) animCanvas.style.opacity = "0.95";
      if (videoEl) videoEl.style.opacity = "0";
      videoBgEnabled = false;
    } else if (mode === "hybrid") {
      if (window.sceneAnimationEngine) {
        window.sceneAnimationEngine.isEnabled = true;
        window.sceneAnimationEngine.opacity = 0.65;
      }
      if (animCanvas) animCanvas.style.opacity = "0.65";
      if (videoEl) videoEl.style.opacity = "0.4";
      videoBgEnabled = true;
      updateStageVideo(scenes[currentSceneIndex]);
    } else if (mode === "video") {
      if (window.sceneAnimationEngine) {
        window.sceneAnimationEngine.isEnabled = false;
      }
      if (animCanvas) animCanvas.style.opacity = "0";
      if (videoEl) videoEl.style.opacity = "0.55";
      videoBgEnabled = true;
      updateStageVideo(scenes[currentSceneIndex]);
    }
  }

  if (btnVisAnim) btnVisAnim.addEventListener("click", () => setVisualMode("anim"));
  if (btnVisHybrid) btnVisHybrid.addEventListener("click", () => setVisualMode("hybrid"));
  if (btnVisVideo) btnVisVideo.addEventListener("click", () => setVisualMode("video"));

  // Direct 1-Click Prompt Generation Button
  const btnDirectPrompt = document.getElementById("btn-direct-generate-prompt");
  if (btnDirectPrompt) {
    btnDirectPrompt.addEventListener("click", () => {
      const topic = document.getElementById("research-topic-input")?.value || "";
      const prompt = document.getElementById("research-prompt-input")?.value || "";
      window.researchStudio?.runResearch(topic, prompt, true);
    });
  }

  // Handle Enter key inside prompt inputs for instant generation
  const topicInput = document.getElementById("research-topic-input");
  if (topicInput) {
    topicInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const topic = topicInput.value || "";
        const prompt = document.getElementById("research-prompt-input")?.value || "";
        window.researchStudio?.runResearch(topic, prompt, true);
      }
    });
  }

  const promptInput = document.getElementById("research-prompt-input");
  if (promptInput) {
    promptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const topic = document.getElementById("research-topic-input")?.value || "";
        const prompt = promptInput.value || "";
        window.researchStudio?.runResearch(topic, prompt, true);
      }
    });
  }

  // Topic Research Button
  const btnResearch = document.getElementById("btn-run-research");
  if (btnResearch) {
    btnResearch.addEventListener("click", () => {
      const topic = document.getElementById("research-topic-input")?.value || "";
      const prompt = document.getElementById("research-prompt-input")?.value || "";
      window.researchStudio?.runResearch(topic, prompt, false);
    });
  }

  // Quick Topic Pills
  document.querySelectorAll(".quick-topic-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const topic = btn.getAttribute("data-topic");
      const topicInput = document.getElementById("research-topic-input");
      if (topicInput && topic) {
        topicInput.value = topic;
        const prompt = document.getElementById("research-prompt-input")?.value || "";
        window.researchStudio?.runResearch(topic, prompt, true);
      }
    });
  });

  // Transfer Research Script Button
  const btnTransfer = document.getElementById("btn-transfer-research");
  if (btnTransfer) {
    btnTransfer.addEventListener("click", () => {
      window.researchStudio?.transferToSlidePipeline();
    });
  }

  // Main Script Generation Button
  const btnGenerate = document.getElementById("btn-generate-slides");
  if (btnGenerate) {
    btnGenerate.addEventListener("click", () => {
      const text = document.getElementById("script-input")?.value || "";
      generateScenesFromScript(text);
      if (window.soundEngine) window.soundEngine.playWhoosh(1.0);
    });
  }

  // Player controls
  const btnPlay = document.getElementById("btn-play-pause");
  if (btnPlay) {
    btnPlay.addEventListener("click", togglePlayPause);
  }

  const btnPrev = document.getElementById("btn-prev-slide");
  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      goToScene(Math.max(0, currentSceneIndex - 1));
      if (window.soundEngine) window.soundEngine.playWhoosh(0.8);
    });
  }

  const btnNext = document.getElementById("btn-next-slide");
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      goToScene(Math.min(scenes.length - 1, currentSceneIndex + 1));
      if (window.soundEngine) window.soundEngine.playWhoosh(0.8);
    });
  }

  // Aspect ratio toggles
  document.querySelectorAll(".aspect-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".aspect-btn").forEach(b => b.classList.remove("bg-indigo-600", "text-white"));
      btn.classList.add("bg-indigo-600", "text-white");
      currentAspectRatio = btn.getAttribute("data-aspect");
      updateStageAspectRatio();
    });
  });

  // Voice Persona selector
  const personaSelect = document.getElementById("voice-persona-select");
  if (personaSelect) {
    personaSelect.addEventListener("change", (e) => {
      if (window.speechEngine) {
        window.speechEngine.setPersona(e.target.value);
        populateVoiceDropdown();
      }
    });
  }

  // Voice dropdown change
  const voiceSelect = document.getElementById("voice-select");
  if (voiceSelect) {
    voiceSelect.addEventListener("change", (e) => {
      if (window.speechEngine) {
        window.speechEngine.setVoiceByUri(e.target.value);
      }
    });
  }

  // Voice Pitch slider
  const pitchSlider = document.getElementById("voice-pitch-slider");
  if (pitchSlider) {
    pitchSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (window.speechEngine) window.speechEngine.pitch = val;
      const lbl = document.getElementById("voice-pitch-label");
      if (lbl) lbl.textContent = val.toFixed(2) + "x";
    });
  }

  // Voice Rate slider
  const rateSlider = document.getElementById("voice-rate-slider");
  if (rateSlider) {
    rateSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (window.speechEngine) window.speechEngine.rate = val;
      const lbl = document.getElementById("voice-rate-label");
      if (lbl) lbl.textContent = val.toFixed(2) + "x";
    });
  }

  // Test Voice button
  const btnTestVoice = document.getElementById("btn-test-voice");
  if (btnTestVoice) {
    btnTestVoice.addEventListener("click", () => {
      if (window.speechEngine) {
        window.speechEngine.speak("This is the high-fidelity AI narration voice synchronized for kinetic video slides.");
      }
    });
  }

  // SFX master toggle
  const toggleAudioBtn = document.getElementById("toggle-audio-btn");
  if (toggleAudioBtn) {
    toggleAudioBtn.addEventListener("click", () => {
      if (!window.soundEngine) return;
      window.soundEngine.enabled = !window.soundEngine.enabled;
      const onIcon = document.getElementById("audio-icon-on");
      const offIcon = document.getElementById("audio-icon-off");
      const label = document.getElementById("audio-label");
      if (window.soundEngine.enabled) {
        if (onIcon) onIcon.classList.remove("hidden");
        if (offIcon) offIcon.classList.add("hidden");
        if (label) label.textContent = "SFX: On";
        window.soundEngine.playCelestialChime();
      } else {
        if (onIcon) onIcon.classList.add("hidden");
        if (offIcon) offIcon.classList.remove("hidden");
        if (label) label.textContent = "SFX: Muted";
      }
    });
  }

  // Ambient track select
  const ambientSelect = document.getElementById("ambient-track-select");
  if (ambientSelect) {
    ambientSelect.addEventListener("change", (e) => {
      if (!window.soundEngine) return;
      const track = e.target.value;
      if (track === "none") {
        window.soundEngine.stopAmbientTrack();
      } else {
        window.soundEngine.startAmbientTrack(track);
      }
    });
  }

  // Soundboard Trigger Audition Buttons
  document.querySelectorAll(".sfx-audition-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!window.soundEngine) return;
      const sfx = btn.getAttribute("data-sfx");
      playSfxByName(sfx);
    });
  });

  // Text Customizer Controls
  const fontSelect = document.getElementById("font-family-select");
  if (fontSelect) {
    fontSelect.addEventListener("change", (e) => {
      activeFontPairing = e.target.value;
      renderCurrentSlide();
      if (currentViewMode === "storyboard") renderStoryboardGrid();
    });
  }

  const glowSelect = document.getElementById("glow-color-select");
  if (glowSelect) {
    glowSelect.addEventListener("change", (e) => {
      activeGlowColor = e.target.value;
      renderCurrentSlide();
      if (currentViewMode === "storyboard") renderStoryboardGrid();
    });
  }

  // Per slide text live editor in Stage View
  const slideTextEditor = document.getElementById("current-slide-text-editor");
  if (slideTextEditor) {
    slideTextEditor.addEventListener("input", (e) => {
      if (scenes[currentSceneIndex]) {
        scenes[currentSceneIndex].narration = e.target.value;
        renderCurrentSlide();
        renderSlideThumbs();
        updateStoryboardSummary();
      }
    });
  }

  // Video Export WebM recording
  const btnExport = document.getElementById("btn-export-video");
  if (btnExport) {
    btnExport.addEventListener("click", startVideoExport);
  }

  // --- Stock Video Background Event Listeners ---
  // Open modal button
  const btnOpenModal = document.getElementById("btn-open-stock-modal");
  if (btnOpenModal) {
    btnOpenModal.addEventListener("click", () => {
      openStockVideoModal(currentSceneIndex);
    });
  }

  // Close modal buttons
  const btnCloseModal = document.getElementById("btn-close-stock-modal");
  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", closeStockVideoModal);
  }
  const btnCancelModal = document.getElementById("btn-modal-cancel");
  if (btnCancelModal) {
    btnCancelModal.addEventListener("click", closeStockVideoModal);
  }

  // Search video in modal button
  const btnSearchVideo = document.getElementById("btn-modal-search-video");
  if (btnSearchVideo) {
    btnSearchVideo.addEventListener("click", () => {
      const q = document.getElementById("modal-video-search-input")?.value || "";
      searchStockVideos(q);
    });
  }

  // Enter key in modal search input
  const videoSearchInput = document.getElementById("modal-video-search-input");
  if (videoSearchInput) {
    videoSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        searchStockVideos(videoSearchInput.value || "");
      }
    });
  }

  // Quick query pill buttons in modal
  document.querySelectorAll(".modal-query-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const query = pill.getAttribute("data-query");
      if (videoSearchInput && query) {
        videoSearchInput.value = query;
        searchStockVideos(query);
      }
    });
  });

  // Toggle Video Background On/Off
  const btnToggleVideoBg = document.getElementById("btn-toggle-video-bg");
  if (btnToggleVideoBg) {
    btnToggleVideoBg.addEventListener("click", () => {
      videoBgEnabled = !videoBgEnabled;
      const statusLabel = document.getElementById("video-toggle-status");
      const icon = document.getElementById("video-toggle-icon");
      const text = document.getElementById("video-toggle-text");

      if (videoBgEnabled) {
        if (statusLabel) { statusLabel.textContent = "ON"; statusLabel.className = "text-cyan-400 font-mono"; }
        if (icon) icon.textContent = "🎬";
        if (text) text.textContent = "Video Active";
        btnToggleVideoBg.className = "w-full py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition";
      } else {
        if (statusLabel) { statusLabel.textContent = "OFF"; statusLabel.className = "text-slate-500 font-mono"; }
        if (icon) icon.textContent = "⏸️";
        if (text) text.textContent = "Video Disabled";
        btnToggleVideoBg.className = "w-full py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold flex items-center justify-center space-x-1.5 transition";
      }

      updateStageVideo(scenes[currentSceneIndex]);
      if (window.soundEngine) window.soundEngine.playWhoosh(0.7);
    });
  }

  // Video Opacity Slider
  const videoOpacitySlider = document.getElementById("video-opacity-slider");
  if (videoOpacitySlider) {
    videoOpacitySlider.addEventListener("input", (e) => {
      videoOpacity = parseFloat(e.target.value);
      const label = document.getElementById("video-opacity-label");
      if (label) label.textContent = `${Math.round(videoOpacity * 100)}%`;
      updateStageVideo(scenes[currentSceneIndex]);
    });
  }

  // 1-Click Auto Match All Slide Backgrounds
  const btnAutoMatchAll = document.getElementById("btn-auto-match-all-videos");
  if (btnAutoMatchAll) {
    btnAutoMatchAll.addEventListener("click", () => {
      autoMatchAllSlideVideos();
    });
  }
}

function playSfxByName(sfx) {
  if (!window.soundEngine) return;
  switch (sfx) {
    case "sub-bass": window.soundEngine.playSubBassImpact(); break;
    case "glitch": window.soundEngine.playLaserGlitch(); break;
    case "word-tick": window.soundEngine.playWordTick(2000); break;
    case "chime": window.soundEngine.playCelestialChime(); break;
    case "whoosh": window.soundEngine.playWhoosh(1.2); break;
    case "riser": window.soundEngine.playRiser(); break;
    case "shutter": window.soundEngine.playCameraShutter(); break;
    default: window.soundEngine.playWhoosh(0.9); break;
  }
}

// Switch between Stage and Storyboard Views
function setViewMode(mode) {
  currentViewMode = mode;
  const stageContainer = document.getElementById("view-container-stage");
  const storyboardContainer = document.getElementById("view-container-storyboard");
  const btnStage = document.getElementById("view-toggle-stage");
  const btnStoryboard = document.getElementById("view-toggle-storyboard");

  if (mode === "storyboard") {
    if (stageContainer) stageContainer.classList.add("hidden");
    if (storyboardContainer) storyboardContainer.classList.remove("hidden");

    if (btnStoryboard) {
      btnStoryboard.className = "view-toggle-btn flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-md shadow-indigo-500/25";
    }
    if (btnStage) {
      btnStage.className = "view-toggle-btn flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-400 hover:text-slate-200";
    }

    renderStoryboardGrid();
    if (window.soundEngine) window.soundEngine.playWhoosh(0.7);
  } else {
    if (stageContainer) stageContainer.classList.remove("hidden");
    if (storyboardContainer) storyboardContainer.classList.add("hidden");

    if (btnStage) {
      btnStage.className = "view-toggle-btn flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-indigo-600 text-white shadow-md shadow-indigo-500/25";
    }
    if (btnStoryboard) {
      btnStoryboard.className = "view-toggle-btn flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-400 hover:text-slate-200";
    }

    renderCurrentSlide();
    renderSlideThumbs();
    if (window.soundEngine) window.soundEngine.playWhoosh(0.7);
  }
  updateStoryboardSummary();
}

function updateStoryboardSummary() {
  const badge = document.getElementById("storyboard-summary-badge");
  if (!badge) return;
  const totalDuration = scenes.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0);
  badge.textContent = `${scenes.length} Scenes • ${totalDuration.toFixed(1)}s Total`;
}

function updateStageAspectRatio() {
  const stage = document.getElementById("kinetic-stage");
  if (!stage) return;
  stage.classList.remove("aspect-9-16", "aspect-16-9", "aspect-1-1");
  stage.classList.add(currentAspectRatio);
}

function generateScenesFromScript(text, topicHint) {
  if (!text || !text.trim()) return;

  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (!lines.length) return;

  const suggestedPictorials = window.researchStudio?.latestResearch?.suggestedPictorials || [];

  scenes = lines.map((line, idx) => {
    let mood = "kinetic";
    let sfx = "whoosh";
    if (idx === 0) { mood = "hook"; sfx = "sub-bass"; }
    else if (idx === lines.length - 1) { mood = "cta"; sfx = "chime"; }
    else if (line.includes("%") || line.includes("0") || line.includes("breakthrough") || line.includes("scale") || line.includes("growth")) { mood = "impact"; sfx = "glitch"; }

    // Use AI recommended pictorial if available for this index, otherwise compute contextual pictorial
    let pic = suggestedPictorials[idx] || getDefaultPictorialForIndex(idx, line);

    return {
      id: idx + 1,
      narration: line,
      duration: Math.max(3.5, Math.min(8.0, line.split(" ").length * 0.45)),
      mood: mood,
      sfx: sfx,
      pictorial: pic,
      videoBg: null // Populated via Pexels stock video auto-matcher
    };
  });

  currentSceneIndex = 0;
  renderSlideThumbs();
  renderStoryboardGrid();
  goToScene(0);
  updateStoryboardSummary();
  syncGlobalExportState();

  // Automatically fetch & apply high-definition stock video backgrounds via Pexels
  fetchAndApplyStockVideosForScenes(scenes, topicHint || text.slice(0, 60));
}

function getDefaultPictorialForIndex(idx, line) {
  const cleanLine = line || "";
  const words = cleanLine.split(" ");
  const metricMatch = cleanLine.match(/(\d+[\d,\.]*[%xXkKMmBb$€£]*|\b\d+\b)/);

  if (metricMatch) {
    return {
      type: "metric_badge",
      label: "Key Metric",
      value: metricMatch[0],
      subtext: words.slice(0, 3).join(" ")
    };
  }

  if (idx % 3 === 0) {
    return {
      type: "tech_hud",
      label: "Telemetry",
      value: "Active & Verified",
      subtext: words.slice(0, 4).join(" ")
    };
  } else if (idx % 3 === 1) {
    return {
      type: "diagram_flow",
      label: "Core Pipeline",
      value: "Trigger → Execution → Impact",
      subtext: "System Workflow"
    };
  } else {
    return {
      type: "circular_gauge",
      label: "Efficiency Rate",
      value: "98.5%",
      subtext: "Optimal Performance"
    };
  }
}

// -------------------------------------------------------------
// STORYBOARD VIEW RENDERER & DRAG-AND-DROP REORDERING
// -------------------------------------------------------------
function renderStoryboardGrid() {
  const grid = document.getElementById("storyboard-cards-grid");
  if (!grid) return;

  grid.innerHTML = "";

  scenes.forEach((scene, index) => {
    const card = document.createElement("div");
    card.className = `storyboard-card rounded-2xl bg-slate-900 border ${
      index === currentSceneIndex ? "border-indigo-500/90 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40" : "border-slate-800 hover:border-slate-700/90"
    } p-4 flex flex-col justify-between gap-3.5 relative select-none`;
    card.setAttribute("draggable", "true");
    card.setAttribute("data-index", index);

    // Mini preview text calculation
    const words = scene.narration.split(" ");
    const previewWords = words.slice(0, 8).join(" ") + (words.length > 8 ? "..." : "");
    const glowClass = glowPresets[activeGlowColor] || glowPresets["pink-cyan"];

    card.innerHTML = `
      <!-- Card Top Bar & Drag Handle -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-slate-200 transition" title="Drag to reorder">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
            </svg>
          </div>
          <span class="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-800/60 text-xs font-mono font-bold text-indigo-300">
            #${index + 1}
          </span>
          <span class="text-xs text-slate-400 font-mono">${(scene.duration || 3.5).toFixed(1)}s</span>
        </div>

        <div class="flex items-center space-x-1.5">
          <!-- SFX Preview button -->
          <button class="btn-audition-card-sfx p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-pink-400 transition" title="Audition Slide SFX" data-sfx="${scene.sfx || 'whoosh'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
            </svg>
          </button>

          <!-- Play on Stage -->
          <button class="btn-jump-stage px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-[11px] font-semibold text-slate-200 hover:text-white transition flex items-center space-x-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            </svg>
            <span>Stage</span>
          </button>
        </div>
      </div>

      <!-- Mini Kinetic Canvas Thumbnail Box -->
      <div class="w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between overflow-hidden relative shadow-inner cursor-pointer hover:border-slate-700 transition group" style="background: radial-gradient(ellipse at top, #1e1b4b 0%, #030712 100%);">
        <div class="flex items-center justify-between text-[9px] font-mono text-slate-400">
          <span class="text-cyan-400 font-bold">SCENE // 0${index + 1}</span>
          <span class="uppercase text-pink-400">${scene.mood || 'kinetic'}</span>
        </div>

        <div class="my-auto text-center ${activeFontPairing}">
          <p class="text-xs font-bold text-slate-100 line-clamp-2 leading-tight ${glowClass}">
            ${escapeHtml(previewWords)}
          </p>
        </div>

        <div class="flex justify-center text-[9px] text-slate-400 font-mono">
          <span class="truncate max-w-[140px] px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/60">
            📊 ${escapeHtml(scene.pictorial?.label || 'Visual Badge')}
          </span>
        </div>
      </div>

      <!-- Quick Inline Content Editor -->
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-semibold text-slate-300 flex justify-between">
          <span>Slide Narration Script</span>
          <span class="text-[10px] text-slate-400 font-normal">${words.length} words</span>
        </label>
        <textarea 
          class="card-narration-input w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-400 resize-none transition shadow-inner leading-relaxed" 
          rows="3" 
          placeholder="Slide narration text..."
        >${escapeHtml(scene.narration)}</textarea>
      </div>

      <!-- Mood, SFX & Duration Controls Grid -->
      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="flex flex-col gap-1">
          <label class="text-[10px] text-slate-400">Mood</label>
          <select class="card-mood-select px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-[11px] focus:outline-none">
            <option value="hook" ${scene.mood === 'hook' ? 'selected' : ''}>🎯 Hook</option>
            <option value="impact" ${scene.mood === 'impact' ? 'selected' : ''}>⚡ Impact</option>
            <option value="kinetic" ${scene.mood === 'kinetic' ? 'selected' : ''}>✨ Kinetic</option>
            <option value="cta" ${scene.mood === 'cta' ? 'selected' : ''}>🚀 CTA</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[10px] text-slate-400">SFX</label>
          <select class="card-sfx-select px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-[11px] focus:outline-none">
            <option value="sub-bass" ${scene.sfx === 'sub-bass' ? 'selected' : ''}>💥 Sub-Bass</option>
            <option value="glitch" ${scene.sfx === 'glitch' ? 'selected' : ''}>⚡ Glitch</option>
            <option value="chime" ${scene.sfx === 'chime' ? 'selected' : ''}>✨ Chime</option>
            <option value="whoosh" ${scene.sfx === 'whoosh' ? 'selected' : ''}>💨 Whoosh</option>
            <option value="riser" ${scene.sfx === 'riser' ? 'selected' : ''}>📈 Riser</option>
            <option value="shutter" ${scene.sfx === 'shutter' ? 'selected' : ''}>📸 Shutter</option>
            <option value="word-tick" ${scene.sfx === 'word-tick' ? 'selected' : ''}>⌨️ Tick</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[10px] text-slate-400">Duration</label>
          <div class="flex items-center space-x-1">
            <button class="btn-duration-minus px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]">-</button>
            <span class="card-duration-label flex-1 text-center font-mono text-[11px] text-slate-200">${(scene.duration || 4.0).toFixed(1)}s</span>
            <button class="btn-duration-plus px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]">+</button>
          </div>
        </div>
      </div>

      <!-- Infographic Badge Dropdown Selector -->
      <div class="flex flex-col gap-1 pt-0.5">
        <div class="flex items-center justify-between text-[10px] text-slate-400">
          <span>Infographic Badge</span>
          <span class="text-indigo-400 font-mono">${scene.pictorial?.value || ''}</span>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <select class="card-pictorial-type px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-[11px] focus:outline-none">
            <option value="tech_hud" ${scene.pictorial?.type === 'tech_hud' ? 'selected' : ''}>🌐 Tech HUD</option>
            <option value="metric_badge" ${scene.pictorial?.type === 'metric_badge' ? 'selected' : ''}>▲ Metric Badge</option>
            <option value="circular_gauge" ${scene.pictorial?.type === 'circular_gauge' ? 'selected' : ''}>⏱ Circular Gauge</option>
            <option value="diagram_flow" ${scene.pictorial?.type === 'diagram_flow' ? 'selected' : ''}>🔀 Flow Diagram</option>
            <option value="concept_card" ${scene.pictorial?.type === 'concept_card' ? 'selected' : ''}>💡 Concept Card</option>
          </select>
          <input 
            type="text" 
            class="card-pictorial-val px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-[11px] focus:outline-none" 
            placeholder="Metric (e.g. 10,000x)" 
            value="${escapeHtml(scene.pictorial?.value || '')}"
          />
        </div>
      </div>

      <!-- Stock Video Background Selector Row -->
      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
        <div class="flex items-center space-x-2 truncate max-w-[170px]">
          <div class="w-6 h-6 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs shrink-0">
            📹
          </div>
          <div class="flex flex-col truncate">
            <span class="text-slate-300 font-medium truncate">${escapeHtml(scene.videoBg?.query || 'Cinematic Loop')}</span>
            <span class="text-[9px] text-slate-500 font-mono">Pexels HD</span>
          </div>
        </div>

        <button 
          class="btn-change-card-video px-2 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600/80 text-cyan-300 hover:text-white font-medium text-[10px] transition flex items-center space-x-1"
          title="Browse & Choose Background Video"
        >
          <span>Change</span>
        </button>
      </div>

      <!-- Card Action Footer (Reorder, Clone, Delete) -->
      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div class="flex items-center space-x-1">
          <button class="btn-move-scene-left p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition" ${index === 0 ? 'disabled' : ''} title="Move Left / Earlier">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button class="btn-move-scene-right p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition" ${index === scenes.length - 1 ? 'disabled' : ''} title="Move Right / Later">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <div class="flex items-center space-x-1.5">
          <button class="btn-clone-scene px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1" title="Duplicate this scene">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span class="text-[11px]">Clone</span>
          </button>

          <button class="btn-delete-scene p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 transition" title="Delete scene" ${scenes.length <= 1 ? 'disabled' : ''}>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    `;

    // Attach Event Listeners to Card Elements
    setupCardEventListeners(card, index);

    // Attach Drag and Drop Events
    setupCardDragDropEvents(card, index);

    grid.appendChild(card);
  });

  // Append "+ Add New Scene" Dashed Card at End of Grid
  const addCard = document.createElement("div");
  addCard.className = "rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-900/40 hover:bg-slate-900/80 p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition min-h-[360px] text-slate-400 hover:text-indigo-300";
  addCard.innerHTML = `
    <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
    </div>
    <div class="text-center">
      <h4 class="text-sm font-bold text-white">Add New Slide</h4>
      <p class="text-xs text-slate-500">Insert new kinetic scene at end</p>
    </div>
  `;
  addCard.addEventListener("click", () => addNewScene());
  grid.appendChild(addCard);
}

function setupCardEventListeners(card, index) {
  const scene = scenes[index];
  if (!scene) return;

  // Narration text live editor
  const textarea = card.querySelector(".card-narration-input");
  if (textarea) {
    textarea.addEventListener("input", (e) => {
      scene.narration = e.target.value;
      if (index === currentSceneIndex) {
        renderCurrentSlide();
        const mainEditor = document.getElementById("current-slide-text-editor");
        if (mainEditor) mainEditor.value = scene.narration;
      }
      renderSlideThumbs();
    });
  }

  // Mood select
  const moodSelect = card.querySelector(".card-mood-select");
  if (moodSelect) {
    moodSelect.addEventListener("change", (e) => {
      scene.mood = e.target.value;
      if (index === currentSceneIndex) renderCurrentSlide();
    });
  }

  // SFX select
  const sfxSelect = card.querySelector(".card-sfx-select");
  if (sfxSelect) {
    sfxSelect.addEventListener("change", (e) => {
      scene.sfx = e.target.value;
      const auditionBtn = card.querySelector(".btn-audition-card-sfx");
      if (auditionBtn) auditionBtn.setAttribute("data-sfx", scene.sfx);
      playSfxByName(scene.sfx);
    });
  }

  // Audition SFX button
  const auditionBtn = card.querySelector(".btn-audition-card-sfx");
  if (auditionBtn) {
    auditionBtn.addEventListener("click", () => {
      playSfxByName(scene.sfx || "whoosh");
    });
  }

  // Jump to Stage button
  const jumpBtn = card.querySelector(".btn-jump-stage");
  if (jumpBtn) {
    jumpBtn.addEventListener("click", () => {
      goToScene(index);
      setViewMode("stage");
    });
  }

  // Duration steppers
  const btnMinus = card.querySelector(".btn-duration-minus");
  const btnPlus = card.querySelector(".btn-duration-plus");
  const durLabel = card.querySelector(".card-duration-label");

  if (btnMinus && durLabel) {
    btnMinus.addEventListener("click", () => {
      scene.duration = Math.max(1.5, (scene.duration || 4.0) - 0.5);
      durLabel.textContent = scene.duration.toFixed(1) + "s";
      updateStoryboardSummary();
      renderSlideThumbs();
    });
  }

  if (btnPlus && durLabel) {
    btnPlus.addEventListener("click", () => {
      scene.duration = Math.min(20.0, (scene.duration || 4.0) + 0.5);
      durLabel.textContent = scene.duration.toFixed(1) + "s";
      updateStoryboardSummary();
      renderSlideThumbs();
    });
  }

  // Pictorial Type & Value
  const picType = card.querySelector(".card-pictorial-type");
  const picVal = card.querySelector(".card-pictorial-val");

  if (picType) {
    picType.addEventListener("change", (e) => {
      if (!scene.pictorial) scene.pictorial = {};
      scene.pictorial.type = e.target.value;
      if (index === currentSceneIndex) renderCurrentSlide();
    });
  }

  if (picVal) {
    picVal.addEventListener("input", (e) => {
      if (!scene.pictorial) scene.pictorial = {};
      scene.pictorial.value = e.target.value;
      if (index === currentSceneIndex) renderCurrentSlide();
    });
  }

  // Stock Video background modal trigger
  const changeVideoBtn = card.querySelector(".btn-change-card-video");
  if (changeVideoBtn) {
    changeVideoBtn.addEventListener("click", () => {
      openStockVideoModal(index);
    });
  }

  // Move buttons
  const moveLeftBtn = card.querySelector(".btn-move-scene-left");
  if (moveLeftBtn) {
    moveLeftBtn.addEventListener("click", () => {
      moveScene(index, index - 1);
    });
  }

  const moveRightBtn = card.querySelector(".btn-move-scene-right");
  if (moveRightBtn) {
    moveRightBtn.addEventListener("click", () => {
      moveScene(index, index + 1);
    });
  }

  // Clone button
  const cloneBtn = card.querySelector(".btn-clone-scene");
  if (cloneBtn) {
    cloneBtn.addEventListener("click", () => {
      duplicateScene(index);
    });
  }

  // Delete button
  const deleteBtn = card.querySelector(".btn-delete-scene");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      deleteScene(index);
    });
  }
}

// -------------------------------------------------------------
// DRAG AND DROP REORDERING HANDLERS
// -------------------------------------------------------------
function setupCardDragDropEvents(card, index) {
  card.addEventListener("dragstart", (e) => {
    draggedSceneIndex = index;
    card.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("is-dragging");
    document.querySelectorAll(".storyboard-card").forEach(c => c.classList.remove("is-drop-target"));
    draggedSceneIndex = null;
  });

  card.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedSceneIndex !== null && draggedSceneIndex !== index) {
      card.classList.add("is-drop-target");
    }
  });

  card.addEventListener("dragleave", () => {
    card.classList.remove("is-drop-target");
  });

  card.addEventListener("drop", (e) => {
    e.preventDefault();
    card.classList.remove("is-drop-target");
    if (draggedSceneIndex !== null && draggedSceneIndex !== index) {
      moveScene(draggedSceneIndex, index);
    }
  });
}

function moveScene(fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= scenes.length || toIndex < 0 || toIndex >= scenes.length) return;

  const [movedItem] = scenes.splice(fromIndex, 1);
  scenes.splice(toIndex, 0, movedItem);

  // Update current active scene index
  if (currentSceneIndex === fromIndex) {
    currentSceneIndex = toIndex;
  } else if (fromIndex < currentSceneIndex && toIndex >= currentSceneIndex) {
    currentSceneIndex--;
  } else if (fromIndex > currentSceneIndex && toIndex <= currentSceneIndex) {
    currentSceneIndex++;
  }

  renumberScenes();
  renderStoryboardGrid();
  renderSlideThumbs();
  goToScene(currentSceneIndex);
  syncScenesToScript();
  if (window.soundEngine) window.soundEngine.playWhoosh(0.9);
}

function addNewScene(insertIndex = null) {
  const targetIdx = insertIndex !== null ? insertIndex : scenes.length;
  const newScene = {
    id: targetIdx + 1,
    narration: "New kinetic slide text and key insight here.",
    duration: 4.5,
    mood: "kinetic",
    sfx: "whoosh",
    pictorial: {
      type: "metric_badge",
      label: "Key Milestone",
      value: "100%",
      subtext: "Optimal Result"
    }
  };

  scenes.splice(targetIdx, 0, newScene);
  currentSceneIndex = targetIdx;

  renumberScenes();
  renderStoryboardGrid();
  renderSlideThumbs();
  goToScene(currentSceneIndex);
  syncScenesToScript();
  updateStoryboardSummary();
  if (window.soundEngine) window.soundEngine.playCelestialChime();
}

function duplicateScene(index) {
  if (index < 0 || index >= scenes.length) return;
  const source = scenes[index];
  const clone = JSON.parse(JSON.stringify(source));
  clone.id = index + 2;
  
  scenes.splice(index + 1, 0, clone);
  currentSceneIndex = index + 1;

  renumberScenes();
  renderStoryboardGrid();
  renderSlideThumbs();
  goToScene(currentSceneIndex);
  syncScenesToScript();
  updateStoryboardSummary();
  if (window.soundEngine) window.soundEngine.playCelestialChime();
}

function deleteScene(index) {
  if (scenes.length <= 1) {
    alert("Storyboard must contain at least 1 slide.");
    return;
  }

  scenes.splice(index, 1);
  if (currentSceneIndex >= scenes.length) {
    currentSceneIndex = scenes.length - 1;
  }

  renumberScenes();
  renderStoryboardGrid();
  renderSlideThumbs();
  goToScene(currentSceneIndex);
  syncScenesToScript();
  updateStoryboardSummary();
  if (window.soundEngine) window.soundEngine.playWhoosh(0.7);
}

function renumberScenes() {
  scenes.forEach((s, idx) => {
    s.id = idx + 1;
  });
}

function syncScenesToScript() {
  const fullText = scenes.map(s => s.narration).join("\n");
  const scriptInput = document.getElementById("script-input");
  if (scriptInput) {
    scriptInput.value = fullText;
  }
}

function renderSlideThumbs() {
  const container = document.getElementById("slide-thumbnails-container");
  if (!container) return;

  container.innerHTML = "";
  scenes.forEach((scene, i) => {
    const thumb = document.createElement("button");
    thumb.className = `p-2.5 rounded-lg border text-left flex flex-col gap-1 transition shrink-0 w-36 sm:w-44 ${
      i === currentSceneIndex ? "bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-500/20" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
    }`;
    thumb.innerHTML = `
      <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
        <span class="text-indigo-400">#${i + 1}</span>
        <span class="px-1.5 py-0.2 rounded bg-slate-800 text-[10px]">${(scene.duration || 4.0).toFixed(1)}s</span>
      </div>
      <p class="text-xs text-slate-200 line-clamp-2 leading-tight">${escapeHtml(scene.narration)}</p>
    `;
    thumb.addEventListener("click", () => {
      goToScene(i);
      if (window.soundEngine) window.soundEngine.playWhoosh(0.7);
    });
    container.appendChild(thumb);
  });
}

function goToScene(index) {
  if (index < 0 || index >= scenes.length) return;
  currentSceneIndex = index;

  renderSlideThumbs();
  renderCurrentSlide();

  // Synchronize Pexels stock video background layer
  const currentScene = scenes[currentSceneIndex];
  updateStageVideo(currentScene);

  // Synchronize procedural character & atmosphere scene animation engine
  if (window.sceneAnimationEngine && currentScene) {
    window.sceneAnimationEngine.updateFromScene(currentScene);
  }

  // Trigger Slide SFX
  if (window.soundEngine && currentScene) {
    if (currentScene.sfx === "sub-bass" || currentScene.mood === "hook") window.soundEngine.playSubBassImpact();
    else if (currentScene.sfx === "glitch" || currentScene.mood === "impact") window.soundEngine.playLaserGlitch();
    else if (currentScene.sfx === "chime" || currentScene.mood === "cta") window.soundEngine.playCelestialChime();
    else window.soundEngine.playWhoosh(0.9);
  }

  // Update text editor in sidebar
  const editor = document.getElementById("current-slide-text-editor");
  if (editor && currentScene) {
    editor.value = currentScene.narration;
  }

  const badge = document.getElementById("current-slide-number-badge");
  if (badge) badge.textContent = `Slide ${currentSceneIndex + 1} of ${scenes.length}`;

  // Speak with SpeechEngine if playing or manually triggered
  if (window.speechEngine && window.speechEngine.enabled && isPlaying) {
    window.speechEngine.speak(currentScene.narration, (wordIdx) => {
      highlightActiveWord(wordIdx);
    });
  }
}

function renderCurrentSlide() {
  const stage = document.getElementById("kinetic-stage-content");
  if (!stage || !scenes[currentSceneIndex]) return;

  const scene = scenes[currentSceneIndex];
  const words = scene.narration.split(" ");
  const glowClass = glowPresets[activeGlowColor] || glowPresets["pink-cyan"];

  // Build animated word tokens
  const wordsHtml = words.map((w, idx) => {
    const isKeyword = w.length > 5 || w.includes("%") || w.includes("0") || idx % 4 === 2;
    const styleDelay = `animation-delay: ${idx * 60}ms;`;
    if (isKeyword) {
      return `<span id="word-token-${idx}" class="inline-block animate-word mx-1 font-black tracking-tight ${glowClass}" style="${styleDelay}">${escapeHtml(w)}</span>`;
    }
    return `<span id="word-token-${idx}" class="inline-block animate-word mx-1 text-slate-100 font-extrabold tracking-tight" style="${styleDelay}">${escapeHtml(w)}</span>`;
  }).join(" ");

  // Build Pictorial Infographic HTML
  const pictorialHtml = renderPictorialComponent(scene.pictorial);

  stage.innerHTML = `
    <div class="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-8">
      <!-- Top Stage HUD -->
      <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
        <div class="flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="text-emerald-400 font-semibold tracking-wider">SCENE // 0${currentSceneIndex + 1}</span>
        </div>
        <div class="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-[11px] text-slate-300">
          MOOD: <strong class="text-indigo-300 uppercase">${scene.mood}</strong>
        </div>
      </div>

      <!-- Main Stage Kinetic Typography -->
      <div class="my-auto ${activeTextAlign} ${activeFontPairing}">
        <h2 class="${activeFontSize} font-bold leading-snug tracking-tight text-white select-none">
          ${wordsHtml}
        </h2>
      </div>

      <!-- Bottom Pictorial Infographic Area -->
      <div class="mt-4 flex justify-center">
        ${pictorialHtml}
      </div>
    </div>
  `;
}

function renderPictorialComponent(pic) {
  if (!pic || pic.type === "none") return "";

  if (pic.type === "metric_badge") {
    return `
      <div class="animate-float px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/80 to-slate-900/90 border border-indigo-500/40 shadow-xl backdrop-blur-md flex items-center space-x-4">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-lg">
          ▲
        </div>
        <div>
          <div class="text-2xl font-black font-space text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-pink-300">
            ${escapeHtml(pic.value || "10,000x")}
          </div>
          <div class="text-[11px] font-medium text-slate-300 tracking-wide uppercase">${escapeHtml(pic.label || "Key Metric")}</div>
          <div class="text-[10px] text-slate-400">${escapeHtml(pic.subtext || "")}</div>
        </div>
      </div>
    `;
  } else if (pic.type === "tech_hud") {
    return `
      <div class="w-full max-w-sm p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md flex items-center space-x-3.5">
        <div class="relative w-11 h-11 rounded-full border-2 border-cyan-500/40 flex items-center justify-center animate-spin" style="animation-duration: 8s;">
          <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
        </div>
        <div class="flex-1 font-mono">
          <div class="flex items-center justify-between text-xs">
            <span class="text-cyan-400 font-bold">${escapeHtml(pic.label || "System HUD")}</span>
            <span class="text-pink-400 font-semibold text-[11px] animate-pulse">ACTIVE</span>
          </div>
          <div class="text-sm font-bold text-white tracking-wider">${escapeHtml(pic.value || "Telemetry Online")}</div>
          <div class="text-[10px] text-slate-400">${escapeHtml(pic.subtext || "Coordinates 48.85 // Verified")}</div>
        </div>
      </div>
    `;
  } else if (pic.type === "circular_gauge") {
    return `
      <div class="px-5 py-3 rounded-2xl bg-slate-900/90 border border-emerald-500/40 flex items-center space-x-4 shadow-lg">
        <div class="relative w-12 h-12 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path class="text-slate-800" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="text-emerald-400" stroke-dasharray="85, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <span class="absolute text-[11px] font-bold text-emerald-300 font-mono">${escapeHtml(pic.value || "99.9%")}</span>
        </div>
        <div>
          <div class="text-xs font-bold text-slate-200">${escapeHtml(pic.label || "Cluster Fidelity")}</div>
          <div class="text-[11px] text-emerald-400 font-medium">${escapeHtml(pic.subtext || "Optimal State")}</div>
        </div>
      </div>
    `;
  } else if (pic.type === "diagram_flow") {
    return `
      <div class="w-full max-w-md px-4 py-2.5 rounded-xl bg-slate-900/90 border border-purple-500/40 flex items-center justify-between text-xs font-mono">
        <span class="px-2 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">Input</span>
        <span class="text-purple-400 animate-pulse">──►</span>
        <span class="px-2 py-1 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 font-bold">${escapeHtml(pic.label || "Pipeline")}</span>
        <span class="text-cyan-400 animate-pulse">──►</span>
        <span class="px-2 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">Output</span>
      </div>
    `;
  } else {
    // Default Concept Card
    return `
      <div class="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center space-x-3 text-xs">
        <span class="text-indigo-400 font-bold">●</span>
        <span class="text-slate-200 font-medium">${escapeHtml(pic.label || "Concept")}: <strong class="text-indigo-300">${escapeHtml(pic.value || "")}</strong></span>
      </div>
    `;
  }
}

function highlightActiveWord(wordIdx) {
  const token = document.getElementById(`word-token-${wordIdx}`);
  if (token) {
    token.classList.add("scale-110", "brightness-125");
    setTimeout(() => {
      token.classList.remove("scale-110", "brightness-125");
    }, 350);
  }
}

function togglePlayPause() {
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  isPlaying = true;
  updatePlayButtonUI(true);

  if (window.soundEngine) {
    const ambientSelect = document.getElementById("ambient-track-select");
    const track = ambientSelect ? ambientSelect.value : "cyber";
    if (track && track !== "none") {
      window.soundEngine.startAmbientTrack(track);
    }
  }

  playCurrentSceneLoop();
}

function pausePlayback() {
  isPlaying = false;
  updatePlayButtonUI(false);
  if (playTimer) clearTimeout(playTimer);
  if (window.speechEngine) window.speechEngine.stop();
  if (window.soundEngine) window.soundEngine.stopAmbientTrack();
}

function updatePlayButtonUI(playing) {
  const btn = document.getElementById("btn-play-pause");
  if (!btn) return;
  if (playing) {
    btn.innerHTML = `
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Pause</span>
    `;
    btn.classList.replace("bg-indigo-600", "bg-pink-600");
  } else {
    btn.innerHTML = `
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Play Slides</span>
    `;
    btn.classList.replace("bg-pink-600", "bg-indigo-600");
  }
}

function playCurrentSceneLoop() {
  if (!isPlaying) return;

  const scene = scenes[currentSceneIndex];
  if (!scene) return;

  goToScene(currentSceneIndex);

  const durationMs = (scene.duration || 4.0) * 1000;

  playTimer = setTimeout(() => {
    if (!isPlaying) return;
    if (currentSceneIndex < scenes.length - 1) {
      currentSceneIndex++;
      playCurrentSceneLoop();
    } else {
      // Loop or pause
      currentSceneIndex = 0;
      playCurrentSceneLoop();
    }
  }, durationMs);
}

// Global Art Theme Switcher
window.setArtTheme = function(theme) {
  currentTheme = theme;
  const stage = document.getElementById("kinetic-stage");
  if (!stage) return;

  stage.classList.remove("from-slate-950", "from-indigo-950", "from-emerald-950", "from-purple-950", "from-amber-950");

  if (theme === "cyberpunk") {
    stage.style.background = "radial-gradient(ellipse at top, #1e1b4b 0%, #030712 100%)";
    activeGlowColor = "pink-cyan";
  } else if (theme === "emerald") {
    stage.style.background = "radial-gradient(ellipse at top, #064e3b 0%, #022c22 100%)";
    activeGlowColor = "matrix-green";
  } else if (theme === "sunset") {
    stage.style.background = "radial-gradient(ellipse at top, #451a03 0%, #0c0a09 100%)";
    activeGlowColor = "gold-fire";
  } else if (theme === "cosmic") {
    stage.style.background = "radial-gradient(ellipse at top, #311042 0%, #050510 100%)";
    activeGlowColor = "cobalt-ice";
  } else {
    stage.style.background = "radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)";
    activeGlowColor = "cyan-mint";
  }
  renderCurrentSlide();
  if (currentViewMode === "storyboard") renderStoryboardGrid();
};

// Video Export Configuration & Recording
function startVideoExport() {
  if (window.videoExportEngine) {
    window.videoExportEngine.openModal();
  } else {
    const modal = document.getElementById("video-export-modal");
    if (modal) modal.classList.remove("hidden");
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ========================================================
// PEXELS STOCK VIDEO BACKGROUNDS ENGINE & MODAL HANDLERS
// ========================================================

// Update the video background on the kinetic stage
function updateStageVideo(scene) {
  const videoEl = document.getElementById("stage-bg-video");
  const overlayEl = document.getElementById("stage-video-overlay");
  const queryLabel = document.getElementById("active-video-query-label");
  const sourceLabel = document.getElementById("active-video-source-label");

  if (!videoEl) return;

  if (!videoBgEnabled || !scene || !scene.videoBg || !scene.videoBg.url) {
    // Hide video layer smoothly
    videoEl.style.opacity = "0";
    if (queryLabel) queryLabel.textContent = videoBgEnabled ? "No Video Assigned" : "Video Disabled";
    if (sourceLabel) sourceLabel.textContent = `Slide ${currentSceneIndex + 1}`;
    return;
  }

  const targetUrl = scene.videoBg.url;

  // Only change src if it's different to prevent video reloading flicker
  if (videoEl.dataset.currentSrc !== targetUrl) {
    videoEl.dataset.currentSrc = targetUrl;
    videoEl.src = targetUrl;
    videoEl.load();
  }

  videoEl.style.opacity = String(videoOpacity);
  
  // Safely play video
  const playPromise = videoEl.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      // Browser autoplay policies silently handled
    });
  }

  // Update UI Labels
  if (queryLabel) {
    queryLabel.textContent = scene.videoBg.query ? `${scene.videoBg.query}` : "Stock Video Loop";
  }
  if (sourceLabel) {
    const quality = scene.videoBg.quality || "HD";
    const src = scene.videoBg.source === "pexels" ? "Pexels" : "Curated";
    sourceLabel.textContent = `${src} ${quality} • Slide ${currentSceneIndex + 1}`;
  }
}

// Auto-fetch and assign relevant stock videos for all scenes in parallel
async function fetchAndApplyStockVideosForScenes(scenesList, topicHint) {
  if (!scenesList || !scenesList.length) return;

  const spinner = document.getElementById("auto-match-spinner");
  if (spinner) spinner.classList.remove("hidden");

  try {
    const orientation = currentAspectRatio === "aspect-16-9" ? "landscape" : "portrait";
    const response = await fetch("/api/stock-videos/auto-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slides: scenesList,
        topic: topicHint || "",
        orientation: orientation
      })
    });

    if (!response.ok) throw new Error("Failed to auto-match stock videos");

    const data = await response.json();
    if (data.matches && Array.isArray(data.matches)) {
      data.matches.forEach((match, idx) => {
        if (scenes[idx]) {
          scenes[idx].videoBg = match;
        }
      });

      // Update stage video for active scene
      updateStageVideo(scenes[currentSceneIndex]);

      // Re-render storyboard cards if in storyboard mode
      if (currentViewMode === "storyboard") {
        renderStoryboardGrid();
      }
    }
  } catch (err) {
    console.error("Auto match videos error:", err);
  } finally {
    if (spinner) spinner.classList.add("hidden");
  }
}

// Triggered by button in Stock Video sidebar panel
async function autoMatchAllSlideVideos() {
  const topicInput = document.getElementById("research-topic-input")?.value;
  const scriptInput = document.getElementById("script-input")?.value;
  const promptInput = document.getElementById("research-prompt-input")?.value;
  const topicHint = topicInput || promptInput || (scriptInput ? scriptInput.slice(0, 80) : "cinematic technology");

  const btn = document.getElementById("btn-auto-match-all-videos");
  if (btn) {
    btn.classList.add("opacity-75", "pointer-events-none");
  }

  await fetchAndApplyStockVideosForScenes(scenes, topicHint);

  if (btn) {
    btn.classList.remove("opacity-75", "pointer-events-none");
  }

  if (window.soundEngine) window.soundEngine.playCelestialChime();
}

// Open Stock Video search modal for a specific scene
function openStockVideoModal(sceneIndex) {
  modalTargetSceneIndex = (sceneIndex >= 0 && sceneIndex < scenes.length) ? sceneIndex : currentSceneIndex;
  
  const modal = document.getElementById("stock-video-modal");
  const targetLabel = document.getElementById("modal-target-slide-label");
  const searchInput = document.getElementById("modal-video-search-input");

  if (targetLabel) {
    targetLabel.textContent = `Selecting background for Slide #${modalTargetSceneIndex + 1}: "${escapeHtml((scenes[modalTargetSceneIndex]?.narration || '').slice(0, 55))}..."`;
  }

  // Derive contextual search query from slide narration if available
  const currentScene = scenes[modalTargetSceneIndex];
  let defaultQuery = "abstract digital motion";
  if (currentScene && currentScene.videoBg?.query) {
    defaultQuery = currentScene.videoBg.query;
  } else if (currentScene && currentScene.narration) {
    const words = currentScene.narration
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
    if (words.length) {
      defaultQuery = words.slice(0, 3).join(" ");
    }
  }

  if (searchInput) {
    searchInput.value = defaultQuery;
  }

  if (modal) {
    modal.classList.remove("hidden");
  }

  // Execute initial search
  searchStockVideos(defaultQuery);
  if (window.soundEngine) window.soundEngine.playWhoosh(0.7);
}

// Close Stock Video modal
function closeStockVideoModal() {
  const modal = document.getElementById("stock-video-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Search Pexels Stock Videos
async function searchStockVideos(query) {
  const q = (query || "").trim() || "abstract technology motion";
  const grid = document.getElementById("modal-video-grid");
  const spinner = document.getElementById("modal-search-spinner");

  if (spinner) spinner.classList.remove("hidden");
  if (grid) {
    grid.innerHTML = `
      <div class="col-span-full py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <svg class="animate-spin h-7 w-7 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xs font-mono">Searching Pexels video library for "${escapeHtml(q)}"...</p>
      </div>
    `;
  }

  try {
    const orientation = currentAspectRatio === "aspect-16-9" ? "landscape" : "portrait";
    const response = await fetch("/api/stock-videos/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: q,
        orientation: orientation,
        perPage: 12
      })
    });

    if (!response.ok) throw new Error("Search request failed");

    const data = await response.json();
    const videos = data.videos || [];

    if (!grid) return;

    if (!videos.length) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <p class="text-sm font-semibold text-slate-300">No stock videos found for "${escapeHtml(q)}"</p>
          <p class="text-xs mt-1 text-slate-500">Try searching broad terms like "particles", "galaxy", "technology", "nature", or "city".</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = "";

    videos.forEach((video) => {
      const card = document.createElement("div");
      card.className = "group relative rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 overflow-hidden shadow-lg transition flex flex-col justify-between";

      // Video preview card HTML
      card.innerHTML = `
        <div class="relative w-full aspect-video bg-black overflow-hidden cursor-pointer">
          <img src="${escapeHtml(video.thumbnail)}" alt="${escapeHtml(video.query)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
          
          <video 
            src="${escapeHtml(video.url)}" 
            loop 
            muted 
            playsinline 
            class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
          ></video>

          <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-cyan-300 font-bold border border-cyan-500/30">
            ${video.duration ? `${video.duration}s` : 'HD'}
          </div>

          <div class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-slate-300">
            By ${escapeHtml(video.user || 'Pexels Creator')}
          </div>
        </div>

        <div class="p-3 flex items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-900/90">
          <span class="text-xs font-medium text-slate-300 truncate max-w-[130px]" title="${escapeHtml(video.query)}">
            ${escapeHtml(video.query)}
          </span>
          <button 
            class="btn-apply-video px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow transition flex items-center space-x-1 shrink-0"
          >
            <span>Apply</span>
          </button>
        </div>
      `;

      // Hover playback for preview
      const previewVideo = card.querySelector("video");
      card.addEventListener("mouseenter", () => {
        if (previewVideo) {
          previewVideo.play().catch(() => {});
        }
      });
      card.addEventListener("mouseleave", () => {
        if (previewVideo) {
          previewVideo.pause();
          previewVideo.currentTime = 0;
        }
      });

      // Apply button event
      const applyBtn = card.querySelector(".btn-apply-video");
      if (applyBtn) {
        applyBtn.addEventListener("click", () => {
          applyVideoToScene(modalTargetSceneIndex, video);
        });
      }

      grid.appendChild(card);
    });

  } catch (err) {
    console.error("Video search failed:", err);
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full py-8 text-center text-rose-400 text-xs font-mono">
          Failed to fetch stock videos. Please check connection and try again.
        </div>
      `;
    }
  } finally {
    if (spinner) spinner.classList.add("hidden");
  }
}

// Apply chosen video to specific scene
function applyVideoToScene(sceneIndex, videoObj) {
  if (!scenes[sceneIndex]) return;

  scenes[sceneIndex].videoBg = videoObj;

  // If modifying active stage slide, update immediately
  if (sceneIndex === currentSceneIndex) {
    updateStageVideo(scenes[currentSceneIndex]);
  }

  // Update storyboard grid cards
  if (currentViewMode === "storyboard") {
    renderStoryboardGrid();
  }

  closeStockVideoModal();
  if (window.soundEngine) window.soundEngine.playCelestialChime();
}

window.generateScenesFromScript = generateScenesFromScript;
window.setViewMode = setViewMode;
window.openStockVideoModal = openStockVideoModal;
window.autoMatchAllSlideVideos = autoMatchAllSlideVideos;
