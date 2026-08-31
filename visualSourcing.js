import fetch from "node-fetch";

const STYLE_SUFFIX =
  "dark background, neon blue and purple accents, glowing edges, holographic, cinematic lighting, high detail, futuristic";

const FALLBACK_THEMED_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80", // abstract liquid neon
  "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80", // neural network / nodes
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80", // cosmic nebula deep space
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", // microchip motherboard tech
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80", // retro tech cyber
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80", // 3D abstract fluid
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80", // planet earth space glow
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80", // holographic geometry
];

async function sourceStock(query, apiKey) {
  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        { headers: { Authorization: apiKey } }
      );
      const data = await res.json();
      if (data.photos?.[0]?.src?.large) {
        return data.photos[0].src.large;
      }
    } catch (err) {
      console.warn("[Visual Sourcing] Stock fetch error:", err.message);
    }
  }

  // Fallback to topic-matched Unsplash direct URL
  const cleanKeyword = encodeURIComponent((query || "abstract technology").split(" ").slice(0, 3).join(","));
  return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;
}

async function sourceAiImage(prompt, apiKey) {
  if (apiKey) {
    try {
      const fullPrompt = `${prompt}, ${STYLE_SUFFIX}`;
      const form = new FormData();
      form.append("prompt", fullPrompt);
      form.append("output_format", "png");
      const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body: form,
      });
      const data = await res.json();
      if (data.image) {
        return `data:image/png;base64,${data.image}`;
      }
    } catch (err) {
      console.warn("[Visual Sourcing] AI image fetch error:", err.message);
    }
  }

  // Fallback to stylized curated high-tech visual
  const hash = Math.abs((prompt || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return FALLBACK_THEMED_IMAGES[hash % FALLBACK_THEMED_IMAGES.length];
}

function source2d(prompt, index = 0) {
  const styles = ["particles-grid", "geometric-rings", "matrix-wave", "neon-gradient-mesh", "kinetic-prism", "cyber-grid"];
  const styleIndex = (index || 0) % styles.length;
  return {
    source: "generative-2d",
    theme: styles[styleIndex],
    query: prompt,
  };
}

export async function sourceVisual(scene, keys, index = 0) {
  if (scene.visual_type === "stock") {
    const url = await sourceStock(scene.visual_prompt, keys?.pexels);
    return { ...scene, visual_url: url, visual_theme: "cinematic-stock" };
  }
  if (scene.visual_type === "ai") {
    const url = await sourceAiImage(scene.visual_prompt, keys?.stability);
    return { ...scene, visual_url: url, visual_theme: "cyber-ai" };
  }
  return {
    ...scene,
    visual_asset: source2d(scene.visual_prompt, index),
    visual_theme: "vector-generative"
  };
}

export async function sourceAllVisuals(scenes, keys) {
  return Promise.all(scenes.map((scene, i) => sourceVisual(scene, keys, i)));
}


export { STYLE_SUFFIX };
