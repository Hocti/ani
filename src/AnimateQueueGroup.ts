import { QueueType, cssObject, aniOption,AnimateCall,AnimateQueue } from "./types";
import TimeFunction from "./TimeFunction";

const processOption=(option?:number|aniOption|undefined):aniOption=>{
    if(!option){
        return {
            duration:700, 
            easing:TimeFunction.easeInQuad
        }
    }
    if(typeof option=="number"){
        return {
            duration:option, 
            easing:TimeFunction.easeInQuad
        }
    }
    return option as aniOption;
}

export default class AnimateQueueGroup{
    queue:AnimateQueue[]=[];
    marks:Map<string,number>=new Map();
    animate(cssObj?:cssObject,option?:number|aniOption,cb?:AnimateCall):AnimateQueueGroup{
        this.queue.push({
            type:QueueType.animate,
            cssObj,
            option:processOption(option),
            cb
        })
        return this;
    }
    delay(time:number,cb?:AnimateCall):AnimateQueueGroup{
        this.queue.push({
            type:QueueType.delay,
            option:{
                duration:time
            },
            cb
        })
        return this;
    }
    do(cb?:AnimateCall):AnimateQueueGroup{
        this.queue.push({
            type:QueueType.do,
            cb
        })
        return this;
    }
    css(cssObj?:cssObject):AnimateQueueGroup{
        this.queue.push({
            type:QueueType.css,
            cssObj
        })
        return this;
    }
    show():AnimateQueueGroup{
        this.queue.push({
            type:QueueType.show
        })
        return this;
    }
    hide():AnimateQueueGroup{
        this.queue.push({
            type:QueueType.hide
        })
        return this;
    }
    fadeIn(time:number=700):AnimateQueueGroup{
        this.queue.push({
            type:QueueType.fadeIn,
            option:processOption(time)
        })
        return this;
    }
    fadeOut(time:number=700):AnimateQueueGroup{
        this.queue.push({
            type:QueueType.fadeOut,
            option:processOption(time)
        })
        return this;
    }
    
    branch(cb:AnimateCall):AnimateQueueGroup{
        this.queue.push({
            type:QueueType.branch,
            cb
        })
        return this;
    }
    remove(){
        this.queue.push({
            type:QueueType.remove
        })
        return this;
    }

    mark(name:string):AnimateQueueGroup{
        this.marks.set(name,this.queue.length);
        return this;
    }
    jump(markname:string,looptime:number=1):AnimateQueueGroup{
        this.queue.push({
            type:QueueType.jump,
            option:{
                markname,
                looptime
            }
        })
        return this;
    }

    //
    cloneQueue():AnimateQueue[]{
        return JSON.parse(JSON.stringify(this.queue)) as AnimateQueue[];
    }
    joinQueue(q:AnimateQueueGroup):AnimateQueueGroup{
        this.queue=this.queue.concat(q.queue);
        return this;
    }
}