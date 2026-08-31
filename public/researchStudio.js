// ========================================================
// AI TOPIC RESEARCH & PROMPT SYNTHESIZER COMPONENT
// ========================================================

class ResearchStudio {
  constructor() {
    this.latestResearch = null;
    this.isResearching = false;
  }

  async runResearch(topic, promptDirective = "", autoGenerateSlides = false) {
    const rawInput = topic || promptDirective;
    if (!rawInput || !rawInput.trim()) {
      alert("Please enter any prompt, topic, or question.");
      return null;
    }

    this.isResearching = true;
    this.updateUIState(true);

    try {
      const res = await fetch("/api/research-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: rawInput.trim(), prompt: promptDirective ? promptDirective.trim() : "" })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to synthesize prompt");
      }

      const data = await res.json();
      this.latestResearch = data;
      this.renderResearchResults(data);

      if (autoGenerateSlides) {
        this.transferToSlidePipeline(true);
      }

      if (window.soundEngine) {
        window.soundEngine.playCelestialChime();
      }

      return data;
    } catch (err) {
      console.error("[ResearchStudio Error]:", err);
      alert("Prompt generation error: " + err.message);
      return null;
    } finally {
      this.isResearching = false;
      this.updateUIState(false);
    }
  }

  updateUIState(loading) {
    const btn = document.getElementById("btn-run-research");
    const btnAuto = document.getElementById("btn-direct-generate-prompt");
    const spinner = document.getElementById("research-spinner");
    const btnText = document.getElementById("research-btn-text");

    if (btn) {
      btn.disabled = loading;
      if (loading) {
        btn.classList.add("opacity-60", "cursor-not-allowed");
        if (spinner) spinner.classList.remove("hidden");
        if (btnText) btnText.textContent = "Synthesizing AI Video Slides...";
      } else {
        btn.classList.remove("opacity-60", "cursor-not-allowed");
        if (spinner) spinner.classList.add("hidden");
        if (btnText) btnText.textContent = "Research Topic & Synthesize Script";
      }
    }

    if (btnAuto) {
      btnAuto.disabled = loading;
      if (loading) {
        btnAuto.classList.add("opacity-60", "cursor-not-allowed");
      } else {
        btnAuto.classList.remove("opacity-60", "cursor-not-allowed");
      }
    }
  }

  renderResearchResults(data) {
    const resultsContainer = document.getElementById("research-results-container");
    if (!resultsContainer) return;

    resultsContainer.classList.remove("hidden");

    // Title & Summary
    const titleEl = document.getElementById("research-result-title");
    const summaryEl = document.getElementById("research-result-summary");
    if (titleEl) titleEl.textContent = data.topic;
    if (summaryEl) summaryEl.textContent = data.executiveSummary;

    // Key findings
    const findingsList = document.getElementById("research-findings-list");
    if (findingsList) {
      findingsList.innerHTML = "";
      (data.keyFindings || []).forEach((f) => {
        const div = document.createElement("div");
        div.className = "p-3 rounded-lg bg-slate-900/80 border border-slate-700/60 flex flex-col gap-1";
        div.innerHTML = `
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-200">${escapeHtml(f.point)}</span>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">${escapeHtml(f.metricOrStat || "Metric")}</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(f.takeaway)}</p>
        `;
        findingsList.appendChild(div);
      });
    }

    // Suggested Pictorials
    const pictorialsList = document.getElementById("research-pictorials-list");
    if (pictorialsList) {
      pictorialsList.innerHTML = "";
      (data.suggestedPictorials || []).forEach((p) => {
        const pill = document.createElement("div");
        pill.className = "px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2 text-xs";
        pill.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span class="font-medium text-slate-200">${escapeHtml(p.label)}: <strong class="text-indigo-300">${escapeHtml(p.value)}</strong></span>
        `;
        pictorialsList.appendChild(pill);
      });
    }

    // Editable Script Box
    const scriptBox = document.getElementById("research-generated-script");
    if (scriptBox) {
      scriptBox.value = data.narrationScript || "";
    }

    // Also populate the main script input
    const mainScriptInput = document.getElementById("script-input");
    if (mainScriptInput && data.narrationScript) {
      mainScriptInput.value = data.narrationScript;
    }
  }

  transferToSlidePipeline(autoScroll = true) {
    if (!this.latestResearch) return;

    const scriptBox = document.getElementById("research-generated-script");
    const scriptToUse = scriptBox && scriptBox.value ? scriptBox.value : this.latestResearch.narrationScript;

    // Put script in main script textarea
    const mainScriptInput = document.getElementById("script-input");
    if (mainScriptInput) {
      mainScriptInput.value = scriptToUse;
    }

    // Switch theme if recommended
    if (this.latestResearch.suggestedTheme && window.setArtTheme) {
      window.setArtTheme(this.latestResearch.suggestedTheme);
    }

    // Trigger video slides generation in app.js
    if (window.generateScenesFromScript) {
      window.generateScenesFromScript(scriptToUse, this.latestResearch.topic);
    } else {
      const generateBtn = document.getElementById("btn-generate-slides");
      if (generateBtn) generateBtn.click();
    }

    if (window.setViewMode) {
      window.setViewMode("stage");
    }

    if (autoScroll) {
      const stageSection = document.getElementById("stage-section-container");
      if (stageSection) {
        stageSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (window.soundEngine) {
      window.soundEngine.playWhoosh(1.2);
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

window.researchStudio = new ResearchStudio();
