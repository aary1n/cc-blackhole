# ascii-black-hole

A Claude Code theme that puts an ASCII black hole behind the conversation in the Claude desktop app, with warm near-black colours and copper accents to match.

It ships as a still frame (`blackhole.png`). An animated mode is in the code but off: the desktop app blanks the backdrop between redraws, so it flickers.

The drawing is the original `ascii-black-hole.html` canvas animation, ported to run inside the mod: each frame, the original's own maths computes every character and colour, and the mod hands the app a fresh SVG. The black hole sits toward the bottom right, so the middle of the window stays clear for text.

- The app redraws a mod's backdrop at most 10 times a second, so the disk turns at the original speed but in steps.
- Colours are snapped to 40 shades taken from the drawing.
- The mobile app shows the same frames; the terminal draws no theme.

To try the animation anyway, set `ANIMATE = true` in `hooks/register.tsx`.

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
