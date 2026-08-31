# Script-to-slides pipeline (MVP)

This is the backend skeleton for: script -> scene breakdown -> visual
sourcing (2D / AI / stock) -> futuristic style pass -> animation
templates -> matched SFX -> render manifest.

It does NOT run ffmpeg for you yet (video rendering is heavy - better
run on a proper server than tested locally first). Instead it returns
a JSON "manifest" describing exactly what a render step would need,
so you can validate the full pipeline logic before wiring up
rendering.

## Setup

1. `cd video-pipeline`
2. `npm install`
3. `cp .env.example .env` and fill in your API keys:
   - `ANTHROPIC_API_KEY` - required, powers scene breakdown
   - `PEXELS_API_KEY` - free tier, for stock photos
   - `STABILITY_API_KEY` - free tier, for AI-generated images (swap for
     whichever provider you pick)
4. `npm start`

Server runs on `http://localhost:3000` by default.

## Using it from your tablet

Run the server on a machine on your network (or deploy it to a free
tier host like Render/Railway/Fly.io), then open a browser on your
tablet and point a simple frontend at:

```
POST http://<server-address>:3000/api/generate
Content-Type: application/json

{ "script": "your full script text here" }
```

You'll get back a JSON manifest with every scene tagged: its
narration text, sourced visual, animation template, and matched SFX.

## What's a placeholder vs real

- **Scene breakdown**: real, calls Claude API directly
- **Stock photos**: real, calls Pexels API directly
- **AI images**: real shape, but swap `STABILITY_API_KEY` logic for
  whichever image API you settle on - the free-tier landscape changes
  often, so check current options before committing
- **2D visuals**: placeholder - wire this up to unDraw/Freepik or your
  own curated asset folder
- **SFX file paths**: placeholders - download your curated SFX set from
  Pixabay Audio/Mixkit and host them at the paths in `sfxTags.js`
- **Actual video rendering**: not implemented - `renderManifest.js`
  shows the shape of an ffmpeg command per scene, but stitching a full
  video (concat, audio mixing, transitions) is the next piece to build
  once you've confirmed the manifest logic works end to end

## Suggested next step

Test with one short script first. Check that:
1. Scene breakdown tags make sense (visual_type / mood per scene)
2. Sourced visuals actually match the scene content
3. Animation + SFX assignments feel right for the mood

Then move on to wiring up real ffmpeg rendering.
