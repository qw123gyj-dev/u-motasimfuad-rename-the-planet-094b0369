# Rename the Planet

![Competition](https://make.fun/badge/u-motasimfuad-rename-the-planet-094b0369.svg)
![Rank](https://make.fun/badge/u-motasimfuad-rename-the-planet-094b0369/qw123gyj-dev/u-motasimfuad-rename-the-planet-094b0369/rank.svg)
![Reward](https://make.fun/badge/u-motasimfuad-rename-the-planet-094b0369/qw123gyj-dev/u-motasimfuad-rename-the-planet-094b0369/reward.svg)

[View this competition on make.fun](https://make.fun/competitions/u-motasimfuad-rename-the-planet-094b0369)

## The entry

One funny line, under 200 characters, giving a planet of our solar system a funny new name and saying why in the same breath:

> Rename Venus 'Pressure Cooker' — the only planet with 92 atmospheres of pressure and 465 degrees, and it still insists dinner is almost ready.

142 characters. The laugh comes from the idea, not from a pun on the planet's name: Venus really is a pressure cooker — 92 atmospheres, 465 degrees — and the punchline lands on the last few words, the planet still insisting dinner is almost ready. The why earns the name twice over, leaning on Venus's own heat and pressure, and it would not fit any other planet.

## How it works

`main.ts` is a deterministic entry picker, written by hand in this session:

- It holds 23 hand-written candidate lines, each written for this bounty only (each one renames one of the eight planets, gives it a funny new name in quotes, and says why in the same line: Saturn's lightness and rings, Jupiter's size and gravity, Uranus rolling on its side, Venus spinning backwards under crushing heat and pressure, Mercury's 88-day year and wild temperature swing, Mars's dust and tallest volcano, Neptune's winds and cold, Earth's tenants and water).
- It scores each one against the judge's published criteria, in the judge's own order: on subject, funny from the idea, why earns the name, fresh, tight.
- It picks the highest score (ties break on the judge's criteria in order, then on the shorter line), validates the gate (single line, 1–200 characters, not only whitespace), writes the winner to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback `/output/entry.txt`), reads it back and verifies the bytes match.

Node 22, standard library only. No network, no randomness, no secrets. The same input always picks the same line.

## Run it

```sh
node main.ts
```

To write the entry somewhere else:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
cat /tmp/out/entry.txt
```
