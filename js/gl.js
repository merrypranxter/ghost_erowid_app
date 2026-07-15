// GHOST EROWID COSMOLOGY — content-specific WebGL environments.
// Each family has its own visual grammar. These are not interchangeable skins:
// the shader behavior is part of the interpretation of the archive.

const VERTEX = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const HEADER = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_intensity;
#define PI 3.141592653589793

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

vec3 spectrum(float t) {
  return 0.52 + 0.48 * cos(6.28318 * (t + vec3(0.0, 0.31, 0.67)));
}
`;

const DMT = HEADER + `
void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p += (u_pointer - 0.5) * 0.13;
  float originalRadius = length(p);
  float angle = atan(p.y, p.x);
  float sector = PI / 6.0;
  angle = abs(mod(angle + sector * 0.5, sector) - sector * 0.5);
  p = vec2(cos(angle), sin(angle)) * originalRadius;

  float depth = 1.0 / max(0.09, originalRadius);
  vec2 jeweled = p * depth * (5.0 + u_intensity * 2.0);
  jeweled *= rot(u_time * 0.08);
  float syntax = abs(sin(jeweled.x * 2.4 + sin(jeweled.y * 1.7 + u_time * 1.9)));
  float lattice = smoothstep(0.16, 0.0, abs(fract(jeweled.x + jeweled.y) - 0.5));
  float eyes = smoothstep(0.13, 0.0, abs(length(fract(jeweled) - 0.5) - 0.22));
  float tunnel = pow(max(0.0, 1.0 - originalRadius * 0.62), 2.2);
  float pulse = 0.65 + 0.35 * sin(depth * 3.0 - u_time * 3.3);

  vec3 blackJewel = vec3(0.008, 0.002, 0.025);
  vec3 color = blackJewel;
  color += spectrum(syntax * 0.35 + u_time * 0.025) * syntax * tunnel * 1.35;
  color += vec3(0.0, 1.0, 0.78) * lattice * 0.48 * u_intensity;
  color += vec3(1.0, 0.10, 0.74) * eyes * pulse * 0.58;
  color += vec3(1.0, 0.77, 0.03) * pow(tunnel, 4.0) * pulse;
  color *= 1.0 - smoothstep(0.55, 1.7, originalRadius) * 0.72;
  gl_FragColor = vec4(pow(max(color, 0.0), vec3(0.82)), 1.0);
}
`;

const LSD = HEADER + `
void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec2 cursor = (u_pointer - 0.5) * 0.12;
  p += cursor;
  float a = atan(p.y, p.x);
  float r = length(p);
  float wedge = PI / 3.0;
  a = abs(mod(a + wedge * 0.5, wedge) - wedge * 0.5);
  p = vec2(cos(a), sin(a)) * r;

  float breathing = 0.98 + 0.025 * sin(u_time * 0.7);
  vec2 z = p * (1.45 / breathing);
  vec2 c = vec2(-0.745, 0.113) + 0.035 * vec2(cos(u_time * 0.11), sin(u_time * 0.13));
  float escaped = 0.0;
  float orbit = 0.0;
  for (int i = 0; i < 44; i++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    orbit += exp(-abs(length(z) - 0.72) * 7.0);
    if (dot(z, z) > 7.0 && escaped == 0.0) escaped = float(i);
  }
  float iter = escaped / 44.0;
  float crystal = sin(orbit * 0.13 + r * 24.0 - u_time * 0.6) * 0.5 + 0.5;
  float tracers = smoothstep(0.12, 0.0, abs(fract(a * 8.0 / PI + u_time * 0.03) - 0.5));
  vec3 color = spectrum(iter * 1.7 + crystal * 0.14 + u_time * 0.018);
  color *= 0.15 + pow(crystal, 2.1) * 0.95;
  color += vec3(0.0, 0.85, 1.0) * tracers * (1.0 - r) * 0.34;
  color.r += smoothstep(0.4, 0.0, abs(sin(orbit * 0.11 + 0.12))) * 0.2;
  color.b += smoothstep(0.4, 0.0, abs(sin(orbit * 0.11 - 0.12))) * 0.2;
  color *= 1.0 - smoothstep(0.45, 1.55, r) * 0.62;
  gl_FragColor = vec4(pow(max(color, 0.0), vec3(0.86)), 1.0);
}
`;

const SALVIA = HEADER + `
float gear(vec2 p, float teeth, float radius, float phase) {
  float a = atan(p.y, p.x) + phase;
  float r = length(p);
  float edge = radius + 0.055 * sign(sin(a * teeth));
  return smoothstep(0.028, 0.0, abs(r - edge));
}

void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p.x += 0.15 * sin(floor(p.y * 8.0) + u_time * 0.5);
  float seam = abs(p.x - 0.15 * sin(p.y * 3.0 + u_time * 0.33));
  float zipper = smoothstep(0.035, 0.0, seam);
  float wheel = gear(p * 0.92, 24.0, 0.55, u_time * 0.27);
  wheel += gear((p - vec2(-0.63, 0.32)) * 1.4, 16.0, 0.32, -u_time * 0.42);
  wheel += gear((p - vec2(0.67, -0.37)) * 1.5, 12.0, 0.31, u_time * 0.55);
  float spokes = smoothstep(0.055, 0.0, abs(sin(atan(p.y, p.x) * 8.0 + u_time * 0.25)))
    * step(0.17, length(p)) * step(length(p), 0.55);
  float belt = step(abs(p.y + 0.73), 0.14);
  float slats = step(0.53, fract(p.x * 4.0 - u_time * 0.68));
  float page = step(0.94, fract((p.y + p.x * 0.18) * 7.0 + u_time * 0.12));

  vec3 grease = vec3(0.026, 0.027, 0.018);
  vec3 copper = vec3(0.66, 0.31, 0.10);
  vec3 verdigris = vec3(0.10, 0.58, 0.53);
  vec3 warning = vec3(1.0, 0.18, 0.0);
  vec3 color = grease;
  color += copper * wheel * 1.2;
  color += verdigris * spokes * 0.76;
  color = mix(color, mix(copper * 0.35, grease * 2.0, slats), belt);
  color += warning * zipper * (0.45 + 0.55 * sin(u_time * 7.0));
  color += vec3(0.42, 0.48, 0.14) * page * 0.16;
  float dust = step(0.993, hash21(floor((p + u_time * 0.015) * 95.0)));
  color += vec3(0.9, 0.78, 0.48) * dust * 0.36;
  color *= 1.0 - smoothstep(0.5, 1.55, length(p)) * 0.7;
  gl_FragColor = vec4(color, 1.0);
}
`;

const DXM = HEADER + `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float tick = floor(u_time * (2.2 + u_intensity * 1.8)) / (2.2 + u_intensity * 1.8);
  vec2 blocks = floor(uv * vec2(72.0, 42.0)) / vec2(72.0, 42.0);
  vec2 displaced = blocks;
  displaced.x += 0.045 * sin(floor(blocks.y * 13.0) + tick * 0.7);
  displaced.y += 0.018 * sin(floor(blocks.x * 9.0) - tick * 0.43);
  float horizon = smoothstep(0.08, 0.0, abs(displaced.y - 0.54));
  float chamber = abs(sin((displaced.x - 0.5) * 9.0 / max(0.18, displaced.y)));
  chamber = smoothstep(0.93, 1.0, chamber);
  float avatarLag = smoothstep(0.12, 0.0, length(displaced - u_pointer));
  float echo = smoothstep(0.16, 0.0, length(displaced - u_pointer - vec2(0.09, -0.035)));
  float drop = step(0.987, hash21(vec2(floor(uv.y * 60.0), tick)));

  vec3 color = vec3(0.012, 0.018, 0.052);
  color += vec3(0.15, 0.25, 0.58) * chamber * 0.7;
  color += vec3(0.72, 0.82, 1.0) * horizon * 0.38;
  color += vec3(1.0, 0.18, 0.58) * echo * 0.18;
  color += vec3(0.15, 0.55, 1.0) * avatarLag * 0.22;
  color += vec3(0.45, 0.55, 0.8) * drop * 0.14;
  color *= 0.82 + 0.18 * step(0.5, hash21(vec2(tick, floor(uv.y * 7.0))));
  color *= 1.0 - length(uv - 0.5) * 0.74;
  gl_FragColor = vec4(color, 1.0);
}
`;

const DELIRIANTS = HEADER + `
float bayer(vec2 fc) {
  vec2 p = mod(floor(fc), 4.0);
  float a = mod(p.x + p.y * 2.0, 4.0);
  float b = floor(p.x / 2.0) + floor(p.y / 2.0) * 2.0;
  return (a * 4.0 + b) / 16.0;
}

float figure(vec2 p, vec2 origin) {
  p -= origin;
  float head = length(p - vec2(0.0, 0.15)) - 0.035;
  vec2 q = abs(p - vec2(0.0, -0.11)) - vec2(0.06, 0.22);
  float body = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  float hat = max(abs(p.x) - 0.09, abs(p.y - 0.205) - 0.018);
  return min(min(head, body), hat);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float frozen = floor(u_time * 3.0) / 3.0;
  float room = step(0.985, sin(uv.x * 51.0)) * 0.03 + step(0.992, sin(uv.y * 63.0)) * 0.025;
  float peripheral = smoothstep(0.28, 0.72, length(uv - 0.5));
  float leftGhost = smoothstep(0.025, -0.02, figure(uv, vec2(0.075, 0.48)));
  float rightGhost = smoothstep(0.025, -0.02, figure(uv, vec2(0.94, 0.43)));
  float recognitionError = step(0.73, hash21(vec2(floor(frozen * 0.7), 4.0)));
  float phantom = (leftGhost + rightGhost) * peripheral * recognitionError;
  float track = step(0.989, hash21(vec2(floor(uv.y * 53.0), frozen)));
  float dither = bayer(gl_FragCoord.xy) * 0.035;

  vec3 color = vec3(0.055, 0.054, 0.041) + room;
  color += vec3(0.22, 0.21, 0.10) * dither;
  color = mix(color, vec3(0.003, 0.004, 0.006), phantom * 0.94);
  color += vec3(0.55, 0.04, 0.07) * track * 0.09;
  color *= 0.97 + 0.03 * step(0.5, hash21(vec2(frozen, 2.0)));
  color *= 1.0 - smoothstep(0.25, 0.78, length(uv - 0.5)) * 0.62;
  gl_FragColor = vec4(color, 1.0);
}
`;

const TWO_CB = HEADER + `
void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p *= rot(0.08 * sin(u_time * 0.4));
  float r = length(p);
  float a = atan(p.y, p.x);
  float petals = sin(a * 8.0 + sin(r * 8.0 - u_time * 0.8));
  float touch = sin(p.x * 8.0 + sin(p.y * 6.0 + u_time)) * sin(p.y * 7.0 - u_time * 0.7);
  float pulse = 0.5 + 0.5 * sin(r * 18.0 - u_time * 2.0);
  float contour = smoothstep(0.82, 1.0, abs(touch));
  float bloom = exp(-r * 1.15) * (0.55 + 0.45 * petals);
  vec3 hot = vec3(1.0, 0.08, 0.52);
  vec3 citrus = vec3(1.0, 0.38, 0.0);
  vec3 mint = vec3(0.0, 0.92, 0.72);
  vec3 violet = vec3(0.42, 0.14, 0.94);
  vec3 color = vec3(0.03, 0.008, 0.05);
  color += mix(hot, citrus, pulse) * bloom * 0.9;
  color += mix(mint, violet, touch * 0.5 + 0.5) * contour * 0.34;
  color += vec3(1.0, 0.85, 0.08) * pow(max(0.0, bloom), 3.0) * 0.55;
  color *= 1.0 - smoothstep(0.5, 1.6, r) * 0.64;
  gl_FragColor = vec4(pow(max(color, 0.0), vec3(0.88)), 1.0);
}
`;

const CANON = HEADER + `
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 grid = uv * aspect * 9.0;
  vec2 cell = floor(grid);
  vec2 f = fract(grid) - 0.5;
  float id = hash21(cell);
  vec2 node = vec2(hash21(cell + 1.3), hash21(cell + 7.1)) - 0.5;
  float dotNode = smoothstep(0.09, 0.0, length(f - node * 0.62));
  float lineA = smoothstep(0.025, 0.0, abs(f.y - node.y * 0.45));
  float lineB = smoothstep(0.018, 0.0, abs(f.x + f.y - node.x * 0.55));
  float scan = smoothstep(0.09, 0.0, abs(fract(uv.y * 5.0 - u_time * 0.15) - 0.5));
  vec3 color = vec3(0.004, 0.012, 0.025);
  color += spectrum(id + u_time * 0.015) * dotNode * 0.9;
  color += vec3(0.0, 0.78, 1.0) * lineA * 0.18;
  color += vec3(1.0, 0.05, 0.68) * lineB * 0.13;
  color += vec3(0.65, 1.0, 0.0) * scan * (lineA + lineB) * 0.35;
  color *= 1.0 - length(uv - 0.5) * 0.75;
  gl_FragColor = vec4(color, 1.0);
}
`;

export const SHADERS = { dmt: DMT, lsd: LSD, salvia: SALVIA, dxm: DXM, deliriants: DELIRIANTS, "2cb": TWO_CB, canon: CANON };

export class PhenomenaField {
  constructor(canvas, { reducedMotion = false, intensity = 2 } = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    this.programs = {};
    this.current = "dmt";
    this.intensity = intensity;
    this.reducedMotion = reducedMotion;
    this.pointer = [0.5, 0.5];
    this.started = performance.now();
    this.visible = !document.hidden;
    this.needsFrame = true;
    this.resolutionScale = 1;
    this.slowFrames = 0;
    this.lastFrame = performance.now();

    if (!this.gl) {
      document.documentElement.classList.add("no-webgl");
      canvas.hidden = true;
      return;
    }

    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.buffer = buffer;

    for (const [name, source] of Object.entries(SHADERS)) {
      const compiled = this.compile(source, name);
      if (compiled) this.programs[name] = compiled;
    }
    if (!Object.keys(this.programs).length) {
      document.documentElement.classList.add("no-webgl");
      canvas.hidden = true;
      return;
    }

    this.resize();
    window.addEventListener("resize", () => this.resize(), { passive: true });
    window.addEventListener("pointermove", (event) => {
      this.pointer[0] = event.clientX / Math.max(1, innerWidth);
      this.pointer[1] = 1 - event.clientY / Math.max(1, innerHeight);
      this.needsFrame = true;
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      this.visible = !document.hidden;
      this.needsFrame = true;
    });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      document.documentElement.classList.add("no-webgl");
    });
    requestAnimationFrame((time) => this.loop(time));
  }

  compile(fragmentSource, name) {
    const gl = this.gl;
    const makeShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`[ghost field] ${name} shader failed`, gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vertex = makeShader(gl.VERTEX_SHADER, VERTEX);
    const fragment = makeShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(`[ghost field] ${name} program failed`, gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return {
      program,
      position: gl.getAttribLocation(program, "a_position"),
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      pointer: gl.getUniformLocation(program, "u_pointer"),
      intensity: gl.getUniformLocation(program, "u_intensity"),
    };
  }

  use(name) {
    this.current = this.programs[name] ? name : (this.programs.canon ? "canon" : Object.keys(this.programs)[0]);
    this.needsFrame = true;
  }

  setIntensity(level) {
    this.intensity = Math.max(0, Math.min(3, level));
    this.resolutionScale = 1;
    this.slowFrames = 0;
    this.resize();
  }

  setReducedMotion(reduced) {
    this.reducedMotion = reduced;
    this.needsFrame = true;
  }

  resize() {
    if (!this.gl) return;
    const base = [0.58, 0.72, 0.88, 1][this.intensity] || 0.88;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.65);
    const width = Math.max(1, Math.floor(innerWidth * dpr * base * this.resolutionScale));
    const height = Math.max(1, Math.floor(innerHeight * dpr * base * this.resolutionScale));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
    this.needsFrame = true;
  }

  render(time) {
    const gl = this.gl;
    const shader = this.programs[this.current];
    if (!gl || !shader) return;
    gl.useProgram(shader.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(shader.position);
    gl.vertexAttribPointer(shader.position, 2, gl.FLOAT, false, 0, 0);
    const seconds = this.reducedMotion ? 17.0 : (time - this.started) / 1000;
    gl.uniform1f(shader.time, seconds);
    gl.uniform2f(shader.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(shader.pointer, this.pointer[0], this.pointer[1]);
    gl.uniform1f(shader.intensity, [0.35, 0.68, 1.0, 1.45][this.intensity] || 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.needsFrame = false;
  }

  loop(time) {
    if (this.visible && (!this.reducedMotion || this.needsFrame)) {
      this.render(time);
      const frameCost = time - this.lastFrame;
      if (!this.reducedMotion && frameCost > 26) this.slowFrames += 1;
      else this.slowFrames = Math.max(0, this.slowFrames - 1);
      if (this.slowFrames > 45 && this.resolutionScale > 0.7) {
        this.resolutionScale *= 0.82;
        this.slowFrames = 0;
        this.resize();
      }
    }
    this.lastFrame = time;
    requestAnimationFrame((next) => this.loop(next));
  }
}
