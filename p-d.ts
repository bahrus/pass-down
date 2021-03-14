import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface} from 'xtal-element/lib/XtalCore.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {P} from './p.js';
import { getSlicedPropDefs } from './node_modules/xtal-element/lib/getSlicedPropDefs.js';

/**
 * @element p-d
 */
export class PD extends P implements ReactiveSurface{
    static is = 'p-d';
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
    handleEvent(e: Event){
        this.lastEvent = e;
    }
    m: number | undefined;
    from: string | undefined;
}

const attachEventHandler = ({on, self}: PD) => {
    const elementToObserve = getPreviousSib(self, self.observe) as Element;
    if(elementToObserve === null) throw "Could not locate element to observe.";
    if(self.previousOn !== undefined){
        elementToObserve.removeEventListener(self.previousOn, self.handleEvent);
    }else{
        nudge(elementToObserve)
    }
    elementToObserve.addEventListener(on!, self.handleEvent);
    self.previousOn = on;
};

const handleEvent = ({val, lastEvent, parseValAs, to, careOf, m, from, self}: PD) => {
    if(!self.noblock) lastEvent!.stopPropagation();
    let valToPass = getProp(lastEvent, val!.split('.'), self);
    if(parseValAs !== undefined){
        valToPass = convert(valToPass, parseValAs);
    }
    passVal(valToPass, self, to, careOf, m, from);
}

const propActions = [attachEventHandler] as PropAction[];

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
    async: bool1, parseValAs: str1, capture: bool1,
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