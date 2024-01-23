import {cssObject,stringDict} from './types';

type cssPart={
  type:'number'|"function"|"other",
  function?:string,
  args?:cssPart[]
  value?:number|string,
  unit?:string,
}

export function toCamelCase(cssProperty:string):string {
  return cssProperty.replace(/-([a-z])/g, function (g) { 
      return g[1].toUpperCase(); 
  });
}
export function toHyphenated(cssProperty:string):string {
  return cssProperty.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function splitCssString(cssString:string) {
  if(typeof cssString!='string'){
    throw new Error('cssString is not string '+cssString)
  }
  const regex = /(\b[a-z]+\([^)]*\))|\S+/gi;
  return cssString.match(regex);
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

function categorizeCssValue(value:string):cssPart {
  // Check if the value is a number (with or without a unit)
  const numberMatch = value.match(/^(\-?\d+(?:\.\d+)?)([a-z%]*)$/);
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

function parseCssValueString(s:string):cssPart[]{
  const result:cssPart[]=[];
  splitCssString(s)?.forEach((v,k)=>{
      result.push(processSplited(v))
  })
  return result;
}


function checkRelate(value:string):{mathType:string,value:number}|undefined{
  const relate = value.match(/^([+-\/\*])=([-]?[\d].?[\d]?)$/);
  if (relate) {
    return {
      mathType: relate[1],
      value: parseFloat(relate[2]),
    };
  }
  return undefined
}

export const css=(h:string|HTMLElement,cssObj:cssObject)=>{
  if(typeof h=="string"){
    h=document.querySelector(h) as HTMLElement;
    if(!h){
        throw new Error("element not found")
    }
  }
  const result=SetCompiledResult(h,cssObj)
  for(let k in result){
    h.style[k as any]=result[k];
  }
}

const transslateKey=['x','y','z'];
const transformKey=['rotate','scale','translate'];
const degKey=['rotate','rotateX','rotateY','rotateZ'];
const xyzKey=[...transslateKey,'rotateX','scaleX','rotateY','scaleY','rotateZ','scaleZ'];
const withoutUnit=['opacity','scale','scaleX','scaleY','scaleZ'];

const autoUnit=(v:string|number|undefined,type:string='px'):string|number|undefined=>{
  if(v==undefined){
    return undefined
  }
  if(typeof v === 'string' && !isNaN(parseFloat(v)) && isNaN(Number(v))){
    v=parseFloat(v);
  }
  if(typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)))){
    if(withoutUnit.indexOf(type)>=0){
      return v.toString();
    }
    if(degKey.indexOf(type)>=0){
      return v+'deg';
    }
    return v+'px'
  }
  return v;
}
export const getTargetCss =(h:HTMLElement,cssObj:cssObject):cssObject=>{
  const oldStyle=h.getAttribute('style')||'';
  css(h,cssObj);
  const result=getCss(h,cssObj);
  h.setAttribute('style',oldStyle);
  return result;
}
//===================================================









  function middleNumber(from:string|number,to:string|number,progressRate:number):number{
      let f1=parseFloat(from as string)
      let f2=parseFloat(to as string)
      return f1+(f2-f1)*progressRate;
  }


function checkFormatMatch(obj1:cssPart[],obj2:cssPart[]):boolean{
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

function mixObj(obj1:cssPart[],obj2:cssPart[],progress:number):cssPart[]{
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
  let result:string[]=[];
  for(let i in cp){
      result.push(cssPart2String(cp[i]));
  }
  return result.join(' ');
}





function currentValue(element:HTMLElement,key:string):string{
  const newkey=toCamelCase(key) as any;
	return getComputedStyle(element)[newkey];
}

function getComputedResult(element:HTMLElement,key:string,value:string):string{
  const newkey=toCamelCase(key) as any;
	const oldValue=element.style[newkey];

  value=autoUnit(value,newkey) as string;
  
	element.style[newkey]=value;

	const result=getComputedStyle(element)[newkey]
	element.style[newkey]=oldValue;
	return result
}

export const getCss=(h:HTMLElement,cssObj:cssObject):cssObject=>{
  const css=getComputedStyle(h) as unknown as stringDict;
  const result:cssObject={};
  const extraKey:string[]=[];
  for(let k in cssObj){
      const kk=toCamelCase(k);
      if(kk=='x' || kk=='y' || kk=='z'){
        let x=0,y=0,z=0;
        if(css.translate!='none' && css.translate!=''){
          const currTran=css.translate.split(' ')
          x=parseFloat(currTran[0])
          if(currTran.length>=2){
            y=parseFloat(currTran[1])
          }
          if(currTran.length>=3){
            z=parseFloat(currTran[2])
          }
        }
        for(let xh of ['x','y','z']){
          result[xh]=css[xh]
        }
        continue;
      }else if(xyzKey.indexOf(kk)>=0){
        const type=kk.substring(0,kk.length-1);
        extraKey.push(type)
        
        const xyz=kk.substring(kk.length-1).toLocaleLowerCase();
        let v={x:1,y:1,z:1};
        if(css[type]!='none' && css[type]!=''){
          const currTran=css[type].split(' ')
          v.x=parseFloat(currTran[0])
          v.y=v.x
          v.z=v.x
          if(currTran.length>=2){
            v.y=parseFloat(currTran[1])
          }
          if(currTran.length>=3){
            v.z=parseFloat(currTran[2])
          }
        }
        for(let xh in v){
          const type2=type+xh.toLocaleUpperCase()
          result[type2]=(css[type2] || (v[xh as 'x'].toString()) ) as string;
        }
        continue;
      }
      result[kk]=css[kk];
      if((result[kk]=='none' || result[kk]=='') && transformKey.indexOf(kk)>=0){
        if(kk=='rotate'){
          result[kk]='0deg';
        }else if(kk=='scale'){
          result[kk]='1';
        }else if(kk=='translate'){
          result[kk]='0px 0px';
        }
      }
  }
  if(result.x || result.y && !result['translate']){
    result['translate']=`${result.x} ${result.y} ${result.z}`;
  }
  for(let k of extraKey){
    if(!result[k]){
      result[k]=`${result[`${k}X`]} ${result[`${k}Y`]} ${result[`${k}Z`]}`;
    }
  }
  console.log('getCss',result)
  return result;
}



const SetCompiledResult=(h:HTMLElement,cssObj:cssObject):Record<string,string>=>{
  const result:Record<string,string>={};

  for(let k in cssObj){
    let kk=toCamelCase(k) as any;

    if(typeof cssObj[k] === 'string'){
      const relate=checkRelate(cssObj[k] as string);
      if(relate){
        const oldValue=parseFloat(currentValue(h,kk));
        //console.log(kk,oldValue,currentValue(h,kk))
        if(!isNaN(oldValue)){
          switch(relate.mathType){
            case '+':
              result[kk]=autoUnit(oldValue+relate.value) as string;
              break;
            case '-':
              result[kk]=autoUnit(oldValue-relate.value) as string;
              break;
            case '*':
              result[kk]=autoUnit(oldValue*relate.value) as string;
              break;
            case '/':
              result[kk]=autoUnit(oldValue/relate.value) as string;
              break;
          }
           }
        continue;
      }
    }

    console.log()

    result[kk]=autoUnit(cssObj[k],kk) as string;
  }

    if(result.x || result.y || result.z){
      result['translate']=`${autoUnit(result.x || h.style['x' as any] || 0)} ${autoUnit(result.y|| h.style['y' as any]) || ''} ${result.z || ''}`
    }

  return result;
}









export const middleCss=(h:HTMLElement,cssFrom:cssObject,cssTo:cssObject,progressRate:number)=>{
  if(progressRate==0 && cssFrom){
    css(h,cssFrom);
  }else if(progressRate===1){
    css(h,cssTo);
  }else{

    const cssmix:cssObject={};
    for(let k in cssTo){
      let value=cssTo[k];
      let fromValue=cssFrom[k];
      const kk=toCamelCase(k) as any;
      
      if(typeof value=='number'){
        if(!fromValue){
          fromValue=0;
        }
        if(typeof fromValue=='number'){
          value=middleNumber(fromValue,value,progressRate);
        }
      }else if(typeof value=='string'){
        //*?
        const o2=parseCssValueString(value)
        if(!fromValue && o2.length==1 && o2[0].type=='number'){
          fromValue=`0${o2[0].unit}`
        }
        //console.log(kk,fromValue,value)
        if(typeof fromValue=='string'){
          const o1=parseCssValueString(fromValue)
          if(checkFormatMatch(o1,o2)){
            value=cssParts2String(mixObj(o1,o2,progressRate))
          }
        }

      }
      cssmix[kk]=value as string;
    }
    css(h,cssmix);
  }
}