#!/usr/bin/env node

/**
 * Convert the Ghost Erowid cosmology wiki into a browser-native archive.
 *
 * Usage:
 *   node tools/generate-archive-data.mjs ../cosmology
 *
 * The source repository contains dosage guides. The public artwork is an
 * experiential/educational archive, not a use guide, so actionable dosage
 * quantities and "how to use" material are never copied into the bundle.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

const sourceRoot = resolve(process.argv[2] || "../cosmology");
const wikiRoot = join(sourceRoot, "wiki");
const output = resolve("js/archive-data.js");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const slugify = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

function firstParagraph(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 42 && !line.startsWith("#") && !line.startsWith("-") && !/^\d+\./.test(line))
    ?.replace(/\*\*/g, "") || "Archive record recovered from the source cosmology.";
}

function redactTechnical(title, originalPath) {
  return `## ARCHIVE SAFETY INTERLOCK

This source record is catalogued because it exists in the Ghost Erowid Cosmology corpus, but its actionable dosage quantities and procedural use instructions are intentionally not reproduced here.

The archive is an artistic and educational exploration of phenomenology, culture, symbolism, mechanisms, and risk. It is **not** a guide for taking, preparing, combining, or obtaining psychoactive substances.

## RECOVERED METADATA

- **Original record**: ${title}
- **Source path**: ${originalPath}
- **Status**: PRESENT / CONTENT SAFETY-REDACTED
- **Reason**: Procedural dosage material falls outside the public archive's scope.`;
}

const wikiFiles = (await walk(wikiRoot)).filter((path) => extname(path) === ".md" && basename(path) !== "README.md");
const allSourceFiles = (await walk(sourceRoot))
  .map((path) => relative(sourceRoot, path).replaceAll("\\", "/"))
  .filter((path) => !path.startsWith(".git/"));

const entries = [];
for (const path of wikiFiles) {
  const rel = relative(wikiRoot, path).replaceAll("\\", "/");
  const [substance, section] = rel.split("/");
  const raw = await readFile(path, "utf8");
  const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() || basename(path, ".md").replaceAll("_", " ");
  const safetyRedacted = /dosage/i.test(`${basename(path)} ${title}`);
  const markdown = safetyRedacted ? redactTechnical(title, `wiki/${rel}`) : raw.replace(/^#\s+.+\n?/, "").trim();
  const id = `${slugify(substance)}--${slugify(section)}--${slugify(title.split("/")[0])}`;
  entries.push({
    id,
    substance,
    section,
    title,
    shortTitle: title.split("/")[0].trim(),
    summary: safetyRedacted
      ? "A source-corpus dosage record retained as a safety-redacted catalog entry."
      : firstParagraph(markdown),
    markdown,
    sourcePath: `wiki/${rel}`,
    safetyRedacted,
  });
}

entries.sort((a, b) =>
  a.substance.localeCompare(b.substance) ||
  a.section.localeCompare(b.section) ||
  a.title.localeCompare(b.title)
);

const counts = entries.reduce((acc, entry) => {
  acc[entry.substance] = (acc[entry.substance] || 0) + 1;
  return acc;
}, {});

const header = `// GENERATED FILE — do not hand edit.\n// Source: merrypranxter/ghost-erowid-cosmology\n// Generator: tools/generate-archive-data.mjs\n\n`;
const payload = `${header}export const ARCHIVE_ENTRIES = ${JSON.stringify(entries, null, 2)};\n\n` +
  `export const SOURCE_MANIFEST = ${JSON.stringify({
    generatedAt: new Date().toISOString(),
    sourceRepository: "merrypranxter/ghost-erowid-cosmology",
    wikiEntryCount: entries.length,
    safetyRedactedCount: entries.filter((entry) => entry.safetyRedacted).length,
    entriesBySubstance: counts,
    sourceFileCount: allSourceFiles.length,
    sourceFiles: allSourceFiles,
  }, null, 2)};\n`;

await writeFile(output, payload, "utf8");
console.log(`Wrote ${entries.length} archive entries from ${allSourceFiles.length} source files to ${output}`);
