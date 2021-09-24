import { CE } from 'trans-render/lib/CE.js';
import { NotifyMixin } from 'trans-render/lib/mixins/notify.js';
import { getProp, convert } from 'on-to-me/prop-mixin.js';
import { passVal } from 'on-to-me/to-mixin.js';
import { structuralClone } from 'trans-render/lib/structuralClone.js';
import { OnMixin } from 'on-to-me/on-mixin.js';
const ce = new CE();
class PassDownCore extends HTMLElement {
    doInit({ observedElement, parseValAs, cloneVal, initEvent }) {
        if (observedElement === null) {
            console.error('404');
            return;
        }
        const foundInitVal = setInitVal({ parseValAs, cloneVal }, this, observedElement);
        if (!foundInitVal && initEvent) {
            observedElement.addEventListener(initEvent, e => {
                setInitVal({ parseValAs, cloneVal }, this, observedElement);
            }, { once: true });
        }
    }
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
        valToPass = getBoolVal(valToPass, this);
        return this.cloneVal ? structuralClone(valToPass) : valToPass;
    };
    doEvent({ lastEvent, noblock, valFromEvent }) {
        this.setAttribute('status', '🌩️');
        if (!noblock && lastEvent.stopPropagation)
            lastEvent.stopPropagation();
        let valToPass = valFromEvent(lastEvent);
        this.lastVal = valToPass;
        //holding on to lastEvent could introduce memory leak
        this.lastEvent = undefined; //wtf? why does't delete work?
        this.setAttribute('status', '👂');
    }
    handleValChange({ lastVal, prop, to, careOf, m, from, as, observedElement, propFromTarget, debug, log }) {
        if (lastVal === undefined)
            return; //do not use falsy gatekeeper for this!
        if (debug) {
            debugger;
        }
        else if (log) {
            const self = this;
            console.log('passVal', { lastVal, self });
        }
        let dynProp = prop;
        if (propFromTarget !== undefined) {
            dynProp = getProp(observedElement, propFromTarget.split('.'), this);
        }
        const matches = passVal(lastVal, this, to, careOf, m, from, dynProp, as);
        this.setAttribute('matches', '' + matches.length);
        this.cnt++;
    }
    onFromProp(initVal) {
        return this.on === undefined ? ce.toLisp(initVal) + '-changed' : this.on;
    }
    setValFromTarget({ valFromTarget }) {
        const initVal = valFromTarget === '' ? 'value' : valFromTarget;
        const val = 'target.' + initVal;
        const on = this.onFromProp(initVal);
        return { on, val, initVal };
    }
    ;
    setAliases({ vft }) {
        if (vft === undefined)
            return;
        this.valFromTarget = vft;
    }
}
const stringProp = {
    type: 'String'
};
const filters = ['isC', 'disabled'];
export const PassDown = ce.def({
    config: {
        tagName: 'pass-down',
        propDefaults: {
            initDelay: 16,
            isC: true,
            disabled: false,
            debug: false,
            log: false,
            m: Infinity,
            cloneVal: false,
            noblock: false,
            observeHost: false,
            trueVal: '',
            falseVal: '',
            cnt: 0,
        },
        propChangeMethod: 'onPropChange',
        propInfo: {
            disabled: {
                notify: {
                    toggleTo: 'enabled',
                    toggleDelay: 'initDelay',
                }
            },
            lastVal: {
                dry: false,
            },
            enabled: {
                type: 'Boolean',
                parse: false,
            },
            cnt: {
                notify: {
                    reflect: {
                        asAttr: true
                    }
                }
            },
            on: stringProp, initEvent: stringProp, parseValAs: stringProp, observe: stringProp, initVal: stringProp, ifTargetMatches: stringProp,
            val: stringProp, propFromTarget: stringProp, to: stringProp, careOf: stringProp, from: stringProp, prop: stringProp, as: stringProp,
            mutateEvents: stringProp, valFromTarget: stringProp, vft: stringProp, observeClosest: stringProp,
        },
        actions: {
            doInit: {
                ifAllOf: ['initVal', 'isC', 'enabled'],
                ifKeyIn: ['initEvent', 'parseValAs', 'cloneVal'],
            },
            locateAndListen: {
                ifAllOf: ['isC', 'on', 'enabled'],
                ifKeyIn: ['observe', 'ifTargetMatches', 'observeHost', 'observeClosest'],
            },
            doEvent: {
                ifAllOf: ['isC', 'lastEvent', 'enabled'],
                ifKeyIn: ['val', 'parseValAs', 'noblock'],
            },
            handleValChange: {
                ifAllOf: ['isC', 'enabled'],
                ifKeyIn: ['lastVal', 'debug', 'log', 'm', 'propFromTarget', 'to', 'careOf', 'from', 'prop', 'as', 'isC', 'enabled'],
            },
            attachMutationEventHandler: {
                ifAllOf: ['mutateEvents', 'isC', 'enabled'],
            },
            setValFromTarget: {
                ifAllOf: ['isC', 'enabled'],
                ifKeyIn: ['valFromTarget'],
            },
            setAliases: {
                ifKeyIn: ['vft'],
            }
        },
        style: {
            display: 'none'
        }
    },
    superclass: PassDownCore,
    mixins: [NotifyMixin, OnMixin]
});
function getBoolVal(val, { trueVal, falseVal }) {
    let valToPass = val;
    if (typeof valToPass === 'boolean') {
        if (valToPass && trueVal) {
            valToPass = trueVal;
        }
        else if (!valToPass && falseVal) {
            valToPass = falseVal;
        }
    }
    return valToPass;
}
function setInitVal({ parseValAs, cloneVal }, self, elementToObserve) {
    let val = self.parseInitVal(elementToObserve);
    if (val === undefined)
        return false;
    if (parseValAs)
        val = convert(val, parseValAs);
    if (cloneVal)
        val = structuralClone(val);
    val = getBoolVal(val, self);
    self.lastVal = val;
    return true;
}
