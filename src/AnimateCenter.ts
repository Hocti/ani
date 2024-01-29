import AnimateQueueGroup from "./AnimateQueueGroup";
import Animate from "./Animate";
import { cssObject, QueueType, AnimateQueue, aniOption, queueWithTime, AnimateCall } from "./types";

let animates:(Animate|undefined)[]=[];
export const add2List=(a:Animate):void=>{
    animates.push(a);
}

const start=(h:HTMLElement|string,cssObj?:cssObject,option?:number|aniOption,cb?:AnimateCall):Animate=>{
    if(typeof h=="string"){
        h=document.querySelector(h) as HTMLElement;
        if(!h){
            throw new Error("element not found")
        }
    }
    const a=new Animate(h,cssObj,option,cb);
    return a;
}
const queue=(cssObj?:cssObject,option?:number|aniOption,cb?:AnimateCall):AnimateQueueGroup=>{
    const a=new AnimateQueueGroup()
    if(cssObj){
        a.animate(cssObj,option,cb);
    }
    return a;
}

const stop=(h:HTMLElement|string):void=>{
    if(typeof h=="string"){
        h=document.querySelector(h) as HTMLElement;
    }
    for(let a of animates){
        if(a!=undefined && a.element==h){
            a.stop();
        }
    }
}

let lastTime:number=0;
function etf(f: number):void{
    const t=f-lastTime;
    let removecount=0;
    for(let i in animates){
        if(animates[i]==undefined){
            removecount++;
            continue;
        }
        const remove=(animates[i] as Animate).process(t);
        if(remove){
            animates[i]=undefined;
            //const index=animates.indexOf(a);
            //animates.splice(index, 1);
        }
    }
    if(removecount>10){
        animates = animates.filter(value => value !== undefined);
    }

    lastTime=f;
    window.requestAnimationFrame(etf)
}
window.requestAnimationFrame(etf)

export {start,stop,queue}