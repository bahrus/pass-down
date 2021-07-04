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
        if (this.valFilter === undefined && this.filterId === undefined) {
            return super.parseInitVal(elementToObserve);
        }
        let val = getProp(elementToObserve, this.initVal.split('.'), this);
        if (val === undefined)
            return undefined;
        if (this.valFilter !== undefined) {
            val = jsonPath(val, this.valFilter);
        }
        if (this.filterId !== undefined) {
            const rn = this.getRootNode();
            const filterScriptElement = rn.querySelector('script#' + this.filterId);
            if (filterScriptElement !== null) {
                const filterPath = this.filterScriptProp || '_modExport.filter';
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
        const superVal = super.parseValFromEvent(e);
        if (this.valFilter === undefined && this.filterId === undefined) {
            return superVal;
        }
        let filteredVal = superVal;
        if (this.valFilter !== undefined) {
            filteredVal = jsonPath(filteredVal, this.valFilter);
        }
        if (this.filterId !== undefined) {
            const rn = this.getRootNode();
            const filterScriptElement = rn.querySelector('script#' + this.filterId);
            if (filterScriptElement !== null) {
                const filterPath = this.filterScriptProp || '_modExport.filter';
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
    filterId: strProp,
    filterScriptProp: strProp,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PDX, slicedPropDefs, 'onPropChange');
xc.define(PDX);
