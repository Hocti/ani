import { start, stop, queue } from "./AnimateCenter";
import { css, getCss } from "./cssHelper";
import time from "./TimeFunction";
import Animate from "./Animate";
import { cssObject, aniOption, AnimateCall } from "./types";

const ani = (h: HTMLElement | string, cssObj?: cssObject, option?: number | aniOption, cb?: AnimateCall) => {
	return start(h, cssObj, option, cb);
};

ani.start = start;
ani.stop = stop;
ani.queue = queue;
ani.css = css;
ani.getCss = getCss;
ani.time = time;
ani.Animate = Animate;

export default ani;
