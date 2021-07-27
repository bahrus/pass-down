import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface, IReactor} from 'xtal-element/lib/XtalCore.js';
import {getPreviousSib, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {camelToLisp} from 'trans-render/lib/camelToLisp.js';
import  'mut-obs/mut-obs.js';
import {MutObs} from 'mut-obs/mut-obs.js';
import {structuralClone} from 'xtal-element/lib/structuralClone.js';

import {PassDownProps} from './types.d.js';
import {addDefaultMutObs, handleValChange, attachMutationEventHandler} from './pdUtils.js';



export class PD extends HTMLElement implements ReactiveSurface, PassDownProps{
    static is = 'p-d';
    static observedAttributes = ['debug', 'log'];
    attributeChangedCallback(n:string, ov: string, nv: string){
        (<any>this)[n] = (nv !== null);
    }
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);
    _sym = Symbol();


    connectedCallback(){
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
        this.isC = true;
    }
    onPropChange(n: string, propDef: PropDef, nv: any){
        this.reactor.addToQueue(propDef, nv);
    }
    //https://web.dev/javascript-this/
    handleEvent = (e: Event) => {
        if((this as unknown as PassDownProps).ifTargetMatches !== undefined){
            if(!(e.target as HTMLElement).matches((this as unknown as PassDownProps).ifTargetMatches!)) return;
        }
        if(!this.filterEvent(e)) return;
        if(this.propFromEvent !== undefined){
            this.prop = getProp(e, this.propFromEvent.split('.'), this);
        }
        (this as unknown as PassDownProps).lastEvent = e;
    }

    parseValFromEvent(e: Event){
        const val = (this as unknown as PassDownProps).val || 'target.value';
        const valToPass = getProp(e, val.split('.'), this);
        return valToPass;        
    }

    parseInitVal(elementToObserve: Element){
        const initVal =  (this as unknown as PassDownProps).initVal;
        if(initVal === undefined) return undefined;
        return  getProp(elementToObserve,initVal.split('.'), this);
    }

    valFromEvent(e: Event){
        const val = (this as unknown as PassDownProps).val || 'target.value';
        let valToPass = this.parseValFromEvent(e);
        
        if(valToPass === undefined){
            const target = e.target as HTMLElement || this.observedElement;
            const attribVal = target.getAttribute(val);
            if(attribVal !== null){
                valToPass = attribVal;
            }
        }
        if((this as unknown as PassDownProps).parseValAs !== undefined){
            valToPass = convert(valToPass, (this as unknown as PassDownProps).parseValAs!);
        }
        return (this as unknown as PassDownProps).cloneVal ? structuralClone(valToPass) :  valToPass;
    }

    filterEvent(e: Event) : boolean{
        return true;
    }


    mutateEvents: string[] | undefined;

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
}

export interface PD extends PassDownProps{}

const attachEventHandler = ({on, observe, isC, self}: PD) => {
    const previousElementToObserve = self._wr?.deref();
    self._wr = undefined;
    const elementToObserve = self.observedElement;
    if(!elementToObserve) throw "Could not locate element to observe.";
    let doNudge = previousElementToObserve !== elementToObserve;
    if((previousElementToObserve !== undefined) && (self.previousOn !== undefined || (previousElementToObserve !== elementToObserve))){
        previousElementToObserve.removeEventListener(self.previousOn || on!, self.handleEvent);
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

export const onInitVal = ({initVal, isC, self}: PD) => {
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

export const onValFromTarget = ({valFromTarget, isC, self}: PD) => {
    if(valFromTarget === undefined) return;
    const valFromTargetOrValue = valFromTarget === '' ? 'value' : valFromTarget;
    self.initVal = valFromTargetOrValue;
    self.val = 'target.' + valFromTargetOrValue;
    if(self.on === undefined) self.on = camelToLisp(valFromTargetOrValue) + '-changed';
};

function setInitVal(self: PD, elementToObserve: Element){
    let val = self.parseInitVal(elementToObserve);
    if(val === undefined) return false;
    if(self.parseValAs !== undefined) val = convert(val, self.parseValAs!);
    if(self.cloneVal) val = structuralClone(val);
    self.lastVal = val;
    return true;
}



export const handleEvent = ({val, lastEvent, parseValAs, isC, self}: PD) => {
    if(!lastEvent){
        debugger;
    }
    self.setAttribute('status', '🌩️');
    if(!self.noblock) lastEvent!.stopPropagation();
    let valToPass = self.valFromEvent(lastEvent!);
    self.lastVal = valToPass;
    //holding on to lastEvent could introduce memory leak
    delete self.lastEvent;
    self.setAttribute('status', '👂');
}



const propActions = [onInitVal, attachEventHandler, handleEvent, handleValChange, attachMutationEventHandler, onValFromTarget] as PropAction[];

export const str0: PropDef = {
    type: String,
    dry: true
}

export const str1: PropDef = {
    ...str0,
    stopReactionsIfFalsy: true,
};

const baseObj2: PropDef = {
    type: Object
};

const baseObj: PropDef = {
    type: Object,
    dry: true,
};

export const bool1: PropDef = {
    type: Boolean,
    dry: true,
};

const bool2: PropDef = {
    ...bool1,
    stopReactionsIfFalsy: true,
}

const obj1: PropDef = {
    ...baseObj,
    stopReactionsIfFalsy: true,
};

const obj2: PropDef = {
    ...obj1,
    parse: true,
}

const num: PropDef = {
    type: Number,
    dry: true,
}

const propDefMap: PropDefMap<PassDownProps> = {
    observe: str0, observeClosest: str0, on: str1, to: str0, careOf: str0, ifTargetMatches: str0, 
    noblock: bool1, prop: str0, propFromEvent: str0, val: str0, initVal: str1, initEvent: bool1, valFromTarget: str0,
    vft:{
        ...str0,
        echoTo: 'valFromTarget'
    },
    fireEvent: str0, debug: bool1, log: bool1, as: str0, isC: bool2,
    async: bool1, parseValAs: str0, capture: bool1, cloneVal: bool1,
    lastEvent: obj1, m: num, from: str0, mutateEvents: obj2,
    lastVal: baseObj2,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);


xc.letThereBeProps(PD, slicedPropDefs, 'onPropChange');

xc.define(PD);

declare global {
    interface HTMLElementTagNameMap {
        'p-d': PD;
    }
}

/**
 * @element pass-down
 */
export class PassDown extends PD{
    static is = 'pass-down';
}

xc.define(PassDown);

declare global {
    interface HTMLElementTagNameMap {
        'pass-down': PassDown;
    }
}