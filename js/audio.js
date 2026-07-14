// GHOST//OS — sound design
// Cues from audio/SOUND_DESIGN_CUES.md + docs/COSMOLOGICAL_LAYERS.yaml
// frequency_signatures: schumann 7.83Hz idle, carrier 440Hz -> ultrasonic,
// gamma spike 33.3-40Hz hardware resonance.

export class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  _ac() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  // THR_CARRIER_WAVE — rising sine, 440Hz ramp toward breakthrough
  carrierWave(seconds = 5) {
    if (this.muted) return;
    const ac = this._ac();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + seconds * 0.4);
    osc.frequency.exponentialRampToValueAtTime(3200, t + seconds);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.4);
    gain.gain.setValueAtTime(0.06, t + seconds - 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    // gentle tremolo at 7.83Hz (schumann idle)
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 7.83;
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(gain.gain);
    osc.connect(gain).connect(ac.destination);
    osc.start(t); lfo.start(t);
    osc.stop(t + seconds); lfo.stop(t + seconds);
  }

  // THR_POP — single-frame click + white flash companion
  pop() {
    if (this.muted) return;
    const ac = this._ac();
    const t = ac.currentTime;
    const len = ac.sampleRate * 0.06;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    gain.gain.value = 0.25;
    src.buffer = buf;
    src.connect(gain).connect(ac.destination);
    src.start(t);
  }

  // notification blip — two-tone UI chirp
  blip(alert = false) {
    if (this.muted) return;
    const ac = this._ac();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = alert ? "square" : "sine";
    osc.frequency.setValueAtTime(alert ? 660 : 880, t);
    osc.frequency.setValueAtTime(alert ? 440 : 1320, t + 0.07);
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // keystroke tick for the boot log
  tick() {
    if (this.muted) return;
    const ac = this._ac();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.value = 1800 + Math.random() * 600;
    gain.gain.setValueAtTime(0.008, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }
}
