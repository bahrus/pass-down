import { PD } from './p-d.js';
import { jsonPath } from 'jsonpathesm/JSONPath.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
import { getProp } from 'on-to-me/on-to-me.js';
/**
 * @element p-d-x
 */
export class PDX extends PD {
    static is = 'p-d-x';
    parseInitVal(elementToObserve) {
        if (this.valFilter === undefined && this.valFilterScriptId === undefined) {
            return super.parseInitVal(elementToObserve);
        }
        let val = getProp(elementToObserve, this.initVal.split('.'), this);
        if (val === undefined)
            return undefined;
        if (this.valFilter !== undefined) {
            val = jsonPath(val, this.valFilter);
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
                    val = filterFn(val);
                }
            }
        }
        return val;
    }
    parseValFromEvent(e) {
        let filteredVal = super.parseValFromEvent(e);
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
    connectedCallback() {
        super.connectedCallback();
        xc.mergeProps(this, slicedPropDefs);
    }
}
const strProp = {
    dry: true,
    type: String,
};
const objProp = {
    dry: true,
    type: Object
};
const propDefMap = {
    valFilter: strProp,
    valFilterScriptId: strProp,
    valFilterScriptPropPath: strProp,
    closestWeakMapKey: strProp,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PDX, slicedPropDefs, 'onPropChange');
xc.define(PDX);
