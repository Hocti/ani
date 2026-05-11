# Ani

A small but powerful JavaScript animation library. If you have used jQuery's `.animate()`, Ani will feel familiar — but it works without jQuery and has more features.

## Features

- **Chainable API** — call methods one after another on the same element
- **CSS animation** — animate any CSS property, including transforms and CSS variables
- **Queues** — build reusable animation sequences and apply them to multiple elements
- **Flow control** — pause, resume, loop, branch, and jump within a sequence
- **30+ easing functions** — built-in timing curves for natural motion
- **Relative values** — use `+=`, `-=`, `*=`, `/=` to animate relative to the current value
- **Multiple formats** — works as CJS, ESM, or a plain browser script

---

## Installation

```bash
npm install ani-lib
# or
yarn add ani-lib
```

```javascript
import ani from 'ani-lib';
```

Or load it directly in the browser:

```html
<script src="https://cdn.jsdelivr.net/npm/ani-lib@latest/dist/ani.js"></script>
```

---

## Quick Start

```javascript
// Both of these do the same thing:
ani('#box').fadeIn();
ani.start('#box').fadeIn();

// Animate CSS properties with a duration (ms)
ani('#box').animate({ opacity: 0, x: 100 }, 500);

// Chain multiple steps
ani('#box').hide().fadeIn().delay(300).animate({ x: 200 }, 700).fadeOut();
```

---

## Core Concepts

### Selectors and Elements

Pass a CSS selector string or a direct DOM element:

```javascript
ani('#myDiv');
ani(document.getElementById('myDiv'));
```

### Animation Options

The second argument to `animate()` (and `start()`) can be:

- A **number** — duration in milliseconds (default: `700`)
- An **object** with `duration` and `easing`

```javascript
ani('#box').animate({ x: 200 }, 1000);
ani('#box').animate({ x: 200 }, { duration: 1000, easing: ani.time.easeInOutQuad });
```

### CSS Object (`cssObj`)

Any CSS property is accepted. Transforms have shorthand aliases:

```javascript
{
  opacity: 0.7,
  marginTop: 10,           // number → adds 'px'
  marginLeft: '10em',
  x: 50,                   // shorthand for translateX
  y: -20,                  // shorthand for translateY
  rotate: 45,              // number → adds 'deg'
  scaleX: 1.5,
  rotateX: 90,
  width: '*=2',            // multiply current width by 2
  height: '+=50',          // add 50px to current height
}
```

Numbers are given `px` or `deg` automatically (except `opacity`, `scale`, and similar unitless properties).

**Relative operators:**

| Operator | Effect |
|----------|--------|
| `+=`     | Add    |
| `-=`     | Subtract |
| `*=`     | Multiply |
| `/=`     | Divide |

---

## API Reference

### Top-Level Functions

#### `ani(element, cssObj?, option?, callback?)` → `Animate`

Shorthand for `ani.start()`. Starts an animation on the element and returns an `Animate` instance for chaining.

#### `ani.start(element, cssObj?, option?, callback?)` → `Animate`

Same as calling `ani()` directly. Kept for backwards compatibility and explicitness.

#### `ani.stop(element)`

Stops all running animations on the element immediately.

#### `ani.queue(cssObj?, option?, callback?)` → `AnimateQueueGroup`

Creates a reusable animation queue not attached to any element yet. Use `.joinQueue()` to apply it.

```javascript
const fadeSeq = ani.queue({ opacity: 0 }, 400).animate({ opacity: 1 }, 400);

ani('#box1').joinQueue(fadeSeq);
ani('#box2').delay(200).joinQueue(fadeSeq);
```

---

### Queue Methods (chaining)

These are available on both `Animate` and `AnimateQueueGroup`:

| Method | Description |
|--------|-------------|
| `animate(cssObj, option?, cb?)` | Animate to target CSS values |
| `delay(ms, cb?)` | Wait before the next step |
| `do(cb)` | Run a callback at this point in the queue |
| `css(cssObj)` | Apply CSS immediately (no animation) |
| `show()` | Show the element (`display` is restored) |
| `hide()` | Hide the element (`display: none`) |
| `fadeIn(option?)` | Fade in from 0 to full opacity |
| `fadeOut(option?)` | Fade out to 0 opacity |
| `branch(cb)` | Fork the queue — `cb` receives a new `Animate` that runs alongside the main sequence |
| `mark(name)` | Save a position in the queue |
| `jump(name, times?)` | Jump back to a mark. `times=0` loops forever |
| `speedup(factor)` | Multiply the speed of all following steps |
| `pause()` | Pause the queue at this point |
| `reset()` | Reset and restart the queue from the beginning |
| `remove()` | Remove the element from the DOM and end animation |
| `cloneQueue()` | Return a copy of the queue (for reuse) |
| `joinQueue(q)` | Append another queue to this one |

---

### `Animate` Instance (returned by `ani()` / `ani.start()`)

Inherits all queue methods above, plus:

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `element` | `HTMLElement` | — | The animated element |
| `speed` | `number` | `1` | Global speed multiplier |
| `skipDelay` | `boolean` | `false` | Skip all `delay()` steps when `true` |

#### Methods

| Method | Description |
|--------|-------------|
| `now()` | execute the last queued command immediately instead of adding it to the queue |
| `resume()` | Resume a paused animation |
| `stop()` | Stop and clear the animation |

**`now` example:**

```javascript
// Without .now: x goes 200 → 100 → 300 (css({x:50}) is queued too)
ani('#box', { x: 200 }).animate({ x: 100 }).css({ x: 50 }).animate({ x: 300 });

// With .now: x is set to 50 immediately, then animates 200 → 100 → 300
ani('#box', { x: 200 }).animate({ x: 100 }).css({ x: 50 }).now.animate({ x: 300 });
```

---

## Examples

### Looping Background Gradient

```javascript
const from = `radial-gradient(circle, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)`;
const to   = `radial-gradient(circle, rgba(60,60,129,1) 0%, rgba(0,212,255,1) 63%, rgba(2,0,36,1) 100%)`;

ani('#bg')
  .css({ background: from }).now
  .mark('loop')
  .animate({ background: to }, 2000)
  .animate({ background: from }, 2000)
  .jump('loop', 0); // loop forever
```

### Branching Animation

```javascript
// Width and height animate at different speeds simultaneously
ani('#box')
  .css({ width: 100, height: 100 })
  .branch(a => a.animate({ width: 200 }, 3000))
  .animate({ height: 200 }, 6000);
```

### Reusable Queue

```javascript
const pulse = ani.queue({ opacity: 0.3 }, 400).animate({ opacity: 1 }, 400);

ani('#icon1').joinQueue(pulse.cloneQueue());
ani('#icon2').delay(100).joinQueue(pulse.cloneQueue());
```

### Animating CSS Variables

```javascript
ani('#element').animate({ '--my-color-stop': '80%' }, 1000);
```

### Relative Values

```javascript
ani('#box').animate({ width: '*=2', x: '+=100', height: '-=20' }, 600);
```

---

## Easing Functions

Access via `ani.time.*`:

```
linear, uniform
easeInSine, easeOutSine, easeInOutSine
easeInQuad, easeOutQuad, easeInOutQuad
easeInCubic, easeOutCubic, easeInOutCubic
easeInQuart, easeOutQuart, easeInOutQuart
easeInQuint, easeOutQuint, easeInOutQuint
easeInExpo, easeOutExpo, easeInOutExpo
easeInCirc, easeOutCirc, easeInOutCirc
easeInBack, easeOutBack, easeInOutBack
easeInElastic, easeOutElastic, easeInOutElastic
easeInBounce, easeOutBounce, easeInOutBounce
```

---

## License

MIT — see [LICENSE](./LICENSE) for details.
