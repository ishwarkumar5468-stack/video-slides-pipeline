// Reusable animation templates, keyed by mood. Build these once as
// CSS/SVG animations in your frontend, then just reference the name here.
const ANIMATION_MAP = {
  transition: "glitch-transition",
  reveal: "scan-line-reveal",
  emphasis: "glow-pulse",
  ambient: "slow-zoom",
};

export function assignAnimation(scene) {
  return {
    ...scene,
    animation: ANIMATION_MAP[scene.mood] || "fade",
  };
}

export function assignAllAnimations(scenes) {
  return scenes.map(assignAnimation);
}
