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
  let theme = "cyberpunk";
  let intent = `Transform prompt "${cleanPrompt}" into a high-retention, kinetic video storyboard.`;
  let scenesData = [];

  if (lower.includes("window") || lower.includes("rain") || lower.includes("looking at the rain") || lower.includes("standing near")) {
    topicTitle = "Reflections in the Rain: Quiet Clarity";
    theme = "cyberpunk";
    intent = "Atmospheric narrative exploring quiet reflection, perspective, and inner stillness against rainy city window.";
    scenesData = [
      {
        narration: "Imagine standing by a quiet window while rain gently washes over the city lights.",
        glowWord: "Quiet Window",
        mood: "hook",
        sfx: "sub-bass",
        sceneVisualType: "rain_window",
        videoQuery: "rain on window pane city night lights",
        pictorial: { type: "tech_hud", label: "Mind State", value: "Deep Reflection", subtext: "Atmospheric Stillness" }
      },
      {
        narration: "Every falling droplet mirrors the neon streets below, slowing down the noise of the world.",
        glowWord: "Slowing Noise",
        mood: "kinetic",
        sfx: "whoosh",
        sceneVisualType: "rain_window",
        videoQuery: "rain drops falling water window glass",
        pictorial: { type: "diagram_flow", label: "Clarity Arc", value: "Noise → Stillness → Insight", subtext: "Perspective Shift" }
      },
      {
        narration: "In these undisturbed moments of solitude, your sharpest and most creative ideas awaken.",
        glowWord: "Creative Ideas",
        mood: "impact",
        sfx: "laser-glitch",
        sceneVisualType: "rain_window",
        videoQuery: "rainy night city bokeh neon lights",
        pictorial: { type: "metric_badge", label: "Cognitive Clarity", value: "+300%", subtext: "Solitude & Flow State" }
      },
      {
        narration: "The storm outside becomes your backdrop for profound focus and future breakthroughs.",
        glowWord: "Profound Focus",
        mood: "pulse",
        sfx: "whoosh",
        sceneVisualType: "rain_window",
        videoQuery: "rain window street reflections night",
        pictorial: { type: "circular_gauge", label: "Focus Depth", value: "99.4%", subtext: "Optimal Creative State" }
      },
      {
        narration: "Step forward into tomorrow with clear purpose and unstoppable conviction.",
        glowWord: "Unstoppable Conviction",
        mood: "cta",
        sfx: "celestial-chime",
        sceneVisualType: "rain_window",
        videoQuery: "sunrise after rain city morning light",
        pictorial: { type: "concept_card", label: "Horizon", value: "Unstoppable Vision", subtext: "Manifest Reality" }
      }
    ];
  } else if (lower.includes("car") || lower.includes("vehicle") || lower.includes("drive") || lower.includes("speed") || lower.includes("cyberpunk city")) {
    topicTitle = "Cyberpunk Hyperdrive: Midnight Stance";
    theme = "cyberpunk";
    intent = "High-octane neon cyberpunk aesthetic with futuristic vehicle and night skyline.";
    scenesData = [
      {
        narration: "Beneath the glowing skyscrapers of Neo-Tokyo, pure engineering meets unstoppable ambition.",
        glowWord: "Pure Engineering",
        mood: "hook",
        sfx: "sub-bass",
        sceneVisualType: "cyber_car",
        videoQuery: "cyberpunk car neon city night street",
        pictorial: { type: "tech_hud", label: "Powertrain", value: "Quantum Dual-Drive", subtext: "1,200 kW Output" }
      },
      {
        narration: "Wet asphalt reflects a storm of cyan and magenta light as twin turbo-thrusters spool to life.",
        glowWord: "Spool to Life",
        mood: "kinetic",
        sfx: "laser-glitch",
        sceneVisualType: "cyber_car",
        videoQuery: "neon sports car driving night city highway",
        pictorial: { type: "diagram_flow", label: "Ignition Sequence", value: "Spool → Hyper-Torque → Vector Thrust", subtext: "Zero Traction Loss" }
      },
      {
        narration: "Zero to two hundred kilometers per hour in under two seconds—redefining the limits of motion.",
        glowWord: "0-200 Under 2s",
        mood: "impact",
        sfx: "rising-riser",
        sceneVisualType: "cyber_car",
        videoQuery: "fast car speed neon blur lights motion",
        pictorial: { type: "metric_badge", label: "Acceleration", value: "1.85s", subtext: "0-100 km/h Launch" }
      },
      {
        narration: "Every curve of the bodywork channels aerodynamic downforce with surgical precision.",
        glowWord: "Surgical Precision",
        mood: "pulse",
        sfx: "whoosh",
        sceneVisualType: "cyber_car",
        videoQuery: "futuristic car design aerodynamic glowing lights",
        pictorial: { type: "circular_gauge", label: "Downforce", value: "850 kg", subtext: "Dynamic Active Aero" }
      },
      {
        narration: "Take the wheel of the future and leave ordinary boundaries in the rearview mirror.",
        glowWord: "Take The Wheel",
        mood: "cta",
        sfx: "celestial-chime",
        sceneVisualType: "cyber_car",
        videoQuery: "neon highway driving into glowing city night",
        pictorial: { type: "concept_card", label: "Velocity", value: "Unrestricted", subtext: "Next Generation Drive" }
      }
    ];
  } else if (lower.includes("ai") || lower.includes("robot") || lower.includes("agent") || lower.includes("neural") || lower.includes("intelligence")) {
    topicTitle = "Autonomous AI & Cognitive Systems";
    theme = "cyberpunk";
    scenesData = [
      {
        narration: "Autonomous AI agents are shifting from passive chat assistants into self-governing execution systems.",
        glowWord: "Self-Governing",
        mood: "hook",
        sfx: "sub-bass",
        videoQuery: "artificial intelligence neural network digital brain",
        pictorial: { type: "tech_hud", label: "Agent Autonomy", value: "Level 4 Execution", subtext: "Multi-Agent Swarm Logic" }
      },
      {
        narration: "By executing multi-step reasoning loops, modern agents decompose complex enterprise goals into instantaneous actions.",
        glowWord: "Reasoning Loops",
        mood: "kinetic",
        sfx: "laser-glitch",
        videoQuery: "cyberpunk matrix network data stream",
        pictorial: { type: "diagram_flow", label: "Agent Pipeline", value: "Perceive → Plan → Tool Use → Verify", subtext: "Zero-Latency Routing" }
      },
      {
        narration: "Benchmark tests demonstrate a four-hundred percent improvement in autonomous task completion accuracy.",
        glowWord: "400% Improvement",
        mood: "impact",
        sfx: "rising-riser",
        videoQuery: "quantum computing processor technology",
        pictorial: { type: "metric_badge", label: "Task Accuracy", value: "+400%", subtext: "Multi-Agent Collaboration" }
      },
      {
        narration: "Real-time tool invocation connects foundation models directly with APIs, robotic hardware, and databases.",
        glowWord: "Real-Time Tools",
        mood: "pulse",
        sfx: "whoosh",
        videoQuery: "futuristic robotics robotic arm factory",
        pictorial: { type: "circular_gauge", label: "System Latency", value: "45ms", subtext: "Real-Time Sensor Readout" }
      },
      {
        narration: "The future belongs to those who build with intelligent agent architectures today.",
        glowWord: "Intelligent Architecture",
        mood: "cta",
        sfx: "celestial-chime",
        videoQuery: "modern city technology skyscrapers dusk",
        pictorial: { type: "concept_card", label: "Next Horizon", value: "AGI Ecosystem", subtext: "Production Deployment Ready" }
      }
    ];
  } else if (lower.includes("quantum") || lower.includes("physics") || lower.includes("superposition")) {
    topicTitle = "Quantum Computing Acceleration";
    theme = "cyberpunk";
    scenesData = [
      {
        narration: "Quantum computing is crossing the barrier from experimental theory into commercial advantage.",
        glowWord: "Commercial Advantage",
        mood: "hook",
        sfx: "sub-bass",
        videoQuery: "quantum particles atom energy glow",
        pictorial: { type: "tech_hud", label: "Qubit Coherence", value: "99.8% Fidelity", subtext: "Superconducting Transmon Array" }
      },
      {
        narration: "By harnessing superposition, quantum processors compute millions of permutations simultaneously.",
        glowWord: "Superposition",
        mood: "kinetic",
        sfx: "laser-glitch",
        videoQuery: "abstract blue particle wave motion",
        pictorial: { type: "diagram_flow", label: "Parallel States", value: "|0⟩ + |1⟩ → Gate Matrix → Readout", subtext: "Exponential Permutations" }
      },
      {
        narration: "Recent benchmarks showcase a ten-thousand-times acceleration in complex molecular simulations.",
        glowWord: "10,000x Acceleration",
        mood: "impact",
        sfx: "rising-riser",
        videoQuery: "futuristic science lab holographic interface",
        pictorial: { type: "metric_badge", label: "Compute Speedup", value: "10,000x", subtext: "Vs Classical Supercomputers" }
      },
      {
        narration: "Fault-tolerant error correction is unlocking breakthroughs in clean energy and medicine.",
        glowWord: "Breakthroughs",
        mood: "pulse",
        sfx: "whoosh",
        videoQuery: "deep space nebula galaxy cosmic stars",
        pictorial: { type: "circular_gauge", label: "Physical Qubits", value: "1,121 Qubits", subtext: "Logical Error Suppression" }
      },
      {
        narration: "The quantum revolution is officially here—prepare for exponential computation.",
        glowWord: "Quantum Revolution",
        mood: "cta",
        sfx: "celestial-chime",
        videoQuery: "abstract cyber lights hyper speed",
        pictorial: { type: "concept_card", label: "Horizon 2026", value: "Quantum Cloud", subtext: "Hybrid Classical Orchestration" }
      }
    ];
  } else if (lower.includes("space") || lower.includes("mars") || lower.includes("rocket") || lower.includes("orbit")) {
    topicTitle = "Interplanetary Spaceflight & Starships";
    theme = "cosmic";
    scenesData = [
      {
        narration: "Human civilization is entering a new golden age of deep space exploration.",
        glowWord: "Golden Age",
        mood: "hook",
        sfx: "sub-bass",
        videoQuery: "rocket launch space stars nebula",
        pictorial: { type: "tech_hud", label: "Orbital Velocity", value: "28,000 km/h", subtext: "Low Earth Orbit Insertion" }
      },
      {
        narration: "Fully reusable heavy-lift rockets have slashed the cost of orbital payload delivery by ninety percent.",
        glowWord: "90% Cost Slashed",
        mood: "kinetic",
        sfx: "rising-riser",
        videoQuery: "planet earth from space satellite",
        pictorial: { type: "metric_badge", label: "Launch Economics", value: "$100 / kg", subtext: "Full Reusability Architecture" }
      },
      {
        narration: "Next-generation plasma and nuclear-thermal thrusters will cut transit times to Mars in half.",
        glowWord: "Mars in Half",
        mood: "impact",
        sfx: "laser-glitch",
        videoQuery: "mars red planet space exploration",
        pictorial: { type: "diagram_flow", label: "Transit Arc", value: "Earth Orbit → Propellant Transfer → Mars Entry", subtext: "Deep Space Corridor" }
      },
      {
        narration: "Automated refineries will extract oxygen and methane directly from Martian subsurface glaciers.",
        glowWord: "In-Situ Fuel",
        mood: "pulse",
        sfx: "whoosh",
        videoQuery: "futuristic colony alien planet futuristic landscape",
        pictorial: { type: "circular_gauge", label: "Resource Extraction", value: "98% Purity", subtext: "In-Situ Resource Utilization" }
      },
      {
        narration: "A multi-planetary future is no longer a dream—it is being built right now.",
        glowWord: "Multi-Planetary",
        mood: "cta",
        sfx: "celestial-chime",
        videoQuery: "deep space galaxy nebula stars glowing",
        pictorial: { type: "concept_card", label: "Human Destiny", value: "Interplanetary", subtext: "Permanent Orbital Presence" }
      }
    ];
  } else if (lower.includes("focus") || lower.includes("habit") || lower.includes("productivity") || lower.includes("dopamine") || lower.includes("brain")) {
    topicTitle = "Neuroscience of High Performance";
    theme = "sunset";
    scenesData = [
      {
        narration: "Unlocking peak cognitive focus is the single most valuable superpower in the modern world.",
        glowWord: "Cognitive Focus",
        mood: "hook",
        sfx: "sub-bass",
        videoQuery: "meditation brain thinking focus calm",
        pictorial: { type: "circular_gauge", label: "Focus Score", value: "95%", subtext: "Prefrontal Cortex Activation" }
      },
      {
        narration: "Neuroscience shows our brains thrive in ninety-minute ultradian rhythm cycles of intense concentration.",
        glowWord: "90-Minute Cycles",
        mood: "kinetic",
        sfx: "whoosh",
        videoQuery: "sunset timelapse clouds mountain peaceful",
        pictorial: { type: "diagram_flow", label: "Ultradian Rhythm", value: "Warmup → Flow State → Recovery", subtext: "Dopamine Alignment" }
      },
      {
        narration: "Eliminating digital distractions reduces attention residue and cognitive fatigue by forty percent.",
        glowWord: "40% Less Fatigue",
        mood: "impact",
        sfx: "laser-glitch",
        videoQuery: "abstract flowing liquid lights energy",
        pictorial: { type: "metric_badge", label: "Energy Preserved", value: "+40%", subtext: "Zero Context Switching" }
      },
      {
        narration: "When you protect uninterrupted deep work blocks, creative output multiplies threefold.",
        glowWord: "3x Output",
        mood: "pulse",
        sfx: "rising-riser",
        videoQuery: "runner athlete morning sunrise focus",
        pictorial: { type: "comparison_pill", label: "Monotasking vs Multitasking", value: "3.2x Throughput", subtext: "High Leverage Execution" }
      },
      {
        narration: "Master your attention today, and unlock the highest level of your potential.",
        glowWord: "Master Attention",
        mood: "cta",
        sfx: "celestial-chime",
        videoQuery: "sun rays shining through forest majestic",
        pictorial: { type: "concept_card", label: "Daily Mastery", value: "Flow State", subtext: "Consistent Peak Performance" }
      }
    ];
  } else {
    // Dynamic universal generator for ANY prompt
    topicTitle = cleanPrompt.length > 50 ? cleanPrompt.slice(0, 50) + "..." : cleanPrompt;
    theme = "minimal-tech";
    scenesData = [
      {
        narration: `Mastering ${topicTitle} is essential for unlocking true strategic breakthroughs.`,
        glowWord: "Strategic Breakthroughs",
        mood: "hook",
        sfx: "sub-bass",
        videoQuery: "abstract technology digital particles blue",
        pictorial: { type: "tech_hud", label: "Core Concept", value: "Primary Driver", subtext: `${topicTitle} Analysis` }
      },
      {
        narration: `Behind every great achievement in this space is a disciplined understanding of foundational mechanics.`,
        glowWord: "Foundational Mechanics",
        mood: "kinetic",
        sfx: "laser-glitch",
        videoQuery: "cyberpunk matrix network connection",
        pictorial: { type: "diagram_flow", label: "Execution Roadmap", value: "Concept → Strategy → Rapid Execution", subtext: "Iterative Feedback Loop" }
      },
      {
        narration: `Data reveals that implementing these principles creates a three-fold multiplier in overall output.`,
        glowWord: "3x Multiplier",
        mood: "impact",
        sfx: "rising-riser",
        videoQuery: "glowing data analytics abstract graphics",
        pictorial: { type: "metric_badge", label: "Performance Gain", value: "3.5x Multiplier", subtext: "Verified Empirical Metric" }
      },
      {
        narration: `By focusing on high-leverage execution, you eliminate friction and accelerate results.`,
        glowWord: "Accelerate Results",
        mood: "pulse",
        sfx: "whoosh",
        videoQuery: "flying above clouds sunset golden hour",
        pictorial: { type: "circular_gauge", label: "Efficiency Rate", value: "98.4%", subtext: "Optimized Workflow Pipeline" }
      },
      {
        narration: `Take decisive action today and transform your vision into unstoppable reality.`,
        glowWord: "Decisive Action",
        mood: "cta",
        sfx: "celestial-chime",
        videoQuery: "modern city skyline sunrise neon lights",
        pictorial: { type: "concept_card", label: "Final Milestone", value: "Peak Execution", subtext: "Realized Potential" }
      }
    ];
  }

  // Adjust to requested slide count
  let finalScenes = scenesData;
  if (slideCount && slideCount > 0 && slideCount < scenesData.length) {
    finalScenes = scenesData.slice(0, slideCount);
  }

  return {
    prompt: cleanPrompt,
    topicTitle: topicTitle,
    theme: theme,
    reasoning: {
      intent: intent,
      targetAudience: "Curious professionals, innovators, and creators seeking high-impact knowledge",
      narrativeArc: "Hook & Intrigue → Technical Mechanism → Quantitative Proof → Tactical Execution → Inspiring CTA",
      keyTakeaway: `Key principles of ${topicTitle} distilled into kinetic video format.`
    },
    scenes: finalScenes.map((s, idx) => ({
      index: idx,
      narration: s.narration,
      glowWord: s.glowWord,
      mood: s.mood || "kinetic",
      sfx: s.sfx || "whoosh",
      duration: Math.max(3.8, Math.min(7.5, s.narration.split(" ").length * 0.45)),
      videoQuery: s.videoQuery,
      pictorial: s.pictorial
    }))
  };
}

/**
 * AI Brain Core: Evaluates any prompt, decomposes intent, and synthesizes complete scene slides.
 */
export async function generateBrainScenes(prompt, options = {}) {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt is required for the AI Brain");
  }

  const cleanPrompt = prompt.trim();
  const slideCount = parseInt(options.slideCount, 10) || 5;
  const style = options.style || "viral-hook";
  const orientation = options.aspectRatio === "aspect-16-9" ? "landscape" : "portrait";

  const ai = getGeminiClient();
  let brainResult = null;

  if (ai) {
    const systemInstruction = `You are the AI Brain & Chief Kinetic Director of a next-generation video studio.
Your job is to deeply analyze ANY user prompt, understand its core intent, tone, and knowledge depth, and engineer a sequence of ${slideCount} high-impact, kinetic video scene slides.

For each scene slide, you must create:
1. "narration": A punchy, conversational, hook-driven sentence (10-18 words max) optimized for word-by-word kinetic typography.
2. "glowWord": 1 to 3 words from the sentence that will glow vividly as the key visual anchor.
3. "mood": One of: "hook" (opening punch), "impact" (mind-blowing stat/breakthrough), "kinetic" (fast motion), "pulse" (rhythmic build), "cta" (closing call to action), "minimal".
4. "sfx": One of: "sub-bass" (deep cinematic hit), "laser-glitch" (cyber transition), "whoosh" (fast flyby), "celestial-chime" (magical realization), "rising-riser" (tension buildup), "tick" (precise metric readout).
5. "videoQuery": A 3-5 word high-definition cinematic stock video search query for Pexels (e.g., "tokamak fusion reactor plasma", "cyberpunk neural network brain", "deep space galaxy nebula", "modern skyscrapers dawn").
6. "pictorial": A sophisticated infographic HUD overlay with:
   - "type": One of "tech_hud", "metric_badge", "circular_gauge", "diagram_flow", "comparison_pill", "concept_card".
   - "label": Short title (e.g., "Compute Acceleration", "Energy Density", "Neural Latency").
   - "value": An eye-catching metric, stat, or short flow (e.g. "10,000x", "99.8% Coherence", "450 Wh/kg", "Plan → Execute → Verify").
   - "subtext": 3-6 word contextual descriptor.

Return ONLY a JSON object matching this schema:
{
  "topicTitle": "Crisp 2-5 word title for the presentation",
  "theme": "cyberpunk" | "cosmic" | "minimal-tech" | "matrix" | "sunset" | "emerald",
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

Create exactly ${slideCount} scene slides that fully understand this prompt and deliver an unforgettable kinetic video experience.`;

    try {
      // Prioritize fast, high-availability models with automatic fallback on transient spikes
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
                  theme: parsed.theme || "cyberpunk",
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
                    sceneVisualType: s.sceneVisualType || (s.narration?.toLowerCase().includes("rain") || s.narration?.toLowerCase().includes("window") ? "rain_window" : s.narration?.toLowerCase().includes("car") ? "cyber_car" : s.narration?.toLowerCase().includes("space") ? "astronaut_space" : "rain_window"),
                    duration: Math.max(3.5, Math.min(8.0, (s.narration || "").split(" ").length * 0.45)),
                    videoQuery: s.videoQuery || "abstract technology motion",
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
              // Brief jitter backoff on 503 high demand spike before retry
              await new Promise((resolve) => setTimeout(resolve, 650));
              continue;
            }
            break;
          }
        }
        if (modelSuccess && brainResult) {
          break;
        }
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
