import { AMBIENT_BED } from "./sfxTags.js";
// note: all files now live together in one folder, no "steps/" subfolder needed

/**
 * Produces a render manifest: everything the render step needs to know,
 * in one JSON object. This is what you'd hand to ffmpeg (or a hosted
 * render service) to actually assemble the final MP4.
 */
export function buildManifest(scenes, options = {}) {
  return {
    ambient_bed: AMBIENT_BED,
    resolution: options.resolution || "1080x1920", // vertical, tablet/mobile friendly
    fps: options.fps || 30,
    scenes: scenes.map((scene) => {
      // Calculate realistic duration based on word count (approx 2.5 words/sec + 1.2s padding, min 3.5s)
      const wordCount = (scene.text || "").trim().split(/\s+/).length;
      const calculatedDuration = Math.max(3.5, Math.min(8.0, Math.round((wordCount / 2.3 + 1.2) * 10) / 10));

      return {
        scene_number: scene.scene_number,
        narration_text: scene.text,
        visual: scene.visual_url || scene.visual_asset,
        visual_type: scene.visual_type,
        visual_prompt: scene.visual_prompt,
        visual_theme: scene.visual_theme || "default",
        pictorial_type: scene.pictorial_type || "none",
        pictorial_data: scene.pictorial_data || {},
        highlight_keywords: scene.highlight_keywords || [],
        typography: scene.typography || {
          font_family: "Space Grotesk",
          font_size: "text-2xl",
          text_align: "center",
          vertical_position: "center",
          text_color: "#ffffff",
          highlight_color: "from-cyan-400 via-indigo-300 to-pink-400",
          tracking: "tracking-tight",
          text_transform: "none"
        },
        animation: scene.animation,
        sfx: scene.sfx,
        mood: scene.mood,
        duration: scene.duration || calculatedDuration,
      };
    }),
  };
}

/**
 * Example of how you'd turn the manifest into an ffmpeg command for a
 * single scene (a real implementation would loop this and concat).
 * This is intentionally minimal - swap in your actual asset paths.
 */
export function ffmpegCommandForScene(scene, durationSeconds = 4) {
  const sfxInput = scene.sfx ? `-i ${scene.sfx}` : "";
  return `ffmpeg -loop 1 -i ${scene.visual} ${sfxInput} -t ${durationSeconds} -vf "scale=1080:1920" scene_${scene.scene_number}.mp4`;
}
