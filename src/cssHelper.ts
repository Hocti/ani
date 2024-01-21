import {cssObject,stringDict} from './types';

type cssPart={
  type:'number'|"function"|"other",
  value?:number|string,
  unit?:string,
  function?:string,
  args?:cssPart[]
}

export function toCamelCase(cssProperty:string):string {
  return cssProperty.replace(/-([a-z])/g, function (g) { 
      return g[1].toUpperCase(); 
  });
}
export function toHyphenated(cssProperty:string):string {
  return cssProperty.replace(/([A-Z])/g, '-$1').toLowerCase();
}
export function splitCssString(cssString:string) {
  if(typeof cssString!='string'){
    throw new Error('cssString is not string '+cssString)
  }
  const regex = /(\b[a-z]+\([^)]*\))|\S+/gi;
  return cssString.match(regex);
}
export function categorizeCssValue(value:string):cssPart {
  // Check if the value is a number (with or without a unit)
  const numberMatch = value.match(/^(\d+(?:\.\d+)?)([a-z%]*)$/);
  if (numberMatch) {
    return {
      type: 'number',
      value: parseFloat(numberMatch[1]),
      unit: numberMatch[2] || undefined
    };
  }

  // Check if the value is a function
  const functionMatch = value.match(/^([a-z]+)\((.*)\)$/i);
  if (functionMatch) {
    const functionName = functionMatch[1];
    const args_str = functionMatch[2].split(/,\s*/);
    const args:cssPart[]=[];
    for(let i in args_str){
        args.push(categorizeCssValue(args_str[i]))
    }
    return {
      type: 'function',
      function: functionName,
      args
    };
  }

  // If neither, classify as 'other'
  return {
    type: 'other',
    value: value
  };
}

const withoutUnit=['opacity']

  function middleNumber(from:string|number,to:string|number,progressRate:number):number{
      let f1=parseFloat(from as string)
      let f2=parseFloat(to as string)
      return f1+(f2-f1)*progressRate;
  }

  const isNumber=(value:string|number|undefined)=>{
    if(value===undefined)return false
    if(typeof value=='number')return true
    //return !isNaN(parseFloat(value))
    if(typeof value==='string'){
      if(value==='0')return true
      return !isNaN(parseFloat(value));
    }
    return false
  }


  export function middleValue(key:string,from:string|number|undefined,to:string|number|undefined,progressRate:number):string{
      if(isNumber(from) && isNumber(to)){
      const v=middleNumber(from as number,to as number,progressRate);
      console.log('middleValue',key,v)
      return v.toString()
      }
      return to as string
  }

function processSplited(v:string):cssPart{
  const c=categorizeCssValue(v)
  if(c.type=='function'){
      if(c.function=='rgb'){
          c.function='rgba';
          c.args!.push({
              type:'number',
              value:1,
              unit:undefined,
          });
      }
  }
  return c;
}

function processString(s:string):cssPart[]{
  const result:cssPart[]=[];
  splitCssString(s)?.forEach((v,k)=>{
      result.push(processSplited(v))
  })
  return result;
}

export function checkFormatMatch(obj1:cssPart[],obj2:cssPart[]):boolean{
  if(obj1.length!=obj2.length){
      return false;
  }
  for(let i in obj1){
      if(obj1[i].type!=obj2[i].type){
          return false;
      }
      if(obj1[i].type=='function'){
          if(obj1[i].function!=obj2[i].function){
              return false;
          }
          if(!checkFormatMatch(obj1[i].args!,obj2[i].args!)){
              return false;
          }
      }
  }
  return true;
}

export function mixObj(obj1:cssPart[],obj2:cssPart[],progress:number):cssPart[]{
  const result:cssPart[]=[];
  for(let i in obj1){
      if(!obj1[i]){
          console.error('sfdgundefined',obj1,obj2)
          throw new Error('obj1[i] is undefined')
      }
      if(obj1[i].type=='number'){
          result.push({
              type:'number',
              value:middleNumber(obj1[i].value as number,obj2[i].value as number,progress),
              unit:obj1[i].unit
          })
      }else if(obj1[i].type=='function'){
          result.push({
              type:'function',
              function:obj1[i].function,
              args:mixObj(obj1[i].args!,obj2[i].args!,progress)//?.map((v,k)=>mixObj(v,obj2[i].args![k],progress))
          })
      }else{
          result.push(obj1[i])
      }
  }
  return result;
}

function cssPart2String(cp:cssPart):string{
  let result='';
  if(cp.type=='number'){
      result+=cp.value!+(cp.unit?cp.unit:'')+' ';
  }else if(cp.type=='function'){
      result+=cp.function+'(';
      for(let i=0,t=cp.args!.length;i<t;i++){
          result+=cssPart2String(cp.args![i]);
          if(i!=t -1){
              result+=', ';
          }
      }
      result+=') ';
  }else{
      result+=cp.value+' ';
  }
  return result;
}
function cssParts2String(cp:cssPart[]):string{
  let result='';
  for(let i in cp){
      result+=cssPart2String(cp[i]);
  }
  return result;

}





export function getComputedResult(element:HTMLElement,key:string,value:string):string{
  const newkey=toCamelCase(key) as any;
	const oldValue=element.style[newkey];
  if(isNumber(value) && withoutUnit.indexOf(newkey)<0){
    value=value+'px'
  }
	element.style[newkey]=value;
	const result=getComputedStyle(element)[newkey]
	element.style[newkey]=oldValue;
	return result
}
export const getTargetCss =(h:HTMLElement,cssObj:cssObject):cssObject=>{
  const result:cssObject={};
  for(let k in cssObj){
    const kk=toCamelCase(k);
    result[kk]=getComputedResult(h,kk,cssObj[kk] as string)
  }
  return result;
}
export const getCss=(h:HTMLElement,cssObj:cssObject):cssObject=>{
  const css=getComputedStyle(h) as unknown as stringDict;
  const result:cssObject={};
  for(let k in cssObj){
      const kk=toCamelCase(k);
      result[kk]=css[kk];
      if(kk=='x' || kk=='y'){
        const currTran=css.transform.split(' ')
        let x=0,y=0;
        x=parseFloat(currTran[0])
        if(currTran.length>=2){
          y=parseFloat(currTran[1])
        }
        if(kk=='x'){
          result[kk]=x;
        }else if(kk=='y'){
          result[kk]=y;
        }
      }
  }
  return result;
}
export const css=(h:HTMLElement,cssObj:cssObject)=>{
  for(let k in cssObj){
    let kk=toCamelCase(k) as any;
    let value=cssObj[k] as string;
    if(kk=='x' || kk=='y'){
      const currTran=h.style.translate.split(' ')
      let x=0,y=0;
      x=parseFloat(currTran[0])
      if(currTran.length>=2){
        y=parseFloat(currTran[1])
      }
      if(kk=='x'){
        x=parseFloat(value)
      }else if(kk=='y'){
        y=parseFloat(value)
      }
      kk='translate'
      value=`${x}px ${y}px`
      console.log(kk,value)
    }
    if(isNumber(value) && withoutUnit.indexOf(kk)<0){
      //value=value+'px'
    }
    h.style[kk]=value;
    //console.log(kk,'_',value,'_',h.style[kk])
  }
}
export const middleCss=(h:HTMLElement,cssFrom:cssObject,cssTo:cssObject,progressRate:number)=>{
  if(progressRate==0 && cssFrom){
    css(h,cssFrom);
  }else if(progressRate===1){
    css(h,cssTo);
  }else{
    const cssmix:cssObject={};
    for(let k in cssTo){
      const kk=toCamelCase(k) as any;
      let value=cssTo[k];
      if(cssFrom && cssFrom[k]!==undefined){
        let fromValue=cssFrom[k];

        if(typeof fromValue=='number' && typeof value=='number'){
          value=middleNumber(fromValue,value,progressRate);
        }else if(typeof fromValue=='string' && typeof value=='string'){
          const o1=processString(fromValue)
          const o2=processString(value)
          if(checkFormatMatch(o1,o2)){
            value=cssParts2String(mixObj(o1,o2,progressRate))
          }
        }
      }else{

      }
      cssmix[kk]=value as string;
    }
    css(h,cssmix);
  }
}