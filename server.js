import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { breakdownScript } from "./steps/sceneBreakdown.js";
import { sourceAllVisuals } from "./steps/visualSourcing.js";
import { assignAllAnimations } from "./steps/animationTags.js";
import { assignAllSfx } from "./steps/sfxTags.js";
import { buildManifest } from "./steps/renderManifest.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
app.listen(PORT, () => {
  console.log(`Pipeline server running on port ${PORT}`);
});
