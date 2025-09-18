import AnimateQueueGroup from "./AnimateQueueGroup";
import {
	cssObject,
	QueueType,
	AnimateQueue,
	timeOption,
	aniOption,
	queueWithTime,
	queueWithAnimate,
	jumpOption,
	AnimateCall,
} from "./types";
import { css, getCss, getTargetCss, middleCss } from "./cssHelper";
import { clamp } from "./utils";
import { add2List } from "./AnimateCenter";

export default class Animate extends AnimateQueueGroup {
	element: HTMLElement;
	speed: number = 1;
	skipDelay: boolean = false;
	is_pause: boolean = false;

	private currQueue: number = 0;
	private currentStepTime: number = 0;
	private looped: Record<number, number> = {};

	private originStyle: string = "";
	private originDisplay: string = "";
	private originOpacity: number;

	private beforeAni: cssObject = {};
	private targetAni: cssObject = {};

	constructor(h: HTMLElement, cssObj?: cssObject, option?: number | aniOption, cb?: AnimateCall) {
		super();
		this.element = h;
		this.originStyle = h.getAttribute("style") || "";
		this.originDisplay = getComputedStyle(h).display;
		if (this.originDisplay == "none") {
			if (h.getAttribute("originDisplay") == null) {
				this.originDisplay = "block";
			} else {
				this.originDisplay = h.getAttribute("originDisplay")!;
			}
		} else {
			h.setAttribute("originDisplay", this.originDisplay);
		}
		this.originOpacity = parseFloat(getComputedStyle(h).opacity);
		if (this.originOpacity == 0) {
			this.originOpacity = 1;
		}
		if (cssObj) {
			this.animate(cssObj, option, cb);
		}

		add2List(this);
	}
	//
	public get now(): this {
		const lastQ = this.queue.pop();
		if (lastQ) {
			if (queueWithTime.indexOf(lastQ.type) >= 0) {
				throw new Error("can't get run command with time immediately");
			}
			this.processNow(lastQ);
		}
		return this;
	}

	private resetNow(pause: boolean = false): this {
		this.speed = 1;
		this.skipDelay = false;
		this.is_pause = pause;
		this.currQueue = 0;
		this.currentStepTime = 0;
		this.looped = {};
		this.element.setAttribute("style", this.originStyle);
		return this;
	}
	//
	private nextQueue(): void {
		this.currQueue++;
		this.currentStepTime = 0;
	}

	private setDisplay(display: boolean): void {
		const curr = getComputedStyle(this.element);
		if (display) {
			if (curr.display === "none") {
				css(this.element, { display: this.originDisplay });
			}
			if (curr.opacity == "0") {
				this.element.style.opacity = this.originOpacity.toString();
			}
		} else {
			css(this.element, { display: "none" }); //hide
		}
	}

	stop(): void {
		this.queue = [];
		this.currQueue = 0;
		this.is_pause = false;
		this.currentStepTime = 0;
		this.speed = 1;
		this.skipDelay = false;
	}

	resume(): this {
		this.is_pause = false;
		return this;
	}

	process(f: number): boolean | undefined {
		//async
		if (!this.element || this.element.parentElement == null || this.currQueue >= this.queue.length) {
			return true;
		}
		if (this.is_pause) {
			return;
		}
		if (this.queue.length == 0) {
			return;
		}
		const queue = this.queue[this.currQueue];

		if (queueWithTime.indexOf(queue.type) >= 0) {
			const duration = (queue.option as timeOption).duration!;
			const progress = clamp(this.currentStepTime / duration, 0, 1);

			if (queueWithAnimate.indexOf(queue.type) >= 0) {
				const easing = (queue.option as timeOption).easing!;
				const progressRate = easing(progress);

				if (queue.type == QueueType.animate) {
					if (progress == 0) {
						this.beforeAni = getCss(this.element, queue.cssObj!);
						this.targetAni = getTargetCss(this.element, queue.cssObj!);
						console.log('aniBegin',this.element,queue.cssObj,this.beforeAni,this.targetAni)
					}
				} else if (queue.type == QueueType.fadeIn) {
					if (progress == 0) {
						const startOpacity =
							this.element.style.display === "none"
								? 0
								: parseFloat(getComputedStyle(this.element).opacity);
						this.setDisplay(true);
						this.beforeAni = { opacity: startOpacity };
						this.targetAni = { opacity: this.originOpacity };
					}
				} else if (queue.type == QueueType.fadeOut) {
					if (progress == 0) {
						this.beforeAni = { opacity: parseFloat(getComputedStyle(this.element).opacity) };
						this.targetAni = { opacity: 0 };
					}
					if (progress == 1) {
						this.setDisplay(false);
					}
				}
				middleCss(this.element, this.beforeAni, this.targetAni, progressRate);
				if (progress == 1) {
					this.nextQueue();
					if (queue.cb) {
						queue.cb(this);
					}
					return;
				}
			} else if (queue.type == QueueType.delay) {
				if (this.skipDelay || progress === 1) {
					if (queue.cb) {
						queue.cb(this);
					}
					this.nextQueue();
					this.process(f);
					return;
				}
			}

			this.currentStepTime += f * this.speed;
		} else {
			const stop = this.processNow(queue);
			if (!stop) {
				this.nextQueue();
				this.process(f);
			}
		}
	}

	processNow(queue: AnimateQueue): boolean {
		if (queue.type == QueueType.show) {
			this.setDisplay(true);
		} else if (queue.type == QueueType.hide) {
			this.setDisplay(false);
		} else if (queue.type == QueueType.do) {
			queue.cb!(this);
		} else if (queue.type == QueueType.css) {
			css(this.element, queue.cssObj!);
		} else if (queue.type == QueueType.speedup) {
			this.speed = queue.option as number;
		} else if (queue.type == QueueType.branch) {
			queue.cb!(new Animate(this.element));
		} else if (queue.type == QueueType.jump) {
			const mark = this.marks.get((queue.option! as jumpOption).markname);
			const looptime = (queue.option! as jumpOption)!.looptime;
			if (!this.looped[this.currQueue]) {
				this.looped[this.currQueue] = 0;
			}
			this.looped[this.currQueue]++;
			if (mark != undefined && (looptime <= 0 || this.looped[this.currQueue] <= looptime)) {
				this.currQueue = mark;
				return true;
			}
		} else if (queue.type == QueueType.pause) {
			this.is_pause = true;
			this.nextQueue();
			return true;
		} else if (queue.type == QueueType.reset) {
			this.resetNow();
			return true;
		} else if (queue.type == QueueType.remove) {
			this.queue = undefined!;
			this.element.parentElement!.removeChild(this.element);
			this.element = undefined!;
			return true;
		}
		return false;
	}
}
