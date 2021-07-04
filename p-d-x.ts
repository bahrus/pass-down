import {PD} from './p-d.js';
import {jsonPath} from 'jsonpathesm/JSONPath.js';
import {xc, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';
import {PassDownExtProps, PassDownProps} from './types.d.js';
import {getProp} from 'on-to-me/on-to-me.js';


export class PDX extends PD {
    static is = 'p-d-x';

    override parseInitVal(elementToObserve: Element){
        if(this.valFilter === undefined){
            return super.parseInitVal(elementToObserve);
        }
        const val = getProp(elementToObserve, (this as unknown as PassDownExtProps).initVal!.split('.'), this);
        if(val === undefined) return undefined;
        return jsonPath(val, (this as unknown as PassDownExtProps).valFilter);
    }
    override parseValFromEvent(e: Event){
        const superVal = super.parseValFromEvent(e);
        if(this.valFilter === undefined){
            return superVal;
        }
        return jsonPath(superVal, this.valFilter);
    }

    connectedCallback(){
        super.connectedCallback();
        xc.mergeProps(this, slicedPropDefs);
    }
}
export interface PDX extends PassDownExtProps{}
const strProp: PropDef = {
    dry: true,
    type: String,
};
const objProp: PropDef = {
    dry: true,
    type: Object
}
const propDefMap: PropDefMap<PassDownExtProps> = {
    valFilter: strProp,

};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PDX, slicedPropDefs, 'onPropChange');
xc.define(PDX);
