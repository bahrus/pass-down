import { PassDown } from './pass-down.js';
import { CE } from 'trans-render/lib/CE.js';
import { jsonPath } from 'jsonpathesm/JSONPath.js';
import { addDefaultMutObs } from './PDMixin.js';
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
    attachEventHandler({ addMutObs }) {
        super.attachEventHandler(this);
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
