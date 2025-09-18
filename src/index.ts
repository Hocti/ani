//export {start,stop,queue} from './AnimateCenter'
//export {css,getCss} from './cssHelper'
//export {time}
import { start, stop, queue } from "./AnimateCenter";
import { css, getCss } from "./cssHelper";
import time from "./TimeFunction";
import Animate from "./Animate";

const obj = {
	start,
	stop,
	queue,
	css,
	getCss,
	time,
	Animate,
};

export default obj;
