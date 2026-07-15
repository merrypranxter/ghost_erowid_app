# GHOST EROWID COSMOLOGY — THE LIVING ARCHIVE

An experiential, educational archive built from the complete
[`ghost-erowid-cosmology`](https://github.com/merrypranxter/ghost-erowid-cosmology)
source corpus.

This is not a fake desktop with psychedelic wallpaper. The information drives
the artwork: each signal family changes the shader physics, typographic
organism, palette, motion tempo, symmetry, transition grammar, and the Ghost's
voice.

## What is in the archive

- 108 wiki records across DMT, LSD, Salvia, DXM, deliriants, and 2C-B
- 52 cross-domain canon motifs
- 7 distinct real-time WebGL environments
- a living character-based organism rendered from punctuation and type
- constellation and linear navigation for the same information
- full-text search across the public archive
- deep links to every family and entry
- mobile, keyboard, reduced-motion, low-power, and no-WebGL behavior
- four intensity states: `CALM`, `ALTERED`, `COSMIC`, and `ABSOLUTELY FUCKED`

The source repository currently contains six dosage-guide records. They remain
catalogued so the corpus is not silently misrepresented, but actionable
quantities and procedural use instructions are safety-redacted from the public
bundle. This project discusses phenomenology, culture, symbolism, mechanisms,
and risk; it is not a guide for obtaining, preparing, dosing, combining, or
using psychoactive substances.

## Run it

The deployed site has no runtime dependencies and no build step.

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Architecture

```text
index.html                  semantic shell: threshold, atlas, reader, search
css/ghost.css               profile-driven visual language and responsive states
js/main.js                  routes, transitions, controls, sound, Ghost behavior
js/profiles.js              substance-specific art-direction configuration
js/gl.js                    shared WebGL engine + seven fragment-shader identities
js/organism.js              dynamic ASCII/Unicode tentacle organism
js/archive.js               constellation, search, reader, and Markdown rendering
js/archive-data.js          generated wiki corpus (do not hand-edit)
js/data.js                  generated 52-record canon motif corpus
tools/generate-archive-data.mjs
                            source-corpus compiler and safety interlock
```

The previous `apps.js`, `wm.js`, `boot.js`, and legacy ASCII library remain in
the repository as archaeological material, but the new archive does not depend
on the old window-manager interface.

## Refresh content from the cosmology repo

Clone the two repositories next to each other, then run:

```sh
node tools/generate-archive-data.mjs ../ghost-erowid-cosmology
```

The generator walks the source repository, embeds every public wiki entry,
records a manifest of every source file, and applies the dosage-content safety
interlock. The generated bundle is static so GitHub Pages does not need Node.

## Add or mutate an art identity

1. Add a profile in `js/profiles.js`: palette, type characters, thesis, tempo,
   symmetry, Ghost messages, and transition name.
2. Add a fragment shader in `js/gl.js` and register it in `SHADERS`.
3. Add the profile id to `PROFILE_ORDER` and map its source folder through
   `SOURCE_TO_PROFILE`.
4. Add profile-specific CSS variables in `css/ghost.css` only when the shared
   variables cannot express the new identity.

The renderer maintains one live WebGL context, dynamically scales resolution,
pauses while hidden, and degrades to a CSS field if compilation or WebGL fails.

## Keyboard map

- `/` — search the entire archive
- `Esc` — close search or return from a record to its constellation
- `←` / `→` — previous or next record while reading
- `1`–`7` — switch signal family in the atlas

`THE ARCHIVE IS NOT PASSIVE. THE INDEX IS INDEXING YOU BACK.`
