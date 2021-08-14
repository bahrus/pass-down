import {define, Action, PropInfo, camelToLisp} from 'liquid-xtal/define.js';
import {PassDownProps} from './types.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {structuralClone} from 'xtal-element/lib/structuralClone.js';
import {addDefaultMutObs, handleValChange, attachMutationEventHandler} from './pdUtils.js';

export class PDMixin {

    init(){
        this.style.display = 'none';
    }
    //https://web.dev/javascript-this/
    handleEvent = (e: Event) => {
        if((this as unknown as PassDownProps).ifTargetMatches !== undefined){
            if(!(e.target as HTMLElement).matches((this as unknown as PassDownProps).ifTargetMatches!)) return;
        }
        if(!this.filterEvent(e)) return;
        (this as unknown as PassDownProps).lastEvent = e;
    }

    parseValFromEvent(e: Event){
        const val = this.val || 'target.value';
        const valToPass = getProp(e, val.split('.'), this);
        return valToPass;        
    }

    parseInitVal(elementToObserve: Element){
        const initVal =  (this as unknown as PassDownProps).initVal;
        if(initVal === undefined) return undefined;
        return getProp(elementToObserve,initVal.split('.'), this);
    }

    valFromEvent(e: Event){
        const val = this.val || 'target.value';
        let valToPass = this.parseValFromEvent(e);
        
        if(valToPass === undefined){
            const target = e.target as HTMLElement || this.observedElement;
            const attribVal = target.getAttribute(val);
            if(attribVal !== null){
                valToPass = attribVal;
            }
        }
        if(this.parseValAs !== undefined){
            valToPass = convert(valToPass, (this as unknown as PassDownProps).parseValAs!);
        }
        return (this as unknown as PassDownProps).cloneVal ? structuralClone(valToPass) :  valToPass;
    }

    filterEvent(e: Event) : boolean{
        return true;
    }

    _wr: WeakRef<Element> | undefined;
    get observedElement() : Element | null{
        const element = this._wr?.deref();
        if(element !== undefined){
            return element;
        }
        let elementToObserve: Element | null;
        if(this.observeClosest !== undefined){
            elementToObserve = this.closest(this.observeClosest);
            if(elementToObserve !== null && this.observe !== undefined){
                elementToObserve = getPreviousSib(elementToObserve.previousElementSibling || elementToObserve.parentElement as HTMLElement, this.observe) as Element;
            }
        }else{
            elementToObserve = getPreviousSib(this.previousElementSibling || this.parentElement as HTMLElement, this.observe ?? null) as Element;
        }
        if(elementToObserve === null) return null;
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }

    attachEventHandler(self: PD) {
        const on = self.on!;
        const previousElementToObserve = self._wr?.deref();
        self._wr = undefined;
        const elementToObserve = self.observedElement;
        if(!elementToObserve) throw "Could not locate element to observe.";
        let doNudge = previousElementToObserve !== elementToObserve;
        if((previousElementToObserve !== undefined) && (self.previousOn !== undefined || (previousElementToObserve !== elementToObserve))){
            previousElementToObserve.removeEventListener(self.previousOn || on, self.handleEvent);
        }else{
            doNudge = true;
        }
        elementToObserve.addEventListener(on!, self.handleEvent, {capture: self.capture});
        if(doNudge){
            if(elementToObserve === self.parentElement && (self as unknown as PassDownProps).ifTargetMatches){
                elementToObserve.querySelectorAll(self.ifTargetMatches!).forEach(publisher =>{
                    nudge(publisher);
                });
            }else{
                nudge(elementToObserve);
            }
            
        }
        self.setAttribute('status', '👂');
        (self as unknown as PassDownProps).previousOn = on;
        addDefaultMutObs(self);
        
     
    };

    onInitVal(self: PD) {
        const elementToObserve = self.observedElement;
        if(elementToObserve === null){
            console.error('404');
            return;
        }
        const foundInitVal = setInitVal(self, elementToObserve);
        if(!foundInitVal && (self as unknown as PassDownProps).initEvent!== undefined){
            elementToObserve.addEventListener(self.initEvent!, e => {
                setInitVal(self, elementToObserve);
            }, {once: true});
        }
    };

    doEvent(self: PD) {
        if(!self.lastEvent){
            debugger;
        }
        self.setAttribute('status', '🌩️');
        if(!self.noblock) self.lastEvent!.stopPropagation();
        let valToPass = self.valFromEvent(self.lastEvent!);
        self.lastVal = valToPass;
        //holding on to lastEvent could introduce memory leak
        delete self.lastEvent;
        self.setAttribute('status', '👂');
    }

    handleValChange(self: PD){
        const lastVal = self.lastVal, prop = self.prop;
        if(self.debug){
            debugger;
        }else if(self.log){
            console.log('passVal', {lastVal, self});
        }
        const hSelf = self as HTMLElement;
        let dynProp = prop;
        if(self.propFromTarget !== undefined){
            dynProp = getProp(self.observedElement, self.propFromTarget.split('.'), self);
        }
        const matches = passVal(lastVal, hSelf, self.to, self.careOf, self.m, self.from, dynProp, self.as);
        hSelf.setAttribute('matches', '' + matches.length);
        
    }

    attachMutationEventHandler(self: PD){
        const parentElement = self.parentElement;
        if(!parentElement) return;
        for(const event of self.mutateEvents!){
            parentElement.addEventListener(event, e => {
                if(self.lastVal !== undefined){
                    handleValChange(self);
                }
            })
        }
    };

    onValFromTarget(self: PD){
        const valFromTarget = self.valFromTarget!
        const valFromTargetOrValue = valFromTarget === '' ? 'value' : valFromTarget;
        self.initVal = valFromTargetOrValue;
        self.val = 'target.' + valFromTargetOrValue;
        if(self.on === undefined) self.on = camelToLisp(valFromTargetOrValue) + '-changed';
    };
    
    setAliases(self: PD){
        self.valFromTarget = self.vft;
    }
}

const disabledFilter: Partial<Action<PDMixin>> = {
    rift: ['disabled']
};

const defaultFilters: Partial<Action<PDMixin>> = {
    riff: ['isC'],
    ...disabledFilter,
}

const isStringProp: PropInfo = {
    type: 'String'
};

const filters = ['isC', 'disabled'];

define<PDMixin>({
    config: {
        tagName: 'pass-down',
        initMethod: 'init',
        initPropMerge:{
            isC: true,
            disabled: false,
            debug: false,
            log: false,
            m: Infinity,
        },
        actions:[
            {
                do: 'onInitVal',
                upon: [
                    'initVal', isStringProp, 
                    ...filters
                ],
                ...defaultFilters
            },{
                do: 'attachEventHandler',
                upon: [
                    'on', isStringProp, 'observe', isStringProp, ...filters],
                ...defaultFilters
            },{
                do: 'doEvent',
                upon: [
                    'val', isStringProp, 'parseValAs', isStringProp,
                    'lastEvent', ...filters
                ],
                ...defaultFilters
            },{
                do: 'handleValChange',
                upon: [
                    'lastVal', 'debug', 'log', 'm',
                    'propFromTarget', isStringProp, 'to', isStringProp, 'careOf', isStringProp, 'from', isStringProp, 'prop', isStringProp,
                    ...filters
                ], 
                riff: ['isC', 'lastVal'],
                ...disabledFilter
            },{
                do: 'attachMutationEventHandler',
                upon: [
                    'mutateEvents', isStringProp,
                    ...filters
                ],
                riff: ['isC', 'mutateEvents'],
                ...disabledFilter
            },{
                do: 'onValFromTarget',
                upon: [
                    'valFromTarget', isStringProp,
                    ...filters
                ],
                riff: ['isC', 'onValFromTarget'],
                ...disabledFilter
            },{
                do: 'setAliases',
                upon: [
                    'vft', isStringProp
                ]
            }
            
        ]
    },
    mixins: [PDMixin]
});

function setInitVal(self: PD, elementToObserve: Element){
    let val = self.parseInitVal(elementToObserve);
    if(val === undefined) return false;
    if(self.parseValAs !== undefined) val = convert(val, self.parseValAs!);
    if(self.cloneVal) val = structuralClone(val);
    self.lastVal = val;
    return true;
}

// export function passVal(
//     val: any, self: HTMLElement, to: string | undefined | null, careOf: string | undefined | null, 
//     me: number | undefined, from: string | undefined | null, prop: string | undefined | null, as: asAttr, cachedMatches?: Element[] | undefined){
//     const matches = cachedMatches ?? findMatches(self, to, me, from, careOf);
//     passValToMatches(matches, val, to, careOf, prop, as);
//     return matches;
// }

// export function findMatches(start: Element, match: string | undefined | null, m: number | undefined, from: string | null | undefined, careOf: string | null | undefined): Element[]{
//     let returnObj = [] as Element[];
//     match = match || '*';
//     const ubound = m ?? Infinity;
//     let count = 0;
//     let start2;
//     if(from){
//         start2 = start.closest(from);
//     }else{
//         start2 = start.nextElementSibling;
//     }
//     while(start2 !== null){
//         if(start2.matches(match)) {
//             if(careOf){
//                 const careOfs = Array.from(start2.querySelectorAll(careOf));
//                 returnObj = returnObj.concat(careOfs);
//                 count += careOfs.length;
//             }else{
//                 count++;
//                 returnObj.push(start2);
//             }
//             if(count > ubound) break;
//         }
//         start2 = start2.nextElementSibling;
//     }
//     return returnObj;
// }

// export function passValToMatches(matches: Element[], val: any, to: string | undefined | null, careOf: string | undefined | null, prop: string | undefined | null,
//     as: asAttr){
//     const dynToProp = getToProp(to, careOf, as);
//     const hasBoth = !!prop && dynToProp !== null; //hasBoth is there for use with an element ref property.
//     const toProp = hasBoth ? dynToProp : prop || dynToProp;
//     if(toProp === null) throw "No to prop."
//     matches.forEach( match => {
//         let subMatch = match;
//         if(hasBoth){
//             if((<any>match)[prop!] === undefined){
//                 (<any>match)[prop!] = {};
//             }
//             subMatch = (<any>match)[prop!];
//         }
//         switch(as){
//             case 'str-attr':
//                 subMatch.setAttribute(toProp, val.toString());
//                 break;
//             case 'obj-attr':
//                 subMatch.setAttribute(toProp, JSON.stringify(val));
//                 break;
//             case 'bool-attr':
//                 if(val) {
//                     subMatch.setAttribute(toProp, '');
//                 }else{
//                     subMatch.removeAttribute(toProp);
//                 }
//                 break;
//             default:
//                 if(toProp === '...'){
//                     Object.assign(subMatch, val);
//                 }else{
//                     (<any>subMatch)[toProp] = val;
//                 }
                

//         }
//     });
// }

// export function getToProp(to: string | null | undefined, careOf: string | null | undefined, as: asAttr): string | null{
//     let target = careOf || to;
//     if(!target || !target.endsWith(']')) return null;
//     const iPos = target.lastIndexOf('[');
//     if(iPos === -1) return null;
//     target = target.replace('[data-data-', '[-');
//     if(target[iPos + 1] !== '-') return null;
//     target = target.substring(iPos + 2, target.length - 1);
//     return !!as ? target : lispToCamel(target);
// }

const ltcRe = /(\-\w)/g;
export function lispToCamel(s: string){
    return s.replace(ltcRe, function(m){return m[1].toUpperCase();});
}

type PD = PDMixin;

export interface PDMixin extends PassDownProps{}