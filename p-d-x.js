import { PD } from './p-d.js';
import { jsonPath } from 'jsonpathesm/JSONPath.js';
import { xc } from 'xtal-element/lib/XtalCore.js';
export class PDX extends PD {
    static is = 'p-d-x';
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
