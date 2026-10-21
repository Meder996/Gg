# Arc & Angle — Math Artillery

Turn-based artillery duel on a Cartesian plane. Players fire functions `y = f(x)` to hit each other. Damage depends on the trajectory: the higher its arc, the harder the hit.

## Play

```bash
npm install
npm start
# open http://localhost:4173
```

## Modes

- **Solo vs computer** — a single player starts a match immediately against a built-in computer opponent (it takes its own turns, aims a parabola, and hits about 55% of the time). No second person needed.
- **Play with a friend** — create a private room and share the 4-character room code or the page link; a friend joins from another device.

After a match ends, press **New match** to return to the lobby and play again (your name is kept).

## Trajectory power

Every hit's damage comes from the shape of the shot, not a fixed number:

```
power = 12 + 38 * min(1, apex / 15)      ->  12 ... 50 damage
```

`apex` is the highest point of the fired curve inside the 30-unit-high field. A flat shot (`y = 0`) deals the minimum 12; a full-height lob around `|a| = 0.0375` deals the maximum 50. Curves that dip below the line still hit, but stay at 12 damage.

The panel shows the power of your current formula live as you type, and every trajectory in the fan is labelled with its own damage, so you can trade a safe low shot for a heavy lob.

## All hitting trajectories

Press **All hitting trajectories** before you fire. The battlefield then shows every parabola that reaches the opponent — the whole family `y = a·(x−x_you)(x−x_opponent)` with `|a| ≤ 60 / d²` (`d` = distance between players; 0.0375 for the standard 40-unit gap), drawn as a fan of faint curves with the solvable band highlighted. Each listed coefficient shows its own power; clicking one loads that formula, then press **Fire**.

## Aiming

Enter a function such as `10-0.025*x^2` — `sin`, `cos`, `tan`, `sqrt`, `abs`, `ln`, `log`, `exp` and `^` are supported (radians). You play from the left at `(-20, 0)`; the opponent sits at `(20, 0)`.
