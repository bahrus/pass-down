import { PassDown } from './pass-down.js';
import { CE } from 'trans-render/lib/CE.js';
import { jsonPath } from 'jsonpathesm/JSONPath.js';
import { passValToMatches } from 'on-to-me/on-to-me.js';
import 'mut-obs/mut-obs.js';
const p_std = 'p_std';
export class PDXCore extends PassDown {
    attachMutationEventHandler({ parentElement, mutateEvents }) {
        if (!parentElement)
            return;
        for (const event of mutateEvents) {
            parentElement.addEventListener(event, e => {
                if (this.lastVal !== undefined) {
                    this.handleValChange(this);
                }
            });
        }
    }
    parseValFromEvent(e) {
        let filteredVal = super.parseValFromEvent(e);
        return this.filterVal(filteredVal);
    }
    locateAndListen({ addMutObs }) {
        super.locateAndListen(this);
        if (addMutObs) {
            addDefaultMutObs(this);
        }
    }
    filterVal(val) {
        let filteredVal = val;
        if (this.closestWeakMapKey !== undefined && filteredVal instanceof WeakMap) {
            const closest = this.closest(this.closestWeakMapKey); //TODO:  cache? //dispose in disconnectedcallback()?
            if (closest !== null) {
                filteredVal = filteredVal.get(closest);
                if (!filteredVal)
                    return filteredVal;
            }
        }
        if (this.valFilter !== undefined) {
            filteredVal = jsonPath(filteredVal, this.valFilter);
        }
        if (this.valFilterScriptId !== undefined) {
            const rn = this.getRootNode();
            const filterScriptElement = rn.querySelector('script#' + this.valFilterScriptId);
            if (filterScriptElement !== null) {
                const filterPath = this.valFilterScriptPropPath || '_modExport.filter';
                const tokens = filterPath.split('.');
                let filterFn = filterScriptElement;
                for (const token of tokens) {
                    if (filterFn !== undefined) {
                        filterFn = filterFn[token];
                    }
                    else {
                        break;
                    }
                }
                if (typeof filterFn === 'function') {
                    filteredVal = filterFn(filteredVal);
                }
            }
        }
        return filteredVal;
    }
}
const ce = new CE({
    config: {
        tagName: 'p-d-x',
        propDefaults: {
            valFilter: '',
            valFilterScriptId: '',
            addMutObs: false,
            valFilterScriptPropPath: '',
            closestWeakMapKey: '',
        }
    },
    superclass: PDXCore
});
export function getFrom(self) {
    return self.from !== undefined ? self.closest(self.from) : self;
}
export function isMatchAfterFrom(match, self) {
    const from = getFrom(self);
    if (!from)
        return false;
    let prev = match.previousElementSibling;
    while (prev != null) {
        if (prev === from)
            return true;
        prev = prev.previousElementSibling;
    }
    return false;
}
export function addDefaultMutObs(self) {
    const parent = getFrom(self)?.parentElement;
    if (parent) {
        const mutObs = document.createElement('mut-obs');
        const s = mutObs.setAttribute.bind(mutObs);
        s('dispatch', p_std);
        s('child-list', '');
        s('observe', 'parentElement');
        s('on', self.to);
        parent.appendChild(mutObs);
        mutObs.addEventListener(p_std, (e) => {
            e.stopPropagation();
            const mutObj = e.target;
            if (self.lastVal !== undefined) {
                const ae = e;
                const match = ae.detail.match;
                if (isMatchAfterFrom(match, self)) {
                    passValToMatches([match], self.lastVal, self.to, self.careOf, self.prop, self.as);
                }
            }
        });
    }
}
