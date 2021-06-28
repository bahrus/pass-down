import {PD} from './p-d.js';
import {jsonPath} from 'jsonpathesm/JSONPath.js';
import {xc, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';
import {PassDownExtProps} from './types.d.js';

export class PDX extends PD {
    static is = 'p-d-x';
    override parseValFromEvent(e: Event){
        const cThis = this as unknown as PassDownExtProps;
        const superVal = super.parseValFromEvent(e);
        if(cThis.valFilter === undefined){
            return superVal;
        }
        return jsonPath(superVal, cThis.valFilter);
    }
    connectedCallback(){
        super.connectedCallback();
        xc.mergeProps(this, slicedPropDefs);
    }
}
const strProp: PropDef = {
    dry: true,
    type: String,
};
const propDefMap: PropDefMap<PassDownExtProps> = {
    valFilter: strProp
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PDX, slicedPropDefs, 'onPropChange');
xc.define(PDX);
