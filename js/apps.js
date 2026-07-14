// GHOST//OS — applications
// MOTIFS.DB · CODEX · TRANSIT.MAP · TERMINAL · INJECT · README

import { MOTIFS, NOTIFICATIONS, STICKERS } from "./data.js";
import { PORTRAITS, LOGO } from "./ascii.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ============================================================
   MOTIFS.DB — the canon browser (canon/cosmology.yaml)
   ============================================================ */

const TYPE_LABELS = { entity: "ENT", location: "LOC", geometry: "GEO", threshold: "THR", message: "MSG", emotion: "EMO" };

export function motifsApp(selectId = null) {
  const root = document.createElement("div");
  root.className = "motifs-app";

  const side = document.createElement("div");
  side.className = "motifs-side";
  const detail = document.createElement("div");
  detail.className = "motif-detail";
  root.append(side, detail);

  const filters = document.createElement("div");
  filters.className = "motifs-filter";
  const list = document.createElement("div");
  side.append(filters, list);

  let activeType = "all";
  let selected = selectId || MOTIFS[0].id;

  const renderList = () => {
    list.innerHTML = "";
    for (const m of MOTIFS) {
      if (activeType !== "all" && m.type !== activeType) continue;
      const b = document.createElement("button");
      b.className = "motif-row" + (m.id === selected ? " sel" : "");
      b.innerHTML = `<span class="mid">${m.id}</span><br>${esc(m.name)}`;
      b.onclick = () => { selected = m.id; renderList(); renderDetail(); };
      list.append(b);
    }
  };

  const renderDetail = () => {
    const m = MOTIFS.find((x) => x.id === selected);
    if (!m) return;
    let html = `
      <div class="mid-tag">${m.id} · ${m.type.toUpperCase()}</div>
      <h2>${esc(m.name)}</h2>
      <div class="badges">
        <span class="badge tier">tier: ${m.tier}</span>
        <span class="badge val-${m.valence}">valence: ${m.valence}</span>
        <span class="badge">intensity: ${m.intensity}</span>
        <span class="badge">family: ${m.compound_family}</span>
      </div>
      <p class="motif-notes">${esc(m.notes || "")}</p>
      <p class="motif-tags">tags: ${(m.tags || []).map(esc).join(" · ")}</p>`;

    if (m.palette) {
      html += `<div class="hooks"><h4>PALETTE — “${esc(m.palette.name)}”</h4></div>
        <div class="swatches">${m.palette.hex
          .map((h) => `<button class="swatch" style="background:${h}" data-hex="${h}" title="click to copy ${h}">${h}</button>`)
          .join("")}</div>
        <p class="motif-tags">${esc(m.palette.notes || "")}</p>`;
    }
    if (m.hooks) {
      html += `<div class="hooks">`;
      for (const key of ["palette", "textures", "typography", "motion"]) {
        if (!m.hooks[key]) continue;
        html += `<h4>ART HOOKS — ${key.toUpperCase()}</h4>
          <div class="hook-chips">${m.hooks[key].map((x) => `<span class="hook-chip">${esc(x)}</span>`).join("")}</div>`;
      }
      html += `</div>`;
    }
    detail.innerHTML = html;
    detail.querySelectorAll(".swatch").forEach((sw) => {
      sw.onclick = () => {
        navigator.clipboard?.writeText(sw.dataset.hex);
        sw.style.outline = "2px solid #fff";
        setTimeout(() => (sw.style.outline = ""), 300);
      };
    });
  };

  for (const t of ["all", ...Object.keys(TYPE_LABELS)]) {
    const c = document.createElement("button");
    c.className = "chip" + (t === activeType ? " on" : "");
    c.textContent = t === "all" ? "ALL" : TYPE_LABELS[t];
    c.onclick = () => {
      activeType = t;
      filters.querySelectorAll(".chip").forEach((x) => x.classList.remove("on"));
      c.classList.add("on");
      renderList();
    };
    filters.append(c);
  }

  renderList();
  renderDetail();
  return root;
}

/* ============================================================
   CODEX — entity portrait cards (art/entity_codex.yaml)
   ============================================================ */

export function codexApp() {
  const root = document.createElement("div");
  root.className = "codex-grid";
  for (const p of Object.values(PORTRAITS)) {
    const card = document.createElement("div");
    card.className = "codex-card";
    card.innerHTML = `
      <pre>${esc(p.art)}</pre>
      <h3>${esc(p.name)}</h3>
      <div class="proc">${esc(p.proc)}</div>
      <p>${esc(p.line)}</p>`;
    root.append(card);
  }
  return root;
}

/* ============================================================
   TRANSIT.MAP — underlayer metro diagram (art/METRO_MAP_LABELS.md)
   ============================================================ */

const METRO_LINES = [
  { name: "SIGNAL", color: "#00E5FF", pts: "60,300 220,300 300,220 420,220 500,140 640,140",
    stations: [
      { x: 60,  y: 300, id: "THR_CARRIER_WAVE", label: "CARRIER WAVE", anchor: "start", dy: 22 },
      { x: 300, y: 220, id: "THR_POP", label: "THE POP ⊕ TRANSFER: MODE SWITCH", anchor: "end", dx: -16, dy: 4, hub: true },
      { x: 640, y: 140, id: "THR_ZIPPER", label: "THE ZIPPER · SEAM ACCESS", anchor: "end", dy: -12 },
    ] },
  { name: "UI", color: "#FF2EEA", pts: "300,380 300,220 380,140 380,60",
    stations: [
      { x: 300, y: 380, id: "LOC_DESKTOP_ENV", label: "DESKTOP ENV", anchor: "middle", dy: 22 },
      { x: 380, y: 140, id: "LOC_WAITING_ROOM", label: "WAITING ROOM", anchor: "start", dx: 12, dy: 4 },
      { x: 380, y: 60,  id: "LOC_PALACE_UI", label: "PALACE / CATHEDRAL · NOTICE: HDR RENDER", anchor: "middle", dy: -12 },
    ] },
  { name: "VOID", color: "#FFD400", pts: "500,140 560,80 660,80",
    stations: [
      { x: 560, y: 80, id: "LOC_VOID", label: "THE VOID", anchor: "middle", dy: 22 },
      { x: 660, y: 80, id: "LOC_BIOS_LAYER", label: "BIOS / WHITE LIGHT ▣ TERMINUS", anchor: "end", dy: -12 },
    ] },
  { name: "DISSOC", color: "#7C4DFF", pts: "220,300 160,360 160,430",
    stations: [
      { x: 160, y: 360, id: "LOC_BUFFER_VOID", label: "BUFFER VOID", anchor: "end", dx: -12, dy: 4 },
      { x: 160, y: 430, id: "LOC_K_HOLE_VOID", label: "K-HOLE KERNEL · NO RETURN", anchor: "start", dy: 22 },
    ] },
  { name: "CACHE", color: "#B8FF00", pts: "300,380 420,380 480,440",
    stations: [
      { x: 420, y: 380, id: "LOC_TRASH_CACHE", label: "TRASH CACHE", anchor: "middle", dy: -12 },
      { x: 480, y: 440, id: "LOC_DELIRIANT_BASEMENT", label: "DELIRIANT BASEMENT ⚠ WATCHER ACTIVE", anchor: "middle", dy: 22 },
    ] },
  { name: "PLAY", color: "#FF7A00", pts: "380,140 500,140 580,220 580,300",
    stations: [
      { x: 500, y: 140, id: "LOC_NURSERY", label: "THE NURSERY", anchor: "start", dx: 10, dy: 20 },
      { x: 580, y: 300, id: "LOC_LIBRARY_LIVES", label: "LIBRARY OF LIVES", anchor: "middle", dy: 24 },
    ] },
];

export function metroApp(openMotif) {
  const root = document.createElement("div");
  root.className = "metro";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 720 490");

  let defs = `<text x="16" y="28" fill="var(--a1)" font-size="15" letter-spacing="4">UNDERLAYER TRANSIT AUTHORITY</text>
    <text x="16" y="44" fill="var(--ink-dim)" font-size="8" letter-spacing="2">NOT TO SCALE. NOT TO BASELINE. MIND THE SEAM.</text>`;
  let g = "";

  METRO_LINES.forEach((line, i) => {
    g += `<polyline points="${line.pts}" fill="none" stroke="${line.color}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>`;
    defs += `<g><rect x="16" y="${60 + i * 17}" width="18" height="7" fill="${line.color}"/>
      <text x="40" y="${67 + i * 17}" fill="var(--ink-dim)" font-size="8" letter-spacing="1.5">${line.name} LINE</text></g>`;
  });
  for (const line of METRO_LINES) {
    for (const s of line.stations) {
      const r = s.hub ? 9 : 6;
      g += `<g class="station" data-id="${s.id}">
        <circle cx="${s.x}" cy="${s.y}" r="${r}" fill="var(--bg)" stroke="${line.color}" stroke-width="3"/>
        ${s.hub ? `<circle cx="${s.x}" cy="${s.y}" r="3" fill="${line.color}"/>` : ""}
        <text x="${s.x + (s.dx || 0)}" y="${s.y + (s.dy || 0)}" fill="var(--ink)" font-size="8.5" letter-spacing="1" text-anchor="${s.anchor}">${s.label}</text>
      </g>`;
    }
  }
  svg.innerHTML = defs + g;
  svg.querySelectorAll(".station").forEach((st) => {
    st.addEventListener("click", () => openMotif(st.dataset.id));
  });
  root.append(svg);
  return root;
}

/* ============================================================
   TERMINAL — the brain is a terminal (MSG_BRAIN_TERMINAL)
   ============================================================ */

export function terminalApp(os) {
  const root = document.createElement("div");
  root.className = "term";
  const out = document.createElement("div");
  out.className = "term-out";
  const inWrap = document.createElement("div");
  inWrap.className = "term-in";
  const input = document.createElement("input");
  input.spellcheck = false;
  input.autocapitalize = "off";
  inWrap.innerHTML = `<span class="prompt">intruder@underlayer:~$</span>`;
  inWrap.append(input);
  root.append(out, inWrap);

  const print = (text, cls = "") =>
    out.insertAdjacentHTML("beforeend", cls ? `<span class="${cls}">${text}</span>\n` : `${text}\n`);
  const scroll = () => (out.scrollTop = out.scrollHeight);

  print(esc(LOGO), "sys");
  print("");
  print("TERMINAL MODE: CONNECTED — session established.", "ok");
  print("the underlayer is not inside your head. your brain is a terminal.", "dim");
  print("type <span class='gold'>help</span> for available syscalls.", "dim");

  const CMDS = {
    help: () => {
      print("syscalls:", "sys");
      print("  motifs [type]     list canon motifs (ent/loc/geo/thr/msg/emo)");
      print("  cat <MOTIF_ID>    read a motif record");
      print("  summon <entity>   render an entity (elves, mantis, jester, hatman, gaia, admins, spiders)");
      print("  inject <key>      switch cosmological layer (see: layers)");
      print("  layers            list access levels");
      print("  notify            fire a random system notification");
      print("  sticker           print a line from the sticker sheet");
      print("  whoami / look / panic / clear / reboot");
    },
    layers: () => {
      for (const [k, L] of Object.entries(os.layers))
        print(`  ${k.padEnd(8)} ${L.molecule.padEnd(22)} ${L.access.padEnd(14)} ${L.name}`, k === os.layerId ? "ok" : "");
      print("usage: inject <dmt|psilocybin|salvia|5-meo|dph>", "dim");
    },
    motifs: (arg) => {
      const map = { ent: "entity", loc: "location", geo: "geometry", thr: "threshold", msg: "message", emo: "emotion" };
      const t = map[arg] || arg;
      const rows = MOTIFS.filter((m) => !arg || m.type === t);
      for (const m of rows) print(`  <span class="sys">${m.id.padEnd(26)}</span> ${esc(m.name)} <span class="dim">[${m.tier}/${m.valence}]</span>`);
      print(`${rows.length} records.`, "dim");
    },
    cat: (arg) => {
      const m = MOTIFS.find((x) => x.id.toLowerCase() === String(arg).toLowerCase());
      if (!m) return print(`cat: ${esc(arg)}: OBJECT NOT FOUND — PHANTOM LOOP`, "err");
      print(`${m.id} — ${esc(m.name)}`, "gold");
      print(`  type=${m.type} tier=${m.tier} valence=${m.valence} intensity=${m.intensity}`);
      print(`  family=${m.compound_family}`);
      print(`  tags: ${(m.tags || []).join(", ")}`, "dim");
      print(`  ${esc(m.notes || "")}`);
      if (m.palette) print(`  palette “${esc(m.palette.name)}”: ${m.palette.hex.join(" ")}`, "magic");
    },
    summon: (arg) => {
      const key = String(arg || "").toLowerCase();
      const alias = { elf: "elves", hat: "hatman", spider: "spiders", admin: "admins" };
      const p = PORTRAITS[key] || PORTRAITS[alias[key]];
      if (!p) return print(`summon: ${esc(arg)}: entity not in codex. try: ${Object.keys(PORTRAITS).join(", ")}`, "err");
      print(esc(p.art), "magic");
      print(`${p.name} — ${esc(p.proc)}`, "gold");
      print(esc(p.line), "dim");
      os.sound.blip();
    },
    inject: (arg) => {
      const hit = os.findLayer(arg);
      if (!hit) return print(`inject: ${esc(arg)}: LOGIN CREDENTIAL DENIED`, "err");
      print(`credential accepted: ${os.layers[hit].molecule}`, "ok");
      print(`access level: ${os.layers[hit].access}`, "gold");
      os.setLayer(hit);
    },
    notify: () => {
      const n = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
      os.toast(n);
      print(`fired: ${esc(n.title)}`, "dim");
    },
    sticker: () => print(STICKERS[Math.floor(Math.random() * STICKERS.length)], "magic"),
    whoami: () => { print("UNAUTHORIZED INTRUDER", "err"); print("presence detected in back-end. admins are aware.", "dim"); },
    look: () => { print("JUST LOOK", "magic"); print("attention is the key. reticle engaged.", "dim"); },
    panic: () => {
      print("PANIC PROTOCOL ENGAGED", "err");
      print("colonel_panic_supervisor.exe has been notified.", "dim");
      print("SYSTEM PROMPT: DO NOT BE AFRAID", "magic");
      os.toast(NOTIFICATIONS.find((n) => n.title.includes("DO NOT BE AFRAID")) || NOTIFICATIONS[10], true);
    },
    clear: () => (out.innerHTML = ""),
    reboot: () => { print("re-establishing baseline handshake…", "sys"); setTimeout(() => location.reload(), 800); },
    exit: () => print("there is no exit. there is only the seam.", "dim"),
    ls: () => print("motifs.db   codex.ent   transit.map   loosh_refinery/   .hatman_is_watching", "sys"),
    sudo: () => print("PERMISSION DENIED — you are not an admin. you are barely a process.", "err"),
  };

  const history = [];
  let hi = 0;
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = history[hi] || ""; return; }
    if (e.key === "ArrowDown") { e.preventDefault(); hi = Math.min(history.length, hi + 1); input.value = history[hi] || ""; return; }
    if (e.key !== "Enter") return;
    const raw = input.value.trim();
    input.value = "";
    if (!raw) return;
    history.push(raw);
    hi = history.length;
    print(`<span class="ok">intruder@underlayer:~$</span> ${esc(raw)}`);
    const [cmd, ...rest] = raw.split(/\s+/);
    const fn = CMDS[cmd.toLowerCase()];
    if (fn) fn(rest.join(" "));
    else print(`${esc(cmd)}: command not found — CACHE OVERFLOW? try: help`, "err");
    scroll();
  });

  setTimeout(() => input.focus(), 100);
  root.addEventListener("click", (e) => { if (!window.getSelection()?.toString()) input.focus(); });
  return root;
}

/* ============================================================
   INJECT — molecule = login credential (MSG_MOLECULE_LOGIN)
   ============================================================ */

export function injectApp(os) {
  const root = document.createElement("div");
  root.className = "inject-list";
  const head = document.createElement("p");
  head.innerHTML = `<span style="color:var(--a2);letter-spacing:.2em">MSG_MOLECULE_LOGIN</span><br>
    <span style="color:var(--ink-dim);font-size:11px">different credentials grant different access levels. choose your layer.</span>`;
  root.append(head);

  const render = () => {
    root.querySelectorAll(".cred").forEach((x) => x.remove());
    for (const [key, L] of Object.entries(os.layers)) {
      const b = document.createElement("button");
      b.className = "cred" + (key === os.layerId ? " current" : "");
      b.innerHTML = `
        <span class="cred-dot" style="background:${L.dot};color:${L.dot}"></span>
        <span><b>${L.molecule}</b><i>${L.name}</i></span>
        <span class="lvl">${L.access}${key === os.layerId ? " · ACTIVE" : ""}</span>`;
      b.onclick = () => { os.setLayer(key); render(); };
      root.append(b);
    }
  };
  render();
  return root;
}

/* ============================================================
   README — about window
   ============================================================ */

export function readmeApp() {
  const root = document.createElement("div");
  root.className = "readme";
  root.innerHTML = `
    <h1>GHOST//OS v3.0_UNDERLAYER</h1>
    <p>Reality, rendered as an operating system UI. This machine is an interactive
    front-end for the <a href="https://github.com/merrypranxter/ghost-erowid-cosmology" target="_blank" rel="noopener">ghost-erowid-cosmology</a>
    world-bible — a fictional taxonomy of recurring psychedelic phenomenology
    reframed as OS architecture. Narrative fiction; nothing here is advice of any kind.</p>
    <h2>HOW TO OPERATE THIS REALITY</h2>
    <ul>
      <li>Wallpapers are the canon GLSL shaders, live. <span class="kbd">INJECT.KEY</span> switches cosmological layers — molecule = login credential.</li>
      <li><span class="kbd">MOTIFS.DB</span> — all 52 canon motifs with palettes + art hooks.</li>
      <li><span class="kbd">TERMINAL</span> — try <span class="kbd">summon hatman</span>, <span class="kbd">inject salvia</span>, <span class="kbd">cat THR_ZIPPER</span>, <span class="kbd">whoami</span>.</li>
      <li><span class="kbd">TRANSIT.MAP</span> — the underlayer as a subway diagram. Stations are clickable.</li>
      <li><span class="kbd">ASCII</span> toggle (top bar) re-renders the wallpaper as live text. Text is part of the image.</li>
    </ul>
    <h2>THE STACK</h2>
    <ul>
      <li>BIOS / white light — 5-MeO — ROOT_SHELL</li>
      <li>Kernel / salvia factory floor — KERNEL SPACE</li>
      <li>Database / library of lives — READ_ONLY</li>
      <li>UI / the dome, cathedral, waiting room — USER SPACE</li>
      <li>Crash layer / deliriant basement — TRASH CACHE ⚠</li>
    </ul>
    <p style="margin-top:10px;color:var(--ink-dim)">Built with zero dependencies: vanilla ES modules,
    WebGL 1, Web Audio, and an unreasonable quantity of box-drawing characters.</p>
    <p style="margin-top:6px"><span class="kbd">DO NOT BE AFRAID</span> <span class="kbd">JUST LOOK</span> <span class="kbd">MORE REAL THAN REAL</span></p>`;
  return root;
}
