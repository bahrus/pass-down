import { define, camelToLisp } from 'trans-render/lib/define.js';
import { NotifyMixin } from 'trans-render/lib/mixins/notify.js';
import { getPreviousSib, nudge, getProp, convert } from 'on-to-me/on-to-me.js';
import { structuralClone } from 'trans-render/lib/structuralClone.js';
import { PDMixin, addDefaultMutObs } from './PDMixin.js';
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
        if (this.parseValAs !== undefined) {
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
        if (this.observeClosest !== undefined) {
            elementToObserve = this.closest(this.observeClosest);
            if (elementToObserve !== null && this.observe !== undefined) {
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
    onInitVal(self) {
        const { observedElement, initEvent, parseValAs, cloneVal } = self;
        if (observedElement === null) {
            console.error('404');
            return;
        }
        const foundInitVal = setInitVal({ parseValAs, cloneVal }, self, observedElement);
        if (!foundInitVal && initEvent !== undefined) {
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
        if (valFromTarget === undefined)
            return;
        const valFromTargetOrValue = valFromTarget === '' ? 'value' : valFromTarget;
        self.initVal = valFromTargetOrValue;
        self.val = 'target.' + valFromTargetOrValue;
        if (self.on === undefined)
            self.on = camelToLisp(valFromTargetOrValue) + '-changed';
    }
    ;
    setAliases(self) {
        self.valFromTarget = self.vft;
    }
}
const defaultFilters = {
    riff: ['isC', 'enabled'],
};
const stringProp = {
    type: 'String'
};
const filters = ['isC', 'disabled'];
export const PassDown = define({
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
            initVal: stringProp, initEvent: stringProp, parseValAs: stringProp, on: stringProp, observe: stringProp, ifTargetMatches: stringProp,
            val: stringProp, propFromTarget: stringProp, to: stringProp, careOf: stringProp, from: stringProp, prop: stringProp, as: stringProp,
            mutateEvents: stringProp, valFromTarget: stringProp, vft: stringProp,
        },
        actions: [
            {
                do: 'onInitVal',
                upon: ['initVal', 'initEvent', 'parseValAs', 'cloneVal', 'isC', 'enabled'],
                ...defaultFilters
            }, {
                do: 'attachEventHandler',
                upon: ['on', 'observe', 'ifTargetMatches', 'isC', 'enabled'],
                riff: ['isC', 'on', 'enabled'],
            }, {
                do: 'doEvent',
                upon: ['val', 'parseValAs', 'noblock', 'lastEvent', 'isC', 'enabled'],
                riff: ['isC', 'lastEvent', 'enabled'],
            }, {
                do: 'handleValChange',
                upon: ['lastVal', 'debug', 'log', 'm', 'propFromTarget', 'to', 'careOf', 'from', 'prop', 'as', 'isC', 'enabled'],
                riff: ['isC', 'lastVal', 'enabled'],
            }, {
                do: 'attachMutationEventHandler',
                upon: ['mutateEvents', 'isC', 'enabled'],
                riff: ['isC', 'mutateEvents', 'enabled'],
            }, {
                do: 'onValFromTarget',
                upon: ['valFromTarget', 'isC', 'enabled'],
                riff: ['isC', 'enabled'],
            }, {
                do: 'setAliases',
                upon: ['vft'],
            }
        ]
    },
    superclass: PassDownCore,
    mixins: [NotifyMixin, PDMixin]
});
function setInitVal({ parseValAs, cloneVal }, self, elementToObserve) {
    let val = self.parseInitVal(elementToObserve);
    if (val === undefined)
        return false;
    if (parseValAs !== undefined)
        val = convert(val, parseValAs);
    if (cloneVal)
        val = structuralClone(val);
    self.lastVal = val;
    return true;
}
