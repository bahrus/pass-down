import { xc } from 'xtal-element/lib/XtalCore.js';
import { getPreviousSib, nudge, getProp, convert } from 'on-to-me/on-to-me.js';
import 'mut-obs/mut-obs.js';
import { structuralClone } from 'xtal-element/lib/structuralClone.js';
import { addDefaultMutObs, handleValChange, attachMutationEventHandler } from './pdUtils.js';
export class PD extends HTMLElement {
    static is = 'p-d';
    static observedAttributes = ['debug', 'log'];
    attributeChangedCallback(n, ov, nv) {
        this[n] = (nv !== null);
    }
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);
    _sym = Symbol();
    connectedCallback() {
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs);
    }
    onPropChange(n, propDef, nv) {
        this.reactor.addToQueue(propDef, nv);
    }
    //https://web.dev/javascript-this/
    handleEvent = (e) => {
        if (this.ifTargetMatches !== undefined) {
            if (!e.target.matches(this.ifTargetMatches))
                return;
        }
        if (!this.filterEvent(e))
            return;
        this.lastEvent = e;
    };
    parseValFromEvent(e) {
        const val = this.val || 'target.value';
        const valToPass = getProp(e, val.split('.'), this);
        return valToPass;
    }
    parseInitVal(elementToObserve) {
        return getProp(elementToObserve, self.initVal.split('.'), this);
    }
    valFromEvent(e) {
        const val = this.val || 'target.value';
        let valToPass = this.parseValFromEvent(e);
        if (valToPass === undefined) {
            const target = e.target || this.observedElement;
            const attribVal = target.getAttribute(val);
            if (attribVal !== null) {
                valToPass = attribVal;
            }
        }
        if (this.parseValAs !== undefined) {
            valToPass = convert(valToPass, this.parseValAs);
        }
        return this.cloneVal ? structuralClone(valToPass) : valToPass;
    }
    filterEvent(e) {
        return true;
    }
    mutateEvents;
    _wr;
    get observedElement() {
        const element = this._wr?.deref();
        if (element !== undefined) {
            return element;
        }
        const elementToObserve = getPreviousSib(this.previousElementSibling, this.observe ?? null);
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }
}
const attachEventHandler = ({ on, observe, self }) => {
    const previousElementToObserve = self._wr?.deref();
    self._wr = undefined;
    const elementToObserve = self.observedElement;
    if (!elementToObserve)
        throw "Could not locate element to observe.";
    let doNudge = previousElementToObserve !== elementToObserve;
    if ((previousElementToObserve !== undefined) && (self.previousOn !== undefined || (previousElementToObserve !== elementToObserve))) {
        previousElementToObserve.removeEventListener(self.previousOn || on, self.handleEvent);
    }
    else {
        doNudge = true;
    }
    elementToObserve.addEventListener(on, self.handleEvent, { capture: self.capture });
    if (doNudge) {
        if (elementToObserve === self.parentElement && self.ifTargetMatches) {
            elementToObserve.querySelectorAll(self.ifTargetMatches).forEach(publisher => {
                nudge(publisher);
            });
        }
        else {
            nudge(elementToObserve);
        }
    }
    self.setAttribute('status', '👂');
    self.previousOn = on;
    addDefaultMutObs(self);
};
export const onInitVal = ({ initVal, self }) => {
    const elementToObserve = self.observedElement;
    const foundInitVal = setInitVal(self, elementToObserve);
    if (!foundInitVal && self.initEvent !== undefined) {
        elementToObserve.addEventListener(self.initEvent, e => {
            setInitVal(self, elementToObserve);
        }, { once: true });
    }
};
export const onValFromTarget = ({ valFromTarget, self }) => {
    self.initVal = valFromTarget;
    self.val = 'target.' + valFromTarget;
};
function setInitVal(self, elementToObserve) {
    let val = self.parseInitVal(elementToObserve);
    if (val === undefined)
        return false;
    if (self.parseValAs !== undefined)
        val = convert(val, self.parseValAs);
    if (self.cloneVal)
        val = structuralClone(val);
    self.lastVal = val;
    return true;
}
export const handleEvent = ({ val, lastEvent, parseValAs, self }) => {
    if (!lastEvent) {
        debugger;
    }
    self.setAttribute('status', '🌩️');
    if (!self.noblock)
        lastEvent.stopPropagation();
    let valToPass = self.valFromEvent(lastEvent);
    self.lastVal = valToPass;
    //holding on to lastEvent could introduce memory leak
    delete self.lastEvent;
    self.setAttribute('status', '👂');
};
const propActions = [onInitVal, attachEventHandler, handleEvent, handleValChange, attachMutationEventHandler, onValFromTarget];
export const str0 = {
    type: String,
    dry: true
};
export const str1 = {
    ...str0,
    stopReactionsIfFalsy: true,
};
const baseObj = {
    type: Object,
    dry: true,
};
export const bool1 = {
    type: Boolean,
    dry: true,
};
const obj1 = {
    ...baseObj,
    stopReactionsIfFalsy: true,
};
const obj2 = {
    ...obj1,
    parse: true,
};
const num = {
    type: Number,
    dry: true,
};
const propDefMap = {
    observe: str0, on: str1, to: str0, careOf: str0, ifTargetMatches: str0,
    noblock: bool1, prop: str0, propFromEvent: str0, val: str0, initVal: str1, initEvent: bool1, valFromTarget: str1,
    fireEvent: str0, debug: bool1, log: bool1, as: str0,
    async: bool1, parseValAs: str0, capture: bool1, cloneVal: bool1,
    lastEvent: obj1, m: num, from: str0, mutateEvents: obj2,
    lastVal: baseObj,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PD, slicedPropDefs, 'onPropChange');
xc.define(PD);
/**
 * @element pass-down
 */
export class PassDown extends PD {
    static is = 'pass-down';
}
xc.define(PassDown);
