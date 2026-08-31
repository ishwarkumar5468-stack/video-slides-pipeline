/**
 * Video & Production Export Engine
 * Handles client-side high-definition video rendering (720p, 1080p, 4K at 30/60 FPS),
 * High-Res PNG slide posters, timed .srt subtitles, and structured pipeline JSON manifests.
 */

class VideoExportEngine {
  constructor() {
    this.selectedResolution = "1080p"; // '720p', '1080p', '4k'
    this.selectedFps = 60; // 30 or 60
    this.activeTab = "video"; // 'video', 'posters', 'manifest'
    this.isExporting = false;
    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.recordedBlob = null;
    this.recordedUrl = null;
    this.cancelRequested = false;

    // Standard video resolution presets adapted for 9:16 (Shorts/Reels), 16:9 (Landscape), and 1:1 (Square)
    this.resolutionPresets = {
      "aspect-9-16": {
        "720p": { width: 720, height: 1280, label: "720 × 1280 px (HD)" },
        "1080p": { width: 1080, height: 1920, label: "1080 × 1920 px (Full HD)" },
        "4k": { width: 2160, height: 3840, label: "2160 × 3840 px (4K Cinema)" }
      },
      "aspect-16-9": {
        "720p": { width: 1280, height: 720, label: "1280 × 720 px (HD)" },
        "1080p": { width: 1920, height: 1080, label: "1920 × 1080 px (Full HD)" },
        "4k": { width: 3840, height: 2160, label: "3840 × 2160 px (4K Cinema)" }
      },
      "aspect-1-1": {
        "720p": { width: 720, height: 720, label: "720 × 720 px (HD Square)" },
        "1080p": { width: 1080, height: 1080, label: "1080 × 1080 px (Full HD Square)" },
        "4k": { width: 2160, height: 2160, label: "2160 × 2160 px (4K Square)" }
      }
    };

    this.initEventListeners();
  }

  getScenesList() {
    if (typeof window.getScenes === "function") {
      const list = window.getScenes();
      if (Array.isArray(list) && list.length > 0) return list;
    }
    if (Array.isArray(window.scenes) && window.scenes.length > 0) {
      return window.scenes;
    }
    const scriptInput = document.getElementById("script-input");
    if (scriptInput && scriptInput.value.trim()) {
      const lines = scriptInput.value.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      return lines.map((line, idx) => ({
        id: idx + 1,
        narration: line,
        duration: Math.max(3.5, Math.min(8.0, line.split(" ").length * 0.45)),
        mood: idx === 0 ? "hook" : idx === lines.length - 1 ? "cta" : "kinetic",
        sfx: idx === 0 ? "sub-bass" : "whoosh",
        pictorial: {
          type: "tech_hud",
          label: "Telemetry Metric",
          value: "Active",
          subtext: "Verified telemetry"
        }
      }));
    }
    return [];
  }

  initEventListeners() {
    // Open Modal Triggers
    const btnExportVideo = document.getElementById("btn-export-video");
    if (btnExportVideo) {
      btnExportVideo.addEventListener("click", () => this.openModal("video"));
    }

    const btnStoryboardExport = document.getElementById("btn-storyboard-export");
    if (btnStoryboardExport) {
      btnStoryboardExport.addEventListener("click", () => this.openModal("video"));
    }

    // Close Modal Buttons
    const btnCloseModal = document.getElementById("btn-close-export-modal");
    if (btnCloseModal) {
      btnCloseModal.addEventListener("click", () => this.closeModal());
    }

    const btnCancelModal = document.getElementById("btn-cancel-export-modal");
    if (btnCancelModal) {
      btnCancelModal.addEventListener("click", () => this.closeModal());
    }

    // Modal Navigation Tabs
    const tabBtns = document.querySelectorAll(".export-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tabKey = btn.getAttribute("data-tab");
        if (tabKey) this.switchTab(tabKey);
      });
    });

    // Resolution Selection Cards
    const resCards = document.querySelectorAll(".export-resolution-card");
    resCards.forEach(card => {
      card.addEventListener("click", () => {
        const res = card.getAttribute("data-resolution");
        if (!res) return;
        this.selectedResolution = res;

        resCards.forEach(c => {
          c.classList.remove("border-cyan-400", "bg-cyan-950/40", "shadow-lg", "shadow-cyan-500/20");
          c.classList.add("border-slate-800", "bg-slate-950/60");
          const radio = c.querySelector(".export-res-radio");
          if (radio) {
            radio.className = "export-res-radio w-4 h-4 rounded-full border-2 border-slate-700 bg-transparent flex items-center justify-center";
          }
        });

        card.classList.remove("border-slate-800", "bg-slate-950/60");
        card.classList.add("border-cyan-400", "bg-cyan-950/40", "shadow-lg", "shadow-cyan-500/20");
        const radio = card.querySelector(".export-res-radio");
        if (radio) {
          radio.className = "export-res-radio w-4 h-4 rounded-full border-2 border-cyan-400 bg-cyan-400 flex items-center justify-center";
        }

        this.updateExportSummaryLabels();
      });
    });

    // Frame Rate (FPS) Selection Buttons
    const fpsBtns = document.querySelectorAll(".export-fps-btn");
    fpsBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const fps = parseInt(btn.getAttribute("data-fps"), 10);
        if (!fps) return;
        this.selectedFps = fps;

        fpsBtns.forEach(b => {
          b.className = "export-fps-btn p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center justify-between";
        });

        btn.className = "export-fps-btn p-2.5 rounded-xl border border-cyan-400 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30 transition flex items-center justify-between";
        this.updateExportSummaryLabels();
      });
    });

    // Start Video Rendering Button
    const btnStartRender = document.getElementById("btn-start-video-render");
    if (btnStartRender) {
      btnStartRender.addEventListener("click", () => this.startExportProcess());
    }

    // Re-download Video Button
    const btnDownloadVideo = document.getElementById("btn-download-exported-video");
    if (btnDownloadVideo) {
      btnDownloadVideo.addEventListener("click", () => {
        if (this.recordedBlob) {
          this.triggerFileDownload(this.recordedBlob);
        }
      });
    }

    // PNG Poster Buttons
    const btnExportSinglePng = document.getElementById("btn-export-single-png");
    if (btnExportSinglePng) {
      btnExportSinglePng.addEventListener("click", () => this.exportSingleSlidePng());
    }

    const btnExportAllPng = document.getElementById("btn-export-all-png");
    if (btnExportAllPng) {
      btnExportAllPng.addEventListener("click", () => this.exportAllSlidesPng());
    }

    // Subtitles & Manifest Buttons
    const btnExportSrt = document.getElementById("btn-export-srt");
    if (btnExportSrt) {
      btnExportSrt.addEventListener("click", () => this.exportSrtSubtitles());
    }

    const btnExportJson = document.getElementById("btn-export-json");
    if (btnExportJson) {
      btnExportJson.addEventListener("click", () => this.exportManifestJson());
    }

    const btnCopyManifest = document.getElementById("btn-copy-manifest-clipboard");
    if (btnCopyManifest) {
      btnCopyManifest.addEventListener("click", () => this.copyManifestToClipboard());
    }

    const btnExportTxt = document.getElementById("btn-export-transcript-txt");
    if (btnExportTxt) {
      btnExportTxt.addEventListener("click", () => this.exportTranscriptText());
    }
  }

  openModal(tab = "video") {
    const modal = document.getElementById("video-export-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    this.switchTab(tab);
    this.showStep("config");
    this.updateExportSummaryLabels();
    if (window.soundEngine) window.soundEngine.playCelestialChime(0.6);
  }

  closeModal() {
    const modal = document.getElementById("video-export-modal");
    if (!modal) return;
    if (this.isExporting) {
      this.cancelRequested = true;
      this.isExporting = false;
    }
    modal.classList.add("hidden");
  }

  switchTab(tabKey) {
    this.activeTab = tabKey;
    const tabBtns = document.querySelectorAll(".export-tab-btn");
    tabBtns.forEach(btn => {
      const isCurrent = btn.getAttribute("data-tab") === tabKey;
      if (isCurrent) {
        btn.className = "export-tab-btn px-3.5 py-2.5 border-b-2 border-pink-500 text-pink-400 font-bold flex items-center space-x-1.5 transition";
      } else {
        btn.className = "export-tab-btn px-3.5 py-2.5 border-b-2 border-transparent text-slate-400 hover:text-slate-200 font-medium flex items-center space-x-1.5 transition";
      }
    });

    const panels = {
      video: document.getElementById("export-tab-content-video"),
      posters: document.getElementById("export-tab-content-posters"),
      manifest: document.getElementById("export-tab-content-manifest")
    };

    Object.keys(panels).forEach(key => {
      const panel = panels[key];
      if (!panel) return;
      if (key === tabKey) {
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
      }
    });
  }

  showStep(stepName) {
    const stepConfig = document.getElementById("export-step-config");
    const stepRendering = document.getElementById("export-step-rendering");
    const stepComplete = document.getElementById("export-step-complete");

    if (stepConfig) stepConfig.classList.toggle("hidden", stepName !== "config");
    if (stepRendering) stepRendering.classList.toggle("hidden", stepName !== "rendering");
    if (stepComplete) stepComplete.classList.toggle("hidden", stepName !== "complete");
  }

  updateExportSummaryLabels() {
    const currentAspect = window.currentAspectRatio || "aspect-9-16";
    const presetMap = this.resolutionPresets[currentAspect] || this.resolutionPresets["aspect-9-16"];
    const targetConfig = presetMap[this.selectedResolution] || presetMap["1080p"];

    const labelDim = document.getElementById("export-summary-dimensions");
    const labelFps = document.getElementById("export-summary-fps");
    const labelAspect = document.getElementById("export-summary-aspect");
    const labelDuration = document.getElementById("export-summary-duration");
    const labelQuality = document.getElementById("export-summary-quality");

    const scenesList = this.getScenesList();
    const totalDuration = scenesList.reduce((sum, s) => sum + (parseFloat(s.duration) || 3.5), 0);

    const aspectName = currentAspect === "aspect-9-16" ? "9:16 Shorts/Reels" : (currentAspect === "aspect-16-9" ? "16:9 Widescreen" : "1:1 Square Post");

    if (labelDim) labelDim.textContent = `${targetConfig.width} × ${targetConfig.height} px`;
    if (labelFps) labelFps.textContent = `${this.selectedFps} FPS`;
    if (labelAspect) labelAspect.textContent = aspectName;
    if (labelDuration) labelDuration.textContent = `${scenesList.length} Scenes • ${totalDuration.toFixed(1)}s Total`;
    if (labelQuality) labelQuality.textContent = `${this.selectedResolution.toUpperCase()} Production Master (WebM)`;
  }

  // ========================================================
  // CORE VIDEO RENDERING & ENCODING PIPELINE
  // ========================================================
  async startExportProcess() {
    if (this.isExporting) return;
    this.isExporting = true;
    this.cancelRequested = false;
    this.recordedChunks = [];
    this.recordedBlob = null;

    const scenesList = this.getScenesList();
    if (!scenesList.length) {
      alert("No scenes found in the storyboard to export. Please generate or add slides first.");
      this.isExporting = false;
      this.showStep("config");
      return;
    }

    this.showStep("rendering");

    const currentAspect = window.currentAspectRatio || "aspect-9-16";
    const presetMap = this.resolutionPresets[currentAspect] || this.resolutionPresets["aspect-9-16"];
    const targetConfig = presetMap[this.selectedResolution] || presetMap["1080p"];
    const fps = this.selectedFps || 60;
    const includeAudio = document.getElementById("export-include-audio-toggle")?.checked ?? true;

    // Create Offscreen Render Canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetConfig.width;
    canvas.height = targetConfig.height;
    const ctx = canvas.getContext("2d", { alpha: false });

    // Status UI Elements
    const progressBar = document.getElementById("export-progress-bar");
    const progressPercent = document.getElementById("export-progress-percentage");
    const frameCountLabel = document.getElementById("export-render-frame-count");
    const statusText = document.getElementById("export-render-status-text");

    const totalDurationSeconds = scenesList.reduce((acc, s) => acc + (parseFloat(s.duration) || 3.5), 0);
    const totalFrames = Math.ceil(totalDurationSeconds * fps);

    // Setup Video Stream & MediaRecorder
    let stream;
    try {
      stream = canvas.captureStream(fps);
    } catch (e) {
      console.warn("captureStream error:", e);
      stream = canvas.captureStream();
    }

    // Audio mixing via Web Audio AudioDestinationNode if audio inclusion is on
    let audioContext = null;
    let audioDest = null;
    if (includeAudio && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
        audioDest = audioContext.createMediaStreamDestination();
        audioDest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      } catch (e) {
        console.warn("Could not attach audio destination to canvas stream:", e);
      }
    }

    // Determine Supported MIME Type
    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp8",
      "video/webm;codecs=h264",
      "video/webm",
      "video/mp4"
    ];

    let selectedMimeType = "";
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedMimeType = type;
        break;
      }
    }

    const recorderOptions = selectedMimeType ? {
      mimeType: selectedMimeType,
      videoBitsPerSecond: this.selectedResolution === "4k" ? 25000000 : (this.selectedResolution === "1080p" ? 8000000 : 4000000)
    } : {};

    try {
      this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
    } catch (e) {
      console.warn("MediaRecorder init error with options, falling back to default:", e);
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    const recordingPromise = new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || "video/webm";
        this.recordedBlob = new Blob(this.recordedChunks, { type: mimeType });
        if (this.recordedUrl) URL.revokeObjectURL(this.recordedUrl);
        this.recordedUrl = URL.createObjectURL(this.recordedBlob);
        resolve(this.recordedBlob);
      };
    });

    this.mediaRecorder.start(100);

    // Frame-by-frame Rendering Loop
    let currentFrame = 0;
    const bgVideoEl = document.getElementById("stage-bg-video");

    for (let sceneIdx = 0; sceneIdx < scenesList.length; sceneIdx++) {
      if (this.cancelRequested) break;

      const scene = scenesList[sceneIdx];
      const sceneDuration = parseFloat(scene.duration) || 4.0;
      const sceneFrames = Math.ceil(sceneDuration * fps);

      // Trigger SFX cue synth if audio enabled
      if (audioContext && audioDest && scene.sfx) {
        this.synthesizeSfxAudio(audioContext, audioDest, scene.sfx);
      }

      for (let f = 0; f < sceneFrames; f++) {
        if (this.cancelRequested) break;

        currentFrame++;
        const sceneProgress = f / sceneFrames;
        const totalProgress = currentFrame / totalFrames;

        // Draw Scene Frame on Canvas
        this.drawSceneToCanvas(ctx, canvas.width, canvas.height, scene, sceneIdx + 1, scenesList.length, sceneProgress, f, bgVideoEl);

        // Update UI every 5 frames for smooth performance
        if (f % 5 === 0 || f === sceneFrames - 1) {
          const pct = Math.min(99, Math.round(totalProgress * 100));
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (progressPercent) progressPercent.textContent = `${pct}%`;
          if (frameCountLabel) frameCountLabel.textContent = `Scene ${sceneIdx + 1}/${scenesList.length} • Frame ${currentFrame}/${totalFrames}`;
          if (statusText) statusText.textContent = `Rendering slide #${sceneIdx + 1} (${scene.mood || 'kinetic'}) at ${targetConfig.width}×${targetConfig.height}...`;
        }

        // Give the browser event loop a moment to breathe and encode
        await new Promise(r => setTimeout(r, 1000 / (fps * 2)));
      }
    }

    if (progressBar) progressBar.style.width = `100%`;
    if (progressPercent) progressPercent.textContent = `100%`;
    if (statusText) statusText.textContent = "Finalizing video container encoding...";

    // Stop MediaRecorder and await output
    this.mediaRecorder.stop();
    const finalBlob = await recordingPromise;

    if (audioContext && audioContext.state !== "closed") {
      audioContext.close().catch(() => {});
    }

    this.isExporting = false;
    this.populateCompletionDetails(finalBlob, targetConfig, fps);
    this.showStep("complete");

    // Automatically trigger browser file download
    this.triggerFileDownload(finalBlob);

    if (window.soundEngine) window.soundEngine.playCelestialChime(0.8);
  }

  // Draw Full Visual Frame (Video, Glow Typography, Infographic HUD)
  drawSceneToCanvas(ctx, width, height, scene, sceneNum, totalScenes, sceneProgress, frameNum, bgVideo) {
    const scaleFactor = width / 1080;

    // 1. Draw Theme Background Gradient
    const theme = window.currentTheme || "cyberpunk";
    if (theme === "monochrome") {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#18181b");
      grad.addColorStop(1, "#09090b");
      ctx.fillStyle = grad;
    } else if (theme === "celestial") {
      const grad = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, height);
      grad.addColorStop(0, "#311042");
      grad.addColorStop(1, "#050510");
      ctx.fillStyle = grad;
    } else {
      // Default Cyberpunk Dark
      const grad = ctx.createRadialGradient(width / 2, height / 3, 80, width / 2, height / 2, height);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Procedural Animated Scene Layer if Available
    if (window.sceneAnimationEngine) {
      ctx.save();
      const animOpacity = window.sceneAnimationEngine.opacity || 0.85;
      ctx.globalAlpha = animOpacity;
      const animTime = (frameNum / (this.selectedFps || 60)) + sceneNum * 10;
      window.sceneAnimationEngine.renderFrame(ctx, width, height, animTime);
      ctx.restore();
    }

    // 2b. Draw Video Background Loop if Active
    const videoEnabled = window.videoBgEnabled !== false;
    if (videoEnabled && bgVideo && bgVideo.readyState >= 2) {
      ctx.save();
      const videoOpacity = window.videoOpacity !== undefined ? window.videoOpacity : 0.4;
      ctx.globalAlpha = videoOpacity;
      // Object fit cover calculation
      const vWidth = bgVideo.videoWidth || 1920;
      const vHeight = bgVideo.videoHeight || 1080;
      const vRatio = vWidth / vHeight;
      const cRatio = width / height;

      let dw, dh, dx, dy;
      if (cRatio > vRatio) {
        dw = width;
        dh = width / vRatio;
        dx = 0;
        dy = (height - dh) / 2;
      } else {
        dh = height;
        dw = height * vRatio;
        dx = (width - dw) / 2;
        dy = 0;
      }

      ctx.drawImage(bgVideo, dx, dy, dw, dh);
      ctx.restore();
    }

    // 3. Ambient Particle/Starfield Dots
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let i = 0; i < 20; i++) {
      const px = ((i * 173 + frameNum * 0.4) % width);
      const py = ((i * 97 + frameNum * 0.2) % height);
      const pr = (i % 3 + 1) * scaleFactor;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Draw Header Scene Identifier Watermark
    ctx.save();
    ctx.font = `700 ${14 * scaleFactor}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
    ctx.textAlign = "left";
    ctx.fillText(`SCENE // 0${sceneNum} OF 0${totalScenes}`, 40 * scaleFactor, 60 * scaleFactor);

    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(244, 63, 94, 0.9)";
    ctx.fillText(`MOOD • ${(scene.mood || 'KINETIC').toUpperCase()}`, width - 40 * scaleFactor, 60 * scaleFactor);
    ctx.restore();

    // 5. Draw Centered Kinetic Typography with Highlights
    const words = (scene.narration || "").split(" ");
    const wordsPerLine = width > height ? 8 : 4;
    const lines = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine));
    }

    const titleSize = Math.max(22, Math.round((width > height ? 42 : 52) * scaleFactor));
    const lineHeight = titleSize * 1.38;
    const totalBlockHeight = lines.length * lineHeight;
    const startY = (height / 2) - (totalBlockHeight / 2) + 10 * scaleFactor;

    const activeWordIndex = Math.floor(sceneProgress * words.length);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let wordCounter = 0;
    lines.forEach((lineWords, lineIdx) => {
      const lineY = startY + lineIdx * lineHeight;
      const lineString = lineWords.join(" ");

      ctx.font = `800 ${titleSize}px "Space Grotesk", sans-serif`;
      const fullLineWidth = ctx.measureText(lineString).width;
      let curX = (width / 2) - (fullLineWidth / 2);

      lineWords.forEach((word) => {
        const isCurrentActive = wordCounter === activeWordIndex;
        const isSpecial = word.length > 5 || word.includes("%") || (scene.glowWord && scene.glowWord.includes(word));
        const wordWidth = ctx.measureText(word + " ").width;
        const wordCenterX = curX + wordWidth / 2;

        if (isCurrentActive) {
          ctx.save();
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 35 * scaleFactor;
          ctx.fillStyle = "#ffffff";
          ctx.font = `900 ${titleSize * 1.08}px "Space Grotesk", sans-serif`;
          ctx.fillText(word, wordCenterX, lineY);
          ctx.restore();
        } else if (isSpecial) {
          ctx.save();
          ctx.shadowColor = "#f43f5e";
          ctx.shadowBlur = 20 * scaleFactor;
          ctx.fillStyle = "#f43f5e";
          ctx.font = `800 ${titleSize}px "Space Grotesk", sans-serif`;
          ctx.fillText(word, wordCenterX, lineY);
          ctx.restore();
        } else {
          ctx.fillStyle = "#f8fafc";
          ctx.fillText(word, wordCenterX, lineY);
        }

        curX += wordWidth;
        wordCounter++;
      });
    });
    ctx.restore();

    // 6. Draw Bottom Pictorial Infographic HUD
    if (scene.pictorial && scene.pictorial.type !== "none") {
      this.drawPictorialHUD(ctx, width, height, scene.pictorial, scaleFactor);
    }
  }

  drawPictorialHUD(ctx, width, height, pic, scale) {
    const hudW = Math.min(width * 0.88, 520 * scale);
    const hudH = 80 * scale;
    const hudX = (width / 2) - (hudW / 2);
    const hudY = height - 150 * scale;

    ctx.save();
    // Rounded Card Background
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
    ctx.lineWidth = 2 * scale;
    this.roundRect(ctx, hudX, hudY, hudW, hudH, 16 * scale);
    ctx.fill();
    ctx.stroke();

    // Badge Icon
    ctx.fillStyle = "#818cf8";
    ctx.font = `700 ${20 * scale}px sans-serif`;
    ctx.fillText("▲", hudX + 25 * scale, hudY + 48 * scale);

    // Label & Value
    ctx.textAlign = "left";
    ctx.font = `800 ${24 * scale}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(pic.value || "10,000x", hudX + 55 * scale, hudY + 40 * scale);

    ctx.font = `600 ${12 * scale}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = "#94a3b8";
    ctx.fillText((pic.label || "KEY METRIC").toUpperCase(), hudX + 55 * scale, hudY + 62 * scale);

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  synthesizeSfxAudio(ctx, dest, sfxName) {
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (sfxName === "sub-bass") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      } else if (sfxName === "chime") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      } else {
        // Whoosh / Tick
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      }

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn("Synthesize audio error:", e);
    }
  }

  populateCompletionDetails(blob, targetConfig, fps) {
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
    const sizeDisplay = blob.size > 0 ? `${sizeMb} MB` : `Generated File`;

    const detailRes = document.getElementById("export-done-resolution");
    const detailFps = document.getElementById("export-done-fps");
    const detailSize = document.getElementById("export-done-size");
    const detailFormat = document.getElementById("export-done-format");

    if (detailRes) detailRes.textContent = `${targetConfig.width}×${targetConfig.height} (${this.selectedResolution.toUpperCase()})`;
    if (detailFps) detailFps.textContent = `${fps} FPS Ultra Smooth`;
    if (detailSize) detailSize.textContent = sizeDisplay;
    if (detailFormat) detailFormat.textContent = "WebM HD Video";

    const previewVideo = document.getElementById("export-result-preview-video");
    if (previewVideo && this.recordedUrl) {
      previewVideo.src = this.recordedUrl;
      previewVideo.load();
      previewVideo.play().catch(() => {});
    }
  }

  triggerFileDownload(blob) {
    const topicHint = document.getElementById("research-topic-input")?.value || "Kinetic_Slides";
    const cleanTopic = topicHint.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const filename = `VideoSlides_${this.selectedResolution}_${this.selectedFps}fps_${cleanTopic}.webm`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  }

  downloadBlobAsFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  }

  // ========================================================
  // HIGH-RES PNG SLIDE POSTERS EXPORT
  // ========================================================
  exportSingleSlidePng(slideIndex = null) {
    const scenesList = this.getScenesList();
    if (!scenesList.length) {
      alert("No scenes found in the storyboard to export.");
      return;
    }

    const activeIdx = slideIndex !== null ? slideIndex : (window.currentSceneIndex || 0);
    const scene = scenesList[activeIdx] || scenesList[0];
    const currentAspect = window.currentAspectRatio || "aspect-9-16";
    const presetMap = this.resolutionPresets[currentAspect] || this.resolutionPresets["aspect-9-16"];
    const targetConfig = presetMap[this.selectedResolution] || presetMap["1080p"];

    const canvas = document.createElement("canvas");
    canvas.width = targetConfig.width;
    canvas.height = targetConfig.height;
    const ctx = canvas.getContext("2d");

    const bgVideoEl = document.getElementById("stage-bg-video");
    this.drawSceneToCanvas(ctx, canvas.width, canvas.height, scene, activeIdx + 1, scenesList.length, 0.5, 30, bgVideoEl);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const topicHint = document.getElementById("research-topic-input")?.value || "Slide";
      const cleanTopic = topicHint.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
      const filename = `Slide_${activeIdx + 1}_${this.selectedResolution}_${cleanTopic}.png`;
      this.downloadBlobAsFile(blob, filename);
      if (window.soundEngine) window.soundEngine.playCelestialChime(0.6);
    }, "image/png");
  }

  async exportAllSlidesPng() {
    const scenesList = this.getScenesList();
    if (!scenesList.length) {
      alert("No scenes found in the storyboard to export.");
      return;
    }

    const currentAspect = window.currentAspectRatio || "aspect-9-16";
    const presetMap = this.resolutionPresets[currentAspect] || this.resolutionPresets["aspect-9-16"];
    const targetConfig = presetMap[this.selectedResolution] || presetMap["1080p"];
    const bgVideoEl = document.getElementById("stage-bg-video");
    const topicHint = document.getElementById("research-topic-input")?.value || "Sequence";
    const cleanTopic = topicHint.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);

    for (let idx = 0; idx < scenesList.length; idx++) {
      const scene = scenesList[idx];
      const canvas = document.createElement("canvas");
      canvas.width = targetConfig.width;
      canvas.height = targetConfig.height;
      const ctx = canvas.getContext("2d");

      this.drawSceneToCanvas(ctx, canvas.width, canvas.height, scene, idx + 1, scenesList.length, 0.5, 30, bgVideoEl);

      await new Promise(resolve => {
        canvas.toBlob((blob) => {
          if (blob) {
            const filename = `Slide_${idx + 1}_of_${scenesList.length}_${cleanTopic}.png`;
            this.downloadBlobAsFile(blob, filename);
          }
          setTimeout(resolve, 300);
        }, "image/png");
      });
    }

    if (window.soundEngine) window.soundEngine.playCelestialChime(0.8);
  }

  // ========================================================
  // SUBTITLES (.SRT), JSON MANIFEST & TRANSCRIPT
  // ========================================================
  exportSrtSubtitles() {
    const scenesList = this.getScenesList();
    if (!scenesList.length) {
      alert("No scenes available for subtitles.");
      return;
    }

    let srtContent = "";
    let currentSeconds = 0;

    scenesList.forEach((scene, index) => {
      const duration = parseFloat(scene.duration) || 4.0;
      const startSeconds = currentSeconds;
      const endSeconds = currentSeconds + duration;

      const startTimeStr = this.formatSrtTime(startSeconds);
      const endTimeStr = this.formatSrtTime(endSeconds);

      srtContent += `${index + 1}\n`;
      srtContent += `${startTimeStr} --> ${endTimeStr}\n`;
      srtContent += `${scene.narration}\n\n`;

      currentSeconds = endSeconds;
    });

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const topicHint = document.getElementById("research-topic-input")?.value || "Captions";
    const cleanTopic = topicHint.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
    this.downloadBlobAsFile(blob, `Subtitles_${cleanTopic}.srt`);
    if (window.soundEngine) window.soundEngine.playCelestialChime(0.5);
  }

  formatSrtTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const pad = (n, len = 2) => String(n).padStart(len, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  }

  exportManifestJson() {
    const scenesList = this.getScenesList();
    const manifest = {
      title: document.getElementById("research-topic-input")?.value || "Video Slides Manifest",
      exportDate: new Date().toISOString(),
      aspectRatio: window.currentAspectRatio || "aspect-9-16",
      theme: window.currentTheme || "cyberpunk",
      fontPairing: window.activeFontPairing || "font-grotesk",
      totalScenes: scenesList.length,
      totalDurationSeconds: scenesList.reduce((sum, s) => sum + (parseFloat(s.duration) || 3.5), 0),
      scenes: scenesList
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
    const topicHint = document.getElementById("research-topic-input")?.value || "Pipeline";
    const cleanTopic = topicHint.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
    this.downloadBlobAsFile(blob, `PipelineManifest_${cleanTopic}.json`);
    if (window.soundEngine) window.soundEngine.playCelestialChime(0.5);
  }

  exportTranscriptText() {
    const scenesList = this.getScenesList();
    if (!scenesList.length) {
      alert("No scenes found to export transcript.");
      return;
    }

    const lines = scenesList.map((s, idx) => `Scene ${idx + 1} (${s.mood || 'kinetic'}, ${(s.duration || 4.0).toFixed(1)}s):\n${s.narration}\n`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const topicHint = document.getElementById("research-topic-input")?.value || "Transcript";
    const cleanTopic = topicHint.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 25);
    this.downloadBlobAsFile(blob, `Transcript_${cleanTopic}.txt`);
    if (window.soundEngine) window.soundEngine.playCelestialChime(0.5);
  }

  copyManifestToClipboard() {
    const scenesList = this.getScenesList();
    const manifest = {
      title: document.getElementById("research-topic-input")?.value || "Video Slides Manifest",
      aspectRatio: window.currentAspectRatio || "aspect-9-16",
      theme: window.currentTheme || "cyberpunk",
      scenes: scenesList
    };

    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2)).then(() => {
      const label = document.getElementById("copy-manifest-label");
      if (label) {
        label.textContent = "✅ Copied!";
        setTimeout(() => { label.textContent = "📋 Copy"; }, 2000);
      }
    }).catch(err => {
      console.warn("Clipboard copy failed:", err);
    });
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.videoExportEngine = new VideoExportEngine();
});
