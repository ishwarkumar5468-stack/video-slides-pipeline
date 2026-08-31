import fetch from "node-fetch";

function heuristicBreakdown(script) {
  const lines = script
    .split(/\n+|\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const moods = ["transition", "reveal", "emphasis", "ambient"];
  const visualTypes = ["2d", "stock", "ai"];
  const pictorialTypes = ["metric_badge", "diagram_flow", "tech_hud", "circular_gauge", "concept_card", "comparison_pill"];

  return lines.map((line, idx) => {
    let mood = moods[idx % moods.length];
    const lower = line.toLowerCase();
    
    // Determine mood
    if (lower.includes("finally") || lower.includes("next") || lower.includes("then") || lower.includes("step")) mood = "transition";
    else if (lower.includes("secret") || lower.includes("introducing") || lower.includes("discover") || lower.includes("breakthrough") || lower.includes("here is")) mood = "reveal";
    else if (lower.includes("key") || lower.includes("important") || lower.includes("crucial") || lower.includes("speed") || lower.includes("power") || lower.includes("million") || lower.includes("%")) mood = "emphasis";
    else if (lower.includes("imagine") || lower.includes("feel") || lower.includes("quiet") || lower.includes("story") || lower.includes("calm")) mood = "ambient";

    // Determine pictorial form
    let pictorialType = "none";
    let pictorialData = {};

    if (lower.includes("%") || lower.includes("speed") || lower.includes("latency") || lower.includes("rate") || lower.includes("fast") || lower.includes("10x") || lower.includes("ultra")) {
      pictorialType = "metric_badge";
      pictorialData = {
        value: lower.includes("%") ? "99.9%" : "10x",
        label: "Performance Uplift",
        subtext: "Real-time processing",
        icon: "zap"
      };
    } else if (lower.includes("step") || lower.includes("process") || lower.includes("architecture") || lower.includes("flow") || lower.includes("network")) {
      pictorialType = "diagram_flow";
      pictorialData = {
        step1: "Sensory Input",
        step2: "Neural Core",
        step3: "Instant Output",
        icon: "flow"
      };
    } else if (lower.includes("sensor") || lower.includes("data") || lower.includes("system") || lower.includes("ai") || lower.includes("silicon") || lower.includes("computing")) {
      pictorialType = "tech_hud";
      pictorialData = {
        statA: "LATENCY: 0.8ms",
        statB: "NODES: 10,000+",
        statC: "STATUS: OPTIMAL",
        icon: "hud"
      };
    } else if (lower.includes("focus") || lower.includes("progress") || lower.includes("growth") || lower.includes("strength") || lower.includes("habit")) {
      pictorialType = "circular_gauge";
      pictorialData = {
        percent: 88,
        label: "Cognitive Score",
        subtext: "+14% Today",
        icon: "gauge"
      };
    } else if (lower.includes("compare") || lower.includes("versus") || lower.includes("traditional") || lower.includes("limits") || lower.includes("clunky")) {
      pictorialType = "comparison_pill";
      pictorialData = {
        leftLabel: "Legacy Rendering",
        leftValue: "Hours",
        rightLabel: "Kinetic Studio",
        rightValue: "Instant (Realtime)"
      };
    } else if (idx % 2 === 1) {
      pictorialType = "concept_card";
      pictorialData = {
        title: "Key Innovation",
        highlight: line.slice(0, 24) + "...",
        icon: "sparkles"
      };
    }

    const vType = visualTypes[idx % visualTypes.length];
    const words = line.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).slice(0, 8).join(" ");
    const visualPrompt = words.length > 0 ? words : `Scene ${idx + 1} visual concept`;

    // Extract highlight keywords
    const candidateKeywords = line
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter((w) => w.length >= 6 || ["ai", "fast", "speed", "core", "zen", "void"].includes(w.toLowerCase()))
      .slice(0, 3);

    return {
      scene_number: idx + 1,
      text: line,
      visual_type: vType,
      mood: mood,
      visual_prompt: visualPrompt,
      pictorial_type: pictorialType,
      pictorial_data: pictorialData,
      highlight_keywords: candidateKeywords,
      typography: {
        font_family: "Space Grotesk",
        font_size: "text-2xl",
        text_align: "center",
        vertical_position: "center",
        text_color: "#ffffff",
        highlight_color: "from-cyan-400 via-indigo-300 to-pink-400",
        tracking: "tracking-tight",
        text_transform: "none"
      }
    };
  });
}

/**
 * Sends the script to LLM or falls back to heuristic breakdown.
 */
export async function breakdownScript(script, apiKey) {
  if (!apiKey) {
    return heuristicBreakdown(script);
  }

  const systemPrompt = `You break a video script into scenes for an automated slide generator with advanced kinetic typography and pictorial infographics.
Return ONLY a JSON array, no prose, no markdown fences. Each item:
{
  "scene_number": number,
  "text": "the narration text for this scene",
  "visual_type": "2d" | "ai" | "stock",
  "mood": "transition" | "reveal" | "emphasis" | "ambient",
  "visual_prompt": "short visual description for image sourcing",
  "pictorial_type": "metric_badge" | "diagram_flow" | "tech_hud" | "circular_gauge" | "concept_card" | "comparison_pill" | "none",
  "pictorial_data": { "value": "...", "label": "...", "icon": "..." },
  "highlight_keywords": ["word1", "word2"]
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
        system: systemPrompt,
        messages: [{ role: "user", content: script }],
      }),
    });

    const data = await response.json();
    const textBlock = data.content?.find((c) => c.type === "text");
    if (!textBlock) {
      return heuristicBreakdown(script);
    }

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed.map((sc, i) => ({
      ...sc,
      scene_number: i + 1,
      typography: sc.typography || {
        font_family: "Space Grotesk",
        font_size: "text-2xl",
        text_align: "center",
        vertical_position: "center",
        text_color: "#ffffff",
        highlight_color: "from-cyan-400 via-indigo-300 to-pink-400",
        tracking: "tracking-tight",
        text_transform: "none"
      }
    }));
  } catch (err) {
    console.warn("[Scene Breakdown] Fallback to heuristic:", err.message);
    return heuristicBreakdown(script);
  }
}

