/**
 * Scene Animation Engine
 * Real-time 60 FPS animated character & atmospheric scene renderer for kinetic video slides.
 * Renders procedural atmospheric elements:
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
    this.activeType = "rain_window"; // 'rain_window', 'cyber_car', 'astronaut_space', 'matrix_terminal', 'nature_sunset', 'quantum_core', 'abstract_particles'
    this.customPrompt = "";
    this.time = 0;
    this.weatherIntensity = 1.0;
    this.characterVisible = true;
    this.particles = [];
    this.raindrops = [];
    this.matrixGlyphs = [];
    this.stars = [];
    this.isEnabled = true;
    this.opacity = 0.85;

    this.init();
  }

  init() {
    this.canvas = document.getElementById("stage-scene-canvas");
    if (!this.canvas) {
      // Find or attach canvas into kinetic-stage
      const stage = document.getElementById("kinetic-stage");
      if (stage) {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "stage-scene-canvas";
        this.canvas.className = "absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 z-[1]";
        this.canvas.style.opacity = String(this.opacity);
        // Insert right after video layer before overlay
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
        // Glass trickle droplets
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

    // 3. Matrix Glyphs
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

    // 4. Floating atmospheric particles
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
    this.activeType = type || "rain_window";
    if (options.prompt) this.customPrompt = options.prompt;
    if (options.characterVisible !== undefined) this.characterVisible = options.characterVisible;
    if (options.opacity !== undefined) {
      this.opacity = options.opacity;
      if (this.canvas) this.canvas.style.opacity = String(this.opacity);
    }
  }

  // Deduce best animated scene type from prompt text or scene object
  determineSceneTypeFromText(text) {
    if (!text) return "rain_window";
    const l = text.toLowerCase();
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
    if (l.includes("sunset") || l.includes("nature") || l.includes("mountain") || l.includes("habit") || l.includes("meditation") || l.includes("focus") || l.includes("morning") || l.includes("calm")) {
      return "nature_sunset";
    }
    if (l.includes("quantum") || l.includes("ai") || l.includes("physics") || l.includes("energy") || l.includes("neural") || l.includes("atom")) {
      return "quantum_core";
    }
    return "rain_window";
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
        this.drawRainWindowScene(ctx, w, h, t);
        break;
    }
  }

  // -------------------------------------------------------------
  // 1. RAIN & WINDOW WITH BOY / CHARACTER SILHOUETTE
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

      // Blinking antenna towers
      if (i % 2 === 0) {
        ctx.strokeStyle = "rgba(244, 63, 94, 0.8)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.5, h - bh);
        ctx.lineTo(bx + bw * 0.5, h - bh - 20 * scale);
        ctx.stroke();

        // Beacon light
        const blink = Math.sin(t * 4 + i) > 0 ? 0.9 : 0.2;
        ctx.fillStyle = `rgba(244, 63, 94, ${blink})`;
        ctx.beginPath();
        ctx.arc(bx + bw * 0.5, h - bh - 20 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Glowing Neon Bokeh Orbs in Background (blurred city streetlights)
    const bokehColors = ["rgba(244,63,94,0.3)", "rgba(56,189,248,0.35)", "rgba(251,191,36,0.3)", "rgba(168,85,247,0.35)"];
    for (let b = 0; b < 12; b++) {
      const bx = ((b * 73 + t * 4) % w);
      const by = h * 0.45 + (Math.sin(b * 2) * h * 0.2);
      const br = (15 + Math.sin(b + t) * 8) * scale;
      const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bGrad.addColorStop(0, bokehColors[b % bokehColors.length]);
      bGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Falling Rain Streaks (Outside window)
    ctx.strokeStyle = "rgba(186, 230, 253, 0.45)";
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    this.raindrops.forEach(drop => {
      drop.y += drop.speed;
      if (drop.y > 1.0) {
        drop.y = -0.05;
        drop.x = Math.random();
      }
      const x1 = drop.x * w;
      const y1 = drop.y * h;
      const x2 = x1 - 4 * scale;
      const y2 = y1 + drop.len * h;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    });
    ctx.stroke();

    // 3. Water droplets running down glass pane
    this.raindrops.forEach(drop => {
      if (drop.isGlassTrickle) {
        drop.y += drop.trickleSpeed;
        if (drop.y > 1.0) drop.y = -0.02;
        const gx = drop.x * w;
        const gy = drop.y * h;

        // Droplet body with highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.beginPath();
        ctx.arc(gx, gy, drop.size * scale, 0, Math.PI * 2);
        ctx.fill();

        // Droplet water streak tail
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(gx, gy - 8 * scale);
        ctx.lineTo(gx, gy);
        ctx.stroke();
      }
    });

    // 4. Window Frame / Glass Sill
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    const sillHeight = h * 0.12;
    ctx.fillRect(0, h - sillHeight, w, sillHeight);

    // Window sill top edge highlight
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.fillRect(0, h - sillHeight, w, 2 * scale);

    // Vertical Window Mullion Frame
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fillRect(w * 0.72, 0, 14 * scale, h - sillHeight);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(w * 0.72, 0, 2 * scale, h - sillHeight);

    // 5. Boy / Character Silhouette Standing Near Window Looking Out
    if (this.characterVisible) {
      const charX = w * 0.38;
      const charY = h - sillHeight;
      const breathe = Math.sin(t * 2) * (2 * scale);

      ctx.save();
      ctx.fillStyle = "#020617"; // Rich deep silhouette

      // Body / Jacket / Torso
      ctx.beginPath();
      ctx.moveTo(charX - 35 * scale, charY);
      ctx.lineTo(charX - 28 * scale, charY - 110 * scale + breathe);
      // Left shoulder
      ctx.quadraticCurveTo(charX - 25 * scale, charY - 135 * scale + breathe, charX - 10 * scale, charY - 140 * scale + breathe);
      // Neck base
      ctx.lineTo(charX + 5 * scale, charY - 140 * scale + breathe);
      // Right shoulder
      ctx.quadraticCurveTo(charX + 25 * scale, charY - 135 * scale + breathe, charX + 32 * scale, charY - 110 * scale + breathe);
      // Right side torso
      ctx.lineTo(charX + 38 * scale, charY);
      ctx.closePath();
      ctx.fill();

      // Head & Hair / Hoodie Silhouette (Profile looking slightly right towards the window)
      const headCenterY = charY - 165 * scale + breathe;
      ctx.beginPath();
      ctx.arc(charX - 2 * scale, headCenterY, 18 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Hoodie / Hair fluff silhouette details
      ctx.beginPath();
      ctx.arc(charX - 8 * scale, headCenterY - 4 * scale, 14 * scale, 0, Math.PI * 2);
      ctx.arc(charX + 6 * scale, headCenterY - 6 * scale, 12 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Hand resting near window glass / sill
      ctx.beginPath();
      ctx.arc(charX + 32 * scale, charY - 45 * scale + breathe * 0.5, 8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Soft Rim Light on Character's Silhouette from rainy window backlight
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      // Highlight right shoulder & side towards window
      ctx.moveTo(charX + 6 * scale, headCenterY - 18 * scale);
      ctx.quadraticCurveTo(charX + 16 * scale, headCenterY, charX + 14 * scale, headCenterY + 16 * scale);
      ctx.quadraticCurveTo(charX + 28 * scale, charY - 130 * scale + breathe, charX + 34 * scale, charY - 90 * scale);
      ctx.stroke();

      // Window Glass Reflection of the character
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.ellipse(charX + 45 * scale, headCenterY + 5 * scale, 16 * scale, 18 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // Atmospheric Vignette & Glow Overlay
    const vigGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.2, w * 0.5, h * 0.5, w * 0.9);
    vigGrad.addColorStop(0, "rgba(0,0,0,0)");
    vigGrad.addColorStop(1, "rgba(2, 6, 23, 0.75)");
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // -------------------------------------------------------------
  // 2. CYBERPUNK CAR WITH NEON HEADLIGHTS & CHARACTER
  // -------------------------------------------------------------
  drawCyberCarScene(ctx, w, h, t) {
    const scale = w / 400;

    // Dark Cyberpunk City Skyline
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#050510");
    sky.addColorStop(0.6, "#150d2a");
    sky.addColorStop(1, "#030712");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Neon Grid Perspective Ground / Wet Asphalt
    const groundY = h * 0.65;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, "#090d1f");
    groundGrad.addColorStop(1, "#02040a");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Distant Neon City Buildings
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    for (let i = 0; i < 7; i++) {
      const bx = (i / 7) * w;
      const bw = w / 7;
      const bh = h * (0.28 + Math.cos(i) * 0.12);
      ctx.fillRect(bx, groundY - bh, bw, bh);

      // Neon sign on building
      if (i === 2 || i === 5) {
        ctx.fillStyle = i === 2 ? "rgba(244, 63, 94, 0.7)" : "rgba(56, 189, 248, 0.7)";
        ctx.fillRect(bx + 10 * scale, groundY - bh + 20 * scale, 25 * scale, 8 * scale);
      }
    }

    // Car Position & Dimensions
    const carX = w * 0.48;
    const carY = groundY + 15 * scale;
    const carW = 240 * scale;
    const carH = 70 * scale;

    // Headlight Beams illuminating wet ground
    ctx.save();
    const beamGrad = ctx.createRadialGradient(carX + carW * 0.45, carY + carH * 0.4, 10 * scale, carX + carW * 0.9, carY + carH * 0.6, 180 * scale);
    beamGrad.addColorStop(0, "rgba(56, 189, 248, 0.6)");
    beamGrad.addColorStop(0.4, "rgba(56, 189, 248, 0.2)");
    beamGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(carX + carW * 0.45, carY + carH * 0.35);
    ctx.lineTo(w * 1.1, groundY - 10 * scale);
    ctx.lineTo(w * 1.1, h);
    ctx.lineTo(carX + carW * 0.45, carY + carH * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Car Underglow (Neon Pink / Cyan Pulse)
    const underglow = ctx.createRadialGradient(carX, carY + carH * 0.8, 10, carX, carY + carH * 0.8, carW * 0.6);
    underglow.addColorStop(0, "rgba(244, 63, 94, 0.85)");
    underglow.addColorStop(0.6, "rgba(168, 85, 247, 0.4)");
    underglow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = underglow;
    ctx.fillRect(carX - carW * 0.6, carY + carH * 0.6, carW * 1.2, 40 * scale);

    // Car Body Silhouette (Futuristic Cyber Sports Coupe)
    ctx.fillStyle = "#090914";
    ctx.beginPath();
    ctx.moveTo(carX - carW * 0.48, carY + carH * 0.6);
    // Rear bumper & spoiler
    ctx.lineTo(carX - carW * 0.48, carY + carH * 0.2);
    ctx.lineTo(carX - carW * 0.42, carY + carH * 0.05); // Spoiler
    ctx.lineTo(carX - carW * 0.35, carY + carH * 0.22);
    // Roofline & Windshield
    ctx.lineTo(carX - carW * 0.15, carY - carH * 0.25);
    ctx.lineTo(carX + carW * 0.18, carY - carH * 0.25);
    ctx.lineTo(carX + carW * 0.38, carY + carH * 0.15); // Hood
    ctx.lineTo(carX + carW * 0.48, carY + carH * 0.35); // Front bumper
    ctx.lineTo(carX + carW * 0.46, carY + carH * 0.65);
    ctx.closePath();
    ctx.fill();

    // Cyber Rim Wheels
    const wheelY = carY + carH * 0.65;
    const wheelRadius = 18 * scale;
    [carX - carW * 0.3, carX + carW * 0.3].forEach((wx) => {
      ctx.fillStyle = "#020205";
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelRadius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Cyan Rim Ring
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Glowing Neon Headlights & Taillights
    ctx.fillStyle = "#38bdf8";
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 15;
    ctx.fillRect(carX + carW * 0.44, carY + carH * 0.28, 8 * scale, 6 * scale);

    ctx.fillStyle = "#f43f5e";
    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 15;
    ctx.fillRect(carX - carW * 0.48, carY + carH * 0.22, 6 * scale, 5 * scale);
    ctx.shadowBlur = 0;

    // Character Stance standing next to car
    if (this.characterVisible) {
      const cx = carX - carW * 0.12;
      const cy = groundY + 30 * scale;
      const breathe = Math.sin(t * 2) * (1.5 * scale);

      ctx.fillStyle = "#020617";
      // Body
      ctx.beginPath();
      ctx.moveTo(cx - 18 * scale, cy);
      ctx.lineTo(cx - 14 * scale, cy - 85 * scale + breathe);
      ctx.quadraticCurveTo(cx, cy - 105 * scale + breathe, cx + 14 * scale, cy - 85 * scale + breathe);
      ctx.lineTo(cx + 18 * scale, cy);
      ctx.closePath();
      ctx.fill();

      // Head with glowing cyber visor
      const hy = cy - 120 * scale + breathe;
      ctx.beginPath();
      ctx.arc(cx, hy, 14 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Visor Glow Line
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2 * scale;
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx + 2 * scale, hy - 2 * scale);
      ctx.lineTo(cx + 12 * scale, hy - 1 * scale);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // -------------------------------------------------------------
  // 3. ASTRONAUT & DEEP SPACE PLANETARY SCENE
  // -------------------------------------------------------------
  drawAstronautSpaceScene(ctx, w, h, t) {
    const scale = w / 400;

    // Deep Space Gradient
    const spaceGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.5, w * 0.9);
    spaceGrad.addColorStop(0, "#1e0b36");
    spaceGrad.addColorStop(0.5, "#0b051c");
    spaceGrad.addColorStop(1, "#020008");
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars Twinkle
    this.stars.forEach((s) => {
      const alpha = s.alpha * (0.6 + Math.sin(t * 5 + s.x * 100) * 0.4);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Giant Glowing Planet with Rings in Background
    const planetX = w * 0.75;
    const planetY = h * 0.28;
    const planetR = 75 * scale;

    const pGrad = ctx.createRadialGradient(planetX - 25 * scale, planetY - 25 * scale, 5, planetX, planetY, planetR);
    pGrad.addColorStop(0, "#ec4899");
    pGrad.addColorStop(0.5, "#8b5cf6");
    pGrad.addColorStop(1, "#1e1035");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
    ctx.fill();

    // Planetary Rings
    ctx.save();
    ctx.translate(planetX, planetY);
    ctx.rotate(-0.4);
    ctx.strokeStyle = "rgba(244, 114, 182, 0.45)";
    ctx.lineWidth = 6 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, planetR * 1.8, planetR * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Floating Astronaut with zero-G bobbing
    if (this.characterVisible) {
      const ax = w * 0.4 + Math.sin(t * 0.8) * (15 * scale);
      const ay = h * 0.55 + Math.cos(t * 0.6) * (12 * scale);
      const rot = Math.sin(t * 0.5) * 0.08;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(rot);

      // Backpack / Life support
      ctx.fillStyle = "#334155";
      ctx.fillRect(-28 * scale, -45 * scale, 56 * scale, 75 * scale);

      // Spacesuit Torso
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.roundRect(-22 * scale, -40 * scale, 44 * scale, 65 * scale, 12 * scale);
      ctx.fill();

      // Helmet
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(0, -58 * scale, 22 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Gold Visor with reflection
      const visorGrad = ctx.createLinearGradient(-15 * scale, -65 * scale, 15 * scale, -50 * scale);
      visorGrad.addColorStop(0, "#fbbf24");
      visorGrad.addColorStop(0.5, "#f59e0b");
      visorGrad.addColorStop(1, "#b45309");
      ctx.fillStyle = visorGrad;
      ctx.beginPath();
      ctx.ellipse(2 * scale, -58 * scale, 14 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Visor highlight glint
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(-2 * scale, -62 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // 4. MATRIX TERMINAL HACKER SCENE
  // -------------------------------------------------------------
  drawMatrixTerminalScene(ctx, w, h, t) {
    const scale = w / 400;

    // Dark matrix background
    ctx.fillStyle = "#020804";
    ctx.fillRect(0, 0, w, h);

    // Cascading green matrix code rain
    ctx.font = `${12 * scale}px monospace`;
    ctx.fillStyle = "#22c55e";

    this.matrixGlyphs.forEach((g) => {
      g.y += g.speed;
      if (g.y > 1.0) g.y = -0.05;

      const gx = g.col * w;
      const gy = g.y * h;

      // Draw trail of green glyphs
      for (let i = 0; i < 8; i++) {
        const charIdx = (Math.floor(t * 10 + i + g.col * 20)) % g.chars.length;
        const char = g.chars[charIdx];
        const alpha = Math.max(0.1, 1.0 - (i * 0.12));
        ctx.fillStyle = i === 0 ? "#86efac" : `rgba(34, 197, 94, ${alpha})`;
        ctx.fillText(char, gx, gy - (i * 14 * scale));
      }
    });

    // Hacker Silhouette at Desk with Glowing Dual Displays
    if (this.characterVisible) {
      const deskY = h * 0.78;
      ctx.fillStyle = "#030d06";
      ctx.fillRect(0, deskY, w, h - deskY);

      // Glowing Monitors
      ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 20;
      ctx.fillRect(w * 0.2, deskY - 60 * scale, 70 * scale, 45 * scale);
      ctx.fillRect(w * 0.55, deskY - 60 * scale, 70 * scale, 45 * scale);
      ctx.shadowBlur = 0;

      // Hacker Silhouette
      ctx.fillStyle = "#010502";
      const hx = w * 0.48;
      ctx.beginPath();
      ctx.arc(hx, deskY - 75 * scale, 16 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.beginPath();
      ctx.moveTo(hx - 25 * scale, deskY);
      ctx.lineTo(hx - 20 * scale, deskY - 60 * scale);
      ctx.quadraticCurveTo(hx, deskY - 70 * scale, hx + 20 * scale, deskY - 60 * scale);
      ctx.lineTo(hx + 25 * scale, deskY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // -------------------------------------------------------------
  // 5. NATURE SUNSET & MOUNTAIN HORIZON
  // -------------------------------------------------------------
  drawNatureSunsetScene(ctx, w, h, t) {
    const scale = w / 400;

    // Warm Sunset Sky
    const sunSky = ctx.createLinearGradient(0, 0, 0, h);
    sunSky.addColorStop(0, "#451a03");
    sunSky.addColorStop(0.4, "#9a3412");
    sunSky.addColorStop(0.7, "#ea580c");
    sunSky.addColorStop(1, "#1c1917");
    ctx.fillStyle = sunSky;
    ctx.fillRect(0, 0, w, h);

    // Glowing Golden Sun
    const sunX = w * 0.5;
    const sunY = h * 0.52;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 65 * scale);
    sunGrad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
    sunGrad.addColorStop(0.4, "rgba(251, 146, 60, 0.6)");
    sunGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 65 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Mountain Ridges Silhouette
    ctx.fillStyle = "#1c1917";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(w * 0.3, h * 0.52);
    ctx.lineTo(w * 0.6, h * 0.62);
    ctx.lineTo(w * 0.85, h * 0.48);
    ctx.lineTo(w, h * 0.58);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Character Silhouette on Cliff
    if (this.characterVisible) {
      const cx = w * 0.3;
      const cy = h * 0.52;
      ctx.fillStyle = "#0c0a09";
      ctx.beginPath();
      ctx.arc(cx, cy - 35 * scale, 9 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 10 * scale, cy);
      ctx.lineTo(cx - 8 * scale, cy - 25 * scale);
      ctx.quadraticCurveTo(cx, cy - 30 * scale, cx + 8 * scale, cy - 25 * scale);
      ctx.lineTo(cx + 10 * scale, cy);
      ctx.closePath();
      ctx.fill();
    }
  }

  // -------------------------------------------------------------
  // 6. QUANTUM CORE REACTOR SCENE
  // -------------------------------------------------------------
  drawQuantumCoreScene(ctx, w, h, t) {
    const scale = w / 400;

    const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.8);
    bg.addColorStop(0, "#082f49");
    bg.addColorStop(0.6, "#031024");
    bg.addColorStop(1, "#020617");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const qx = w * 0.5;
    const qy = h * 0.5;

    // Orbiting Electron Rings
    for (let r = 0; r < 3; r++) {
      ctx.save();
      ctx.translate(qx, qy);
      ctx.rotate(t * (0.8 + r * 0.3) + r * 1.2);
      ctx.strokeStyle = r === 0 ? "rgba(56, 189, 248, 0.7)" : r === 1 ? "rgba(244, 63, 94, 0.7)" : "rgba(168, 85, 247, 0.7)";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.ellipse(0, 0, (75 + r * 18) * scale, (25 + r * 8) * scale, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Electron particle on orbit
      const eAngle = t * (2 + r);
      const ex = Math.cos(eAngle) * (75 + r * 18) * scale;
      const ey = Math.sin(eAngle) * (25 + r * 8) * scale;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex, ey, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Glowing Central Core
    const coreGrad = ctx.createRadialGradient(qx, qy, 0, qx, qy, 35 * scale);
    coreGrad.addColorStop(0, "#ffffff");
    coreGrad.addColorStop(0.4, "#38bdf8");
    coreGrad.addColorStop(1, "rgba(56,189,248,0)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(qx, qy, 35 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Global initialization
window.SceneAnimationEngine = SceneAnimationEngine;
document.addEventListener("DOMContentLoaded", () => {
  if (!window.sceneAnimationEngine) {
    window.sceneAnimationEngine = new SceneAnimationEngine();
  }
});
