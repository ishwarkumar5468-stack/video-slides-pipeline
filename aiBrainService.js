import { GoogleGenAI } from "@google/genai";
import { getStockVideoForSlide } from "./stockVideoService.js";

let aiClient = null;

function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Intelligent rule-based Heuristic AI Brain Fallback for when API keys are absent or network is degraded.
 */
function heuristicBrain(prompt, options = {}) {
  const cleanPrompt = (prompt || "Quantum computing and future technologies").trim();
  const slideCount = parseInt(options.slideCount, 10) || 5;
  const style = options.style || "viral-hook";
  const lower = cleanPrompt.toLowerCase();

  let topicTitle = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
  let theme = "doodle_whiteboard";
  let lofiTrack = "cozy-coffee";
  let voicePersona = "natural-male";
  let intent = `Transform prompt "${cleanPrompt}" into a high-retention, kinetic video storyboard.`;
  let scenesData = [];

  if (lower.includes("doodle") || lower.includes("sketch") || lower.includes("whiteboard") || lower.includes("habit") || lower.includes("draw") || lower.includes("simple") || lower.includes("learn") || lower.includes("idea")) {
    topicTitle = "The Power of Atomic Habits: Doodle Breakdown";
    theme = "doodle_whiteboard";
    lofiTrack = "cozy-coffee";
    voicePersona = "natural-male";
    intent = "Educational hand-drawn doodle visual breakdown with warm human conversational voice modulation.";
    scenesData = [
      {
        narration: "Big goals often fail because we try to change everything all at once.",
        glowWord: "Change Everything",
        mood: "hook",
        sfx: "word-tick",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.94, rate: 0.96, tone: "conversational_warm" },
        videoQuery: "hand drawing sketch paper desk notebook",
        pictorial: { type: "concept_card", label: "Habit Trap", value: "Overwhelming Friction", subtext: "Why Big Leaps Fail" }
      },
      {
        narration: "Instead, shrinking any action to just two minutes makes starting virtually frictionless.",
        glowWord: "Two Minutes",
        mood: "kinetic",
        sfx: "chime",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.96, rate: 1.0, tone: "clear_coach" },
        videoQuery: "stopwatch timer coffee study table",
        pictorial: { type: "metric_badge", label: "Startup Barrier", value: "< 120 Seconds", subtext: "Frictionless Action" }
      },
      {
        narration: "A tiny one percent daily improvement compounds into thirty-seven times better in a year.",
        glowWord: "37x Better",
        mood: "impact",
        sfx: "sub-bass",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.90, rate: 0.92, tone: "deep_emphasis" },
        videoQuery: "exponential growth graph whiteboard doodle",
        pictorial: { type: "tech_hud", label: "Annual Compounding", value: "37.78x Multiplier", subtext: "1.01^365 Math" }
      },
      {
        narration: "Stack your new habit immediately after something you already do every single day.",
        glowWord: "Habit Stacking",
        mood: "pulse",
        sfx: "whoosh",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.94, rate: 0.98, tone: "encouraging_guide" },
        videoQuery: "morning routine coffee book desk",
        pictorial: { type: "diagram_flow", label: "Anchor Formula", value: "Current Cue → New Habit → Reward", subtext: "Automated Triggers" }
      },
      {
        narration: "Start your first tiny micro-action today and let momentum do the heavy lifting.",
        glowWord: "Micro-Action Today",
        mood: "cta",
        sfx: "chime",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.96, rate: 0.98, tone: "motivational_closer" },
        videoQuery: "notebook pencil checkmark goal completed",
        pictorial: { type: "circular_gauge", label: "Momentum", value: "100% Active", subtext: "Take Action Now" }
      }
    ];
  } else if (lower.includes("window") || lower.includes("rain") || lower.includes("looking at the rain") || lower.includes("standing near")) {
    topicTitle = "Reflections in the Rain: Quiet Clarity";
    theme = "rain_window";
    lofiTrack = "rainy-window";
    voicePersona = "calm-lofi";
    intent = "Atmospheric narrative exploring quiet reflection, perspective, and inner stillness against rainy city window.";
    scenesData = [
      {
        narration: "Imagine standing by a quiet window while rain gently washes over the city lights.",
        glowWord: "Quiet Window",
        mood: "hook",
        sfx: "sub-bass",
        sceneVisualType: "rain_window",
        voiceModulation: { pitch: 0.90, rate: 0.92, tone: "intimate_storyteller" },
        videoQuery: "rain on window pane city night lights",
        pictorial: { type: "tech_hud", label: "Mind State", value: "Deep Reflection", subtext: "Atmospheric Stillness" }
      },
      {
        narration: "Every falling droplet mirrors the neon streets below, slowing down the noise of the world.",
        glowWord: "Slowing Noise",
        mood: "kinetic",
        sfx: "whoosh",
        sceneVisualType: "rain_window",
        voiceModulation: { pitch: 0.92, rate: 0.94, tone: "gentle_cadence" },
        videoQuery: "rain drops falling water window glass",
        pictorial: { type: "diagram_flow", label: "Clarity Arc", value: "Noise → Stillness → Insight", subtext: "Perspective Shift" }
      },
      {
        narration: "In these undisturbed moments of solitude, your sharpest and most creative ideas awaken.",
        glowWord: "Creative Ideas",
        mood: "impact",
        sfx: "laser-glitch",
        sceneVisualType: "rain_window",
        voiceModulation: { pitch: 0.88, rate: 0.90, tone: "profound_resonance" },
        videoQuery: "rainy night city bokeh neon lights",
        pictorial: { type: "metric_badge", label: "Cognitive Clarity", value: "+300%", subtext: "Solitude & Flow State" }
      },
      {
        narration: "The storm outside becomes your backdrop for profound focus and future breakthroughs.",
        glowWord: "Profound Focus",
        mood: "pulse",
        sfx: "whoosh",
        sceneVisualType: "rain_window",
        voiceModulation: { pitch: 0.92, rate: 0.94, tone: "uplifting_flow" },
        videoQuery: "rain window street reflections night",
        pictorial: { type: "circular_gauge", label: "Focus Depth", value: "99.4%", subtext: "Optimal Creative State" }
      },
      {
        narration: "Step forward into tomorrow with clear purpose and unstoppable conviction.",
        glowWord: "Unstoppable Conviction",
        mood: "cta",
        sfx: "celestial-chime",
        sceneVisualType: "rain_window",
        voiceModulation: { pitch: 0.94, rate: 0.96, tone: "confident_climax" },
        videoQuery: "sunrise after rain city morning light",
        pictorial: { type: "concept_card", label: "Horizon", value: "Unstoppable Vision", subtext: "Manifest Reality" }
      }
    ];
  } else if (lower.includes("car") || lower.includes("vehicle") || lower.includes("speed") || lower.includes("cyberpunk city")) {
    topicTitle = "Cyberpunk Hyperdrive: Midnight Velocity";
    theme = "cyberpunk";
    lofiTrack = "chillhop-night";
    voicePersona = "deep-baritone";
    intent = "High-octane neon cyberpunk aesthetic with futuristic vehicle and night skyline.";
    scenesData = [
      {
        narration: "Beneath the glowing skyscrapers of Neo-Tokyo, pure engineering meets unstoppable ambition.",
        glowWord: "Pure Engineering",
        mood: "hook",
        sfx: "sub-bass",
        sceneVisualType: "cyber_car",
        voiceModulation: { pitch: 0.78, rate: 0.90, tone: "cinematic_baritone" },
        videoQuery: "cyberpunk car neon city night street",
        pictorial: { type: "tech_hud", label: "Powertrain", value: "Quantum Dual-Drive", subtext: "1,200 kW Output" }
      },
      {
        narration: "Wet asphalt reflects a storm of cyan and magenta light as twin turbo-thrusters spool to life.",
        glowWord: "Spool to Life",
        mood: "kinetic",
        sfx: "laser-glitch",
        sceneVisualType: "cyber_car",
        voiceModulation: { pitch: 0.80, rate: 0.94, tone: "dynamic_pacing" },
        videoQuery: "neon sports car driving night city highway",
        pictorial: { type: "diagram_flow", label: "Ignition Sequence", value: "Spool → Hyper-Torque → Vector Thrust", subtext: "Zero Traction Loss" }
      },
      {
        narration: "Zero to two hundred kilometers per hour in under two seconds—redefining the limits of motion.",
        glowWord: "0-200 Under 2s",
        mood: "impact",
        sfx: "rising-riser",
        sceneVisualType: "cyber_car",
        voiceModulation: { pitch: 0.76, rate: 0.88, tone: "heavy_impact" },
        videoQuery: "fast car speed neon blur lights motion",
        pictorial: { type: "metric_badge", label: "Acceleration", value: "1.85s", subtext: "0-100 km/h Launch" }
      },
      {
        narration: "Every curve of the bodywork channels aerodynamic downforce with surgical precision.",
        glowWord: "Surgical Precision",
        mood: "pulse",
        sfx: "whoosh",
        sceneVisualType: "cyber_car",
        voiceModulation: { pitch: 0.82, rate: 0.92, tone: "technical_authority" },
        videoQuery: "futuristic car design aerodynamic glowing lights",
        pictorial: { type: "circular_gauge", label: "Downforce", value: "850 kg", subtext: "Dynamic Active Aero" }
      },
      {
        narration: "Take the wheel of the future and leave ordinary boundaries in the rearview mirror.",
        glowWord: "Take The Wheel",
        mood: "cta",
        sfx: "celestial-chime",
        sceneVisualType: "cyber_car",
        voiceModulation: { pitch: 0.80, rate: 0.92, tone: "authoritative_closer" },
        videoQuery: "neon highway driving into glowing city night",
        pictorial: { type: "concept_card", label: "Velocity", value: "Unrestricted", subtext: "Next Generation Drive" }
      }
    ];
  } else {
    // General high-impact topic
    topicTitle = "Future Breakthroughs: Kinetic Blueprint";
    theme = "doodle_whiteboard";
    lofiTrack = "cozy-coffee";
    voicePersona = "natural-male";
    scenesData = [
      {
        narration: `Understanding ${cleanPrompt} begins with stripping away outdated assumptions.`,
        glowWord: "Outdated Assumptions",
        mood: "hook",
        sfx: "sub-bass",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.94, rate: 0.96, tone: "clear_hook" },
        videoQuery: "whiteboard sketching architecture idea concept",
        pictorial: { type: "tech_hud", label: "Starting Thesis", value: "First Principles", subtext: "Deconstruct Complexity" }
      },
      {
        narration: "By examining the fundamental mechanisms, hidden leverage points immediately become obvious.",
        glowWord: "Leverage Points",
        mood: "kinetic",
        sfx: "laser-glitch",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.96, rate: 0.98, tone: "analytical_flow" },
        videoQuery: "diagram arrows flow chart whiteboard",
        pictorial: { type: "diagram_flow", label: "Core Mechanics", value: "Deconstruct → Optimize → Scale", subtext: "Maximum Efficiency" }
      },
      {
        narration: "Recent innovations demonstrate an unprecedented tenfold increase in overall performance.",
        glowWord: "Tenfold Increase",
        mood: "impact",
        sfx: "rising-riser",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.88, rate: 0.90, tone: "dramatic_impact" },
        videoQuery: "exponential curve analytics dashboard",
        pictorial: { type: "metric_badge", label: "Performance Gain", value: "10x Multiplier", subtext: "Verified Benchmark" }
      },
      {
        narration: "Seamless coordination across every layer turns isolated progress into compounding growth.",
        glowWord: "Compounding Growth",
        mood: "pulse",
        sfx: "whoosh",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.92, rate: 0.96, tone: "steady_rhythm" },
        videoQuery: "interlocking gears mechanisms team motion",
        pictorial: { type: "circular_gauge", label: "System Sync", value: "99.8%", subtext: "Optimal Integration" }
      },
      {
        narration: "Mastering this paradigm positions you at the absolute forefront of tomorrow's breakthroughs.",
        glowWord: "Forefront Tomorrow",
        mood: "cta",
        sfx: "celestial-chime",
        sceneVisualType: "doodle_whiteboard",
        voiceModulation: { pitch: 0.94, rate: 0.96, tone: "inspirational_call" },
        videoQuery: "horizon sunrise light city modern dawn",
        pictorial: { type: "concept_card", label: "Next Step", value: "Execute Vision", subtext: "Leadership Advantage" }
      }
    ];
  }

  // Adjust count if requested
  if (scenesData.length > slideCount) {
    scenesData = scenesData.slice(0, slideCount);
  }

  return {
    prompt: cleanPrompt,
    topicTitle: topicTitle,
    theme: theme,
    lofiTrack: lofiTrack,
    voicePersona: voicePersona,
    reasoning: {
      intent: intent,
      targetAudience: "Global learners & ambitious creators",
      narrativeArc: "Hook → Core Mechanism → Compounding Impact → Call to Action",
      keyTakeaway: "Clear actionable insight delivered with organic voice inflection and kinetic visual design."
    },
    scenes: scenesData.map((s, idx) => ({
      index: idx,
      narration: s.narration,
      glowWord: s.glowWord,
      mood: s.mood,
      sfx: s.sfx,
      sceneVisualType: s.sceneVisualType,
      voiceModulation: s.voiceModulation || { pitch: 0.94, rate: 0.96 },
      duration: Math.max(3.5, Math.min(8.0, (s.narration || "").split(" ").length * 0.45)),
      videoQuery: s.videoQuery || "minimal modern studio motion",
      pictorial: s.pictorial
    }))
  };
}

/**
 * Main AI Brain Generator with Gemini API + Intelligent Heuristic Fallback
 */
export async function generateBrainScenes(prompt, options = {}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt must be a non-empty string");
  }

  const cleanPrompt = prompt.trim();
  const slideCount = parseInt(options.slideCount, 10) || 5;
  const style = options.style || "viral-hook";
  const orientation = options.aspectRatio === "aspect-16-9" ? "landscape" : "portrait";

  const ai = getGeminiClient();
  let brainResult = null;

  if (ai) {
    const systemInstruction = `You are the AI Brain & Chief Kinetic Director of a next-generation video studio.
Your job is to deeply analyze ANY user prompt, understand its core intent, emotion, and tone, and engineer a sequence of ${slideCount} high-impact, kinetic video scene slides.

For each scene slide, you must create:
1. "narration": A punchy, conversational, hook-driven sentence (10-18 words max) optimized for word-by-word kinetic typography.
2. "glowWord": 1 to 3 words from the sentence that will glow vividly as the key visual anchor.
3. "mood": One of: "hook" (opening punch), "impact" (mind-blowing stat/breakthrough), "kinetic" (fast motion), "pulse" (rhythmic build), "cta" (closing call to action), "minimal".
4. "sfx": One of: "sub-bass" (deep cinematic hit), "laser-glitch" (cyber transition), "whoosh" (fast flyby), "celestial-chime" (magical realization), "rising-riser" (tension buildup), "word-tick" (precise click), "doodle-stroke" (sketch sound).
5. "sceneVisualType": One of "doodle_whiteboard" (whiteboard sketch/lightbulb/gears), "minimal_white" (clean gallery editorial), "papercraft_notebook", "rain_window" (rain droplets & silhouette), "cyber_car" (neon car), "astronaut_space", "matrix_terminal", "nature_sunset", "quantum_core".
6. "voiceModulation": {
     "pitch": float between 0.75 (deep masculine) and 1.05 (bright),
     "rate": float between 0.88 (dramatic/storytelling) and 1.08 (high energy),
     "tone": "conversational_warm" | "deep_baritone" | "intimate_storyteller" | "clear_coach" | "authoritative"
   }
7. "videoQuery": A 3-5 word high-definition cinematic stock video search query for Pexels.
8. "pictorial": A sophisticated infographic HUD overlay with type, label, value, subtext.

Return ONLY a JSON object matching this schema:
{
  "topicTitle": "Crisp 2-5 word title for the presentation",
  "theme": "doodle_whiteboard" | "minimal_white" | "papercraft_notebook" | "rain_window" | "cyberpunk" | "sunset" | "cosmic",
  "lofiTrack": "cozy-coffee" | "rainy-window" | "chillhop-night" | "acoustic-warmth" | "dreamy-cloud",
  "voicePersona": "natural-male" | "deep-baritone" | "cinematic-movie" | "calm-lofi" | "energetic-creator",
  "reasoning": {
    "intent": "Brief analysis of the user's goal with this prompt",
    "targetAudience": "Target audience description",
    "narrativeArc": "Description of the hook-to-resolution pacing",
    "keyTakeaway": "Single most important insight"
  },
  "scenes": [
    {
      "narration": "Line text",
      "glowWord": "Glow highlight phrase",
      "mood": "hook",
      "sfx": "sub-bass",
      "sceneVisualType": "doodle_whiteboard",
      "voiceModulation": { "pitch": 0.92, "rate": 0.96, "tone": "conversational_warm" },
      "videoQuery": "Search query for Pexels video",
      "pictorial": {
        "type": "tech_hud",
        "label": "Metric Title",
        "value": "99.9%",
        "subtext": "Descriptor text"
      }
    }
  ]
}`;

    const userMessage = `User Prompt / Concept: "${cleanPrompt}"
Requested Slide Count: ${slideCount}
Style/Archetype: "${style}"
Orientation: "${orientation}"

Create exactly ${slideCount} scene slides that fully understand this prompt, specify voice modulation for natural human male delivery, and deliver an unforgettable kinetic experience.`;

    try {
      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash", "gemini-3.1-pro-preview"];
      for (const model of modelsToTry) {
        let modelSuccess = false;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: model,
              contents: userMessage,
              config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
              },
            });

            if (response && response.text) {
              let rawText = response.text.trim();
              if (rawText.startsWith("```")) {
                rawText = rawText.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
              }
              const parsed = JSON.parse(rawText);
              if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
                brainResult = {
                  prompt: cleanPrompt,
                  topicTitle: parsed.topicTitle || cleanPrompt,
                  theme: parsed.theme || "doodle_whiteboard",
                  lofiTrack: parsed.lofiTrack || "cozy-coffee",
                  voicePersona: parsed.voicePersona || "natural-male",
                  reasoning: parsed.reasoning || {
                    intent: `Deconstructed prompt: ${cleanPrompt}`,
                    targetAudience: "Curious tech & knowledge audience",
                    narrativeArc: "Hook → Proof → Climax",
                    keyTakeaway: "Core insight structured for kinetic typography"
                  },
                  scenes: parsed.scenes.map((s, idx) => ({
                    index: idx,
                    narration: s.narration || "",
                    glowWord: s.glowWord || s.narration?.split(" ")[0] || "Key",
                    mood: s.mood || "kinetic",
                    sfx: s.sfx || "whoosh",
                    sceneVisualType: s.sceneVisualType || (cleanPrompt.toLowerCase().includes("rain") ? "rain_window" : cleanPrompt.toLowerCase().includes("car") ? "cyber_car" : "doodle_whiteboard"),
                    voiceModulation: s.voiceModulation || { pitch: 0.94, rate: 0.96 },
                    duration: Math.max(3.5, Math.min(8.0, (s.narration || "").split(" ").length * 0.45)),
                    videoQuery: s.videoQuery || "minimal desk paper coffee sketch",
                    pictorial: s.pictorial || {
                      type: "tech_hud",
                      label: "Analysis Point",
                      value: "Active",
                      subtext: "Verified Metric"
                    }
                  }))
                };
                modelSuccess = true;
                break;
              }
            }
          } catch (modelErr) {
            const errString = String(modelErr?.message || modelErr || "");
            const isTransient =
              modelErr?.status === "UNAVAILABLE" ||
              errString.includes("503") ||
              errString.includes("429") ||
              errString.includes("high demand") ||
              errString.includes("RESOURCE_EXHAUSTED");

            if (isTransient && attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 650));
              continue;
            }
            break;
          }
        }
        if (modelSuccess && brainResult) break;
      }
    } catch (err) {
      console.log("[AI Brain Fallback Notice]: Transitioning to local heuristic engine.");
    }
  }

  // Fallback to heuristic brain if needed
  if (!brainResult) {
    brainResult = heuristicBrain(cleanPrompt, options);
  }

  // Now concurrently hydrate all scene slides with matching Pexels stock video backgrounds!
  try {
    const videoMatches = await Promise.all(
      brainResult.scenes.map(async (scene, idx) => {
        const queryToUse = scene.videoQuery || scene.narration || cleanPrompt;
        return await getStockVideoForSlide(queryToUse, brainResult.topicTitle, idx, orientation);
      })
    );

    brainResult.scenes = brainResult.scenes.map((scene, idx) => ({
      ...scene,
      videoBg: videoMatches[idx] || null
    }));
  } catch (videoErr) {
    console.error("[AI Brain Video Hydration Error]:", videoErr);
  }

  return brainResult;
}
