import { xc } from 'xtal-element/lib/XtalCore.js';
import { getPreviousSib, passVal, nudge, getProp, convert } from 'on-to-me/on-to-me.js';
import { P } from './p.js';
import { getSlicedPropDefs } from './node_modules/xtal-element/lib/getSlicedPropDefs.js';
/**
 * @element p-d
 */
export class PD extends P {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs);
    }
    onPropChange(n, propDef, nv) {
        this.reactor.addToQueue(propDef, nv);
    }
    handleEvent(e) {
        this.lastEvent = e;
    }
}
PD.is = 'p-d';
const attachEventHandler = ({ on, self }) => {
    const elementToObserve = getPreviousSib(self.previousElementSibling, self.observe ?? null);
    if (elementToObserve === null)
        throw "Could not locate element to observe.";
    if (!self.boundHandleEvent) {
        self.boundHandleEvent = self.handleEvent.bind(self);
    }
    if (self.previousOn !== undefined) {
        elementToObserve.removeEventListener(self.previousOn, self.boundHandleEvent);
    }
    else {
        nudge(elementToObserve);
    }
    elementToObserve.addEventListener(on, self.boundHandleEvent);
    self.previousOn = on;
};
const handleEvent = ({ val, lastEvent, parseValAs, to, careOf, m, from, self }) => {
    if (!self.noblock)
        lastEvent.stopPropagation();
    let valToPass = getProp(lastEvent, val.split('.'), self);
    if (parseValAs !== undefined) {
        valToPass = convert(valToPass, parseValAs);
    }
    passVal(valToPass, self, to, careOf, m, from);
};
const propActions = [attachEventHandler, handleEvent];
const str1 = {
    type: String,
    dry: true,
    stopReactionsIfFalsy: true,
};
const str2 = {
    type: String,
    dry: true
};
const bool1 = {
    type: Boolean,
    dry: true,
};
const obj1 = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
};
const num = {
    type: Number,
    dry: true,
};
const propDefMap = {
    on: str1, to: str2, careOf: str2, ifTargetMatches: str2,
    noblock: bool1, prop: str2, propFromEvent: str2, val: str2,
    fireEvent: str2, skipInit: bool1, debug: bool1, log: bool1,
    async: bool1, parseValAs: str2, capture: bool1,
    lastEvent: obj1, m: num, from: str2,
};
const slicedPropDefs = getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PD, slicedPropDefs, 'onPropChange');
xc.define(PD);
export class PassDown extends PD {
}
PassDown.is = 'pass-down';
xc.define(PassDown);
