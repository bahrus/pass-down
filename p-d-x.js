import { PD } from './p-d.js';
import { jsonPath } from 'jsonpathesm/JSONPath.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
import { getProp } from 'on-to-me/on-to-me.js';
export class PDX extends PD {
    static is = 'p-d-x';
    parseInitVal(elementToObserve) {
        if (this.valFilter === undefined) {
            return super.parseInitVal(elementToObserve);
        }
        const val = getProp(elementToObserve, this.initVal.split('.'), this);
        if (val === undefined)
            return undefined;
        return jsonPath(val, this.valFilter);
    }
    parseValFromEvent(e) {
        const superVal = super.parseValFromEvent(e);
        if (this.valFilter === undefined) {
            return superVal;
        }
        return jsonPath(superVal, this.valFilter);
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
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PDX, slicedPropDefs, 'onPropChange');
xc.define(PDX);
