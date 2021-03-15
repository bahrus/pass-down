import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface} from 'xtal-element/lib/XtalCore.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {P} from './p.js';
import { getSlicedPropDefs } from './node_modules/xtal-element/lib/getSlicedPropDefs.js';

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
        let valToPass = getProp(e, this.val!.split('.'), this);
        if(this.parseValAs !== undefined){
            valToPass = convert(valToPass, this.parseValAs);
        }
        return valToPass;
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
    elementToObserve.addEventListener(on!, self.handleEvent);
    if(doNudge){
        nudge(elementToObserve);
    }
    self.setAttribute('status', '👂');
    self.previousOn = on;

};



const handleEvent = ({val, lastEvent, parseValAs, to, careOf, m, from, self}: PD) => {
    self.setAttribute('status', '🌩️');
    if(!self.noblock) lastEvent!.stopPropagation();
    let valToPass = self.valFromEvent(lastEvent!);
    
    if(self.debug){
        debugger;
    }else if(self.log){
        console.log('passVal', {valToPass, self, to, careOf, m, from});
    }
    const matches = passVal(valToPass, self, to, careOf, m, from);
    self.setAttribute('matches', '' + matches.length);
    self.setAttribute('status', '👂');
}

const attachMutationEventHandler = ({mutateEvents, self}: PD) => {
    const parentElement = self.parentElement;
    if(parentElement === null) return;
    for(const event of mutateEvents!){
        parentElement.addEventListener(event, e => {
            if(self.lastEvent !== undefined){
                handleEvent(self);
            }
        })
    }
};

const propActions = [attachEventHandler, handleEvent, attachMutationEventHandler] as PropAction[];

const str1: PropDef = {
    type: String,
    dry: true,
    stopReactionsIfFalsy: true,
};

const str2: PropDef = {
    type: String,
    dry: true
}

const bool1: PropDef = {
    type: Boolean,
    dry: true,
};

const obj1: PropDef = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
};

const obj2: PropDef = {
    type: Object,
    dry: true,
    parse: true,
    stopReactionsIfFalsy: true,
}

const num: PropDef = {
    type: Number,
    dry: true,
}

const propDefMap: PropDefMap<PD> = {
    on: str1, to: str2, careOf: str2, ifTargetMatches: str2,
    noblock: bool1, prop: str2, propFromEvent: str2, val: str2,
    fireEvent: str2, skipInit: bool1, debug: bool1, log: bool1,
    async: bool1, parseValAs: str2, capture: bool1,
    lastEvent: obj1, m: num, from: str2, mutateEvents: obj2,
};
const slicedPropDefs = getSlicedPropDefs(propDefMap);


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