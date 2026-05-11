const _bounceOut = (n: number): number => {
	const d1 = 2.75, n1 = 7.5625;
	if (n < 1 / d1) return n1 * n * n;
	if (n < 2 / d1) { n -= 1.5 / d1; return n1 * n * n + 0.75; }
	if (n < 2.5 / d1) { n -= 2.25 / d1; return n1 * n * n + 0.9375; }
	n -= 2.625 / d1; return n1 * n * n + 0.984375;
};

const TimeFunction: Record<string, (n: number) => number> = {
	linear: (n: number) => n,
	sine: (n: number) => 1 - Math.cos((n * Math.PI) / 2),
	uniform: (n: number) => (n < 0.5 ? 2 * n : 2 - 2 * n),
	easeInQuad: (n: number) => n * n,
	easeOutQuad: (n: number) => n * (2 - n),
	easeInOutQuad: (n: number) => (n < 0.5 ? 2 * n * n : -1 + (4 - 2 * n) * n),
	easeInCubic: (n: number) => n * n * n,
	easeOutCubic: (n: number) => --n * n * n + 1,
	easeInOutCubic: (n: number) => (n < 0.5 ? 4 * n * n * n : (n - 1) * (2 * n - 2) * (2 * n - 2) + 1),
	easeInQuart: (n: number) => n * n * n * n,
	easeOutQuart: (n: number) => 1 - --n * n * n * n,
	easeInOutQuart: (n: number) => (n < 0.5 ? 8 * n * n * n * n : 1 - 8 * --n * n * n * n),
	easeInQuint: (n: number) => n * n * n * n * n,
	easeOutQuint: (n: number) => 1 + --n * n * n * n * n,
	easeInOutQuint: (n: number) => (n < 0.5 ? 16 * n * n * n * n * n : 1 + 16 * --n * n * n * n * n),
	easeInExpo: (n: number) => n === 0 ? 0 : Math.pow(2, 10 * n - 10),
	easeOutExpo: (n: number) => n === 1 ? 1 : 1 - Math.pow(2, -10 * n),
	easeInOutExpo: (n: number) => n === 0 ? 0 : n === 1 ? 1 : n < 0.5 ? Math.pow(2, 20 * n - 10) / 2 : (2 - Math.pow(2, -20 * n + 10)) / 2,
	easeInCirc: (n: number) => 1 - Math.sqrt(1 - n * n),
	easeOutCirc: (n: number) => Math.sqrt(1 - (n - 1) * (n - 1)),
	easeInOutCirc: (n: number) => n < 0.5 ? (1 - Math.sqrt(1 - 4 * n * n)) / 2 : (Math.sqrt(1 - (-2 * n + 2) * (-2 * n + 2)) + 1) / 2,
	easeInBack: (n: number) => 2.70158 * n * n * n - 1.70158 * n * n,
	easeOutBack: (n: number) => { const m = n - 1; return 2.70158 * m * m * m + 1.70158 * m * m + 1; },
	easeInOutBack: (n: number) => {
		const c2 = 2.5949095;
		return n < 0.5
			? (4 * n * n * ((c2 + 1) * 2 * n - c2)) / 2
			: ((2 * n - 2) * (2 * n - 2) * ((c2 + 1) * (2 * n - 2) + c2) + 2) / 2;
	},
	easeInElastic: (n: number) => n === 0 ? 0 : n === 1 ? 1 : -Math.pow(2, 10 * n - 10) * Math.sin((10 * n - 10.75) * (2 * Math.PI / 3)),
	easeOutElastic: (n: number) => n === 0 ? 0 : n === 1 ? 1 : Math.pow(2, -10 * n) * Math.sin((10 * n - 0.75) * (2 * Math.PI / 3)) + 1,
	easeInOutElastic: (n: number) => n === 0 ? 0 : n === 1 ? 1 : n < 0.5
		? -(Math.pow(2, 20 * n - 10) * Math.sin((20 * n - 11.125) * (2 * Math.PI / 4.5))) / 2
		: (Math.pow(2, -20 * n + 10) * Math.sin((20 * n - 11.125) * (2 * Math.PI / 4.5))) / 2 + 1,
	easeOutBounce: _bounceOut,
	easeInBounce: (n: number) => 1 - _bounceOut(1 - n),
	easeInOutBounce: (n: number) => n < 0.5 ? (1 - _bounceOut(1 - 2 * n)) / 2 : (1 + _bounceOut(2 * n - 1)) / 2,
};
export default TimeFunction;
