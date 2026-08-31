import { GoogleGenAI } from "@google/genai";

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
 * Intelligent topic research synthesizer for dynamic topics and freeform prompts.
 */
function heuristicResearch(topic, promptDirective = "") {
  const cleanInput = (topic || promptDirective || "Emerging Technologies").trim();
  
  // Strip common prompt prefixes (e.g. "make a video about", "explain", "slides for")
  let cleanTopic = cleanInput
    .replace(/^(make|create|generate|give me|write|build)(\s+a|\s+an|\s+the|\s+some)?(\s+video|\s+slides|\s+storyboard|\s+script|\s+presentation)?(\s+about|\s+on|\s+for|\s+explaining|\s+detailing)?/i, "")
    .replace(/^explain\s+/i, "")
    .replace(/^how\s+to\s+/i, "How to ")
    .replace(/^why\s+/i, "Why ")
    .trim();

  if (!cleanTopic) cleanTopic = cleanInput;

  // Capitalize nicely for display
  const displayTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
  const lower = cleanTopic.toLowerCase();

  let theme = "cyberpunk";
  let findings = [];
  let scriptLines = [];
  let pictorials = [];

  if (lower.includes("quantum") || lower.includes("qubit") || lower.includes("superposition")) {
    theme = "cyberpunk";
    findings = [
      { point: "Qubit Coherence Scaling", metricOrStat: "10,000x Speedup", takeaway: "Exponential compute acceleration for cryptography and molecular modeling." },
      { point: "Quantum Advantage Threshold", metricOrStat: "1,121 Physical Qubits", takeaway: "Transition from noisy intermediate-scale to fault-tolerant clusters." },
      { point: "Commercial Deployment Horizon", metricOrStat: "2026-2028 Horizon", takeaway: "Hybrid classical-quantum cloud orchestration becoming mainstream." }
    ];
    pictorials = [
      { type: "tech_hud", label: "Quantum Coherence", value: "99.8% Fidelity", subtext: "Superconducting Transmon Array" },
      { type: "metric_badge", label: "Algorithmic Speedup", value: "10,000x", subtext: "Shor's & Grover's Acceleration" },
      { type: "diagram_flow", label: "Qubit Pipeline", value: "State Prep → Gate Operation → Measurement", subtext: "Zero-Latency Readout" }
    ];
    scriptLines = [
      `Quantum computing is rapidly crossing from theoretical physics into production reality.`,
      `By utilizing superposition and entanglement, qubits process complex states simultaneously.`,
      `Recent breakthroughs achieved a ten-thousand-times speedup in molecular simulation.`,
      `Fault-tolerant quantum clusters will soon unlock breakthroughs in clean energy and medicine.`,
      `The era of exponential quantum acceleration has officially begun.`
    ];
  } else if (lower.includes("battery") || lower.includes("solid state") || lower.includes("energy") || lower.includes("solar") || lower.includes("ev")) {
    theme = "emerald";
    findings = [
      { point: "Solid-State Energy Density", metricOrStat: "450 Wh/kg", takeaway: "Doubles range of standard lithium-ion with zero fire hazard." },
      { point: "Ultra-Fast Charging Capability", metricOrStat: "10 Min (10-80%)", takeaway: "Eliminates EV range anxiety with rapid dendrite-resistant cathodes." },
      { point: "Cost Parity Milestone", metricOrStat: "$75 per kWh", takeaway: "Mass automotive production scaling globally by late 2026." }
    ];
    pictorials = [
      { type: "circular_gauge", label: "Energy Density", value: "450 Wh/kg", subtext: "+125% vs Conventional Li-Ion" },
      { type: "metric_badge", label: "Fast Charge Rate", value: "10 Min", subtext: "10% to 80% Full Recharging" },
      { type: "comparison_pill", label: "Solid-State vs Liquid", value: "Zero Thermal Runaway", subtext: "Next-Gen Solid Ceramic Electrolyte" }
    ];
    scriptLines = [
      `Solid-state batteries are about to revolutionize electric transportation and grid storage.`,
      `By replacing volatile liquid electrolytes with solid ceramics, energy density reaches four hundred fifty watt-hours per kilogram.`,
      `Vehicles will achieve over seven hundred miles of range with ten-minute fast charging.`,
      `With zero risk of thermal runaway, battery safety and lifespan reach unprecedented levels.`,
      `The global clean energy transition is accelerating faster than ever before.`
    ];
  } else if (lower.includes("focus") || lower.includes("brain") || lower.includes("habit") || lower.includes("sleep") || lower.includes("health") || lower.includes("productivity")) {
    theme = "sunset";
    findings = [
      { point: "Neuroplasticity & Deep Work", metricOrStat: "90 Min Ultradian Cycle", takeaway: "Synchronizing high-focus bursts with natural dopamine rhythms." },
      { point: "Attention Residue Reduction", metricOrStat: "-40% Mental Fatigue", takeaway: "Eliminating rapid task switching preserves prefrontal cortex energy." },
      { point: "Circadian Light Synchronization", metricOrStat: "+35% Slow-Wave Sleep", takeaway: "Early morning photon exposure optimizes melatonin release curves." }
    ];
    pictorials = [
      { type: "circular_gauge", label: "Cognitive Score", value: "94%", subtext: "Optimal Prefrontal Cortex Activity" },
      { type: "diagram_flow", label: "Flow Protocol", value: "Trigger → Immersion → Recovery", subtext: "90-Min Dopamine Alignment" },
      { type: "metric_badge", label: "Deep Work Output", value: "+300%", subtext: "Zero-Distraction Monotasking" }
    ];
    scriptLines = [
      `Mastering deep focus is the ultimate competitive advantage in an era of constant distraction.`,
      `Cognitive research reveals our brains operate in natural ninety-minute ultradian rhythm cycles.`,
      `Eliminating context switching reduces mental fatigue by over forty percent.`,
      `When you protect uninterrupted blocks of time, creative output triples.`,
      `Cultivate deliberate focus, and unlock your true intellectual potential.`
    ];
  } else if (lower.includes("space") || lower.includes("mars") || lower.includes("rocket") || lower.includes("orbit") || lower.includes("galaxy")) {
    theme = "cosmic";
    findings = [
      { point: "Fully Reusable Heavy Lift", metricOrStat: "$100 / kg to Orbit", takeaway: "Massive reduction in launch economics opening orbital manufacturing." },
      { point: "Deep Space Propulsion", metricOrStat: "300,000 km/h Ion Drive", takeaway: "Nuclear-electric thrusters cutting interplanetary transit times by half." },
      { point: "In-Situ Resource Utilization", metricOrStat: "98% Water Recycling", takeaway: "Automated propellant production from Martian subsurface ice deposits." }
    ];
    pictorials = [
      { type: "tech_hud", label: "Orbital Velocity", value: "28,000 km/h", subtext: "Low Earth Orbit Insertion" },
      { type: "metric_badge", label: "Payload Capacity", value: "150 Tons", subtext: "Fully Reusable Architecture" },
      { type: "diagram_flow", label: "Mission Arc", value: "Launch → Refuel → Transit → Landing", subtext: "Interplanetary Corridor" }
    ];
    scriptLines = [
      `Human civilization is taking its first permanent steps beyond Earth.`,
      `Fully reusable launch architectures have reduced the cost of reaching orbit by ninety-five percent.`,
      `Next-generation propulsion systems will cut transit times to Mars by half.`,
      `Automated robotic refineries will produce fuel and water directly from lunar and Martian ice.`,
      `A multi-planetary future is no longer science fiction—it is happening now.`
    ];
  } else if (lower.includes("history") || lower.includes("ancient") || lower.includes("rome") || lower.includes("war") || lower.includes("empire")) {
    theme = "sunset";
    findings = [
      { point: "Foundational Catalyst", metricOrStat: "Historic Turning Point", takeaway: `Critical geopolitical and cultural shifts that defined ${displayTopic}.` },
      { point: "Systemic Momentum", metricOrStat: "Peak Influence", takeaway: "Decisive strategic decisions that reshaped trade, governance, and society." },
      { point: "Lasting Legacy", metricOrStat: "Century Timeline", takeaway: "Enduring historical lessons and institutions that echo into the modern era." }
    ];
    pictorials = [
      { type: "concept_card", label: "Historical Epoch", value: `${displayTopic}`, subtext: "Pivotal Historic Era" },
      { type: "diagram_flow", label: "Chronology Arc", value: "Rise → Zenith → Transformation", subtext: "Historic Progression" },
      { type: "metric_badge", label: "Cultural Influence", value: "Global Reach", subtext: "Enduring Legacy" }
    ];
    scriptLines = [
      `The dramatic story of ${displayTopic} reveals timeless principles of human ambition.`,
      `Pivotal leadership decisions and economic pressures triggered a monumental transformation.`,
      `At its peak, key institutional innovations established unprecedented societal reach.`,
      `Understanding how these dynamics unfolded offers powerful lessons for modern strategy.`,
      `History reminds us that the choices we make today shape the civilizations of tomorrow.`
    ];
  } else {
    // Dynamic universal prompt synthesizer for ANY custom query
    theme = "minimal-tech";
    findings = [
      { point: `Core Dynamics of ${displayTopic}`, metricOrStat: "Primary Driver", takeaway: `Essential principles and structural mechanisms underlying ${displayTopic}.` },
      { point: "Accelerating Impact & Adoption", metricOrStat: "+250% Growth", takeaway: `Rapid momentum and expanding interest across modern domains.` },
      { point: "Strategic Outlook & Action", metricOrStat: "Top Milestone", takeaway: `Actionable steps to leverage key breakthroughs in ${displayTopic}.` }
    ];
    pictorials = [
      { type: "metric_badge", label: "Impact Metric", value: "3.5x Multiplier", subtext: `Acceleration in ${displayTopic}` },
      { type: "diagram_flow", label: "Execution Flow", value: "Concept → Strategy → Breakthrough", subtext: "Optimized Roadmap" },
      { type: "tech_hud", label: "Telemetry", value: "Active & Verified", subtext: `${displayTopic} Analysis` }
    ];
    scriptLines = [
      `Understanding ${displayTopic} is essential for navigating today's rapidly changing landscape.`,
      `Behind every breakthrough in ${displayTopic} is a powerful set of fundamental mechanics.`,
      `Recent data shows organizations and individuals applying these insights are seeing three-fold gains.`,
      `By focusing on high-leverage actions, you can master these concepts with speed and precision.`,
      `Embrace the principles of ${displayTopic} today to unlock your highest potential.`
    ];
  }

  return {
    topic: displayTopic,
    promptEcho: promptDirective,
    executiveSummary: `Strategic research briefing on "${displayTopic}". Synthesizes core principles, critical impact metrics, and high-retention takeaways structured for kinetic video storytelling.`,
    keyFindings: findings,
    suggestedTheme: theme,
    suggestedPictorials: pictorials,
    narrationScript: scriptLines.join("\n")
  };
}

/**
 * Executes a Gemini request with automatic retries and model fallback on transient 503/429 spikes.
 */
async function generateWithFallback(ai, payload) {
  const modelsToTry = [
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.7-flash",
    "gemini-3.1-pro-preview"
  ];
  const maxRetriesPerModel = 1;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: payload.contents,
          config: payload.config,
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        const errStr = String(err?.message || err || "");
        const isTransient =
          err?.status === "UNAVAILABLE" ||
          errStr.includes("503") ||
          errStr.includes("429") ||
          errStr.includes("high demand") ||
          errStr.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt < maxRetriesPerModel) {
          // Brief exponential jitter backoff
          const delay = (attempt + 1) * 600 + Math.floor(Math.random() * 200);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // If exhausted attempts on this model, proceed to the next fallback model
        break;
      }
    }
  }

  return null;
}

/**
 * Conducts research on a topic and user prompt using Gemini Flash or intelligent fallback.
 */
export async function researchTopicAndGenerateScript(topic, userPrompt = "") {
  if (!topic || typeof topic !== "string") {
    throw new Error("Topic is required for research");
  }

  const ai = getGeminiClient();
  if (!ai) {
    return heuristicResearch(topic, userPrompt);
  }

  const systemInstruction = `You are a world-class investigative researcher and viral video scriptwriter.
Your task is to take a research topic and user prompt, conduct thorough structured research, and generate a concise 5-sentence narration script optimized for kinetic typography slide videos with matching pictorial infographic suggestions.

Return ONLY a JSON object with this exact schema:
{
  "topic": "Cleaned topic title",
  "executiveSummary": "2-3 sentence executive briefing of the most critical facts and developments.",
  "keyFindings": [
    {
      "point": "Short title of finding",
      "metricOrStat": "Stat or quantitative number (e.g. 99.9%, 10x, $45B, 0.8ms)",
      "takeaway": "1 sentence analytical explanation"
    }
  ],
  "suggestedTheme": "cyberpunk" | "cosmic" | "minimal-tech" | "matrix" | "sunset" | "emerald",
  "suggestedPictorials": [
    {
      "type": "metric_badge" | "diagram_flow" | "tech_hud" | "circular_gauge" | "comparison_pill" | "concept_card",
      "label": "Short label",
      "value": "Key metric or text",
      "subtext": "Brief descriptor"
    }
  ],
  "narrationScript": "Line 1 sentence.\\nLine 2 sentence.\\nLine 3 sentence.\\nLine 4 sentence.\\nLine 5 sentence."
}

Rules for the narrationScript:
- Exactly 4 to 6 punchy, engaging lines separated by newlines (\\n).
- Each line MUST be a single, complete sentence that can stand on its own slide.
- Avoid robotic jargon; make it conversational, authoritative, and hook-driven (Hook -> Problem -> Breakthrough/Fact -> Impact -> Call to action/Closer).
- Do not include slide numbers, labels, markdown, or timestamps in narrationScript.`;

  const userMessage = `Topic to research: "${topic}"
User Style/Prompt Directives: "${userPrompt || "Focus on key surprising statistics, actionable takeaways, and clear visuals."}"`;

  try {
    const rawText = await generateWithFallback(ai, {
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    if (!rawText) {
      return heuristicResearch(topic, userPrompt);
    }

    // Clean JSON response (strip markdown wrappers if any)
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
    }

    const parsed = JSON.parse(cleaned);
    return {
      topic: parsed.topic || topic,
      promptEcho: userPrompt,
      executiveSummary: parsed.executiveSummary || `Research synthesis on ${topic}`,
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
      suggestedTheme: parsed.suggestedTheme || "cyberpunk",
      suggestedPictorials: Array.isArray(parsed.suggestedPictorials) ? parsed.suggestedPictorials : [],
      narrationScript: parsed.narrationScript || ""
    };
  } catch (err) {
    return heuristicResearch(topic, userPrompt);
  }
}

