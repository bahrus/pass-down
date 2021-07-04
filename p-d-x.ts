import {PD} from './p-d.js';
import {jsonPath} from 'jsonpathesm/JSONPath.js';
import {xc, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';
import {PassDownExtProps, PassDownProps} from './types.d.js';
import {getProp} from 'on-to-me/on-to-me.js';

/**
 * @element p-d-x
 */
export class PDX extends PD {
    static is = 'p-d-x';

    override parseInitVal(elementToObserve: Element){
        if(this.valFilter === undefined && this.filterId === undefined){
            return super.parseInitVal(elementToObserve);
        }
        let val = getProp(elementToObserve, this.initVal!.split('.'), this);
        if(val === undefined) return undefined;
        if(this.valFilter !== undefined){
            val = jsonPath(val, (this as unknown as PassDownExtProps).valFilter);
        }
        if(this.filterId !== undefined){
            const rn = this.getRootNode() as DocumentFragment;
            const filterScriptElement = rn.querySelector('script#' + this.filterId) as any;
            if(filterScriptElement !== null){
                const filterPath = this.filterScriptProp || '_modExport.filter';
                const tokens = filterPath.split('.');
                let filterFn = filterScriptElement;
                for(const token of tokens){
                    if(filterFn !== undefined){
                        filterFn = filterFn[token];
                    }else{
                        break;
                    }
                }
                if(typeof filterFn === 'function'){
                    val = filterFn(val);
                }
            }
        }
        return val;
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
const propDefMap: PropDefMap<PDX> = {
    valFilter: strProp,
    filterId: strProp,
    filterScriptProp: strProp,
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(PDX, slicedPropDefs, 'onPropChange');
xc.define(PDX);
