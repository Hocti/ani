import { cssObject, stringDict } from "./types";

export function toCamelCase(cssProperty: string): string {
	return cssProperty.replace(/-([a-z])/g, function (g) {
		return g[1].toUpperCase();
	});
}
export function toHyphenated(cssProperty: string): string {
	return cssProperty.replace(/([A-Z])/g, "-$1").toLowerCase();
}
function checkRelate(value: string): { mathType: string; value: number } | undefined {
	const relate = value.match(/^([+-\/\*])=([-]?[\d].?[\d]?)$/);
	if (relate) {
		return {
			mathType: relate[1],
			value: parseFloat(relate[2]),
		};
	}
	return undefined;
}

export const css = (h: string | HTMLElement, cssObj: cssObject) => {
	if (typeof h == "string") {
		h = document.querySelector(h) as HTMLElement;
		if (!h) {
			throw new Error("element not found");
		}
	}
	const result = SetCompiledResult(h, cssObj);
	for (let k in result) {
		h.style[k as any] = result[k];
	}
};

const transslateKey = ["x", "y", "z"];
const transformKey = ["rotate", "scale", "translate"];
const degKey = ["rotate", "rotateX", "rotateY", "rotateZ"];
const xyzKey = [...transslateKey, "rotateX", "scaleX", "rotateY", "scaleY", "rotateZ", "scaleZ"];
const withoutUnit = ["opacity", "background", "scale", "scaleX", "scaleY", "scaleZ"];

function middleNumber(from: string | number, to: string | number, progressRate: number): number {
	let f1 = parseFloat(from as string);
	let f2 = parseFloat(to as string);
	return f1 + (f2 - f1) * progressRate;
}

//===================================================

function currentValue(element: HTMLElement, key: string): string {
	const newkey = toCamelCase(key) as any;
	if (xyzKey.indexOf(key) >= 0) {
		const xyz: string = key.substring(key.length - 1).toLowerCase();
		const ttype = key.length == 1 ? "transform" : key.substring(0, key.length - 1);
		const result = getComputedStyle(element)[ttype as any];

		if (!result || result === "none" || result === "") {
			return getDefaultValue(ttype);
		}
		const resultArr = result.split(" ");
		if (xyz == "x") {
			return resultArr[0];
		} else if (xyz == "y") {
			if (resultArr[1]) {
				return resultArr[1];
			} else {
				return getDefaultValue(ttype);
			}
		} else if (xyz == "z" && resultArr.length > 2) {
			if (resultArr[2]) {
				return resultArr[2];
			} else {
				return getDefaultValue(ttype);
			}
		}
	}
	return getComputedStyle(element)[newkey];
}

export const getTargetCss = (h: HTMLElement, cssObj: cssObject): cssObject => {
	const oldStyle = h.getAttribute("style") || "";
	css(h, cssObj);
	const result = getCss(h, cssObj);
	h.setAttribute("style", oldStyle);
	return result;
};

function getDefaultValue(key: string): string {
	if (key == "x" || key == "y" || key == "z" || key == "translate") {
		return "0px";
	} else if (key == "scaleX" || key == "scaleY" || key == "scaleZ" || key == "scale") {
		return "1";
	} else if (key == "rotateX" || key == "rotateY" || key == "rotateZ" || key == "rotate") {
		return "0deg";
	}
	return "0";
}

/*
 */

export const getCss = (h: HTMLElement, cssObj: cssObject): cssObject => {
	const css = getComputedStyle(h) as unknown as stringDict;
	const result: cssObject = {};
	const extraKey: string[] = [];

	for (let k in cssObj) {
		if (k.startsWith("--")) {
			result[k] = window.getComputedStyle(h).getPropertyValue(k);
			continue;
		}
		const kk = toCamelCase(k);
		if (xyzKey.indexOf(kk) >= 0) {
			extraKey.push(kk);
			/*
        result[kk]=h.style[kk as any];
        if(!result[kk] || result[kk]=='' || result[kk]==='none'){
          result[kk]=getDefaultValue(kk);
        }
        */
			continue;
		}
		if (css[kk] == "none" || css[kk] == "" || !css[kk]) {
			if (kk == "rotate") {
				result[kk] = "0deg";
				continue;
			} else if (kk == "scale") {
				result[kk] = "1";
				continue;
			} else if (kk == "translate") {
				result[kk] = "0px";
				continue;
			}
		}
		result[kk] = css[kk];
	}

	if (extraKey.length) {
		if (extraKey.includes("x") || extraKey.includes("y") || extraKey.includes("z")) {
			const translate = mixXYZ(
				"translate",
				css["translate"],
				h.style["x" as any],
				h.style["y" as any],
				h.style["z" as any]
			);
			if (translate) result["translate"] = translate;
		}
		if (extraKey.includes("scaleX") || extraKey.includes("scaleY") || extraKey.includes("scaleZ")) {
			const scale = mixXYZ(
				"scale",
				css["scale"],
				h.style["scaleX" as any],
				h.style["scaleY" as any],
				h.style["scaleZ" as any]
			);
			if (scale) result["scale"] = scale;
		}
		if (extraKey.includes("rotateX") || extraKey.includes("rotateY") || extraKey.includes("rotateZ")) {
			const rotate = mixXYZ(
				"rotate",
				css["rotate"],
				h.style["rotateX" as any],
				h.style["rotateY" as any],
				h.style["rotateZ" as any]
			);
			if (rotate) result["rotate"] = rotate;
		}
	}
	//console.log('getCss',result)
	return result;
};

const autoUnit = (v: string | number | undefined, unittype: string = ""): string | number | undefined => {
	if (v == undefined) {
		return undefined;
	}
	if (typeof v === "string") {
		const oldArr = v.split(" ");
		if (oldArr.length > 1) {
			const newArr: string[] = oldArr.map((v, k) => {
				return autoUnit(v, unittype) as string;
			});
			return newArr.join(" ");
		}
	}
	/*
  if(typeof v === 'string' && !isNaN(parseFloat(v)) && isNaN(Number(v))){
    v=parseFloat(v);
  }
  */
	if (typeof v === "number" || (typeof v === "string" && !isNaN(parseFloat(v)))) {
		if (withoutUnit.indexOf(unittype) >= 0) {
			return (v as string).toString();
			//return parseFloat(v as string).toString();
		}
		if (degKey.indexOf(unittype) >= 0) {
			return parseFloat(v as string) + "deg";
		}
		if (typeof v === "string") {
			const m = v.replace(/[\,\)]+$/g, "").match(/^([-]?[\d.]+)([a-z\%]+)$/);
			if (m && m[2]) {
				return v;
			}
		}
		//console.log(unittype,v)
		return v + "px";
	}
	return v;
};
function relateResult(oldValue: string, mathType: String, newValue: number, unit?: string): string {
	if (!oldValue) {
		console.error("oldValue is undefined");
	}
	const oldArr = oldValue.split(" ");
	if (oldArr.length > 1) {
		const newArr: string[] = oldArr.map((v, k) => {
			return relateResult(v, mathType, newValue, unit);
		});
		return newArr.join(" ");
	}
	if (!isNaN(parseFloat(oldValue))) {
		const oldValueNum = parseFloat(oldValue);
		switch (mathType) {
			case "+":
				return autoUnit(oldValueNum + newValue, unit) as string;
			case "-":
				return autoUnit(oldValueNum - newValue, unit) as string;
			case "*":
				return autoUnit(oldValueNum * newValue, unit) as string;
			case "/":
				return autoUnit(oldValueNum / newValue, unit) as string;
		}
	}
	return oldValue;
}

const SetCompiledResult = (h: HTMLElement, cssObj: cssObject): Record<string, string> => {
	const css = getComputedStyle(h) as unknown as stringDict;
	const result: Record<string, string> = {};
	const extraKey: string[] = [];

	for (let k in cssObj) {
		if (k.startsWith("--")) {
			h.style.setProperty(k, cssObj[k] as string);
			continue;
		}

		let kk = toCamelCase(k) as any;

		if (typeof cssObj[k] === "string") {
			const relate = checkRelate(cssObj[k] as string);
			if (relate) {
				result[kk] = relateResult(currentValue(h, kk), relate.mathType, relate.value, kk);
				continue;
			}
		}

		if (xyzKey.indexOf(kk) >= 0) {
			extraKey.push(kk);
		}
		result[kk] = autoUnit(cssObj[k], kk) as string;
	}

	if (extraKey.length) {
		if (extraKey.includes("x") || extraKey.includes("y") || extraKey.includes("z")) {
			const translate = mixXYZ("translate", css["translate"], result["x"], result["y"], result["z"]);
			if (translate) result["translate"] = translate;
		}
		if (extraKey.includes("scaleX") || extraKey.includes("scaleY") || extraKey.includes("scaleZ")) {
			const scale = mixXYZ("scale", css["scale"], result["scaleX"], result["scaleY"], result["scaleZ"]);
			if (scale) result["scale"] = scale;
		}
		if (extraKey.includes("rotateX") || extraKey.includes("rotateY") || extraKey.includes("rotateZ")) {
			const rotate = mixXYZ("rotate", css["rotate"], result["rotateX"], result["rotateY"], result["rotateZ"]);
			console.log("rotate263", rotate, css["rotate"], result["rotateX"], result["rotateY"], result["rotateZ"]);
			if (rotate) result["rotate"] = rotate;
		}
	}
	for (let k of extraKey) {
		delete result[k];
	}

	return result;
};

function mixXYZ(
	type: "translate" | "scale" | "rotate",
	currentGroupedValue: string | undefined,
	x: string | undefined,
	y: string | undefined,
	z: string | undefined
): string | undefined {
	if (x === undefined && y === undefined && z === undefined) {
		//return undefined;
	}
	let groupValue = [0, 0, 0];
	let currentGroupedValueArr: number[] = [];
	if (type == "scale") {
		groupValue = [1, 1, 1];
	}
	if (
		!currentGroupedValue ||
		currentGroupedValue == "none" ||
		currentGroupedValue == "initial" ||
		currentGroupedValue == ""
	) {
	} else {
		currentGroupedValueArr = currentGroupedValue.split(" ").map((k) => parseFloat(k));
		for (let i = 0; i < currentGroupedValueArr.length; i++) {
			groupValue[i] = currentGroupedValueArr[i];
		}
	}
	if (x) {
		groupValue[0] = parseFloat(x);
	}
	if (y) {
		groupValue[1] = parseFloat(y);
	}
	if (z) {
		groupValue[2] = parseFloat(z);
	}
	if (type == "rotate") {
		if (!(x && y && z)) {
			if (groupValue[0]) {
				return `x ${groupValue[0]}deg`;
			} else if (groupValue[1]) {
				return `y ${groupValue[1]}deg`;
			} else if (groupValue[2]) {
				return `z ${groupValue[2]}deg`;
			}
		}
	}
	const newVal: string[] = [];
	for (let i = 0; i < groupValue.length; i++) {
		newVal[i] = autoUnit(groupValue[i], type) as string;
	}
	const str = newVal.join(" ");
	return str;
}

export const middleCss = (h: HTMLElement, cssFrom: cssObject, cssTo: cssObject, progressRate: number) => {
	if (progressRate == 0 && cssFrom) {
		css(h, cssFrom);
	} else if (progressRate === 1) {
		css(h, cssTo);
	} else {
		const cssmix: cssObject = {};
		for (let k in cssTo) {
			let toValue = cssTo[k];
			let fromValue = cssFrom[k];
			let finalValue: string = toValue as string;
			const kk = k.startsWith("--") ? k : toCamelCase(k) as any;

			if (typeof toValue == "number") {
				if (!fromValue) {
					fromValue = 0;
				}
				if (typeof fromValue == "number") {
					finalValue = middleNumber(fromValue, toValue, progressRate).toString();
				}
			} else if (typeof toValue == "string" && typeof fromValue == "string") {
				const toRaw: (number | string)[] = toValue
					.split(/([-]?[\d.]+)([a-z%]*)/g)
					.filter((v: string) => v !== "")
					.map((v: string) => (isNaN(parseFloat(v)) ? v : parseFloat(v)));
				const fromRaw: (number | string)[] = fromValue
					.split(/([-]?[\d.]+)([a-z%]*)/g)
					.filter((v: string) => v !== "")
					.map((v: string) => (isNaN(parseFloat(v)) ? v : parseFloat(v)));
				const finalRaw: (number | string)[] = [];

				let formatMatch = true;
				if (toRaw.length === fromRaw.length) {
					for (let i = 0; i < toRaw.length; i++) {
						if (typeof toRaw[i] !== typeof fromRaw[i]) {
							formatMatch = false;
							break;
						}
						if (toRaw[i] == fromRaw[i]) {
							finalRaw.push(toRaw[i]);
						} else if (typeof toRaw[i] == "number") {
							//num
							finalRaw.push(middleNumber(fromRaw[i], toRaw[i], progressRate));
						} else {
							//string
							finalRaw.push(progressRate > 0.5 ? toRaw[i] : fromRaw[i]);
						}
					}
				} else {
					formatMatch = false;
				}

				if (formatMatch) {
					finalValue = finalRaw.join("");
				} else if (progressRate > 0.5) {
					finalValue = toValue as string;
				} else {
					finalValue = fromValue as string;
				}
			}
			cssmix[kk] = finalValue;
		}
		css(h, cssmix);
	}
};
