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
    boundHandleEvent: any;
    handleEvent(e: Event){
        this.lastEvent = e;
    }
    m: number | undefined;
    from: string | undefined;
}

const attachEventHandler = ({on, self}: PD) => {
    const elementToObserve = getPreviousSib(self.previousElementSibling as HTMLElement, self.observe ?? null) as Element;
    if(elementToObserve === null) throw "Could not locate element to observe.";
    if(!self.boundHandleEvent){
        self.boundHandleEvent = self.handleEvent.bind(self);
    }
    if(self.previousOn !== undefined){
        elementToObserve.removeEventListener(self.previousOn, self.boundHandleEvent);
    }else{
        nudge(elementToObserve)
    }
    elementToObserve.addEventListener(on!, self.boundHandleEvent);
    self.previousOn = on;
};

const handleEvent = ({val, lastEvent, parseValAs, to, careOf, m, from, self}: PD) => {
    if(!self.noblock) lastEvent!.stopPropagation();
    let valToPass = getProp(lastEvent, val!.split('.'), self);
    if(parseValAs !== undefined){
        valToPass = convert(valToPass, parseValAs);
    }
    if(self.debug){
        debugger;
    }else if(self.log){
        console.log('passVal', {valToPass, self, to, careOf, m, from});
    }
    const matches = passVal(valToPass, self, to, careOf, m, from);
    self.setAttribute('matches', '' + matches.length);
}

const propActions = [attachEventHandler, handleEvent] as PropAction[];

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

const num: PropDef = {
    type: Number,
    dry: true,
}

const propDefMap: PropDefMap<PD> = {
    on: str1, to: str2, careOf: str2, ifTargetMatches: str2,
    noblock: bool1, prop: str2, propFromEvent: str2, val: str2,
    fireEvent: str2, skipInit: bool1, debug: bool1, log: bool1,
    async: bool1, parseValAs: str2, capture: bool1,
    lastEvent: obj1, m: num, from: str2,
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