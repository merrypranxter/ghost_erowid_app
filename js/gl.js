// GHOST//OS — wallpaper engine
// Fragment shaders ported from ghost-erowid-cosmology/shaders/*.glsl
// One shader per cosmological layer (docs/COSMOLOGICAL_LAYERS.yaml).

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const HEADER = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
#define PI 3.14159265359
`;

// --- UI LAYER — shaders/chrysanthemum_gateway.glsl (12-fold hyperbolic tiling)
//     with a faint shaders/hex_substrate.glsl floor mixed in
const FRAG_CHRYSANTHEMUM = HEADER + `
vec2 hex_uv(vec2 uv) {
  vec2 r = vec2(1.0, 1.73205080757);
  vec2 h = r * 0.5;
  vec2 a = mod(uv, r) - h;
  vec2 b = mod(uv - h, r) - h;
  return (length(a) < length(b)) ? a : b;
}
void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec3 magenta = vec3(1.0, 0.18, 0.92);   // #FF2EEA
  vec3 jade    = vec3(0.0, 1.0, 0.5);     // #00FF7F
  vec3 gold    = vec3(1.0, 0.83, 0.0);    // #FFD400
  vec3 cyan    = vec3(0.0, 0.9, 1.0);     // #00E5FF
  vec3 base    = vec3(0.043, 0.063, 0.125); // #0B1020

  float r = length(uv);
  float theta = atan(uv.y, uv.x);

  float petals = 12.0;
  float petal_angle = mod(theta + u_time * 0.05, 2.0 * PI / petals);
  float hyperbolic = exp(-r * 1.35);
  float petal_shape = sin(petal_angle * petals * 0.5) * hyperbolic;

  float rotation = u_time * 0.3;
  float layer1 = sin(theta * 6.0 + rotation) * hyperbolic;
  float layer2 = sin(theta * 12.0 - rotation * 1.5) * hyperbolic * 0.5;

  float tunnel = smoothstep(0.12, 0.0, r);

  vec3 color = base;
  color += mix(magenta, jade, petal_shape + 0.5) * hyperbolic * 1.15;
  color += gold * layer1 * 0.45;
  color += jade * layer2 * 0.3;
  color += cyan * tunnel * (0.6 + 0.4 * sin(u_time * 2.0));

  // caustic refraction ripples
  float caustic = sin(r * 50.0 - u_time * 5.0) * 0.5 + 0.5;
  color += gold * caustic * hyperbolic * 0.22;

  // faint hex substrate — "the honeycomb grid of reality"
  vec2 hx = hex_uv(uv * 9.0 + vec2(0.0, u_time * 0.15));
  float hexline = smoothstep(0.06, 0.0, abs(length(hx) - 0.42));
  color += cyan * hexline * 0.10 * (1.0 - hyperbolic);

  // chromatic vignette
  color *= 1.0 - r * 0.28;
  gl_FragColor = vec4(color, 1.0);
}
`;

// --- DATABASE LAYER — shaders/akashic_grid.glsl (neon web database)
const FRAG_AKASHIC = HEADER + `
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 electric_blue  = vec3(0.0, 1.0, 1.0);    // #00FFFF
  vec3 database_amber = vec3(1.0, 0.75, 0.0);   // #FFBF00
  vec3 cold_steel     = vec3(0.69, 0.77, 0.87); // #B0C4DE

  float density = 9.0;
  vec2 grid_uv = uv * density + vec2(u_time * 0.05, 0.0);
  vec2 grid_cell = floor(grid_uv);
  vec2 grid_frac = fract(grid_uv);
  vec2 node_pos = hash2(grid_cell);
  float dist_to_node = length(grid_frac - node_pos);

  float line = 0.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 ncell = grid_cell + vec2(float(x), float(y));
      vec2 npos = hash2(ncell);
      vec2 a = node_pos;
      vec2 b = npos + vec2(float(x), float(y));
      vec2 pa = grid_frac - a;
      vec2 ba = b - a;
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      float d = length(pa - ba * h);
      float connection = smoothstep(0.02, 0.0, d);
      float active = step(0.55, hash2(ncell).x);
      line += connection * active;
    }
  }

  float node_glow = smoothstep(0.08, 0.0, dist_to_node);
  float data_pulse = mod(u_time * 3.0 - uv.y * 14.0, 1.0);
  float pulse_glow = smoothstep(0.14, 0.0, abs(data_pulse - 0.5)) * line;

  vec3 color = vec3(0.04, 0.04, 0.11); // #1A1A2E-ish base
  color += electric_blue * line * 0.35;
  color += database_amber * pulse_glow * 0.9;
  color += electric_blue * node_glow * 1.6;
  color += cold_steel * 0.05;

  float fog = 1.0 - length(uv - vec2(0.85, 0.5)) * 0.45;
  color *= fog;
  gl_FragColor = vec4(color, 1.0);
}
`;

// --- KERNEL LAYER — after shaders/salvia_mechanical.glsl
//     The Wheel (r = r0 + a*cos(n*theta)) + conveyor belt cylindrical tiling
const FRAG_MECHANICAL = HEADER + `
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  vec3 copper  = vec3(0.72, 0.45, 0.20);  // #B87333
  vec3 olive   = vec3(0.29, 0.36, 0.14);  // #4A5D23
  vec3 orange  = vec3(1.0, 0.27, 0.0);    // #FF4500 safety orange
  vec3 teal    = vec3(0.26, 0.70, 0.68);  // #43B3AE verdigris
  vec3 grease  = vec3(0.10, 0.10, 0.10);

  vec3 color = grease;

  // THE WHEEL — circular buffer visualized as gear teeth
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  float spin = u_time * 0.4;
  float teeth = 24.0;
  float gear = 0.55 + 0.05 * sign(sin((theta + spin) * teeth));
  float wheel = smoothstep(0.015, 0.0, abs(r - gear));
  float hub = smoothstep(0.012, 0.0, abs(r - 0.18));
  float spokes = smoothstep(0.03, 0.0, abs(sin((theta + spin) * 6.0))) * step(0.18, r) * step(r, gear);
  color += copper * wheel * 1.4;
  color += teal * hub * 1.2;
  color += olive * spokes * 2.2;

  // inner gear counter-rotating
  float gear2 = 0.33 + 0.03 * sign(sin((theta - spin * 1.7) * 16.0));
  color += copper * smoothstep(0.012, 0.0, abs(r - gear2)) * 0.9;

  // CONVEYOR BELT — unidirectional flow, mod(time) stripes
  float belt = step(abs(uv.y + 0.72), 0.13);
  float stripes = step(0.5, fract(uv.x * 4.0 - u_time * 0.9));
  color = mix(color, mix(grease * 2.0, copper * 0.7, stripes), belt);
  color += orange * belt * smoothstep(0.02, 0.0, abs(abs(uv.y + 0.72) - 0.13)) * 2.0;

  // volumetric dust motes under flat industrial fluorescents
  vec2 guv = (uv + vec2(u_time * 0.02, u_time * 0.01)) * 90.0;
  vec2 g = floor(guv);
  float dust = step(0.992, hash(g)) * smoothstep(0.5, 0.0, length(fract(guv) - 0.5));
  color += vec3(0.9, 0.85, 0.7) * dust * 0.5;

  // warning light sweep
  float sweep = smoothstep(0.4, 0.0, abs(fract(u_time * 0.11) * 2.4 - 1.2 - uv.x));
  color += orange * sweep * 0.06;

  // industrial vignette
  color *= 1.0 - length(uv) * 0.25;
  gl_FragColor = vec4(color, 1.0);
}
`;

// --- BIOS LAYER — after shaders/white_light_trap.glsl
//     Absolute chromatic nullity, overexposure, prismatic ghost edges
const FRAG_WHITELIGHT = HEADER + `
void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float r = length(uv);

  // breathing overexposure — power supply idle at 7.83Hz/60
  float breathe = 0.92 + 0.08 * sin(u_time * 0.82);
  vec3 color = vec3(1.0) * breathe;

  // faint spectral fringes at the edge of the whiteout
  float fringe = smoothstep(0.5, 1.4, r);
  color.r -= fringe * (0.05 + 0.03 * sin(u_time * 0.7 + r * 6.0));
  color.g -= fringe * (0.07 + 0.03 * sin(u_time * 0.9 + r * 6.0 + 2.1));
  color.b -= fringe * (0.04 + 0.03 * sin(u_time * 1.1 + r * 6.0 + 4.2));

  // prismatic UI ghosts — barely-there ring interfaces
  float ring = abs(sin(r * 14.0 - u_time * 0.5));
  color -= vec3(0.02, 0.015, 0.0) * smoothstep(0.9, 1.0, ring) * fringe;

  // reincarnation bait: a slightly warmer center
  color += vec3(0.015, 0.01, 0.0) * smoothstep(0.4, 0.0, r);
  gl_FragColor = vec4(color, 1.0);
}
`;

// --- CRASH LAYER — shaders/deliriant_glitch.glsl (WebGL1-safe dither port)
const FRAG_DELIRIANT = HEADER + `
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float bayer(vec2 fc) {
  // 4x4 Bayer matrix via arithmetic (GLSL ES 1.0 lacks dynamic mat indexing)
  vec2 p = mod(floor(fc), 4.0);
  float a = mod(p.x + p.y * 2.0, 4.0);
  float b = floor(p.x / 2.0) + floor(p.y / 2.0) * 2.0;
  return (a * 4.0 + b) / 16.0;
}
float sdShadowMan(vec2 uv, vec2 pos, float height) {
  vec2 local = uv - pos;
  float hat  = length(vec2(local.x * 0.55, local.y - height * 0.82)) - 0.045;
  float head = length(local - vec2(0.0, height * 0.62)) - 0.05;
  vec2 q = abs(vec2(local.x, local.y - height * 0.28)) - vec2(0.075, height * 0.42);
  float body = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return min(min(hat, head), body);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float paranoia = 0.75 + 0.25 * sin(u_time * 0.21);
  float d = bayer(gl_FragCoord.xy) * 0.08 - 0.04;

  // sickly yellow flicker — #C8B853 over void black
  vec3 col = vec3(0.22, 0.20, 0.10) * (0.75 + 0.25 * sin(u_time * 10.0)) + d;

  // shadow people: peripheral only, vanish when centered
  float vignette = length(uv - 0.5);
  float peripheral = smoothstep(0.25, 0.75, vignette) * paranoia;
  for (int i = 0; i < 4; i++) {
    vec2 pos = vec2(
      float(i - (i / 2) * 2) * 0.78 + 0.11,
      -0.02 + 0.04 * sin(u_time * 0.5 + float(i))
    );
    pos.y += float(i / 2) * 0.02;
    float jitter = (hash(vec2(floor(u_time * 8.0), float(i))) - 0.5) * 0.012;
    float shadow = sdShadowMan(uv + vec2(jitter, 0.0), pos, 0.42);
    float alpha = smoothstep(0.05, -0.05, shadow) * peripheral * (0.5 + 0.5 * sin(u_time * 0.7 + float(i) * 2.1));
    col = mix(col, vec3(0.02, 0.02, 0.035), alpha * 0.9);
    // red tracking reticle eyes
    float eyes = smoothstep(0.012, 0.0, abs(shadow + 0.03)) * alpha;
    col += vec3(0.86, 0.08, 0.24) * eyes * step(0.6, hash(vec2(float(i), floor(u_time)))) * 0.5;
  }

  // phantom smoke — half-rendered particles
  float smoke = sin(uv.x * 50.0 + u_time) * sin(uv.y * 30.0 - u_time * 2.0);
  smoke = smoothstep(0.8, 1.0, smoke) * 0.18 * paranoia;
  col += vec3(0.7, 0.7, 0.6) * smoke;

  // VHS tracking error
  float scan = step(0.95, sin(uv.y * u_resolution.y * 0.5 + u_time * 5.0));
  col += vec3(scan) * 0.06;
  float track = step(0.992, hash(vec2(floor(uv.y * 40.0), floor(u_time * 3.0))));
  col += vec3(0.12, 0.1, 0.04) * track;

  col *= 1.0 - vignette * 0.5;
  gl_FragColor = vec4(col, 1.0);
}
`;

export const SHADERS = {
  chrysanthemum: FRAG_CHRYSANTHEMUM,
  akashic: FRAG_AKASHIC,
  mechanical: FRAG_MECHANICAL,
  whitelight: FRAG_WHITELIGHT,
  deliriant: FRAG_DELIRIANT,
};

const ASCII_RAMP = " ·:;+*oO≡▒▓█";

export class Wallpaper {
  constructor(glCanvas, asciiCanvas) {
    this.canvas = glCanvas;
    this.asciiCanvas = asciiCanvas;
    this.ctx2d = asciiCanvas.getContext("2d");
    this.gl = glCanvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: false });
    this.asciiMode = false;
    this.programs = {};
    this.current = null;
    this.t0 = performance.now();
    this._frame = 0;

    const gl = this.gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    for (const [name, src] of Object.entries(SHADERS)) {
      this.programs[name] = this._compile(src, name);
    }
    this.resize();
    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame(() => this._loop());
  }

  _compile(fragSrc, name) {
    const gl = this.gl;
    const mk = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(`[GHOST//OS] shader "${name}" failed:`, gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = mk(gl.VERTEX_SHADER, VERT);
    const fs = mk(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "a_pos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(`[GHOST//OS] link "${name}" failed:`, gl.getProgramInfoLog(p));
      return null;
    }
    return {
      prog: p,
      u_time: gl.getUniformLocation(p, "u_time"),
      u_resolution: gl.getUniformLocation(p, "u_resolution"),
    };
  }

  use(name) { this.current = this.programs[name] ? name : this.current; }

  setAscii(on) {
    this.asciiMode = on;
    this.asciiCanvas.hidden = !on;
    this.canvas.style.visibility = on ? "hidden" : "visible";
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (this.asciiMode) {
      // low-res render target = one pixel per character cell
      this.cols = Math.min(180, Math.floor(window.innerWidth / 8));
      this.rows = Math.min(100, Math.floor(window.innerHeight / 14));
      this.canvas.width = this.cols;
      this.canvas.height = this.rows;
      this.asciiCanvas.width = window.innerWidth * dpr;
      this.asciiCanvas.height = window.innerHeight * dpr;
      this.asciiCanvas.style.width = window.innerWidth + "px";
      this.asciiCanvas.style.height = window.innerHeight + "px";
      this.ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.pixels = new Uint8Array(this.cols * this.rows * 4);
    } else {
      // half-res for glow-friendly perf
      this.canvas.width = Math.floor(window.innerWidth * dpr * 0.5);
      this.canvas.height = Math.floor(window.innerHeight * dpr * 0.5);
    }
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  _loop() {
    const gl = this.gl;
    const t = (performance.now() - this.t0) / 1000;
    const P = this.programs[this.current];
    this._frame++;
    if (P) {
      gl.useProgram(P.prog);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(P.u_time, t);
      gl.uniform2f(P.u_resolution, this.canvas.width, this.canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (this.asciiMode && this._frame % 2 === 0) this._drawAscii();
    }
    requestAnimationFrame(() => this._loop());
  }

  _drawAscii() {
    const { gl, ctx2d, cols, rows } = this;
    gl.readPixels(0, 0, cols, rows, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);
    const w = window.innerWidth, h = window.innerHeight;
    const cw = w / cols, ch = h / rows;
    const bg = getComputedStyle(document.body).getPropertyValue("--bg").trim() || "#000";
    ctx2d.fillStyle = bg;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.font = `${Math.ceil(ch)}px monospace`;
    ctx2d.textBaseline = "top";
    const px = this.pixels;
    for (let y = 0; y < rows; y++) {
      const srcY = rows - 1 - y; // GL is bottom-up
      for (let x = 0; x < cols; x++) {
        const i = (srcY * cols + x) * 4;
        const r = px[i], g = px[i + 1], b = px[i + 2];
        const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        const ci = Math.min(ASCII_RAMP.length - 1, Math.floor(lum * ASCII_RAMP.length));
        if (ci === 0) continue;
        ctx2d.fillStyle = `rgb(${r},${g},${b})`;
        ctx2d.fillText(ASCII_RAMP[ci], x * cw, y * ch);
      }
    }
  }
}
