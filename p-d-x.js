import { PD } from './p-d.js';
import { jsonPath } from 'jsonpathesm/JSONPath.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
import { getProp } from 'on-to-me/on-to-me.js';
export class PDX extends PD {
    static is = 'p-d-x';
    parseInitVal(elementToObserve) {
        if (this.valFromTarget === undefined) {
            return super.parseInitVal(elementToObserve);
        }
        const val = getProp(elementToObserve, this.initVal.split('.'), this);
        if (val === undefined)
            return undefined;
        return jsonPath(val, this.valFilter);
    }
    parseValFromEvent(e) {
        const cThis = this;
        const superVal = super.parseValFromEvent(e);
        if (cThis.valFilter === undefined) {
            return superVal;
        }
        return jsonPath(superVal, cThis.valFilter);
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
const propDefMap = {
    valFilter: strProp
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PDX, slicedPropDefs, 'onPropChange');
xc.define(PDX);
