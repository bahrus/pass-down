import {PD} from './p-d.js';
import {jsonPath} from 'jsonpathesm/JSONPath.js';
import {xc, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';
import {PassDownExtProps, PassDownProps} from './types.d.js';
import {getProp} from 'on-to-me/on-to-me.js';


export class PDX extends PD {
    static is = 'p-d-x';

    override parseInitVal(elementToObserve: Element){
        if((this as unknown as PassDownProps).valFromTarget === undefined){
            return super.parseInitVal(elementToObserve);
        }
        const val = getProp(elementToObserve, (this as unknown as PassDownExtProps).initVal!.split('.'), this);
        if(val === undefined) return undefined;
        return jsonPath(val, (this as unknown as PassDownExtProps).valFilter);
    }
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
