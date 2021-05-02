import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface, IReactor} from 'xtal-element/lib/XtalCore.js';
import {getPreviousSib, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import  'mut-obs/mut-obs.js';
import {MutObs} from 'mut-obs/mut-obs.js';
import {structuralClone} from 'xtal-element/lib/structuralClone.js';
import {asAttr} from 'on-to-me/types.d.js';
import {PassDownProps} from './types.d.js';
import {addDefaultMutObs, handleValChange, attachMutationEventHandler} from './pdUtils.js';


/**
 * @element p-d
 */
export class PD extends HTMLElement implements ReactiveSurface, PassDownProps{
    static is = 'p-d';
    static observedAttributes = ['debug', 'log'];
    attributeChangedCallback(n:string, ov: string, nv: string){
        (<any>this)[n] = (nv !== null);
    }
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);
    //_attachedMutObs: boolean | undefined;
    _sym = Symbol();
    /**
     * The event name to monitor for, from previous non-petalian element.
     * @attr
     */
    on: string | undefined;

    /**
     * css pattern to match for from downstream siblings.
     * @attr
     */
    to: string | undefined;

    /**
     * CSS Selector to use to select single child within the destination element.
     * @attr care-of
     * 
     */
    careOf: string | undefined;

    /**
     * Don't block event propagation.
     * @attr
     */
    noblock: boolean | undefined;

    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches: string | undefined;

    /**
     * Name of property to set on matching (downstream) siblings.
     * @attr
     */
    prop: string | undefined;

    /**
     * Dynamically determined name of property to set on matching (downstream) siblings from event object.
     * @attr prop-from-event
     */
    propFromEvent: string | undefined;
    
    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    val: string | undefined;
    
    /**
     * Specifies element to latch on to, and listen for events.
     * Searches previous siblings, parent, previous siblings of parent, etc.
     * Stops at Shadow DOM boundary.
     * @attr
     */
    observe: string | undefined;
    
    /**
     * Artificially fire event on target element whose name is specified by this attribute.
     * @attr fire-event
     */
    fireEvent: string | undefined;

    initVal: string | undefined;

    /**
     * In some cases, the initVal can only be obtained after initEvent fires
     */
    initEvent: string | undefined;
    
    
    debug!: boolean;

    log!: boolean;

    async!: boolean;

    parseValAs: 'int' | 'float' | 'bool' | 'date' | 'truthy' | 'falsy' | undefined;  
    
    /**
     * A Boolean indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
    */
    capture!: boolean;

    previousOn: string | undefined;

    lastEvent: Event | undefined;

    lastVal: any;

    as: asAttr;

    cloneVal: boolean | undefined;
     
    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs);
    }
    onPropChange(n: string, propDef: PropDef, nv: any){
        this.reactor.addToQueue(propDef, nv);
    }
    //https://web.dev/javascript-this/
    handleEvent = (e: Event) => {
        if(this.ifTargetMatches !== undefined){
            if(!(e.target as HTMLElement).matches(this.ifTargetMatches)) return;
        }
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
    addDefaultMutObs(self);
    
 
};

export const onInitVal = ({initVal, self}: PD) => {
    //TODO: how can we avoid calling getPriousSib twice, without storing?
    
    //passVal(val, self, self.to, self.careOf, self.m, self.from, self.prop, self.as);
    const elementToObserve = getPreviousSib(self.previousElementSibling as HTMLElement, self.observe ?? null) as Element;
    const foundInitVal = setInitVal(self, elementToObserve);
    if(!foundInitVal && self.initEvent!== undefined){
        elementToObserve.addEventListener(self.initEvent, e => {
            setInitVal(self, elementToObserve);
        }, {once: true});
    }
}

function setInitVal(self: PD, elementToObserve: Element){
    
    let val = getProp(elementToObserve, self.initVal!.split('.'), self);
    if(val === undefined) return false;
    if(self.parseValAs !== undefined) val = convert(val, self.parseValAs);
    if(self.cloneVal) val = structuralClone(val);
    self.lastVal = val;
    return true;
}



export const handleEvent = ({val, lastEvent, parseValAs, self}: PD) => {
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



const propActions = [onInitVal, attachEventHandler, handleEvent, handleValChange, attachMutationEventHandler] as PropAction[];

export const str0: PropDef = {
    type: String,
    dry: true
}

export const str1: PropDef = {
    ...str0,
    stopReactionsIfFalsy: true,
};


const baseObj: PropDef = {
    type: Object,
    dry: true,
}

export const bool1: PropDef = {
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
    noblock: bool1, prop: str0, propFromEvent: str0, val: str0, initVal: str1, initEvent: bool1,
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