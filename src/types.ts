import Animate from "./Animate";

export enum QueueType{
    animate,
    delay,
    fadeIn,
    fadeOut,

    do,
    css,
    show,
    hide,
    jump,
    branch,
    remove,
}

export const queueWithAnimate=[
    QueueType.animate,
    QueueType.fadeIn,
    QueueType.fadeOut,
]
export const queueWithTime=[
    ...queueWithAnimate,
    QueueType.delay,
]

export type AnimateCall=(a:Animate)=>Animate;

export type AnimateQueue={
    type:QueueType,
    option?:aniOption,
    cssObj?:cssObject,
    cb?:AnimateCall
}

export type timeOption={
    duration:number,
    easing?:((n:number)=>number),
}
export type jumpOption={
    markname:string,
    looptime:number,
}
export type aniOption=timeOption | jumpOption;

export type cssObject=Record<string,string|number|undefined>;
export type stringDict=Record<string,string>;