// Living typographic organism. Characters are the image: no bitmap sprite,
// no static ASCII block. Its body is recalculated from the active profile,
// cursor position, intensity, and current archive depth.

export class SignalOrganism {
  constructor(canvas, profile, { reducedMotion = false, intensity = 2 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: true });
    this.profile = profile;
    this.reducedMotion = reducedMotion;
    this.intensity = intensity;
    this.mode = "threshold";
    this.pointer = { x: 0.5, y: 0.5 };
    this.started = performance.now();
    this.lastDraw = 0;
    this.seed = Math.random() * 100;
    this.visible = !document.hidden;
    if (!this.ctx) {
      canvas.hidden = true;
      return;
    }
    this.resize();

    window.addEventListener("resize", () => this.resize(), { passive: true });
    window.addEventListener("pointermove", (event) => {
      this.pointer.x = event.clientX / Math.max(1, innerWidth);
      this.pointer.y = event.clientY / Math.max(1, innerHeight);
      if (this.reducedMotion) this.draw(performance.now());
    }, { passive: true });
    document.addEventListener("visibilitychange", () => { this.visible = !document.hidden; });
    requestAnimationFrame((time) => this.loop(time));
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.max(1, Math.floor(innerWidth * dpr));
    this.canvas.height = Math.max(1, Math.floor(innerHeight * dpr));
    this.canvas.style.width = `${innerWidth}px`;
    this.canvas.style.height = `${innerHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.dpr = dpr;
    if (this.reducedMotion) this.draw(performance.now());
  }

  setProfile(profile) {
    this.profile = profile;
    this.seed += 7.31;
    if (this.reducedMotion) this.draw(performance.now());
  }

  setMode(mode) {
    this.mode = mode;
    if (this.reducedMotion) this.draw(performance.now());
  }

  setIntensity(level) {
    this.intensity = level;
  }

  setReducedMotion(reduced) {
    this.reducedMotion = reduced;
    if (reduced) this.draw(performance.now());
  }

  anchor() {
    if (this.mode === "reader") return { x: innerWidth * 0.83, y: innerHeight * 0.51, scale: 0.64 };
    if (this.mode === "atlas") return { x: innerWidth * 0.68, y: innerHeight * 0.51, scale: 0.82 };
    return { x: innerWidth * 0.5, y: innerHeight * 0.52, scale: 1.0 };
  }

  draw(now) {
    const ctx = this.ctx;
    const profile = this.profile;
    if (!ctx || !profile) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    const still = this.reducedMotion;
    const t = still ? 11.7 + this.seed : (now - this.started) / 1000 * profile.tempo;
    const { x: cx, y: cy, scale } = this.anchor();
    const chars = Array.from(profile.chars);
    const arms = Math.max(5, Math.min(13, Math.round(profile.symmetry / 2 + this.intensity)));
    const points = 24 + this.intensity * 8;
    const baseRadius = Math.min(innerWidth, innerHeight) * 0.075 * scale;
    const reach = Math.min(innerWidth, innerHeight) * (0.34 + this.intensity * 0.025) * scale;
    const pointerDx = (this.pointer.x * innerWidth - cx) * 0.035;
    const pointerDy = (this.pointer.y * innerHeight - cy) * 0.035;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalCompositeOperation = "lighter";

    for (let arm = 0; arm < arms; arm += 1) {
      const armAngle = (arm / arms) * Math.PI * 2 + t * 0.045 * (arm % 2 ? -1 : 1);
      for (let i = 0; i < points; i += 1) {
        const q = i / Math.max(1, points - 1);
        const curl = Math.sin(q * Math.PI * (2.5 + arm % 3) + t * 0.65 + arm) * (0.32 + q * 0.48);
        const angle = armAngle + curl + q * q * (arm % 2 ? 1.2 : -1.05);
        const radius = baseRadius + reach * q;
        const breathe = 1 + Math.sin(t * 1.2 + i * 0.23 + arm) * 0.025;
        const x = cx + Math.cos(angle) * radius * breathe + pointerDx * q * q;
        const y = cy + Math.sin(angle) * radius * 0.76 * breathe + pointerDy * q * q;
        const color = profile.palette[(i + arm * 2) % profile.palette.length];
        const alpha = (1 - q * 0.72) * (0.22 + this.intensity * 0.11);
        const fontSize = Math.max(7, (16 - q * 7 + Math.sin(i + t) * 2) * scale);
        const char = chars[(i * 3 + arm * 5 + Math.floor(t * 2)) % chars.length];
        ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 6 + this.intensity * 3;
        ctx.shadowColor = color;
        ctx.fillText(char, x, y);
      }
    }

    // A temporary syntax-core: diagram -> eye -> language -> diagram.
    const phase = Math.floor(t * 0.7) % 4;
    const cores = [profile.glyph, "{◉}", "//", "∞"];
    ctx.globalAlpha = 0.58;
    ctx.font = `${Math.max(21, 38 * scale)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    ctx.fillStyle = profile.palette[phase % profile.palette.length];
    ctx.shadowBlur = 22;
    ctx.fillText(cores[phase], cx, cy);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
  }

  loop(time) {
    if (this.visible && (!this.reducedMotion || !this.lastDraw)) {
      const fps = [10, 16, 24, 30][this.intensity] || 24;
      if (time - this.lastDraw >= 1000 / fps) {
        this.draw(time);
        this.lastDraw = time;
      }
    }
    requestAnimationFrame((next) => this.loop(next));
  }
}
