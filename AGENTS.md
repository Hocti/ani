# AGENTS.md — Ani-Lib

Guidelines for AI agents working in this repository.

## What This Project Is

`ani-lib` is a TypeScript animation library. It animates DOM elements by interpolating CSS properties over time using `requestAnimationFrame`. The API is chainable (jQuery-style). It ships as CJS, ESM, and browser IIFE bundles.

## Repository Layout

```
src/              TypeScript source (the only files that need editing for features)
  index.ts        Public API entry point — exports the callable `ani` function
  AnimateCenter.ts  Global RAF loop; start/stop/queue factory functions
  Animate.ts      Core class; extends AnimateQueueGroup; runs the per-frame logic
  AnimateQueueGroup.ts  Base class; all chainable queue-building methods live here
  cssHelper.ts    CSS read/write/interpolation; transform shorthands; units
  TimeFunction.ts Easing functions (30+)
  types.ts        Shared TypeScript types and enums
  utils.ts        clamp() utility

dist/             Build output — do NOT edit manually
demo/             Manual test HTML files — open in a browser to verify behavior
test/             Jest unit tests (run: npm test)
```

## Key Architectural Rules

- **`index.ts` is the public surface.** `ani` is exported as a callable function that also has properties (`ani.start`, `ani.stop`, etc.). Any new top-level API goes here.
- **`AnimateQueueGroup` holds all queue methods.** If you add a new chainable step (like a new animation type), add it to `AnimateQueueGroup`, not `Animate`.
- **`Animate` handles execution.** `Animate.process(deltaTime)` is called every frame by the RAF loop. Add per-frame logic there, and queue-step execution in `processNow()`.
- **`cssHelper.ts` owns all CSS logic.** Do not parse or interpolate CSS values in `Animate.ts`. Keep that separation clean.
- **No runtime dependencies.** This library has zero production dependencies. Keep it that way.

## Build & Test

```bash
npm run build    # compile TypeScript → dist/ (CJS + ESM + IIFE)
npm run watch    # rebuild on file changes
npm test         # run Jest tests
```

Build uses Rollup + esbuild. Output targets ES2020. Three bundle formats are produced from the same source.

## Common Tasks

### Adding a new queue method

1. Add the `QueueType` enum value in `src/types.ts`.
2. Add the method to `AnimateQueueGroup` in `src/AnimateQueueGroup.ts` — push an `AnimateQueue` object onto `this.queues`.
3. Handle the new type in `Animate.processNow()` or `Animate.process()` in `src/Animate.ts`.
4. If it animates over time, add the type to the `queueWithTime` array in `src/types.ts`.

### Adding a new CSS shorthand (like `x`, `rotate`)

All CSS shorthand logic is in `src/cssHelper.ts`. Look at how `x`, `y`, `scaleX`, and `rotate` are handled — they all map to `transform`. Follow the same pattern.

### Adding a new easing function

Add it to `src/TimeFunction.ts`. The function signature is `(t: number) => number` where `t` is a value from 0 to 1.

## Testing

- Unit tests live in `test/`. Run them with `npm test`.
- Manual browser tests are in `demo/`. Open `demo/test.html` in a browser for a broad feature check.
- There is no automated end-to-end test for the browser demos — check them visually after significant changes.

## What to Avoid

- Do not push to `dist/` — it is generated. The CI/release process handles that.
- Do not add production dependencies without a strong reason.
- Do not add CSS parsing logic outside of `cssHelper.ts`.
- Do not call `requestAnimationFrame` directly outside of `AnimateCenter.ts`.
- The `now` getter on `Animate` is a special pattern (it returns `this` after flagging the last pushed queue item as immediate). Do not replicate this pattern elsewhere without understanding it.
