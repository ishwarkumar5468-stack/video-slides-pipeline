import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { breakdownScript } from "./sceneBreakdown.js";
import { sourceAllVisuals } from "./visualSourcing.js";
import { assignAllAnimations } from "./animationTags.js";
import { assignAllSfx } from "./sfxTags.js";
import { buildManifest } from "./renderManifest.js";
import { researchTopicAndGenerateScript } from "./topicResearch.js";
import { searchPexelsVideos, getStockVideoForSlide } from "./stockVideoService.js";
import { generateBrainScenes } from "./aiBrainService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// AI Brain: Understands any prompt, analyzes intent, and generates complete scenes with Pexels videos & HUD widgets
app.post("/api/ai-brain/generate-scenes", async (req, res) => {
  const { prompt, slideCount, style, aspectRatio } = req.body;
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Missing 'prompt' string in request body" });
  }

  try {
    const result = await generateBrainScenes(prompt.trim(), {
      slideCount: slideCount || 5,
      style: style || "viral-hook",
      aspectRatio: aspectRatio || "aspect-9-16"
    });
    res.json(result);
  } catch (err) {
    console.error("[API /api/ai-brain/generate-scenes Error]:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI Brain scenes" });
  }
});

// Topic Research and AI Script synthesis endpoint
app.post("/api/research-topic", async (req, res) => {
  const { topic, prompt } = req.body;
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "Missing 'topic' string in request body" });
  }

  try {
    const researchResult = await researchTopicAndGenerateScript(topic.trim(), prompt || "");
    res.json(researchResult);
  } catch (err) {
    console.error("[API /api/research-topic Error]:", err);
    res.status(500).json({ error: err.message || "Failed to research topic" });
  }
});

// Search Stock Videos via Pexels API
app.post("/api/stock-videos/search", async (req, res) => {
  const { query, orientation, perPage } = req.body;
  try {
    const videos = await searchPexelsVideos(query || "abstract technology", {
      orientation: orientation || "portrait",
      perPage: perPage || 8
    });
    res.json({ videos });
  } catch (err) {
    console.error("[API /api/stock-videos/search Error]:", err);
    res.status(500).json({ error: err.message || "Failed to fetch stock videos" });
  }
});

// Auto-match stock videos for an array of slide lines
app.post("/api/stock-videos/auto-match", async (req, res) => {
  const { slides, topic, orientation } = req.body;
  if (!Array.isArray(slides)) {
    return res.status(400).json({ error: "Expected 'slides' array in request body" });
  }

  try {
    const matches = await Promise.all(
      slides.map((s, idx) => {
        const text = typeof s === "string" ? s : s.narration || "";
        return getStockVideoForSlide(text, topic || "", idx, orientation || "portrait");
      })
    );
    res.json({ matches });
  } catch (err) {
    console.error("[API /api/stock-videos/auto-match Error]:", err);
    res.status(500).json({ error: err.message || "Failed to auto-match stock videos" });
  }
});

// Serve from any device on your network, including a tablet browser
app.post("/api/generate", async (req, res) => {
  const { script } = req.body;
  if (!script || typeof script !== "string") {
    return res.status(400).json({ error: "Missing 'script' string in request body" });
  }

  try {
    // Step 1: script -> scenes with visual_type + mood tags
    const scenes = await breakdownScript(script, process.env.ANTHROPIC_API_KEY);

    // Step 2: source the actual visual per scene (2d / ai / stock)
    const withVisuals = await sourceAllVisuals(scenes, {
      pexels: process.env.PEXELS_API_KEY,
      stability: process.env.STABILITY_API_KEY,
    });

    // Step 3: assign animation template per scene mood
    const withAnimations = assignAllAnimations(withVisuals);

    // Step 4: assign matching SFX per scene mood
    const withSfx = assignAllSfx(withAnimations);

    // Step 5: build the final render manifest
    const manifest = buildManifest(withSfx);

    res.json({ manifest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Pipeline server running on http://0.0.0.0:${PORT}`);
});
