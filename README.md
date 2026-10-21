# Arc & Angle — Math Artillery

Turn-based artillery duel on a Cartesian plane. Players fire functions `y = f(x)` to hit each other; every hit deals 34 damage.

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

## Aiming

Enter a function such as `10-0.025*x^2` — `sin`, `cos`, `tan`, `sqrt`, `abs`, `ln`, `log`, `exp` and `^` are supported (radians). You play from the left at `(-20, 0)`; the opponent sits at `(20, 0)`.
