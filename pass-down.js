import { CE } from 'trans-render/lib/CE.js';
import { NotifyMixin } from 'trans-render/lib/mixins/notify.js';
import { getPreviousSib, nudge, getProp, convert } from 'on-to-me/on-to-me.js';
import { structuralClone } from 'trans-render/lib/structuralClone.js';
import { PDMixin, addDefaultMutObs } from './PDMixin.js';
const ce = new CE();
class PassDownCore extends HTMLElement {
    connectedCallback() {
        this.style.display = 'none';
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
        const initVal = this.initVal;
        if (initVal === undefined)
            return undefined;
        return getProp(elementToObserve, initVal.split('.'), this);
    }
    valFromEvent = (e) => {
        const val = this.val || 'target.value';
        let valToPass = this.parseValFromEvent(e);
        if (valToPass === undefined) {
            const target = e.target || this.observedElement;
            const attribVal = target.getAttribute(val);
            if (attribVal !== null) {
                valToPass = attribVal;
            }
        }
        if (this.parseValAs) {
            valToPass = convert(valToPass, this.parseValAs);
        }
        return this.cloneVal ? structuralClone(valToPass) : valToPass;
    };
    filterEvent(e) {
        return true;
    }
    _wr;
    get observedElement() {
        const element = this._wr === undefined ? undefined : this._wr?.deref(); //TODO  wait for bundlephobia to get over it's updatephobia
        if (element !== undefined) {
            return element;
        }
        let elementToObserve;
        if (this.observeClosest) {
            elementToObserve = this.closest(this.observeClosest);
            if (elementToObserve !== null && this.observe) {
                elementToObserve = getPreviousSib(elementToObserve.previousElementSibling || elementToObserve.parentElement, this.observe);
            }
        }
        else {
            elementToObserve = getPreviousSib(this.previousElementSibling || this.parentElement, this.observe ?? null);
        }
        if (elementToObserve === null)
            return null;
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }
    attachEventHandler(self) {
        const { on, _wr, previousOn, handleEvent, capture, parentElement, ifTargetMatches } = self;
        const previousElementToObserve = _wr !== undefined ? _wr.deref() : undefined; //TODO switch to ?. when bundlephobia catches up to the 2020's.
        self._wr = undefined;
        const elementToObserve = self.observedElement;
        if (!elementToObserve)
            throw "Could not locate element to observe.";
        let doNudge = previousElementToObserve !== elementToObserve;
        if ((previousElementToObserve !== undefined) && (previousOn !== undefined || (previousElementToObserve !== elementToObserve))) {
            previousElementToObserve.removeEventListener(previousOn || on, handleEvent);
        }
        else {
            doNudge = true;
        }
        elementToObserve.addEventListener(on, handleEvent, { capture: capture });
        if (doNudge) {
            if (elementToObserve === parentElement && ifTargetMatches !== undefined) {
                elementToObserve.querySelectorAll(ifTargetMatches).forEach(publisher => {
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
    }
    ;
    doInit(self) {
        const { observedElement, initEvent, parseValAs, cloneVal } = self;
        if (observedElement === null) {
            console.error('404');
            return;
        }
        const foundInitVal = setInitVal({ parseValAs, cloneVal }, self, observedElement);
        if (!foundInitVal && initEvent) {
            observedElement.addEventListener(initEvent, e => {
                setInitVal({ parseValAs, cloneVal }, self, observedElement);
            }, { once: true });
        }
    }
    ;
    doEvent(self) {
        const { lastEvent, noblock, valFromEvent } = self;
        self.setAttribute('status', '🌩️');
        if (!noblock)
            lastEvent.stopPropagation();
        let valToPass = valFromEvent(lastEvent);
        self.lastVal = valToPass;
        //holding on to lastEvent could introduce memory leak
        delete self.lastEvent;
        self.setAttribute('status', '👂');
    }
    onValFromTarget(self) {
        const { valFromTarget } = self;
        const initVal = valFromTarget === '' ? 'value' : valFromTarget;
        const val = 'target.' + initVal;
        const on = self.on === undefined ? ce.toLisp(initVal) + '-changed' : self.on;
        return { on, val, initVal };
    }
    ;
    setAliases(self) {
        self.valFromTarget = self.vft;
    }
}
const defaultFilters = {
    ifAllOf: ['isC', 'enabled'],
};
const stringProp = {
    type: 'String'
};
const filters = ['isC', 'disabled'];
export const PassDown = ce.def({
    config: {
        tagName: 'pass-down',
        propDefaults: {
            isC: true,
            disabled: false,
            enabled: true,
            debug: false,
            log: false,
            m: Infinity,
            cloneVal: false,
            noblock: false,
        },
        propInfo: {
            disabled: {
                notify: { toggleTo: 'enabled' }
            },
            on: stringProp, initEvent: stringProp, parseValAs: stringProp, observe: stringProp, initVal: stringProp, ifTargetMatches: stringProp,
            val: stringProp, propFromTarget: stringProp, to: stringProp, careOf: stringProp, from: stringProp, prop: stringProp, as: stringProp,
            mutateEvents: stringProp, valFromTarget: stringProp, vft: stringProp,
        },
        actions: {
            doInit: {
                ifAllOf: ['initVal', 'initEvent', 'parseValAs', 'cloneVal', 'isC', 'enabled'],
                ...defaultFilters
            },
            attachEventHandler: {
                ifAnyOf: ['on', 'observe', 'ifTargetMatches', 'isC', 'enabled'],
                ifAllOf: ['isC', 'on', 'enabled'],
            },
            doEvent: {
                ifAnyOf: ['val', 'parseValAs', 'noblock', 'lastEvent', 'isC', 'enabled'],
                ifAllOf: ['isC', 'lastEvent', 'enabled'],
            },
            handleValChange: {
                ifAnyOf: ['lastVal', 'debug', 'log', 'm', 'propFromTarget', 'to', 'careOf', 'from', 'prop', 'as', 'isC', 'enabled'],
                ifAllOf: ['isC', 'lastVal', 'enabled'],
            },
            attachMutationEventHandler: {
                ifAllOf: ['mutateEvents', 'isC', 'enabled'],
            },
            onValFromTarget: {
                ifAllOf: ['valFromTarget', 'isC', 'enabled'],
                merge: true,
            },
            setAliases: {
                ifAllOf: ['vft'],
            }
        }
    },
    superclass: PassDownCore,
    mixins: [NotifyMixin, PDMixin]
});
function setInitVal({ parseValAs, cloneVal }, self, elementToObserve) {
    let val = self.parseInitVal(elementToObserve);
    if (val === undefined)
        return false;
    if (parseValAs)
        val = convert(val, parseValAs);
    if (cloneVal)
        val = structuralClone(val);
    self.lastVal = val;
    return true;
}
