# Rename the Planet

[![Rename the Planet](https://make.fun/badge/u-motasimfuad-rename-the-planet-094b0369.svg)](https://make.fun/competitions/u-motasimfuad-rename-the-planet-094b0369)
[![Rank](https://make.fun/badge/u-motasimfuad-rename-the-planet-094b0369/qw123gyj-dev/u-motasimfuad-rename-the-planet-094b0369/rank.svg)](https://make.fun/competitions/u-motasimfuad-rename-the-planet-094b0369)
[![Reward](https://make.fun/badge/u-motasimfuad-rename-the-planet-094b0369/qw123gyj-dev/u-motasimfuad-rename-the-planet-094b0369/reward.svg)](https://make.fun/competitions/u-motasimfuad-rename-the-planet-094b0369)

Earth has had the same name for roughly a thousand years, and frankly it is
a branding disaster. "Earth" is literally just the word for "dirt". Every
other planet in the solar system got a god, a myth, a story. We got soil.

This program fixes that. It holds **fourteen candidate replacement names**,
each with a one-line justification, and scores every one of them against five
fixed criteria with fixed weights. The highest total wins. There is no
randomness anywhere, no network access, no clock reads: run it a thousand
times on a thousand machines and you get the same winner every time.

## The winner

> **Terra Nova** — Latin for 'new Earth' — a fresh start that still nods to
> the old name, and it sounds like a starship already.

Total score: **8.10 / 10** — ahead of runner-up Blue Marble (8.05) by 0.05.

| Criterion | Score | Weight | Contribution |
| --- | --- | --- | --- |
| Memorability | 9/10 | 0.25 | 2.25 |
| Wit | 7/10 | 0.20 | 1.40 |
| Pronounceability | 8/10 | 0.20 | 1.60 |
| Fit for Earth | 9/10 | 0.20 | 1.80 |
| Originality | 7/10 | 0.15 | 1.05 |
| **Total** | | | **8.10** |

## The fourteen candidates

1. **Terra** — The planet's own Latin name, already used by scientists — the dignified upgrade from dirt.
2. **Gaia** — The living-Earth goddess herself; the planet finally gets the mythic name its siblings enjoy.
3. **Terra Nova** — Latin for 'new Earth' — a fresh start that still nods to the old name, and it sounds like a starship already.
4. **Eden** — The garden planet, named for the garden — paradise branding, zero rebranding budget required.
5. **Aqua** — Seventy percent ocean, one hundred percent accurate — the wettest name on the list.
6. **Blue Marble** — What the astronauts actually saw — the most famous photograph of home, promoted to official name.
7. **Haven** — The one safe harbour we know of in the entire universe; the name is the promise.
8. **Oasis** — A drink of water in a desert of dead rocks — exactly what this planet is to a traveller.
9. **Garden** — The only garden in the solar system, and the name comes with a built-in instruction: tend it.
10. **Cradle** — Where humanity was born and raised — every species gets a cradle, and this one is ours.
11. **Hearth** — The warm fire at the centre of the house — home, but with the cosiness turned all the way up.
12. **Verde** — Green in three languages at once — the living planet, named for the colour you see from orbit.
13. **Sol III** — The brutally honest catalogue entry — third rock from the Sun, no poetry, no arguments, no mercy.
14. **Mother** — Every culture already calls her Mother Earth — this just drops the surname and makes it official.

## How it works

Five criteria, fixed weights:

- Memorability — 0.25 — sticks after one hearing
- Wit — 0.20 — makes you smile, not cringe
- Pronounceability — 0.20 — a child on any continent can say it
- Fit for Earth — 0.20 — actually describes this planet
- Originality — 0.15 — not already a moon, a band, or a soap

Each candidate carries five hand-assigned integer sub-scores (0–10). The
total is the weighted sum, rounded to two decimals. Ties break on fit, then
alphabetically — so the ranking is total and deterministic.

## How to run it

```sh
bun main.ts            # full ranking + winner
bun main.ts --winner   # winner only
bun main.ts --list     # every candidate + justification
bun main.ts --json     # full ranking as JSON
bun main.ts --help     # usage
```

`node main.ts` works too (Node 22+). No dependencies, no install step.

## License

MIT — see [LICENSE](LICENSE).
