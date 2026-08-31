// Curated SFX set, one file per mood, kept small and consistent
// rather than searching a library fresh each time. Point these at
// your own hosted files (e.g. from Pixabay Audio or Mixkit downloads).
const SFX_MAP = {
  transition: "/assets/sfx/whoosh-01.mp3",
  reveal: "/assets/sfx/soft-click-01.mp3",
  emphasis: "/assets/sfx/tone-riser-01.mp3",
  ambient: null, // deliberately silent - restraint reads as more professional
};

const AMBIENT_BED = "/assets/sfx/ambient-synth-bed.mp3"; // runs continuously, low volume

export function assignSfx(scene) {
  return {
    ...scene,
    sfx: SFX_MAP[scene.mood] ?? null,
  };
}

export function assignAllSfx(scenes) {
  return scenes.map(assignSfx);
}

export { AMBIENT_BED };
