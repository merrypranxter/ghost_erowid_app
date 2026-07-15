import { ArchiveExplorer, ALL_ENTRIES, renderReader, SOURCE_MANIFEST } from "./archive.js";
import { SoundSystem } from "./audio.js";
import { PhenomenaField } from "./gl.js";
import { SignalOrganism } from "./organism.js";
import { PROFILE_ORDER, PROFILES } from "./profiles.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const INTENSITIES = [
  { label: "CALM", value: 0 },
  { label: "ALTERED", value: 1 },
  { label: "COSMIC", value: 2 },
  { label: "ABSOLUTELY FUCKED", value: 3 },
];

const state = {
  profileId: "dmt",
  view: "threshold",
  intensity: Number.parseInt(localStorage.getItem("ghost-intensity") || "2", 10),
  reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches || localStorage.getItem("ghost-motion") === "reduced",
  soundOn: false,
  rifting: false,
  currentEntry: null,
  ghostTimer: null,
};

if (!Number.isFinite(state.intensity) || state.intensity < 0 || state.intensity > 3) state.intensity = 2;

const sound = new SoundSystem();
sound.muted = true;

const field = new PhenomenaField($("#phenomena-field"), {
  reducedMotion: state.reducedMotion,
  intensity: state.intensity,
});
const organism = new SignalOrganism($("#signal-organism"), PROFILES[state.profileId], {
  reducedMotion: state.reducedMotion,
  intensity: state.intensity,
});

const explorer = new ArchiveExplorer($("#archive"), {
  onProfile: (profileId) => transitionProfile(profileId),
  onOpen: (entry) => openEntry(entry),
});

function showView(view) {
  state.view = view;
  document.body.dataset.view = view;
  $$(".view").forEach((element) => {
    const visible = element.id === view || (view === "atlas" && element.id === "archive");
    element.classList.toggle("is-visible", visible);
    if (element.id === "reader") element.setAttribute("aria-hidden", String(!visible));
  });
  organism.setMode(view === "threshold" ? "threshold" : view === "reader" ? "reader" : "atlas");
}

function setProfileVisual(profileId) {
  const profile = PROFILES[profileId] || PROFILES.dmt;
  state.profileId = profile.id;
  document.body.dataset.profile = profile.id;
  field.use(profile.shader);
  organism.setProfile(profile);
  $("[data-footer-signal]").textContent = profile.thesis;
  $("[data-vital-text]").textContent = `${profile.label} PHYSICS ACTIVE / ${ALL_ENTRIES.length} SIGNALS`;
}

function rift(message, midpoint) {
  if (state.reducedMotion) {
    midpoint?.();
    return;
  }
  if (state.rifting) return;
  state.rifting = true;
  const element = $("[data-rift]");
  $("[data-rift-text]").textContent = message;
  element.classList.remove("is-rifting");
  void element.offsetWidth;
  element.classList.add("is-rifting");
  sound.pop();
  setTimeout(() => midpoint?.(), 410);
  setTimeout(() => {
    element.classList.remove("is-rifting");
    state.rifting = false;
  }, 950);
}

function transitionProfile(profileId) {
  const profile = PROFILES[profileId];
  if (!profile || profileId === state.profileId) return;
  rift(`${profile.transition.toUpperCase()} TRANSITION / ${profile.label} PHYSICS`, () => {
    setProfileVisual(profileId);
    showGhost(profile);
    updateRoute("atlas", profileId);
  });
}

function enterArchive(profileId = "dmt", { push = true } = {}) {
  const profile = PROFILES[profileId] || PROFILES.dmt;
  rift(`THRESHOLD EVENT / ${profile.transition.toUpperCase()}`, () => {
    explorer.setProfile(profile.id, { announce: false });
    setProfileVisual(profile.id);
    showView("atlas");
    if (push) updateRoute("atlas", profile.id);
    setTimeout(() => showGhost(profile), 950);
  });
}

function readerAscii(entry, profile) {
  const chars = Array.from(profile.chars);
  const title = entry.shortTitle.toUpperCase();
  const width = 34;
  const lines = [];
  for (let y = 0; y < 18; y += 1) {
    let line = "";
    for (let x = 0; x < width; x += 1) {
      const dx = x - width / 2;
      const dy = y - 9;
      const ring = Math.abs(Math.sqrt(dx * dx * 0.42 + dy * dy) - (4 + (y % 4)));
      line += ring < 1.2 ? chars[(x * 3 + y * 5) % chars.length] : (x + y) % 11 === 0 ? "·" : " ";
    }
    lines.push(line);
  }
  lines.splice(8, 1, title.slice(0, width).padStart(Math.floor((width + title.length) / 2)).padEnd(width));
  return lines.join("\n");
}

function paintReader(entry) {
  const profile = PROFILES[entry.profileId];
  const rendered = renderReader(entry, profile);
  state.currentEntry = entry;
  explorer.currentEntry = entry;
  setProfileVisual(profile.id);
  $("[data-reader-eyebrow]").textContent = rendered.eyebrow;
  $("[data-reader-title]").textContent = rendered.title;
  $("[data-reader-warning]").innerHTML = rendered.warning;
  $("[data-reader-body]").innerHTML = rendered.body;
  $("[data-reader-profile]").textContent = profile.label;
  $("[data-reader-ascii]").textContent = readerAscii(entry, profile);
  $("#reader").dataset.watermark = profile.glyph;

  const profileEntries = explorer.entriesForProfile(entry.profileId);
  const index = profileEntries.findIndex((item) => item.id === entry.id);
  $("[data-reader-position]").textContent = `RECORD ${String(index + 1).padStart(3, "0")} / ${String(profileEntries.length).padStart(3, "0")}`;
  const previous = explorer.adjacent(-1);
  const next = explorer.adjacent(1);
  $("[data-reader-prev] b").textContent = previous?.shortTitle || "";
  $("[data-reader-next] b").textContent = next?.shortTitle || "";
  $("#reader").scrollTop = 0;
  showView("reader");
}

function openEntry(entry, { push = true, animate = true } = {}) {
  if (!entry) return;
  const perform = () => {
    if (explorer.profileId !== entry.profileId) explorer.setProfile(entry.profileId, { announce: false });
    paintReader(entry);
    if (push) updateRoute("reader", entry.profileId, entry.id);
    if (Math.random() < 0.45) setTimeout(() => showGhost(PROFILES[entry.profileId]), 1300);
  };
  if (animate) rift(`OPENING ${entry.section.toUpperCase()} SIGNAL / ${entry.shortTitle.toUpperCase()}`, perform);
  else perform();
}

function closeReader({ push = true } = {}) {
  const profile = PROFILES[state.profileId];
  rift("REASSEMBLING THE CONSTELLATION", () => {
    showView("atlas");
    if (push) updateRoute("atlas", profile.id);
  });
}

function showThreshold({ push = true } = {}) {
  rift("RETURNING TO OBSERVER SPACE", () => {
    state.currentEntry = null;
    setProfileVisual("dmt");
    showView("threshold");
    if (push) updateRoute("threshold");
  });
}

function updateRoute(view, profileId = state.profileId, entryId = null) {
  let hash = "#/";
  if (view === "atlas") hash = `#/atlas/${profileId}`;
  if (view === "reader" && entryId) hash = `#/atlas/${profileId}/${entryId}`;
  history.pushState({ view, profileId, entryId }, "", hash);
}

function applyRoute({ animate = false } = {}) {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] !== "atlas") {
    setProfileVisual("dmt");
    showView("threshold");
    return;
  }
  const profileId = PROFILES[parts[1]] ? parts[1] : "dmt";
  explorer.setProfile(profileId, { announce: false });
  setProfileVisual(profileId);
  const entry = parts[2] ? ALL_ENTRIES.find((item) => item.id === parts[2]) : null;
  if (entry) openEntry(entry, { push: false, animate });
  else showView("atlas");
}

function showGhost(profile = PROFILES[state.profileId]) {
  clearTimeout(state.ghostTimer);
  const box = $("[data-ghost-transmission]");
  const visits = Number.parseInt(sessionStorage.getItem("ghost-visits") || "0", 10) + 1;
  sessionStorage.setItem("ghost-visits", String(visits));
  const messages = profile.ghost;
  $("[data-ghost-text]").textContent = messages[visits % messages.length];
  box.hidden = false;
  state.ghostTimer = setTimeout(() => { box.hidden = true; }, 6500);
}

function openSearch() {
  const voidElement = $("[data-search-void]");
  voidElement.hidden = false;
  requestAnimationFrame(() => $("[data-search-input]").focus());
}

function closeSearch() {
  $("[data-search-void]").hidden = true;
  $("[data-search-results]").hidden = true;
}

function updateIntensity() {
  state.intensity = ((state.intensity % INTENSITIES.length) + INTENSITIES.length) % INTENSITIES.length;
  const setting = INTENSITIES[state.intensity];
  document.documentElement.dataset.intensity = String(setting.value);
  $("[data-intensity-control] b").textContent = setting.label;
  field.setIntensity(setting.value);
  organism.setIntensity(setting.value);
  localStorage.setItem("ghost-intensity", String(setting.value));
}

function updateMotionControl() {
  document.documentElement.classList.toggle("reduced-motion", state.reducedMotion);
  const button = $("[data-motion-control]");
  button.setAttribute("aria-pressed", String(state.reducedMotion));
  $("b", button).textContent = state.reducedMotion ? "MOTION LOW" : "MOTION";
  field.setReducedMotion(state.reducedMotion);
  organism.setReducedMotion(state.reducedMotion);
}

function bindControls() {
  $$('[data-enter-profile]').forEach((button) => {
    button.addEventListener("click", () => enterArchive(button.dataset.enterProfile));
  });
  $$('[data-home]').forEach((button) => button.addEventListener("click", () => showThreshold()));
  $("[data-reader-close]").addEventListener("click", () => closeReader());
  $("[data-reader-prev]").addEventListener("click", () => openEntry(explorer.adjacent(-1)));
  $("[data-reader-next]").addEventListener("click", () => openEntry(explorer.adjacent(1)));
  $("[data-search-open]").addEventListener("click", openSearch);
  $("[data-search-close]").addEventListener("click", closeSearch);

  $("[data-intensity-control]").addEventListener("click", () => {
    state.intensity = (state.intensity + 1) % INTENSITIES.length;
    updateIntensity();
  });
  $("[data-motion-control]").addEventListener("click", () => {
    state.reducedMotion = !state.reducedMotion;
    localStorage.setItem("ghost-motion", state.reducedMotion ? "reduced" : "full");
    updateMotionControl();
  });
  $("[data-sound-control]").addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    sound.muted = !state.soundOn;
    const button = $("[data-sound-control]");
    button.setAttribute("aria-pressed", String(state.soundOn));
    $("b", button).textContent = state.soundOn ? "SOUND ON" : "SOUND OFF";
    if (state.soundOn) sound.blip();
  });

  document.addEventListener("keydown", (event) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName || "");
    if (event.key === "Escape") {
      if (!$("[data-search-void]").hidden) closeSearch();
      else if (state.view === "reader") closeReader();
      return;
    }
    if (event.key === "/" && !typing) {
      event.preventDefault();
      openSearch();
      return;
    }
    if (state.view === "reader" && !typing && event.key === "ArrowLeft") openEntry(explorer.adjacent(-1));
    if (state.view === "reader" && !typing && event.key === "ArrowRight") openEntry(explorer.adjacent(1));
    if (state.view === "atlas" && !typing && /^[1-7]$/.test(event.key)) {
      explorer.setProfile(PROFILE_ORDER[Number(event.key) - 1]);
    }
  });

  window.addEventListener("popstate", () => applyRoute({ animate: false }));
}

function tickClock() {
  const now = new Date();
  const clock = $("[data-clock]");
  if (Math.random() < 0.006) {
    clock.textContent = "∞:∞:∞";
    setTimeout(() => { clock.textContent = new Date().toTimeString().slice(0, 8); }, 380);
  } else {
    clock.textContent = now.toTimeString().slice(0, 8);
  }
}

function init() {
  document.documentElement.dataset.intensity = String(state.intensity);
  $("[data-vital-text]").textContent = `ARCHIVE DREAMING / ${ALL_ENTRIES.length} SIGNALS / ${SOURCE_MANIFEST.sourceFileCount} FILES`;
  explorer.render();
  updateIntensity();
  updateMotionControl();
  bindControls();
  applyRoute({ animate: false });
  tickClock();
  setInterval(tickClock, 1000);
  setTimeout(() => {
    if (state.view !== "threshold") showGhost(PROFILES[state.profileId]);
  }, 9000);
}

init();
