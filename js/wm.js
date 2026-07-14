// GHOST//OS — window manager
// Dialog chrome per art/UI_KIT_SPEC.md: ALL CAPS title bars,
// [ACKNOWLEDGE] / [EJECT] buttons, windows as evidence.

let zTop = 100;

export class WindowManager {
  constructor(root, taskbar) {
    this.root = root;
    this.taskbar = taskbar;
    this.wins = new Map(); // id -> { el, taskBtn }
  }

  toggle(id, opts) {
    if (this.wins.has(id)) { this.close(id); return null; }
    return this.open(id, opts);
  }

  open(id, { title, body, x, y, w, h }) {
    if (this.wins.has(id)) { this.focus(id); return this.wins.get(id).el; }

    const el = document.createElement("section");
    el.className = "win spawning";
    el.style.width = (w || 520) + "px";
    el.style.height = (h || 420) + "px";
    const pad = 40 + (this.wins.size % 5) * 28;
    el.style.left = (x ?? Math.max(130, (window.innerWidth - (w || 520)) / 2 + pad - 70)) + "px";
    el.style.top = (y ?? Math.max(50, (window.innerHeight - (h || 420)) / 2 + pad - 70)) + "px";
    el.style.zIndex = ++zTop;

    const bar = document.createElement("div");
    bar.className = "win-title";
    bar.innerHTML = `<span class="t">${title}</span>`;
    const btnMin = document.createElement("button");
    btnMin.className = "win-btn";
    btnMin.textContent = "[MIN]";
    const btnClose = document.createElement("button");
    btnClose.className = "win-btn";
    btnClose.textContent = "[EJECT]";
    bar.append(btnMin, btnClose);

    const bodyEl = document.createElement("div");
    bodyEl.className = "win-body";
    if (typeof body === "string") bodyEl.innerHTML = body;
    else bodyEl.append(body);

    const grip = document.createElement("div");
    grip.className = "win-resize";
    grip.textContent = "◢";

    el.append(bar, bodyEl, grip);
    this.root.append(el);
    el.addEventListener("animationend", () => el.classList.remove("spawning"), { once: true });

    // taskbar entry
    const taskBtn = document.createElement("button");
    taskBtn.className = "task-item";
    taskBtn.textContent = title.split("—")[0].trim();
    taskBtn.onclick = () => {
      if (el.style.display === "none") { el.style.display = "flex"; this.focus(id); }
      else if (el.classList.contains("focused")) el.style.display = "none";
      else this.focus(id);
    };
    this.taskbar.append(taskBtn);

    this.wins.set(id, { el, taskBtn });

    btnClose.onclick = () => this.close(id);
    btnMin.onclick = () => { el.style.display = "none"; };
    el.addEventListener("pointerdown", () => this.focus(id));
    this._drag(el, bar);
    this._resize(el, grip);
    this.focus(id);
    return el;
  }

  focus(id) {
    for (const [wid, { el, taskBtn }] of this.wins) {
      const on = wid === id;
      el.classList.toggle("focused", on);
      taskBtn.classList.toggle("active", on);
      if (on) el.style.zIndex = ++zTop;
    }
  }

  close(id) {
    const w = this.wins.get(id);
    if (!w) return;
    this.wins.delete(id);
    w.taskBtn.remove();
    w.el.classList.add("ejecting");
    w.el.addEventListener("animationend", () => w.el.remove(), { once: true });
  }

  _drag(el, bar) {
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".win-btn")) return;
      const startX = e.clientX - el.offsetLeft;
      const startY = e.clientY - el.offsetTop;
      const move = (ev) => {
        el.style.left = Math.max(0, Math.min(window.innerWidth - 80, ev.clientX - startX)) + "px";
        el.style.top = Math.max(34, Math.min(window.innerHeight - 60, ev.clientY - startY)) + "px";
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }

  _resize(el, grip) {
    grip.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const sw = el.offsetWidth - e.clientX;
      const sh = el.offsetHeight - e.clientY;
      const move = (ev) => {
        el.style.width = Math.max(300, sw + ev.clientX) + "px";
        el.style.height = Math.max(160, sh + ev.clientY) + "px";
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }
}
