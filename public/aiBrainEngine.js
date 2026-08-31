// ========================================================
// AI BRAIN STUDIO ENGINE - PROMPT TO SCENE SLIDES
// ========================================================

class AIBrainEngine {
  constructor() {
    this.isGenerating = false;
    this.latestBrainResult = null;
    this.initEventListeners();
  }

  initEventListeners() {
    // Primary AI Brain Generate Button
    const btnGenerate = document.getElementById("btn-brain-generate-scenes");
    if (btnGenerate) {
      btnGenerate.addEventListener("click", () => {
        this.triggerBrainGeneration();
      });
    }

    // Direct Generate from top input
    const btnDirectPrompt = document.getElementById("btn-direct-generate-prompt");
    if (btnDirectPrompt) {
      btnDirectPrompt.addEventListener("click", () => {
        const topicInput = document.getElementById("research-topic-input")?.value || "";
        const promptInput = document.getElementById("research-prompt-input")?.value || "";
        const combinedPrompt = promptInput ? `${topicInput}. Style/Directives: ${promptInput}` : topicInput;
        this.generateFromPrompt(combinedPrompt);
      });
    }

    // Prompt input Enter key trigger
    const brainInput = document.getElementById("brain-prompt-input");
    if (brainInput) {
      brainInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.triggerBrainGeneration();
        }
      });
    }

    // AI Brain Preset Prompt buttons
    document.querySelectorAll(".brain-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prompt = btn.getAttribute("data-prompt");
        const style = btn.getAttribute("data-style") || "viral-hook";
        const count = btn.getAttribute("data-count") || "5";

        if (brainInput && prompt) {
          brainInput.value = prompt;
        }

        const styleSelect = document.getElementById("brain-style-select");
        if (styleSelect && style) styleSelect.value = style;

        const countSelect = document.getElementById("brain-slide-count-select");
        if (countSelect && count) countSelect.value = count;

        this.generateFromPrompt(prompt, { style, slideCount: parseInt(count, 10) });
      });
    });
  }

  triggerBrainGeneration() {
    const promptInput = document.getElementById("brain-prompt-input")?.value;
    const styleSelect = document.getElementById("brain-style-select")?.value || "viral-hook";
    const countSelect = document.getElementById("brain-slide-count-select")?.value || "5";

    if (!promptInput || !promptInput.trim()) {
      // Focus input with subtle pulse
      const input = document.getElementById("brain-prompt-input");
      if (input) {
        input.focus();
        input.classList.add("ring-2", "ring-rose-500");
        setTimeout(() => input.classList.remove("ring-2", "ring-rose-500"), 1200);
      }
      return;
    }

    this.generateFromPrompt(promptInput.trim(), {
      style: styleSelect,
      slideCount: parseInt(countSelect, 10) || 5
    });
  }

  async generateFromPrompt(promptText, options = {}) {
    if (this.isGenerating) return;
    this.isGenerating = true;

    const style = options.style || document.getElementById("brain-style-select")?.value || "viral-hook";
    const slideCount = options.slideCount || parseInt(document.getElementById("brain-slide-count-select")?.value, 10) || 5;
    const aspectRatio = window.currentAspectRatio || "aspect-9-16";

    // Play feedback sound
    if (window.soundEngine) {
      window.soundEngine.playWhoosh(0.9);
    }

    // Show AI Brain Thinking Overlay & Progress Steps
    this.showThinkingState(true, promptText);

    try {
      // Step 1: Thinking progress animation simulation while backend processes
      this.updateProgressStep(1, "🧠 Deconstructing prompt semantics & core intent...");

      const fetchPromise = fetch("/api/ai-brain/generate-scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          style: style,
          slideCount: slideCount,
          aspectRatio: aspectRatio
        })
      });

      setTimeout(() => {
        if (this.isGenerating) this.updateProgressStep(2, "📐 Synthesizing narrative arc & punchy kinetic words...");
      }, 700);

      setTimeout(() => {
        if (this.isGenerating) this.updateProgressStep(3, "📊 Generating tailored HUD telemetry & metric infographics...");
      }, 1500);

      setTimeout(() => {
        if (this.isGenerating) this.updateProgressStep(4, "📹 Sourcing Pexels HD video loops & synchronized SFX triggers...");
      }, 2300);

      const response = await fetchPromise;
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI Brain failed to synthesize scene slides");
      }

      this.updateProgressStep(5, "⚡ Assembling complete kinetic scene slides...");

      const brainData = await response.json();
      this.latestBrainResult = brainData;

      // Apply to active project in app.js
      this.applyBrainResultToProject(brainData);

      // Render the Brain Telemetry & Breakdown Inspector
      this.renderBrainInspector(brainData);

      if (window.soundEngine) {
        window.soundEngine.playCelestialChime();
      }

    } catch (err) {
      console.error("[AIBrainEngine Error]:", err);
      alert("AI Brain Error: " + err.message);
    } finally {
      this.isGenerating = false;
      this.showThinkingState(false);
    }
  }

  showThinkingState(active, promptText = "") {
    const overlay = document.getElementById("brain-thinking-modal");
    const spinner = document.getElementById("brain-generate-spinner");
    const btnText = document.getElementById("brain-btn-text");
    const promptDisplay = document.getElementById("brain-thinking-prompt-text");

    if (active) {
      if (overlay) overlay.classList.remove("hidden");
      if (spinner) spinner.classList.remove("hidden");
      if (btnText) btnText.textContent = "AI Brain Synthesizing...";
      if (promptDisplay) promptDisplay.textContent = `"${promptText.slice(0, 100)}${promptText.length > 100 ? '...' : ''}"`;
    } else {
      if (overlay) overlay.classList.add("hidden");
      if (spinner) spinner.classList.add("hidden");
      if (btnText) btnText.textContent = "🧠 Create Scene Slides";
    }
  }

  updateProgressStep(stepNumber, stepMessage) {
    const stepLabel = document.getElementById("brain-thinking-step-label");
    const progressBar = document.getElementById("brain-thinking-progress-bar");

    if (stepLabel) stepLabel.textContent = stepMessage;
    if (progressBar) {
      const percentage = Math.min(100, stepNumber * 20);
      progressBar.style.width = `${percentage}%`;
    }
  }

  applyBrainResultToProject(data) {
    if (!data || !Array.isArray(data.scenes) || data.scenes.length === 0) return;

    // 1. Update global theme if provided
    if (data.theme && typeof window.setArtTheme === "function") {
      window.setArtTheme(data.theme);
    }

    // 2. Set project title & script textarea
    const scriptInput = document.getElementById("script-input");
    if (scriptInput) {
      scriptInput.value = data.scenes.map(s => s.narration).join("\n");
    }

    // 3. Pass structured scenes to core app engine
    if (typeof window.setScenes === "function") {
      window.setScenes(data.scenes, data.theme, data.topicTitle);
    }

    // 4. Update procedural character & scene animation
    if (window.sceneAnimationEngine) {
      window.sceneAnimationEngine.updateFromScene(data.scenes[0], data.topicTitle);
    }
  }

  renderBrainInspector(data) {
    const container = document.getElementById("brain-reasoning-inspector");
    if (!container) return;

    container.classList.remove("hidden");

    const titleEl = document.getElementById("brain-inspector-title");
    const intentEl = document.getElementById("brain-inspector-intent");
    const arcEl = document.getElementById("brain-inspector-arc");
    const scenesCountEl = document.getElementById("brain-inspector-scenes-count");
    const scenesListEl = document.getElementById("brain-inspector-scenes-list");

    if (titleEl) titleEl.textContent = data.topicTitle || "Synthesized Kinetic Storyboard";
    if (intentEl) intentEl.textContent = data.reasoning?.intent || "Prompt analyzed and structured for kinetic retention.";
    if (arcEl) arcEl.textContent = data.reasoning?.narrativeArc || "Hook & Setup → Core Insight → Proof → Inspiring Closer";
    if (scenesCountEl) scenesCountEl.textContent = `${data.scenes.length} Scenes Architected`;

    if (scenesListEl) {
      scenesListEl.innerHTML = "";
      data.scenes.forEach((scene, i) => {
        const item = document.createElement("div");
        item.className = "p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-2 text-xs";
        
        const moodBadgeColor = scene.mood === "hook" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                               scene.mood === "impact" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                               scene.mood === "cta" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                               "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";

        item.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">#${i + 1}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${moodBadgeColor} border">${scene.mood}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">SFX: ${scene.sfx}</span>
            </div>
            <span class="text-[10px] font-mono text-cyan-400">${scene.duration?.toFixed(1)}s</span>
          </div>

          <p class="text-slate-200 font-medium leading-relaxed">"${escapeHtml(scene.narration)}"</p>

          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 flex-wrap gap-1">
            <span class="text-slate-400">Glow Anchor: <strong class="text-pink-400">${escapeHtml(scene.glowWord || '')}</strong></span>
            <span class="text-slate-400">HUD: <strong class="text-cyan-300">${escapeHtml(scene.pictorial?.label || 'Infographic')} (${escapeHtml(scene.pictorial?.value || '')})</strong></span>
            <span class="text-slate-400">Video: <strong class="text-slate-300 font-mono">${escapeHtml(scene.videoQuery || 'HD Loop')}</strong></span>
          </div>
        `;
        scenesListEl.appendChild(item);
      });
    }
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

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.aiBrainEngine = new AIBrainEngine();
});
