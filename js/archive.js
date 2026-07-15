import { ARCHIVE_ENTRIES, SOURCE_MANIFEST } from "./archive-data.js";
import { MOTIFS } from "./data.js";
import { PROFILE_ORDER, PROFILES, profileForSource } from "./profiles.js";

const SECTION_ORDER = ["All", "Cosmology", "Entities", "Locations", "Phenomena", "Technical", "Motifs"];

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function inline(markdown) {
  return escapeHtml(markdown)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function renderMarkdown(markdown) {
  const lines = String(markdown || "").split("\n");
  const html = [];
  let list = null;
  const closeList = () => {
    if (list) html.push(`</${list}>`);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(4, heading[1].length);
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet || numbered) {
      const type = numbered ? "ol" : "ul";
      if (list !== type) {
        closeList();
        html.push(`<${type}>`);
        list = type;
      }
      html.push(`<li>${inline((bullet || numbered)[1])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return html.join("\n");
}

function motifMarkdown(motif) {
  const palette = motif.palette || {};
  const hooks = motif.hooks || {};
  const hookSections = Object.entries(hooks)
    .map(([key, values]) => `### ${key}\n${(values || []).map((value) => `- ${value}`).join("\n")}`)
    .join("\n\n");
  return `## SIGNAL CLASSIFICATION
- **Record**: ${motif.id}
- **Type**: ${motif.type}
- **Tier**: ${motif.tier}
- **Valence**: ${motif.valence}
- **Intensity**: ${motif.intensity}
- **Compound family**: ${motif.compound_family || "cross-domain"}

## ARCHIVE NOTE
${motif.notes || "Recurring signal recovered from the cosmology canon."}

## TAG CLOUD
${(motif.tags || []).map((tag) => `- ${tag}`).join("\n")}

## ART-DIRECTION PAYLOAD
- **Palette**: ${palette.name || "Unresolved signal"}
- **Colors**: ${(palette.hex || []).join(" / ")}
- **Notes**: ${palette.notes || "No stable note."}

${hookSections}`;
}

const CANON_ENTRIES = MOTIFS.map((motif) => ({
  id: `canon--${motif.id.toLowerCase()}`,
  substance: "CANON",
  profileId: "canon",
  section: "Motifs",
  title: motif.name,
  shortTitle: motif.name,
  summary: motif.notes,
  markdown: motifMarkdown(motif),
  sourcePath: `canon/cosmology.yaml#${motif.id}`,
  safetyRedacted: false,
  motif,
}));

export const ALL_ENTRIES = [
  ...ARCHIVE_ENTRIES.map((entry) => ({ ...entry, profileId: profileForSource(entry.substance) })),
  ...CANON_ENTRIES,
];

function hashNumber(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function nodePosition(id, index, total) {
  const hash = hashNumber(id);
  const ring = 18 + (hash % 31);
  const angle = (index / Math.max(1, total)) * Math.PI * 2 * 2.618 + (hash % 700) / 111;
  const x = 50 + Math.cos(angle) * ring * (0.78 + ((hash >> 3) % 20) / 100);
  const y = 50 + Math.sin(angle) * ring * 0.72;
  return { x: Math.max(8, Math.min(92, x)), y: Math.max(10, Math.min(90, y)) };
}

export class ArchiveExplorer {
  constructor(root, callbacks = {}) {
    this.root = root;
    this.callbacks = callbacks;
    this.profileId = "dmt";
    this.section = "All";
    this.query = "";
    this.currentEntry = null;
    this.profileRail = root.querySelector("[data-profile-rail]");
    this.sectionRail = root.querySelector("[data-section-rail]");
    this.field = root.querySelector("[data-constellation]");
    this.linearIndex = root.querySelector("[data-linear-index]");
    this.profileLabel = root.querySelector("[data-profile-label]");
    this.profileThesis = root.querySelector("[data-profile-thesis]");
    this.entryCount = root.querySelector("[data-entry-count]");
    this.search = document.querySelector("[data-search-input]");
    this.searchResults = document.querySelector("[data-search-results]");
    this.buildProfileRail();
    this.bindSearch();
  }

  entriesForProfile(profileId = this.profileId) {
    return ALL_ENTRIES.filter((entry) => entry.profileId === profileId);
  }

  filteredEntries() {
    const q = this.query.trim().toLowerCase();
    return this.entriesForProfile().filter((entry) => {
      const sectionMatch = this.section === "All" || entry.section === this.section;
      const queryMatch = !q || `${entry.title} ${entry.summary} ${entry.section} ${entry.markdown}`.toLowerCase().includes(q);
      return sectionMatch && queryMatch;
    });
  }

  buildProfileRail() {
    this.profileRail.innerHTML = PROFILE_ORDER.map((id) => {
      const profile = PROFILES[id];
      const count = this.entriesForProfile(id).length;
      return `<button class="profile-signal" data-profile="${id}" aria-pressed="false">
        <span class="profile-signal-index">${profile.index}</span>
        <span class="profile-signal-glyph">${profile.glyph}</span>
        <span class="profile-signal-name">${profile.label}</span>
        <span class="profile-signal-count">${count}</span>
      </button>`;
    }).join("");
    this.profileRail.addEventListener("click", (event) => {
      const button = event.target.closest("[data-profile]");
      if (button) this.setProfile(button.dataset.profile);
    });
  }

  setProfile(profileId, { announce = true } = {}) {
    if (!PROFILES[profileId]) return;
    this.profileId = profileId;
    this.section = "All";
    this.query = "";
    if (this.search) this.search.value = "";
    this.render();
    if (announce) this.callbacks.onProfile?.(profileId);
  }

  render() {
    const profile = PROFILES[this.profileId];
    this.profileLabel.textContent = profile.label;
    this.profileThesis.textContent = profile.thesis;
    this.root.dataset.profile = this.profileId;
    this.profileRail.querySelectorAll("[data-profile]").forEach((button) => {
      const active = button.dataset.profile === this.profileId;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
    this.renderSections();
    this.renderConstellation();
  }

  renderSections() {
    const available = new Set(this.entriesForProfile().map((entry) => entry.section));
    const sections = SECTION_ORDER.filter((section) => section === "All" || available.has(section));
    this.sectionRail.innerHTML = sections.map((section) => {
      const count = section === "All"
        ? this.entriesForProfile().length
        : this.entriesForProfile().filter((entry) => entry.section === section).length;
      return `<button class="taxonomy-signal ${section === this.section ? "is-active" : ""}" data-section="${section}">
        <span>${section.toUpperCase()}</span><sup>${count}</sup>
      </button>`;
    }).join("");
    this.sectionRail.onclick = (event) => {
      const button = event.target.closest("[data-section]");
      if (!button) return;
      this.section = button.dataset.section;
      this.renderSections();
      this.renderConstellation();
    };
  }

  renderConstellation() {
    const all = this.filteredEntries();
    const entries = all.slice(0, 58);
    const positions = entries.map((entry, index) => nodePosition(entry.id, index, entries.length));
    const lines = positions.slice(1).map((position, index) => {
      const previous = positions[Math.max(0, index - (index % 4 === 0 ? 2 : 0))];
      return `<line x1="${previous.x}" y1="${previous.y}" x2="${position.x}" y2="${position.y}" />`;
    }).join("");
    const nodes = entries.map((entry, index) => {
      const position = positions[index];
      const signal = String(index + 1).padStart(2, "0");
      return `<button class="entry-node ${entry.safetyRedacted ? "is-redacted" : ""}"
        style="--node-x:${position.x}%;--node-y:${position.y}%;--node-delay:${index * -37}ms"
        data-entry="${entry.id}" aria-label="Open ${escapeHtml(entry.title)}">
        <span class="entry-node-core">${entry.safetyRedacted ? "⚠" : signal}</span>
        <span class="entry-node-label">${escapeHtml(entry.shortTitle)}</span>
      </button>`;
    }).join("");

    this.field.innerHTML = `<svg class="signal-threads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${nodes}`;
    this.field.querySelectorAll("[data-entry]").forEach((button) => {
      button.addEventListener("click", () => this.open(button.dataset.entry));
    });

    this.entryCount.textContent = `${all.length} SIGNAL${all.length === 1 ? "" : "S"} / ${SOURCE_MANIFEST.sourceFileCount} SOURCE FILES INGESTED`;
    this.linearIndex.innerHTML = all.map((entry, index) => `<button data-entry="${entry.id}">
      <span>${String(index + 1).padStart(3, "0")}</span>
      <b>${escapeHtml(entry.shortTitle)}</b>
      <i>${entry.section.toUpperCase()}</i>
    </button>`).join("") || `<p class="no-signal">NO SIGNAL MATCHES. THE GHOST ATE YOUR SEARCH.</p>`;
    this.linearIndex.querySelectorAll("[data-entry]").forEach((button) => {
      button.addEventListener("click", () => this.open(button.dataset.entry));
    });
  }

  open(entryId) {
    const entry = ALL_ENTRIES.find((item) => item.id === entryId);
    if (!entry) return;
    this.currentEntry = entry;
    if (entry.profileId !== this.profileId) this.setProfile(entry.profileId, { announce: false });
    this.callbacks.onOpen?.(entry);
  }

  adjacent(direction) {
    if (!this.currentEntry) return null;
    const entries = this.entriesForProfile(this.currentEntry.profileId);
    const index = entries.findIndex((entry) => entry.id === this.currentEntry.id);
    return entries[(index + direction + entries.length) % entries.length];
  }

  bindSearch() {
    if (!this.search) return;
    this.search.addEventListener("input", () => {
      const query = this.search.value.trim().toLowerCase();
      if (!query) {
        this.searchResults.hidden = true;
        this.query = "";
        this.renderConstellation();
        return;
      }
      const results = ALL_ENTRIES.filter((entry) =>
        `${entry.title} ${entry.summary} ${entry.substance} ${entry.section}`.toLowerCase().includes(query)
      ).slice(0, 24);
      this.searchResults.innerHTML = results.map((entry) => `<button data-entry="${entry.id}">
        <span>${escapeHtml(PROFILES[entry.profileId].label)} / ${escapeHtml(entry.section)}</span>
        <b>${escapeHtml(entry.title)}</b>
      </button>`).join("") || `<p>NO MATCH. TRY A STRANGER WORD.</p>`;
      this.searchResults.hidden = false;
      this.searchResults.querySelectorAll("[data-entry]").forEach((button) => {
        button.onclick = () => {
          this.searchResults.hidden = true;
          this.open(button.dataset.entry);
        };
      });
    });
  }
}

export function renderReader(entry, profile) {
  const source = escapeHtml(entry.sourcePath);
  const warning = entry.safetyRedacted
    ? `<div class="reader-interlock"><b>SAFETY INTERLOCK ACTIVE</b><span>Actionable dosage and use instructions are deliberately not reproduced.</span></div>`
    : "";
  return {
    eyebrow: `${profile.label} / ${entry.section.toUpperCase()} / ${source}`,
    title: entry.title,
    warning,
    body: renderMarkdown(entry.markdown),
  };
}

export { SOURCE_MANIFEST };
