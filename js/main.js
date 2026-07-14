// GHOST//OS — kernel
// Boot -> desktop -> layer management -> notification daemon.

import { Wallpaper } from "./gl.js";
import { SoundSystem } from "./audio.js";
import { WindowManager } from "./wm.js";
import { runBoot } from "./boot.js";
import { LOGO, ICONS } from "./ascii.js";
import { NOTIFICATIONS } from "./data.js";
import { motifsApp, codexApp, metroApp, terminalApp, injectApp, readmeApp } from "./apps.js";

/* ---------- cosmological layers (docs/COSMOLOGICAL_LAYERS.yaml) ---------- */

const LAYERS = {
  ui: {
    name: "UI LAYER — THE DOME / CATHEDRAL / WAITING ROOM",
    molecule: "N,N-DMT",
    access: "USER SPACE",
    shader: "chrysanthemum",
    cls: "layer-ui",
    dot: "#00E5FF",
    keys: ["dmt", "nn-dmt", "ui", "dome"],
    status: "INTERACTIVE INTERFACE / LOADING SCREEN",
  },
  db: {
    name: "DATABASE — THE INFINITE ARCHIVE / LIBRARY OF LIVES",
    molecule: "PSILOCYBIN (HIGH DOSE)",
    access: "READ_ONLY",
    shader: "akashic",
    cls: "layer-db",
    dot: "#00FFFF",
    keys: ["psilocybin", "shrooms", "db", "database", "akashic", "ketamine"],
    status: "HASH TABLE / BLOCKCHAIN OF BEING",
  },
  kernel: {
    name: "KERNEL — THE MECHANICAL UNDERLAYER / SALVIA FACTORY",
    molecule: "SALVIA DIVINORUM",
    access: "KERNEL SPACE",
    shader: "mechanical",
    cls: "layer-kernel",
    dot: "#FF4500",
    keys: ["salvia", "kernel", "wheel", "factory"],
    status: "PHYSICS ENGINE VISUALIZATION",
  },
  bios: {
    name: "BIOS — THE NULL-VOID / WHITE LIGHT",
    molecule: "5-MeO-DMT",
    access: "ROOT_SHELL",
    shader: "whitelight",
    cls: "layer-bios",
    dot: "#FFD400",
    keys: ["5-meo", "5meo", "bios", "void", "toad"],
    status: "POWER SUPPLY IDLE / NON-RENDERING BUFFER",
  },
  crash: {
    name: "CRASH LAYER — THE DELIRIANT BASEMENT / SHADOW REALM",
    molecule: "DPH 700mg (DO NOT)",
    access: "TRASH CACHE ⚠",
    shader: "deliriant",
    cls: "layer-crash",
    dot: "#DC143C",
    keys: ["dph", "datura", "crash", "basement", "trash"],
    status: "SYSTEM TRASH CACHE / DEAD SPACE MONITORING",
  },
};

/* ---------------------------- OS singleton ---------------------------- */

const os = {
  layers: LAYERS,
  layerId: "ui",
  sound: new SoundSystem(),
  wallpaper: null,
  wm: null,

  findLayer(arg) {
    const q = String(arg || "").toLowerCase();
    return Object.keys(LAYERS).find((k) => k === q || LAYERS[k].keys.includes(q)) || null;
  },

  setLayer(id, silent = false) {
    if (!LAYERS[id]) return;
    const prev = this.layerId;
    this.layerId = id;
    const L = LAYERS[id];
    document.body.classList.remove(...Object.values(LAYERS).map((x) => x.cls));
    document.body.classList.add(L.cls);
    this.wallpaper.use(L.shader);
    // cache --bg for the ASCII renderer (avoids getComputedStyle every frame);
    // re-read after the 600ms body background transition settles
    const cacheBg = () => {
      this.wallpaper.bgColor = getComputedStyle(document.body).getPropertyValue("--bg").trim() || "#000";
    };
    cacheBg();
    setTimeout(cacheBg, 700);
    document.getElementById("layer-name").textContent = L.name;
    document.getElementById("statusline").textContent = L.status;
    if (prev !== id && !silent) {
      // THR_ZIPPER seam-peel transition + THR_POP click
      document.body.classList.add("zipping");
      setTimeout(() => document.body.classList.remove("zipping"), 950);
      this.sound.pop();
      this.toast({
        title: "LOGIN CREDENTIAL VERIFIED",
        micro: `${L.molecule} accepted. access level: ${L.access}`,
        motifs: ["MSG_MOLECULE_LOGIN", "LOC_DESKTOP_ENV"],
      });
      glitchClock();
    }
  },

  toast(n, alert = false) {
    const box = document.getElementById("toasts");
    const isAlert = alert || /INTRUDER|ALERT|OVERFLOW|WATCHER|PANIC|WARNING|DENIED/.test(n.title);
    const el = document.createElement("div");
    el.className = "toast" + (isAlert ? " alert" : "");
    el.innerHTML = `
      <div class="toast-title">${n.title}</div>
      <div class="toast-micro">${n.micro || ""}</div>
      ${n.motifs ? `<div class="toast-motifs">${n.motifs.join(" · ")}</div>` : ""}`;
    el.onclick = () => dismiss();
    const dismiss = () => {
      el.classList.add("leaving");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    };
    box.append(el);
    while (box.children.length > 4) box.firstChild.remove();
    this.sound.blip(isAlert);
    setTimeout(dismiss, 9000);
  },
};

/* ------------------------------ clock ------------------------------ */

const GLITCH_CHARS = "▓▒░◉◈∆✕Ø∞";
let clockGlitching = 0;

function tickClock() {
  const el = document.getElementById("clock");
  const now = new Date();
  let s = now.toTimeString().slice(0, 8);
  if (clockGlitching > 0) {
    // THR_CHRONOS_COLLAPSE — time error stripe
    s = s.split("").map((c) => (Math.random() < 0.5 && c !== ":" ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c)).join("");
    clockGlitching--;
  } else if (Math.random() < 0.004) {
    clockGlitching = 4; // occasional spontaneous chronos error
  }
  el.textContent = s;
}

function glitchClock() { clockGlitching = 14; }

/* --------------------------- desktop icons --------------------------- */

const APPS = [
  { id: "motifs", label: "MOTIFS.DB", icon: ICONS.motifs, w: 720, h: 480, title: "MOTIFS.DB — CANON INDEX (52 RECORDS)", make: () => motifsApp() },
  { id: "codex", label: "CODEX.ENT", icon: ICONS.codex, w: 800, h: 520, title: "CODEX.ENT — ENTITY PROCESS TABLE", make: () => codexApp() },
  { id: "metro", label: "TRANSIT.MAP", icon: ICONS.metro, w: 760, h: 560, title: "TRANSIT.MAP — UNDERLAYER TRANSIT AUTHORITY", make: () => metroApp(openMotifDetail) },
  { id: "term", label: "TERMINAL", icon: ICONS.terminal, w: 680, h: 440, title: "TERMINAL — /DEV/CONSCIOUSNESS", make: () => terminalApp(os) },
  { id: "inject", label: "INJECT.KEY", icon: ICONS.inject, w: 520, h: 470, title: "INJECT.KEY — CREDENTIAL MANAGER", make: () => injectApp(os) },
  { id: "readme", label: "README.TXT", icon: ICONS.readme, w: 560, h: 480, title: "README.TXT — DO NOT BE AFRAID", make: () => readmeApp() },
];

function openMotifDetail(motifId) {
  os.wm.close("motifs");
  const spec = APPS.find((a) => a.id === "motifs");
  os.wm.open("motifs", { title: spec.title, body: motifsApp(motifId), w: spec.w, h: spec.h });
}

function buildIcons() {
  const box = document.getElementById("icons");
  for (const app of APPS) {
    const b = document.createElement("button");
    b.className = "icon";
    b.innerHTML = `<pre>${app.icon}</pre><span>${app.label}</span>`;
    b.onclick = () => os.wm.toggle(app.id, { title: app.title, body: app.make(), w: app.w, h: app.h });
    box.append(b);
  }
}

/* --------------------------- notification daemon --------------------------- */

function startNotifyDaemon() {
  const fire = () => {
    const n = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    os.toast(n);
    setTimeout(fire, 20000 + Math.random() * 25000);
  };
  setTimeout(fire, 7000);
}

/* ------------------------------- boot ------------------------------- */

function popFlash() {
  const f = document.getElementById("flash");
  f.classList.remove("pop");
  void f.offsetWidth;
  f.classList.add("pop");
}

function init() {
  os.wallpaper = new Wallpaper(document.getElementById("gl"), document.getElementById("ascii"));
  os.wm = new WindowManager(document.getElementById("windows"), document.getElementById("task-items"));
  document.getElementById("power-logo").textContent = LOGO;
  buildIcons();

  os.setLayer("ui", true);
  setInterval(tickClock, 250);

  // top bar controls
  const btnAscii = document.getElementById("btn-ascii");
  btnAscii.onclick = () => {
    const on = !os.wallpaper.asciiMode;
    os.wallpaper.setAscii(on);
    btnAscii.textContent = on ? "ASCII:ON" : "ASCII:OFF";
    os.sound.blip();
  };
  const btnCrt = document.getElementById("btn-crt");
  btnCrt.onclick = () => {
    const crt = document.getElementById("crt");
    crt.classList.toggle("off");
    btnCrt.textContent = crt.classList.contains("off") ? "CRT:OFF" : "CRT:ON";
  };
  const btnMute = document.getElementById("btn-mute");
  btnMute.onclick = () => {
    os.sound.muted = !os.sound.muted;
    btnMute.textContent = os.sound.muted ? "SND:OFF" : "SND:ON";
  };

  // power button -> boot -> desktop
  document.getElementById("power-btn").onclick = () => {
    document.getElementById("power").remove();
    runBoot(
      {
        boot: document.getElementById("boot"),
        log: document.getElementById("boot-log"),
        carrier: document.getElementById("carrier"),
        hz: document.getElementById("carrier-hz"),
        fill: document.getElementById("carrier-fill"),
      },
      os.sound,
      () => {
        popFlash();
        document.getElementById("boot").remove();
        document.body.classList.remove("pre-boot");
        const desk = document.getElementById("desktop");
        desk.hidden = false;
        startNotifyDaemon();
        // welcome sequence
        setTimeout(() => os.toast({ title: "EVENT: POP — MODE SWITCH", micro: "Reality clicks. The room becomes an interface.", motifs: ["THR_POP", "LOC_DESKTOP_ENV"] }), 900);
        setTimeout(() => os.wm.open("readme", { title: APPS[5].title, body: readmeApp(), w: 560, h: 480 }), 1600);
      }
    );
  };
}

init();
