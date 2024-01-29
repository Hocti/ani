# Ani

Ani is a lightweight, powerful JavaScript library for performing animations, inspired by jQuery's syntax but operating without jQuery itself. It's designed to make it easy to animate elements on your webpage with minimal code and effort.

## Features

- Chainable methods for concise and readable code.
- Supports animating CSS properties.
- Includes queue management for complex animation sequences.
- Offers methods for common animations like fadeIn, fadeOut, show, and hide.
- Allows for custom animation callbacks.
- Provides functionality to pause, resume, and stop animations.
- Ability to manipulate animation speed.

## Installation

You can install Ani via npm:

```bash
npm install ani-lib
```

Or, if you prefer using Yarn:

```bash
yarn add ani-lib
```

Then, include Ani in your project:

```javascript
import ani from 'ani-lib';
```

Or, Just using jsdelivr
```
<script src="https://cdn.jsdelivr.net/npm/ani-lib@latest/dist/ani.js"></script>
```

## Usage

### Starting an Animation

To start an animation on an element:

```typescript
ani.start('#myElement').hide().fadeIn();

ani.start('#myElement', { opacity: 0 }, 500, () => {
  console.log('Animation completed!');
});

const myElement=document.getElementById('myElement');
const ani2=ani.start(myElement).animate( { opacity: 0 }).do(() => {
  console.log('Animation completed!');
});
  
ani.start(myElement).joinQueue(ani2.cloneQueue());

//related value
ani.start('#myElement').fadeIn().delay(500).css({width:'*=2',x:'+=4',height:100}).fadeOut({duration:700,easing:ani.time.easeInQuad}).remove();

//branch
ani.start('#myElement').css({width:100,height:100}).branch((a)=>{a.animate({width:200},3000)}).animate({height:200},6000);

//
ani.start('#myElement').css({width:100,height:100}).branch((a)=>{a.animate({width:200},3000)}).animate({height:200},6000);
```

### Queueing Animations

You can queue animations for sequential execution:

```typescript
const fadeQueue=ani.queue({ opacity: 0 }, 500).animate({ opacity: 1 }, 500);
//then
ani.start('#myElement').joinQueue(fadeQueue);
ani.start('#yourElement').delay(500).joinQueue(fadeQueue);
```

### Stopping Animations

To stop an ongoing animation:

```typescript
ani.stop('#myElement');
```

## API Overview

- `ani.queue(cssObj?, option?, callback?)AnimateQueueGroup:`: Enqueue an animation or a series of animations.
- `ani.start(HTMLElement/string, cssObj?, option?, callback?):Animate`: Start an animation on the specified element.
- `ani.stop(HTMLElement/string)`: Stop all the animation on the specified element.

### `AnimateQueueGroup` Methods

#### queue methods
- `animate(cssObj?, option?, callback?)`: Adds an animation to the queue.
- `delay(time, callback?)`: Delays the next animation in the queue.
- `do(callback)`: Executes a callback without affecting the queue.
- `css(cssObj?)`: Applies CSS properties immediately.
- `show()`: Shows the element.
- `hide()`: Hides the element.
- `fadeIn(time?)`: Fades the element in.
- `fadeOut(time?)`: Fades the element out.
- `branch(callback)`: Creates a branch in the animation sequence.
- `mark(name)`: Marks a position in the queue.
- `jump(markname, looptime?)`: Jumps to a marked position in the queue.
- `pause()`: pause animation.
- `reset()`: reset animation.
- `speedup(speed?)`: speedup animation.
- `remove()`: Removes the element from parent and end the animation

#### other methods
- `cloneQueue():AnimateQueueGroup`: Clones the current queue.
- `joinQueue(q:AnimateQueueGroup)`: Joins another queue.

### `Animate` Class

Inherits all methods from `AnimateQueueGroup` and adds:

#### properties
- `element`:HTMLElement
- `speed`:number: default 1
- `skipDelay`:boolean: skip all delay quene
#### methods (effective immediately)
- `now`: immediately run last command, not adding to the queue, e.g. `ani.start('#box',{x:200}).animate({x:100}).css({x:50}).now.animate({x:300})` ，would set x to 50 first,then animate to 200->100->300, but not for quene require time to run(animate,delay,fadeIn/Out)
- `resume()`: Resumes the pasued animation.
- `stop()`: Stops and end the animation.

### `cssObj`
```typescript
{
  opacity:0.7
  marginTop:10,
  marginLeft:'10em',  
  'margin-right':'-10',
  'margin-bottom':'*=2',
  scaleX:3,
  scaleY:'+=0.5',
  x:10,
  rotate:30
}
```
number would auto filling 'px'/'deg' as unit (unless it's scale or opacity)

### `option`
number(default 700)
or
```typescript
{
    duration:1200,
    easing:ani.time.easeInQuad
}
```

## update

added 
```
x,y,z
scaleX,scaleY,scaleZ
RotateX,RotateY,RotateZ
```
(auto transform to css transform,scale,rotate)

added difficult unit animation
```
ani.start('#redBox').css({left:'10cm'}).animate({left:'10in'})
```

added `now` to call method immediately, and remove `hideNow`,`jumpNow` etc

## License

This project is licensed under the MIT License - see the LICENSE file for details.