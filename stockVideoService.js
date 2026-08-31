import fetch from "node-fetch";

// Curated high-definition loopable stock videos for seamless background playback
const CURATED_THEMED_VIDEOS = {
  technology: [
    {
      id: "curated-tech-1",
      url: "https://assets.mixkit.co/videos/preview/mixkit-circuit-board-digital-animation-4363-large.mp4",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      query: "cyber circuit board",
      author: "Mixkit Tech"
    },
    {
      id: "curated-tech-2",
      url: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-network-server-racks-42998-large.mp4",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      query: "network server data",
      author: "Mixkit Data"
    },
    {
      id: "curated-tech-3",
      url: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31912-large.mp4",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      query: "analytics telemetry",
      author: "Mixkit Analytics"
    }
  ],
  space: [
    {
      id: "curated-space-1",
      url: "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-starfield-in-space-32968-large.mp4",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      query: "space starfield galaxy",
      author: "Mixkit Space"
    },
    {
      id: "curated-space-2",
      url: "https://assets.mixkit.co/videos/preview/mixkit-planet-earth-in-the-vastness-of-space-40098-large.mp4",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      query: "earth orbit",
      author: "Mixkit Cosmos"
    }
  ],
  energy: [
    {
      id: "curated-energy-1",
      url: "https://assets.mixkit.co/videos/preview/mixkit-wind-turbines-in-a-field-under-a-cloudy-sky-42526-large.mp4",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
      query: "clean energy turbine",
      author: "Mixkit Ecology"
    },
    {
      id: "curated-energy-2",
      url: "https://assets.mixkit.co/videos/preview/mixkit-flowing-blue-and-purple-liquid-abstract-40450-large.mp4",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
      query: "liquid electrolyte flux",
      author: "Mixkit Energy"
    }
  ],
  focus: [
    {
      id: "curated-focus-1",
      url: "https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-in-a-dark-room-43187-large.mp4",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
      query: "deep work typing",
      author: "Mixkit Workspace"
    },
    {
      id: "curated-focus-2",
      url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      query: "calm water flow",
      author: "Mixkit Zen"
    }
  ],
  abstract: [
    {
      id: "curated-abstract-1",
      url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-41586-large.mp4",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      query: "neon laser motion",
      author: "Mixkit Abstract"
    },
    {
      id: "curated-abstract-2",
      url: "https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-in-a-dark-tunnel-41588-large.mp4",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      query: "hyperspace tunnel",
      author: "Mixkit Motion"
    },
    {
      id: "curated-abstract-3",
      url: "https://assets.mixkit.co/videos/preview/mixkit-blue-particles-moving-in-a-dark-space-41584-large.mp4",
      image: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80",
      query: "quantum particle field",
      author: "Mixkit Particles"
    }
  ]
};

/**
 * Extracts searchable concise keywords from slide text.
 */
export function extractSearchKeywords(text = "", fallbackTopic = "") {
  if (!text && !fallbackTopic) return "abstract technology background";

  const raw = `${fallbackTopic} ${text}`.toLowerCase();
  
  if (raw.includes("quantum") || raw.includes("qubit") || raw.includes("superposition") || raw.includes("physics")) {
    return "quantum computing particles technology";
  }
  if (raw.includes("battery") || raw.includes("energy") || raw.includes("solar") || raw.includes("electric") || raw.includes("grid")) {
    return "clean energy technology green electric";
  }
  if (raw.includes("space") || raw.includes("mars") || raw.includes("rocket") || raw.includes("orbit") || raw.includes("galaxy") || raw.includes("planet")) {
    return "space galaxy planet stars";
  }
  if (raw.includes("brain") || raw.includes("focus") || raw.includes("habit") || raw.includes("mind") || raw.includes("psychology")) {
    return "meditation focus brain neural";
  }
  if (raw.includes("robot") || raw.includes("ai") || raw.includes("algorithm") || raw.includes("cyber") || raw.includes("code") || raw.includes("data")) {
    return "artificial intelligence digital cyber network";
  }
  if (raw.includes("money") || raw.includes("market") || raw.includes("startup") || raw.includes("growth") || raw.includes("scale") || raw.includes("business")) {
    return "modern city business finance architecture";
  }
  if (raw.includes("airplane") || raw.includes("flight") || raw.includes("fly") || raw.includes("sky")) {
    return "airplane clouds flying sky";
  }
  if (raw.includes("history") || raw.includes("ancient") || raw.includes("rome") || raw.includes("empire")) {
    return "ancient architecture historic monument";
  }

  // General keyword extraction: pick 2-3 longest meaningful words
  const words = text
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !["this", "that", "with", "from", "have", "they", "will", "been", "more", "when", "what", "which", "into"].includes(w.toLowerCase()));

  if (words.length >= 2) {
    return words.slice(0, 3).join(" ") + " motion";
  }

  return (fallbackTopic || "abstract motion graphics").trim();
}

/**
 * Searches Pexels Videos API for high-resolution background video clips.
 */
export async function searchPexelsVideos(query, options = {}) {
  const apiKey = process.env.PEXELS_API_KEY;
  const orientation = options.orientation || "portrait"; // portrait for 9:16 Shorts, landscape for 16:9
  const perPage = options.perPage || 6;

  if (apiKey) {
    try {
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=${orientation}`;
      const res = await fetch(url, {
        headers: {
          Authorization: apiKey
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          return data.videos.map(v => {
            // Find best mp4 file (prefer HD 1080/720)
            const mp4Files = (v.video_files || []).filter(f => f.file_type === "video/mp4");
            const bestFile = mp4Files.find(f => f.quality === "hd" && (f.height >= 720 || f.width >= 720)) ||
                             mp4Files.find(f => f.quality === "hd") ||
                             mp4Files[0] ||
                             v.video_files?.[0];

            return {
              id: `pexels-${v.id}`,
              url: bestFile?.link || v.video_files?.[0]?.link,
              image: v.image || v.video_pictures?.[0]?.picture,
              width: bestFile?.width || v.width,
              height: bestFile?.height || v.height,
              duration: v.duration,
              author: v.user?.name || "Pexels Creator",
              authorUrl: v.user?.url || "",
              query: query,
              source: "pexels"
            };
          }).filter(item => Boolean(item.url));
        }
      } else {
        console.warn(`[Pexels API] Response status: ${res.status}`);
      }
    } catch (err) {
      console.warn("[Pexels API Error]:", err.message);
    }
  }

  // Fallback to Curated Library matching keyword categories
  const queryLower = query.toLowerCase();
  let selectedCategory = CURATED_THEMED_VIDEOS.abstract;

  if (queryLower.includes("space") || queryLower.includes("galaxy") || queryLower.includes("star") || queryLower.includes("planet")) {
    selectedCategory = CURATED_THEMED_VIDEOS.space;
  } else if (queryLower.includes("energy") || queryLower.includes("battery") || queryLower.includes("solar")) {
    selectedCategory = CURATED_THEMED_VIDEOS.energy;
  } else if (queryLower.includes("focus") || queryLower.includes("work") || queryLower.includes("zen")) {
    selectedCategory = CURATED_THEMED_VIDEOS.focus;
  } else if (queryLower.includes("tech") || queryLower.includes("data") || queryLower.includes("cyber") || queryLower.includes("code") || queryLower.includes("quantum")) {
    selectedCategory = CURATED_THEMED_VIDEOS.technology;
  }

  return selectedCategory.map(item => ({
    ...item,
    source: "curated-library"
  }));
}

/**
 * Returns a fitting stock video for a specific slide scene.
 */
export async function getStockVideoForSlide(lineText, topicHint = "", index = 0, orientation = "portrait") {
  const query = extractSearchKeywords(lineText, topicHint);
  const results = await searchPexelsVideos(query, { orientation, perPage: 5 });

  if (results && results.length > 0) {
    const selected = results[index % results.length];
    return selected;
  }

  // Default fallback
  const fallbackList = CURATED_THEMED_VIDEOS.abstract;
  return fallbackList[index % fallbackList.length];
}
