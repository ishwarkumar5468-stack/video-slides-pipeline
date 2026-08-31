import fetch from "node-fetch";

/**
 * Sends the script to Claude and asks for a scene-by-scene breakdown.
 * Each scene comes back tagged with:
 *  - visual_type: "2d" | "ai" | "stock"
 *  - mood: "transition" | "reveal" | "emphasis" | "ambient"
 *  - visual_prompt: short description used later for image sourcing
 */
export async function breakdownScript(script, apiKey) {
  const systemPrompt = `You break a video script into scenes for an automated slide generator.
Return ONLY a JSON array, no prose, no markdown fences. Each item:
{
  "scene_number": number,
  "text": "the narration text for this scene",
  "visual_type": "2d" | "ai" | "stock",
  "mood": "transition" | "reveal" | "emphasis" | "ambient",
  "visual_prompt": "short visual description for image sourcing"
}
Rules:
- Use "2d" for concept/diagram moments (illustrations, icons work well)
- Use "ai" for emotional/human/unique moments needing a generated image
- Use "stock" for realistic real-world reference moments
- Keep visual_prompt under 12 words
- mood should reflect the pacing: transition (moving to new idea), reveal (introducing new info), emphasis (key insight), ambient (reflective/quiet)`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: script }],
    }),
  });

  const data = await response.json();
  const textBlock = data.content?.find((c) => c.type === "text");
  if (!textBlock) throw new Error("No text response from Claude for scene breakdown");

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
