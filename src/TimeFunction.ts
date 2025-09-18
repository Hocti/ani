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
};
export default TimeFunction;
