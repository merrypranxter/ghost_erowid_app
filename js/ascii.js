// GHOST//OS — ASCII art library
// "Text is part of the image" — art/art_bible.md, global style rule #3

export const LOGO = String.raw`
 ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗   ██╗ ██╗    ██████╗ ███████╗
██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝  ██╔╝██╔╝   ██╔═══██╗██╔════╝
██║  ███╗███████║██║   ██║███████╗   ██║    ██╔╝██╔╝    ██║   ██║███████╗
██║   ██║██╔══██║██║   ██║╚════██║   ██║   ██╔╝██╔╝     ██║   ██║╚════██║
╚██████╔╝██║  ██║╚██████╔╝███████║   ██║  ██╔╝██╔╝      ╚██████╔╝███████║
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝  ╚═╝ ╚═╝        ╚═════╝ ╚══════╝`;

export const GHOST = String.raw`
     .-"""-.
    /  _ _  \
   |  (o)(o) |
   |   ___   |
   |  ˇˇˇˇˇ  |
   /|       |\
  | |  RAM  | |
   \|_/\_/\_|/`;

// ------- entity portraits (terminal `summon` + CODEX app) -------

export const PORTRAITS = {
  hatman: {
    name: "THE HAT MAN",
    proc: "colonel_panic_supervisor.exe — kernel panic handler",
    line: "Do not stare directly. Peripheral rendering only.",
    art: String.raw`
        ___________
       /           \
      |=============|
   ____|           |____
  '----[___________]----'
        |  _   _  |
        | (•) (•) |
        |         |
       /|         |\
      / |         | \
        |  DEAD   |
        |  SPACE  |
        |_________|
        MONITORING`,
  },
  elves: {
    name: "MACHINE ELVES",
    proc: "rendering_engine[0..n] — UI designers",
    line: "They sing objects into existence. 4–8Hz transformation cycles.",
    art: String.raw`
      /\   ◊   /\
     /◊◊\ /|\ /◊◊\
    | ◉◉ |◊|◊| ◉◉ |
     \▽▽/ \|/ \▽▽/
    ◊-/||\-◊-/||\-◊
     { SYNTAX GLOW }
      \\ ♪ ♫ ♪ //
   ~ singing objects ~
   ~ into existence  ~`,
  },
  mantis: {
    name: "MANTIS PHYSICIANS",
    proc: "hardware_maintenance.d — surgical subroutine",
    line: "Foreign object removed. Calibration complete. Patch applied.",
    art: String.raw`
        /\_____/\
       ◁ ◉ ▽ ◉ ▷
        \  ─┬─ /
      ___\__|__/___
     ⌐|  CHITIN  |¬
    / ||  v1.33  || \
   ⌐  ||_________||  ¬
   |  /|  tools  |\  |
      ⌐ SCALPEL.so ¬
       calibrating…`,
  },
  jester: {
    name: "THE JESTER",
    proc: "watchdog_timer — stress test observer",
    line: "Gatekeeper of cognitive dissonance. It already knows the punchline.",
    art: String.raw`
      ♦   _____   ♦
       \ /~~~~~\ /
      ☆ | ◉ ‿ ◉ | ☆
       /|  ───  |\
      ♦ \_______/ ♦
       /|ᴴᴬ|ᴴᴬ|\
      d |HA|HA| b
        |__|__|
     YOUR CERTAINTY
      IS THE JOKE`,
  },
  gaia: {
    name: "MOTHER GAIA",
    proc: "unconditional_love.field — ambient daemon",
    line: "Love as color pressure. You are already home.",
    art: String.raw`
        . ✧ ｡ ✧ .
      ✧ /~~~~~~~\ ✧
     ｡ | ◕     ◕ | ｡
      ✧ \   ▽   / ✧
        .\_____/.
      ｡ ✧ (( )) ✧ ｡
       WARM  HALO
        FIELD: ON
      ~ welcome back ~`,
  },
  admins: {
    name: "THE ADMINS",
    proc: "maintenance_subroutine[ROOT] — simulation upkeep",
    line: "Presence detected in back-end. They seem… annoyed.",
    art: String.raw`
     ┌─[ADMIN CONSOLE]─┐
     │ ▣ ▣ ▣  sudo -i  │
     ├─────────────────┤
     │ > who let the   │
     │   user in here? │
     │ > audit.log ▮   │
     │ > PERMISSION    │
     │   REVOKED_      │
     └─────────────────┘
        ⌐■_■  ⌐■_■`,
  },
  spiders: {
    name: "SHADOW SPIDERS",
    proc: "pattern_recognition — gain: MAXIMUM",
    line: "Movement at the edge. False positive. Probably.",
    art: String.raw`
    \  |  /   .   \  |  /
     \\|//   /|\   \\|//
    --(◉◉)--/ | \--(◉◉)--
     //|\\    |    //|\\
    /  |  \   |   /  |  \
      itsy.bitsy.daemon
      crawling PID 0x08`,
  },
};

// ------- desktop icon glyphs -------

export const ICONS = {
  motifs: String.raw`
┌─▒▒─┐
│▓DB▓│
│▒▒▒▒│
└────┘`,
  codex: String.raw`
 (◉_◉)
/|ENT|\
 |___|
 CODEX`,
  metro: String.raw`
●──●──●
   │
●──●──●
TRANSIT`,
  terminal: String.raw`
┌────┐
│ >_ │
│    │
└────┘`,
  inject: String.raw`
  ▄
 ▐█▌
 ▐█▌
▄▟█▙▄
KEY`,
  readme: String.raw`
┌────┐
│ ?! │
│ ~~ │
└────┘`,
};

export const BOOT_GHOST = String.raw`
   .-"""-.
  /  ◉ ◉  \    GHOST//OS
  | ▄▄▄▄▄ |    v3.0_UNDERLAYER
  /|     |\    "the brain is a terminal"
 | | ~~~ | |
  \|_∧_∧_|/`;
