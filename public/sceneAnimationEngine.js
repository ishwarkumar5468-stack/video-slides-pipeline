/**
 * Scene Animation Engine
 * Real-time 60 FPS animated character, doodle & atmospheric scene renderer for kinetic video slides.
 * Renders procedural visuals:
 * - Doodle & Whiteboard (Hand-drawn lightbulb, rotating sketch gears, animated arrows, thinker doodle, highlighter marks)
 * - Minimal White Studio (Clean modern gallery layout, architectural crosshairs, minimalist geometric wireframes)
 * - Papercraft Notebook (Ruled pages, doodle clips, sticky notes)
 * - Rain & Window Glass Pane with Boy / Character Silhouette Looking Outside
 * - Cyberpunk Car with Neon Headlights, Wet Asphalt & Character Stance
 * - Deep Space Floating Astronaut & Planetary Nebula
 * - Matrix Terminal Hacker with Cascading Code Streams
 * - Nature Sunset & Mountain Horizon Silhouette
 * - Quantum Particle & Cyber Telemetry Core
 */

class SceneAnimationEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;
    this.activeType = "doodle_whiteboard"; // 'doodle_whiteboard' | 'minimal_white' | 'papercraft_notebook' | 'rain_window' | 'cyber_car' | 'astronaut_space' | 'matrix_terminal' | 'nature_sunset' | 'quantum_core'
    this.customPrompt = "";
    this.time = 0;
    this.weatherIntensity = 1.0;
    this.characterVisible = true;
    this.particles = [];
    this.raindrops = [];
    this.matrixGlyphs = [];
    this.stars = [];
    this.doodleStars = [];
    this.isEnabled = true;
    this.opacity = 0.90;

    this.init();
  }

  init() {
    this.canvas = document.getElementById("stage-scene-canvas");
    if (!this.canvas) {
      const stage = document.getElementById("kinetic-stage");
      if (stage) {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "stage-scene-canvas";
        this.canvas.className = "absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 z-[1]";
        this.canvas.style.opacity = String(this.opacity);
        const videoEl = document.getElementById("stage-bg-video");
        if (videoEl && videoEl.nextSibling) {
          stage.insertBefore(this.canvas, videoEl.nextSibling);
        } else {
          stage.prepend(this.canvas);
        }
      }
    }

    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.handleResize();
      window.addEventListener("resize", () => this.handleResize());
    }

    this.initParticleSystems();
    this.startLoop();
  }

  handleResize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = (rect.width || 400) * dpr;
    this.canvas.height = (rect.height || 700) * dpr;
  }

  initParticleSystems() {
    // 1. Raindrops for Rain & Window
    this.raindrops = [];
    for (let i = 0; i < 70; i++) {
      this.raindrops.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.015 + Math.random() * 0.025,
        len: 0.03 + Math.random() * 0.05,
        thickness: 0.8 + Math.random() * 1.5,
        alpha: 0.3 + Math.random() * 0.5,
        isGlassTrickle: i % 4 === 0,
        trickleSpeed: 0.002 + Math.random() * 0.005,
        size: 2 + Math.random() * 3
      });
    }

    // 2. Stars for Deep Space
    this.stars = [];
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.5 + Math.random() * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.05,
        alpha: 0.2 + Math.random() * 0.8,
        color: i % 5 === 0 ? "#38bdf8" : i % 7 === 0 ? "#f43f5e" : "#ffffff"
      });
    }

    // 3. Doodle floating sparkles
    this.doodleStars = [];
    for (let i = 0; i < 20; i++) {
      this.doodleStars.push({
        x: Math.random(),
        y: Math.random(),
        size: 8 + Math.random() * 14,
        speed: 0.0008 + Math.random() * 0.0015,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        rot: Math.random() * Math.PI * 2,
        alpha: 0.4 + Math.random() * 0.5,
        color: i % 3 === 0 ? "#eab308" : i % 3 === 1 ? "#06b6d4" : "#f43f5e"
      });
    }

    // 4. Matrix Glyphs
    this.matrixGlyphs = [];
    const cols = 24;
    for (let c = 0; c < cols; c++) {
      this.matrixGlyphs.push({
        col: c / cols,
        y: Math.random(),
        speed: 0.005 + Math.random() * 0.012,
        chars: "010101XYZΩλπµ$#@!&%<>".split(""),
        leadChar: "1"
      });
    }

    // 5. Floating atmospheric particles
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.001,
        vy: -0.0005 - Math.random() * 0.001,
        size: 1.5 + Math.random() * 3.5,
        alpha: 0.2 + Math.random() * 0.6,
        hue: Math.floor(Math.random() * 60) + 180
      });
    }
  }

  setVisualScene(type, options = {}) {
    this.activeType = type || "doodle_whiteboard";
    if (options.prompt) this.customPrompt = options.prompt;
    if (options.characterVisible !== undefined) this.characterVisible = options.characterVisible;
    if (options.opacity !== undefined) {
      this.opacity = options.opacity;
      if (this.canvas) this.canvas.style.opacity = String(this.opacity);
    }
  }

  determineSceneTypeFromText(text) {
    if (!text) return "doodle_whiteboard";
    const l = text.toLowerCase();
    
    if (l.includes("doodle") || l.includes("sketch") || l.includes("whiteboard") || l.includes("drawing") || l.includes("explain") || l.includes("habit") || l.includes("idea") || l.includes("simple") || l.includes("learn") || l.includes("concept") || l.includes("how to")) {
      return "doodle_whiteboard";
    }
    if (l.includes("clean") || l.includes("minimal") || l.includes("white studio") || l.includes("modern") || l.includes("magazine") || l.includes("design") || l.includes("architecture")) {
      return "minimal_white";
    }
    if (l.includes("notebook") || l.includes("paper") || l.includes("journal") || l.includes("notes") || l.includes("book")) {
      return "papercraft_notebook";
    }
    if (l.includes("rain") || l.includes("window") || l.includes("reflection") || l.includes("droplet") || l.includes("glass") || l.includes("standing near the window") || l.includes("storm") || l.includes("look out")) {
      return "rain_window";
    }
    if (l.includes("car") || l.includes("vehicle") || l.includes("drive") || l.includes("speed") || l.includes("neon city") || l.includes("cyberpunk") || l.includes("street") || l.includes("highway")) {
      return "cyber_car";
    }
    if (l.includes("space") || l.includes("star") || l.includes("planet") || l.includes("astronaut") || l.includes("orbit") || l.includes("mars") || l.includes("galaxy") || l.includes("cosmic")) {
      return "astronaut_space";
    }
    if (l.includes("code") || l.includes("hacker") || l.includes("terminal") || l.includes("matrix") || l.includes("cyber") || l.includes("algorithm") || l.includes("software") || l.includes("security")) {
      return "matrix_terminal";
    }
    if (l.includes("sunset") || l.includes("nature") || l.includes("mountain") || l.includes("meditation") || l.includes("focus") || l.includes("morning") || l.includes("calm")) {
      return "nature_sunset";
    }
    if (l.includes("quantum") || l.includes("physics") || l.includes("energy") || l.includes("neural") || l.includes("atom")) {
      return "quantum_core";
    }
    return "doodle_whiteboard";
  }

  updateFromScene(scene, promptHint = "") {
    if (!scene) return;
    const text = (scene.narration || "") + " " + (scene.videoQuery || "") + " " + (promptHint || "") + " " + (this.customPrompt || "");
    const type = scene.sceneVisualType || this.determineSceneTypeFromText(text);
    this.setVisualScene(type, { prompt: text });
  }

  startLoop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    const animate = () => {
      this.time += 0.016;
      if (this.isEnabled && this.canvas && this.ctx) {
        this.renderFrame(this.ctx, this.canvas.width, this.canvas.height, this.time);
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  renderFrame(ctx, w, h, t) {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    switch (this.activeType) {
      case "doodle_whiteboard":
        this.drawDoodleWhiteboardScene(ctx, w, h, t);
        break;
      case "minimal_white":
        this.drawMinimalWhiteStudioScene(ctx, w, h, t);
        break;
      case "papercraft_notebook":
        this.drawPapercraftNotebookScene(ctx, w, h, t);
        break;
      case "rain_window":
        this.drawRainWindowScene(ctx, w, h, t);
        break;
      case "cyber_car":
        this.drawCyberCarScene(ctx, w, h, t);
        break;
      case "astronaut_space":
        this.drawAstronautSpaceScene(ctx, w, h, t);
        break;
      case "matrix_terminal":
        this.drawMatrixTerminalScene(ctx, w, h, t);
        break;
      case "nature_sunset":
        this.drawNatureSunsetScene(ctx, w, h, t);
        break;
      case "quantum_core":
        this.drawQuantumCoreScene(ctx, w, h, t);
        break;
      default:
        this.drawDoodleWhiteboardScene(ctx, w, h, t);
        break;
    }
  }

  // Line boil wobble helper for organic hand-drawn sketch aesthetic
  wobble(val, freq = 8, amp = 1.8, seed = 0) {
    return val + Math.sin(this.time * freq + seed) * amp;
  }

  // -------------------------------------------------------------
  // 1. DOODLE & WHITEBOARD HAND-DRAWN SKETCH SCENE
  // -------------------------------------------------------------
  drawDoodleWhiteboardScene(ctx, w, h, t) {
    const scale = w / 400;

    // 1. Crisp White / Cream Paper Background with subtle dot grid
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Subtle Dot Grid (Notebook / Whiteboard Style)
    ctx.fillStyle = "rgba(100, 116, 139, 0.15)";
    const dotSpacing = 24 * scale;
    for (let x = dotSpacing; x < w; x += dotSpacing) {
      for (let y = dotSpacing; y < h; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Hand-Drawn Animated Lightbulb (Top Left / Idea Pop)
    const bulbX = w * 0.18;
    const bulbY = h * 0.16;
    const bulbScale = 1.0 * scale;

    // Pulsing warm yellow glow halo
    const glowRadius = (28 + Math.sin(t * 5) * 6) * scale;
    const glowGrad = ctx.createRadialGradient(bulbX, bulbY, 0, bulbX, bulbY, glowRadius);
    glowGrad.addColorStop(0, "rgba(253, 224, 71, 0.7)");
    glowGrad.addColorStop(1, "rgba(253, 224, 71, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Hand-drawn sketch bulb glass body (with organic wobble)
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 3.2 * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.arc(this.wobble(bulbX, 6, 1.2, 1), this.wobble(bulbY, 6, 1.2, 2), 16 * bulbScale, 0.25 * Math.PI, 0.75 * Math.PI, true);
    ctx.lineTo(bulbX - 7 * bulbScale, bulbY + 16 * bulbScale);
    ctx.lineTo(bulbX + 7 * bulbScale, bulbY + 16 * bulbScale);
    ctx.closePath();
    ctx.stroke();

    // Glowing Filament (M-shape / Loop)
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2.4 * scale;
    ctx.beginPath();
    ctx.moveTo(bulbX - 5 * bulbScale, bulbY + 12 * bulbScale);
    ctx.lineTo(bulbX - 3 * bulbScale, bulbY - 3 * bulbScale);
    ctx.lineTo(bulbX, bulbY + 2 * bulbScale);
    ctx.lineTo(bulbX + 3 * bulbScale, bulbY - 3 * bulbScale);
    ctx.lineTo(bulbX + 5 * bulbScale, bulbY + 12 * bulbScale);
    ctx.stroke();

    // Screw base & contact point
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2.8 * scale;
    for (let b = 0; b < 3; b++) {
      ctx.beginPath();
      ctx.moveTo(bulbX - 6 * bulbScale, bulbY + (19 + b * 4) * bulbScale);
      ctx.lineTo(bulbX + 6 * bulbScale, bulbY + (19 + b * 4) * bulbScale);
      ctx.stroke();
    }

    // Radiating Idea Sparks (Shooting rays)
    const rayCount = 6;
    for (let r = 0; r < rayCount; r++) {
      const angle = (r / rayCount) * Math.PI * 1.5 - Math.PI * 0.75;
      const rayLen = (8 + Math.sin(t * 8 + r) * 4) * scale;
      const rx1 = bulbX + Math.cos(angle) * (22 * scale);
      const ry1 = bulbY + Math.sin(angle) * (22 * scale);
      const rx2 = bulbX + Math.cos(angle) * (22 * scale + rayLen);
      const ry2 = bulbY + Math.sin(angle) * (22 * scale + rayLen);

      ctx.strokeStyle = r % 2 === 0 ? "#f59e0b" : "#38bdf8";
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(rx1, ry1);
      ctx.lineTo(rx2, ry2);
      ctx.stroke();
    }

    // 3. Rotating Hand-Drawn Sketch Gears (Top Right)
    this.drawHandDrawnGear(ctx, w * 0.82, h * 0.15, 20 * scale, t * 1.2, "#0284c7", scale);
    this.drawHandDrawnGear(ctx, w * 0.82 + 28 * scale, h * 0.15 + 24 * scale, 15 * scale, -t * 1.6, "#f43f5e", scale);

    // 4. Floating Doodle Stars & Scribble Sparkles
    this.doodleStars.forEach((star, idx) => {
      star.y -= star.speed;
      if (star.y < 0) { star.y = 1.05; star.x = Math.random(); }
      star.rot += star.rotationSpeed;

      const sx = star.x * w;
      const sy = star.y * h;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(star.rot);
      ctx.strokeStyle = star.color;
      ctx.lineWidth = 2.0 * scale;
      ctx.globalAlpha = star.alpha;

      // 4-point star doodle
      const sSize = star.size * scale;
      ctx.beginPath();
      ctx.moveTo(0, -sSize);
      ctx.quadraticCurveTo(0, 0, sSize, 0);
      ctx.quadraticCurveTo(0, 0, 0, sSize);
      ctx.quadraticCurveTo(0, 0, -sSize, 0);
      ctx.quadraticCurveTo(0, 0, 0, -sSize);
      ctx.stroke();
      ctx.restore();
    });

    // 5. Curving Hand-Drawn Arrow (Pointing to central topic/glow phrase)
    const arrowStartX = w * 0.12;
    const arrowStartY = h * 0.44;
    const arrowEndX = w * 0.28;
    const arrowEndY = h * 0.52;

    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 3.0 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(arrowStartX, arrowStartY);
    ctx.quadraticCurveTo(arrowStartX + 20 * scale, arrowStartY + 45 * scale, arrowEndX, arrowEndY);
    ctx.stroke();

    // Arrowhead
    const aAngle = Math.atan2(arrowEndY - (arrowStartY + 35 * scale), arrowEndX - (arrowStartX + 10 * scale));
    ctx.beginPath();
    ctx.moveTo(arrowEndX, arrowEndY);
    ctx.lineTo(arrowEndX - 10 * scale * Math.cos(aAngle - 0.5), arrowEndY - 10 * scale * Math.sin(aAngle - 0.5));
    ctx.moveTo(arrowEndX, arrowEndY);
    ctx.lineTo(arrowEndX - 10 * scale * Math.cos(aAngle + 0.5), arrowEndY - 10 * scale * Math.sin(aAngle + 0.5));
    ctx.stroke();

    // 6. Character / Boy Thinker Doodle (Bottom Right)
    if (this.characterVisible) {
      this.drawBoyThinkerDoodle(ctx, w * 0.82, h * 0.82, scale, t);
    }

    // 7. Highlighter Marker Underline Sweep & Hand-drawn Bracket Box
    const boxX = w * 0.08;
    const boxY = h * 0.38;
    const boxW = w * 0.84;
    const boxH = h * 0.24;

    // Semi-transparent yellow marker highlight swath
    ctx.fillStyle = "rgba(254, 240, 138, 0.45)";
    ctx.beginPath();
    ctx.roundRect(boxX, boxY + boxH * 0.72, boxW * 0.65, 14 * scale, 4 * scale);
    ctx.fill();

    // Subtle Hand-Drawn Corner Brackets
    ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
    ctx.lineWidth = 2.4 * scale;
    const bLen = 14 * scale;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + bLen);
    ctx.lineTo(boxX, boxY);
    ctx.lineTo(boxX + bLen, boxY);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW - bLen, boxY);
    ctx.lineTo(boxX + boxW, boxY);
    ctx.lineTo(boxX + boxW, boxY + bLen);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW, boxY + boxH - bLen);
    ctx.lineTo(boxX + boxW, boxY + boxH);
    ctx.lineTo(boxX + boxW - bLen, boxY + boxH);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(boxX + bLen, boxY + boxH);
    ctx.lineTo(boxX, boxY + boxH);
    ctx.lineTo(boxX, boxY + boxH - bLen);
    ctx.stroke();
  }

  // Draw cute hand-drawn gear with organic wobble
  drawHandDrawnGear(ctx, cx, cy, radius, rot, color, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6 * scale;
    ctx.lineCap = "round";

    const teeth = 8;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.4) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.6) / teeth) * Math.PI * 2;
      const a4 = ((i + 1) / teeth) * Math.PI * 2;

      const rInner = radius * 0.78;
      const rOuter = radius * 1.15;

      ctx.lineTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
      ctx.lineTo(Math.cos(a3) * rOuter, Math.sin(a3) * rOuter);
      ctx.lineTo(Math.cos(a4) * rInner, Math.sin(a4) * rInner);
    }
    ctx.closePath();
    ctx.stroke();

    // Center axle hole
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw cute hand-drawn boy thinker doodle
  drawBoyThinkerDoodle(ctx, cx, cy, scale, t) {
    const headRadius = 18 * scale;
    const breathe = Math.sin(t * 3) * (1.5 * scale);
    const eyeBlink = Math.sin(t * 1.5) > 0.94 ? 0.2 : 1.0;

    ctx.save();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 3.0 * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. Head circle with organic sketch line
    ctx.beginPath();
    ctx.arc(cx, cy - 35 * scale + breathe, headRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Messy Cool Hair doodle
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(cx - 18 * scale, cy - 40 * scale + breathe);
    ctx.quadraticCurveTo(cx - 10 * scale, cy - 62 * scale + breathe, cx, cy - 54 * scale + breathe);
    ctx.quadraticCurveTo(cx + 10 * scale, cy - 64 * scale + breathe, cx + 18 * scale, cy - 40 * scale + breathe);
    ctx.quadraticCurveTo(cx + 6 * scale, cy - 46 * scale + breathe, cx, cy - 46 * scale + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Expressive Glasses & Eyes
    // Left Glass
    ctx.beginPath();
    ctx.arc(cx - 6 * scale, cy - 34 * scale + breathe, 5.5 * scale, 0, Math.PI * 2);
    ctx.stroke();
    // Right Glass
    ctx.beginPath();
    ctx.arc(cx + 6 * scale, cy - 34 * scale + breathe, 5.5 * scale, 0, Math.PI * 2);
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(cx - 1 * scale, cy - 34 * scale + breathe);
    ctx.lineTo(cx + 1 * scale, cy - 34 * scale + breathe);
    ctx.stroke();

    // Pupils (Blinking)
    if (eyeBlink > 0.5) {
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(cx - 6 * scale, cy - 34 * scale + breathe, 2.0 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 6 * scale, cy - 34 * scale + breathe, 2.0 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smiling / Thoughtful Mouth
    ctx.beginPath();
    ctx.arc(cx, cy - 26 * scale + breathe, 4 * scale, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // 4. Body / Hoodie Doodle
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, cy - 17 * scale + breathe);
    ctx.lineTo(cx - 24 * scale, cy + 30 * scale);
    ctx.lineTo(cx + 24 * scale, cy + 30 * scale);
    ctx.lineTo(cx + 12 * scale, cy - 17 * scale + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. Hand holding a sketch pencil
    const handX = cx - 18 * scale;
    const handY = cy - 4 * scale + breathe;
    ctx.strokeStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(handX, handY, 4.5 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Pencil
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(-0.6 + Math.sin(t * 4) * 0.15);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(0, -3 * scale, 22 * scale, 6 * scale);
    ctx.strokeRect(0, -3 * scale, 22 * scale, 6 * scale);
    // Tip
    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.moveTo(22 * scale, -3 * scale);
    ctx.lineTo(28 * scale, 0);
    ctx.lineTo(22 * scale, 3 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Lead
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(26 * scale, -1.2 * scale);
    ctx.lineTo(28 * scale, 0);
    ctx.lineTo(26 * scale, 1.2 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 2. CLEAN MINIMAL WHITE STUDIO SCENE
  // -------------------------------------------------------------
  drawMinimalWhiteStudioScene(ctx, w, h, t) {
    const scale = w / 400;

    // Gallery clean off-white background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);

    // Architectural subtle coordinate grid lines
    ctx.strokeStyle = "rgba(15, 23, 42, 0.06)";
    ctx.lineWidth = 1.0 * scale;

    const gridGap = 40 * scale;
    for (let x = 0; x < w; x += gridGap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridGap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Rotating Minimal Geometric Wireframe Ring (Center)
    ctx.save();
    ctx.translate(w * 0.5, h * 0.45);
    ctx.rotate(t * 0.4);

    ctx.strokeStyle = "rgba(99, 102, 241, 0.35)";
    ctx.lineWidth = 1.6 * scale;
    ctx.beginPath();
    ctx.arc(0, 0, 70 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Minimal Axis Crosshairs
    ctx.strokeStyle = "rgba(15, 23, 42, 0.3)";
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(-85 * scale, 0);
    ctx.lineTo(85 * scale, 0);
    ctx.moveTo(0, -85 * scale);
    ctx.lineTo(0, 85 * scale);
    ctx.stroke();

    // Floating orbital nodes
    const nodeAngle = t * 1.5;
    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.arc(Math.cos(nodeAngle) * 70 * scale, Math.sin(nodeAngle) * 70 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Top Right Minimal Studio Stamp
    ctx.fillStyle = "#0f172a";
    ctx.font = `bold ${10 * scale}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText("STUDIO // MINIMAL v3.0", w * 0.62, h * 0.08);

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(w * 0.62, h * 0.09);
    ctx.lineTo(w * 0.92, h * 0.09);
    ctx.stroke();
  }

  // -------------------------------------------------------------
  // 3. PAPERCRAFT NOTEBOOK SCENE
  // -------------------------------------------------------------
  drawPapercraftNotebookScene(ctx, w, h, t) {
    const scale = w / 400;

    // Warm cream notebook page
    ctx.fillStyle = "#faf8f5";
    ctx.fillRect(0, 0, w, h);

    // Blue ruled notebook horizontal lines
    ctx.strokeStyle = "rgba(59, 130, 246, 0.18)";
    ctx.lineWidth = 1.2 * scale;
    const lineSpacing = 28 * scale;
    for (let y = lineSpacing * 2; y < h; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Red margin vertical line
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 2.0 * scale;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, 0);
    ctx.lineTo(w * 0.12, h);
    ctx.stroke();

    // Sticky Note Callout Box (Top Right)
    const noteX = w * 0.64;
    const noteY = h * 0.10;
    const noteW = w * 0.28;
    const noteH = h * 0.14;

    ctx.save();
    ctx.translate(noteX + noteW / 2, noteY + noteH / 2);
    ctx.rotate(0.04);
    ctx.fillStyle = "#fef08a"; // Yellow sticky note
    ctx.fillRect(-noteW / 2, -noteH / 2, noteW, noteH);

    // Tape strip on top
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillRect(-noteW * 0.3, -noteH / 2 - 4 * scale, noteW * 0.6, 8 * scale);

    ctx.fillStyle = "#854d0e";
    ctx.font = `bold ${10 * scale}px 'Caveat', cursive, sans-serif`;
    ctx.fillText("✨ Key Insight!", -noteW / 2 + 10 * scale, -noteH / 2 + 20 * scale);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // 4. RAIN & WINDOW WITH CHARACTER SILHOUETTE
  // -------------------------------------------------------------
  drawRainWindowScene(ctx, w, h, t) {
    const scale = w / 400;

    // 1. Background City Skyline & Neon Bokeh through Rain
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, "#080b18");
    skyGrad.addColorStop(0.5, "#0d1329");
    skyGrad.addColorStop(1, "#03050c");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // City Silhouettes in distance
    ctx.fillStyle = "rgba(10, 16, 35, 0.9)";
    const bldCount = 8;
    for (let i = 0; i < bldCount; i++) {
      const bx = (i / bldCount) * w;
      const bw = (w / bldCount) * 1.1;
      const bh = h * (0.35 + Math.sin(i * 1.5) * 0.15);
      ctx.fillRect(bx, h - bh, bw, bh);

      if (i % 2 === 0) {
        ctx.strokeStyle = "rgba(244, 63, 94, 0.8)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.5, h - bh);
        ctx.lineTo(bx + bw * 0.5, h - bh - 20 * scale);
        ctx.stroke();

        const blink = Math.sin(t * 4 + i) > 0 ? 0.9 : 0.2;
        ctx.fillStyle = `rgba(244, 63, 94, ${blink})`;
        ctx.beginPath();
        ctx.arc(bx + bw * 0.5, h - bh - 20 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Blurred Bokeh lights
    const bokehColors = ["rgba(56, 189, 248, 0.25)", "rgba(244, 63, 94, 0.25)", "rgba(168, 85, 247, 0.25)", "rgba(251, 191, 36, 0.25)"];
    for (let i = 0; i < 12; i++) {
      const bx = (Math.sin(i * 99 + t * 0.1) * 0.5 + 0.5) * w;
      const by = (Math.cos(i * 33 + t * 0.08) * 0.3 + 0.55) * h;
      const rad = (15 + Math.sin(t * 2 + i) * 5) * scale;
      ctx.fillStyle = bokehColors[i % bokehColors.length];
      ctx.beginPath();
      ctx.arc(bx, by, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Falling Rain Streaks & Glass Trickle Droplets
    this.raindrops.forEach((drop) => {
      drop.y += drop.speed;
      if (drop.y > 1.1) {
        drop.y = -0.1;
        drop.x = Math.random();
      }

      const rx = drop.x * w;
      const ry = drop.y * h;

      if (drop.isGlassTrickle) {
        ctx.fillStyle = `rgba(186, 230, 253, ${drop.alpha})`;
        ctx.beginPath();
        ctx.arc(rx, ry, drop.size * scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(224, 242, 254, ${drop.alpha})`;
        ctx.lineWidth = drop.thickness * scale;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8 * scale, ry + drop.len * h);
        ctx.stroke();
      }
    });

    // 3. Window Pane Frame Lines
    ctx.strokeStyle = "rgba(15, 23, 42, 0.75)";
    ctx.lineWidth = 8 * scale;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.moveTo(0, h * 0.48);
    ctx.lineTo(w, h * 0.48);
    ctx.stroke();

    // 4. Character Silhouette (Looking Out The Window)
    if (this.characterVisible) {
      const charX = w * 0.72;
      const charY = h * 0.88;
      const breathe = Math.sin(t * 2.5) * (2 * scale);

      ctx.fillStyle = "#050814";

      // Head
      ctx.beginPath();
      ctx.arc(charX, charY - 80 * scale + breathe, 22 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Hair silhouette looking leftwards at window
      ctx.beginPath();
      ctx.arc(charX - 4 * scale, charY - 86 * scale + breathe, 23 * scale, Math.PI * 0.8, Math.PI * 1.9);
      ctx.fill();

      // Shoulders & Body
      ctx.beginPath();
      ctx.ellipse(charX, charY + breathe, 45 * scale, 75 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Arm resting on window sill
      ctx.beginPath();
      ctx.roundRect(charX - 55 * scale, charY - 20 * scale + breathe, 65 * scale, 16 * scale, 8 * scale);
      ctx.fill();
    }
  }

  // -------------------------------------------------------------
  // 5. CYBERPUNK CAR & NEON CITY
  // -------------------------------------------------------------
  drawCyberCarScene(ctx, w, h, t) {
    const scale = w / 400;

    // Dark cyberpunk gradient sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#090514");
    sky.addColorStop(0.6, "#18092a");
    sky.addColorStop(1, "#030206");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Wet asphalt ground reflection
    const roadY = h * 0.65;
    ctx.fillStyle = "#0a0712";
    ctx.fillRect(0, 0, w, h);

    // Neon underglow
    const carX = w * 0.5;
    const carY = h * 0.72;
    const glow = ctx.createRadialGradient(carX, carY + 30 * scale, 0, carX, carY + 30 * scale, 120 * scale);
    glow.addColorStop(0, "rgba(236, 72, 153, 0.75)");
    glow.addColorStop(1, "rgba(236, 72, 153, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, roadY, w, h - roadY);

    // Sports car body silhouette
    ctx.fillStyle = "#0d1117";
    ctx.beginPath();
    ctx.moveTo(carX - 110 * scale, carY + 25 * scale);
    ctx.lineTo(carX - 95 * scale, carY - 5 * scale);
    ctx.lineTo(carX - 45 * scale, carY - 20 * scale);
    ctx.lineTo(carX + 50 * scale, carY - 20 * scale);
    ctx.lineTo(carX + 105 * scale, carY + 10 * scale);
    ctx.lineTo(carX + 115 * scale, carY + 25 * scale);
    ctx.closePath();
    ctx.fill();

    // Twin Cyan Headlights Beam
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(carX - 85 * scale, carY + 5 * scale);
    ctx.lineTo(carX - 45 * scale, carY + 5 * scale);
    ctx.stroke();

    // Beam cone
    const beamGrad = ctx.createRadialGradient(carX - 65 * scale, carY + 5 * scale, 0, carX - 140 * scale, carY + 50 * scale, 140 * scale);
    beamGrad.addColorStop(0, "rgba(56, 189, 248, 0.6)");
    beamGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(carX - 85 * scale, carY + 5 * scale);
    ctx.lineTo(carX - 220 * scale, carY + 80 * scale);
    ctx.lineTo(carX - 45 * scale, carY + 80 * scale);
    ctx.closePath();
    ctx.fill();
  }

  // -------------------------------------------------------------
  // 6. DEEP SPACE ASTRONAUT SCENE
  // -------------------------------------------------------------
  drawAstronautSpaceScene(ctx, w, h, t) {
    const scale = w / 400;

    // Space Deep Black
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, w, h);

    // Stars
    this.stars.forEach((s) => {
      const alpha = s.alpha * (0.6 + Math.sin(t * 4 + s.twinkleSpeed * 100) * 0.4);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Glowing Nebula
    const nebX = w * 0.3;
    const nebY = h * 0.25;
    const nebGrad = ctx.createRadialGradient(nebX, nebY, 0, nebX, nebY, 140 * scale);
    nebGrad.addColorStop(0, "rgba(168, 85, 247, 0.45)");
    nebGrad.addColorStop(0.6, "rgba(59, 130, 246, 0.2)");
    nebGrad.addColorStop(1, "rgba(3, 7, 18, 0)");
    ctx.fillStyle = nebGrad;
    ctx.beginPath();
    ctx.arc(nebX, nebY, 140 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Floating Astronaut
    const astroX = w * 0.5 + Math.sin(t * 0.8) * (12 * scale);
    const astroY = h * 0.68 + Math.cos(t * 0.6) * (14 * scale);

    // Helmet
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(astroX, astroY - 35 * scale, 22 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Visor Golden Glint
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.ellipse(astroX, astroY - 35 * scale, 14 * scale, 9 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Suit Body
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.roundRect(astroX - 25 * scale, astroY - 10 * scale, 50 * scale, 60 * scale, 12 * scale);
    ctx.fill();
  }

  // -------------------------------------------------------------
  // 7. MATRIX TERMINAL SCENE
  // -------------------------------------------------------------
  drawMatrixTerminalScene(ctx, w, h, t) {
    const scale = w / 400;
    ctx.fillStyle = "#020b06";
    ctx.fillRect(0, 0, w, h);

    ctx.font = `${11 * scale}px monospace`;
    this.matrixGlyphs.forEach((g) => {
      g.y += g.speed;
      if (g.y > 1.1) g.y = -0.1;

      const gx = g.col * w;
      const gy = g.y * h;

      ctx.fillStyle = "#10b981";
      ctx.fillText(g.leadChar, gx, gy);

      for (let k = 1; k < 6; k++) {
        ctx.fillStyle = `rgba(16, 185, 129, ${0.8 - k * 0.14})`;
        ctx.fillText(g.chars[(k + Math.floor(t * 10)) % g.chars.length], gx, gy - k * 14 * scale);
      }
    });
  }

  // -------------------------------------------------------------
  // 8. NATURE SUNSET SCENE
  // -------------------------------------------------------------
  drawNatureSunsetScene(ctx, w, h, t) {
    const scale = w / 400;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#f97316");
    sky.addColorStop(0.4, "#ec4899");
    sky.addColorStop(0.8, "#3b0764");
    sky.addColorStop(1, "#090114");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Glowing Golden Sun
    const sunX = w * 0.5;
    const sunY = h * 0.45;
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 38 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Mountain Ridges
    ctx.fillStyle = "#1e1035";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(w * 0.35, h * 0.52);
    ctx.lineTo(w * 0.7, h * 0.62);
    ctx.lineTo(w, h * 0.48);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }

  // -------------------------------------------------------------
  // 9. QUANTUM CORE SCENE
  // -------------------------------------------------------------
  drawQuantumCoreScene(ctx, w, h, t) {
    const scale = w / 400;
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;

    // Glowing core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * scale);
    coreGrad.addColorStop(0, "#38bdf8");
    coreGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.4)");
    coreGrad.addColorStop(1, "rgba(3, 7, 18, 0)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 80 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Orbital quantum rings
    for (let r = 0; r < 3; r++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * (0.8 + r * 0.4) + (r * Math.PI) / 3);
      ctx.strokeStyle = r === 0 ? "#38bdf8" : r === 1 ? "#ec4899" : "#a855f7";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, 75 * scale, 30 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

window.sceneAnimationEngine = new SceneAnimationEngine();
