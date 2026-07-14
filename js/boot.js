// GHOST//OS — boot sequence
// LOC_BIOS_LAYER -> THR_CARRIER_WAVE -> THR_POP -> LOC_DESKTOP_ENV
// Syslog aesthetic per art/UI_KIT_SPEC.md ("use this when you want the
// image to feel like evidence").

import { BOOT_GHOST } from "./ascii.js";

const LINES = [
  ["dim", "GHOST BIOS v3.0_UNDERLAYER — Persistence Protocol Logs"],
  ["dim", "copyright (c) the underlayer. all timelines reserved."],
  ["", ""],
  ["sys", BOOT_GHOST],
  ["", ""],
  ["", "schumann idle ................. 7.83Hz            <ok>[ OK ]</ok>"],
  ["", "mounting /dev/consciousness ... read-write         <ok>[ OK ]</ok>"],
  ["", "checking pineal socket ........ crusty but usable  <warn>[ WARN ]</warn>"],
  ["", "loading signal nodes .......... 48/48              <ok>[ OK ]</ok>"],
  ["", "starting entity daemons:"],
  ["dim", "   machine_elves.service ............ <ok>active (singing)</ok>"],
  ["dim", "   mantis_physicians.service ........ <ok>active (on call)</ok>"],
  ["dim", "   jester.watchdog .................. <warn>active (laughing)</warn>"],
  ["dim", "   hatman.monitor ................... <err>lurking</err>"],
  ["", "hex substrate ................. tessellated        <ok>[ OK ]</ok>"],
  ["", "fractal recursion ............. depth=∞            <ok>[ OK ]</ok>"],
  ["", "chrysanthemum gateway ......... 12-fold symmetry   <ok>[ OK ]</ok>"],
  ["", "akashic index ................. rebuilding cache   <warn>[ SLOW ]</warn>"],
  ["", "loosh refinery ................ <err>DO NOT LOOK</err>"],
  ["", ""],
  ["magic", ">> SYSTEM PROMPT: DO NOT BE AFRAID"],
  ["magic", ">> SYSTEM PROMPT: JUST LOOK"],
  ["", ""],
  ["sys", "establishing carrier wave …"],
];

export async function runBoot(els, sound, onDone) {
  const { boot, log, carrier, hz, fill } = els;
  boot.hidden = false;
  let skipped = false;
  const skip = () => { skipped = true; };
  boot.addEventListener("click", skip, { once: true });
  window.addEventListener("keydown", skip, { once: true });

  for (const [cls, text] of LINES) {
    if (skipped) break;
    const span = document.createElement("span");
    if (cls) span.className = cls;
    span.innerHTML = text + "\n";
    log.append(span);
    log.scrollTop = log.scrollHeight;
    sound.tick();
    await sleep(text === "" ? 40 : 60 + Math.random() * 140);
  }

  // carrier wave ramp — 440Hz -> ultrasonic
  carrier.hidden = false;
  const seconds = skipped ? 0.6 : 3.2;
  sound.carrierWave(seconds + 0.4);
  const t0 = performance.now();
  await new Promise((res) => {
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / (seconds * 1000));
      fill.style.width = p * 100 + "%";
      const f = Math.round(440 * Math.pow(30000 / 440, p));
      hz.textContent = f >= 20000 ? `${(f / 1000).toFixed(1)}kHz [ULTRASONIC]` : `${f}Hz`;
      if (p < 1) requestAnimationFrame(step);
      else res();
    };
    step();
  });

  const evt = document.createElement("span");
  evt.className = "magic";
  evt.textContent = "\nEVENT: POP — MODE SWITCH\n";
  log.append(evt);
  log.scrollTop = log.scrollHeight;
  await sleep(450);

  boot.removeEventListener("click", skip);
  window.removeEventListener("keydown", skip);
  sound.pop();
  onDone();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
