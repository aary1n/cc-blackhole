# ascii-black-hole

A Claude Code theme that puts an ASCII black hole behind the conversation in the Claude desktop app, with warm near-black colours and copper accents to match.

The black hole sits toward the bottom right, so the middle of the window stays clear for text. The picture is one frame of the original `ascii-black-hole.html` animation, drawn by its own code.

## Background modes

Type `/blackhole <mode>` in a session to switch how the background is drawn. It applies at once and is remembered for new sessions.

| Mode | What it draws |
| --- | --- |
| `svg` (default) | the frame as a vector scene |
| `png` | the frame as a 2560px image |
| `jpg` | the frame as a 1920px image |
| `off` | the colours only, no picture |

`/blackhole` on its own says which mode is on.

An animated version, which redraws the frame ten times a second, is not included: the desktop app blanks the background on every redraw, so it flickers.

## Install

At the prompt of a terminal session:

```
/plugin install ascii-black-hole --marketplace aary1n/cc-blackhole
```

From a shell:

```
claude plugin install ascii-black-hole --marketplace aary1n/cc-blackhole
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session, desktop app included).

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `aary1n/cc-blackhole`, then Add plugin.
