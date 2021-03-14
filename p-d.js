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
        //https://web.dev/javascript-this/
        this.handleEvent = (e) => {
            this.lastEvent = e;
        };
    }
    attributeChangedCallback(n, ov, nv) {
        this[n] = (nv !== null);
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs);
    }
    onPropChange(n, propDef, nv) {
        this.reactor.addToQueue(propDef, nv);
    }
}
PD.is = 'p-d';
PD.observedAttributes = ['debug', 'log'];
const attachEventHandler = ({ on, self }) => {
    const elementToObserve = getPreviousSib(self.previousElementSibling, self.observe ?? null);
    if (elementToObserve === null)
        throw "Could not locate element to observe.";
    if (self.previousOn !== undefined) {
        elementToObserve.removeEventListener(self.previousOn, self.handleEvent);
    }
    else {
        nudge(elementToObserve);
    }
    elementToObserve.addEventListener(on, self.handleEvent);
    self.setAttribute('status', '👂');
    self.previousOn = on;
};
const handleEvent = ({ val, lastEvent, parseValAs, to, careOf, m, from, self }) => {
    self.setAttribute('status', '🌩️');
    if (!self.noblock)
        lastEvent.stopPropagation();
    let valToPass = getProp(lastEvent, val.split('.'), self);
    if (parseValAs !== undefined) {
        valToPass = convert(valToPass, parseValAs);
    }
    if (self.debug) {
        debugger;
    }
    else if (self.log) {
        console.log('passVal', { valToPass, self, to, careOf, m, from });
    }
    const matches = passVal(valToPass, self, to, careOf, m, from);
    self.setAttribute('matches', '' + matches.length);
    self.setAttribute('status', '👂');
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
