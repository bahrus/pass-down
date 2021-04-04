import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface} from 'xtal-element/lib/XtalCore.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {P} from './p.js';
import  'mut-obs/mut-obs.js';
import {MutObs} from 'mut-obs/mut-obs.js';
import {structuralClone} from 'xtal-element/lib/structuralClone.js';

const p_d_std = 'p_d_std';
const attachedParents = new WeakSet<Element>();

/**
 * @element p-d
 */
export class PD extends P implements ReactiveSurface{
    static is = 'p-d';
    static observedAttributes = ['debug', 'log'];
    attributeChangedCallback(n:string, ov: string, nv: string){
        (<any>this)[n] = (nv !== null);
    }
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);
    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs);
    }
    onPropChange(n: string, propDef: PropDef, nv: any){
        this.reactor.addToQueue(propDef, nv);
    }
    //https://web.dev/javascript-this/
    handleEvent = (e: Event) => {
        if(!this.filterEvent(e)) return;
        this.lastEvent = e;
    }

    valFromEvent(e: Event){
        const val = this.val || 'target.value';
        let valToPass = getProp(e, val.split('.'), this);
        
        if(valToPass === undefined){
            const target = e.target as HTMLElement;
            const attribVal = target.getAttribute(val);
            if(attribVal !== null){
                valToPass = attribVal;
            }
        }
        if(this.parseValAs !== undefined){
            valToPass = convert(valToPass, this.parseValAs);
        }
        return this.cloneVal ? structuralClone(valToPass) :  valToPass;
    }

    filterEvent(e: Event) : boolean{
        return true;
    }

    m: number | undefined;
    from: string | undefined;
    mutateEvents: string[] | undefined;
}

const attachEventHandler = ({on, self}: PD) => {
    const elementToObserve = getPreviousSib(self.previousElementSibling as HTMLElement, self.observe ?? null) as Element;
    if(elementToObserve === null) throw "Could not locate element to observe.";
    let doNudge = false;
    if(self.previousOn !== undefined){
        elementToObserve.removeEventListener(self.previousOn, self.handleEvent);
    }else{
        doNudge = true;
    }
    elementToObserve.addEventListener(on!, self.handleEvent, {capture: self.capture});
    if(doNudge){
        if(elementToObserve === self.parentElement && self.ifTargetMatches){
            elementToObserve.querySelectorAll(self.ifTargetMatches).forEach(publisher =>{
                nudge(publisher);
            });
        }else{
            nudge(elementToObserve);
        }
        
    }
    self.setAttribute('status', '👂');
    self.previousOn = on;
    const parent = self.parentElement;
    if(parent !== null){
        if(!attachedParents.has(parent)){
            attachedParents.add(parent);
            const mutObs = document.createElement('mut-obs') as MutObs;
            const s = mutObs.setAttribute.bind(mutObs);
            s('bubbles', '');
            s('dispatch', p_d_std);
            s('child-list', '');
            s('observe', 'parentElement');
            s('on', '*');
            parent.appendChild(mutObs);
        }
        parent.addEventListener(p_d_std, e => {
            e.stopPropagation();
            if(self.lastVal !== undefined){
                handleValChange(self);
            }
        })
    }
 
};

const onInitVal = ({initVal, self}: PD) => {
    //TODO: how can we avoid calling getPriousSib twice, without storing?
    const elementToObserve = getPreviousSib(self.previousElementSibling as HTMLElement, self.observe ?? null) as Element;
    let val = getProp(elementToObserve, initVal!.split('.'), self);
    if(val === undefined) return;
    if(self.parseValAs !== undefined) val = convert(val, self.parseValAs);
    if(self.cloneVal) val = structuralClone(val);
    self.lastVal = val;
    passVal(val, self, self.to, self.careOf, self.m, self.from, self.prop, self.as);
}



const handleEvent = ({val, lastEvent, parseValAs, self}: PD) => {
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

const handleValChange = ({lastVal, self, to, careOf, m, from, prop}: PD) => {
    if(lastVal === undefined) return;
    if(self.debug){
        debugger;
    }else if(self.log){
        console.log('passVal', {lastVal, self});
    }
    const matches = passVal(lastVal, self, to, careOf, m, from, prop, self.as);
    self.setAttribute('matches', '' + matches.length);
    
}

const attachMutationEventHandler = ({mutateEvents, self}: PD) => {
    const parentElement = self.parentElement;
    if(parentElement === null) return;
    for(const event of mutateEvents!){
        parentElement.addEventListener(event, e => {
            if(self.lastVal !== undefined){
                handleValChange(self);
            }
        })
    }
};

const propActions = [onInitVal, attachEventHandler, handleEvent, handleValChange, attachMutationEventHandler] as PropAction[];

const str0: PropDef = {
    type: String,
    dry: true
}

const str1: PropDef = {
    ...str0,
    stopReactionsIfFalsy: true,
};


const baseObj: PropDef = {
    type: Object,
    dry: true,
}

const bool1: PropDef = {
    type: Boolean,
    dry: true,
};

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

const propDefMap: PropDefMap<PD> = {
    on: str1, to: str0, careOf: str0, ifTargetMatches: str0, observe: str0,
    noblock: bool1, prop: str0, propFromEvent: str0, val: str0, initVal: str1,
    fireEvent: str0, debug: bool1, log: bool1, as: str0,
    async: bool1, parseValAs: str0, capture: bool1, cloneVal: bool1,
    lastEvent: obj1, m: num, from: str0, mutateEvents: obj2,
    lastVal: baseObj,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);


xc.letThereBeProps(PD, slicedPropDefs, 'onPropChange');

xc.define(PD);

declare global {
    interface HTMLElementTagNameMap {
        'p-d': PD;
    }
}

export class PassDown extends PD{
    static is = 'pass-down';
}

xc.define(PassDown);