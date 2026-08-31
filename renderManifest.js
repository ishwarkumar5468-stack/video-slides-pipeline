import { AMBIENT_BED } from "./sfxTags.js";

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
    scenes: scenes.map((scene) => ({
      scene_number: scene.scene_number,
      narration_text: scene.text,
      visual: scene.visual_url || scene.visual_asset,
      visual_type: scene.visual_type,
      animation: scene.animation,
      sfx: scene.sfx,
      mood: scene.mood,
    })),
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
