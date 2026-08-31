import fetch from "node-fetch";

const STYLE_SUFFIX =
  "dark background, neon blue and purple accents, glowing edges, holographic, cinematic lighting, high detail, futuristic";

async function sourceStock(query, apiKey) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
    { headers: { Authorization: apiKey } }
  );
  const data = await res.json();
  return data.photos?.[0]?.src?.large || null;
}

async function sourceAiImage(prompt, apiKey) {
  // Example shape for a cloud image-gen API's free tier.
  // Swap this out for whichever provider you land on.
  const fullPrompt = `${prompt}, ${STYLE_SUFFIX}`;
  const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    body: (() => {
      const form = new FormData();
      form.append("prompt", fullPrompt);
      form.append("output_format", "png");
      return form;
    })(),
  });
  const data = await res.json();
  return data.image ? `data:image/png;base64,${data.image}` : null;
}

function source2d(prompt) {
  // Placeholder: in production, query unDraw/Freepik or a local curated
  // asset library keyed by keywords extracted from `prompt`.
  return { source: "2d-library", query: prompt };
}

export async function sourceVisual(scene, keys) {
  if (scene.visual_type === "stock") {
    const url = await sourceStock(scene.visual_prompt, keys.pexels);
    return { ...scene, visual_url: url };
  }
  if (scene.visual_type === "ai") {
    const url = await sourceAiImage(scene.visual_prompt, keys.stability);
    return { ...scene, visual_url: url };
  }
  return { ...scene, visual_asset: source2d(scene.visual_prompt) };
}

export async function sourceAllVisuals(scenes, keys) {
  return Promise.all(scenes.map((scene) => sourceVisual(scene, keys)));
}

export { STYLE_SUFFIX };
