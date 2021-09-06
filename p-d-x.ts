import {PassDown} from './pass-down.js';
import {CE, Action, PropInfo} from 'trans-render/lib/CE.js';
import {PassDownExtProps} from './types';
import {jsonPath} from 'jsonpathesm/JSONPath.js';
import { PDToFrom, PassDownProps, IPDMixin } from './types.js';
import {passValToMatches, passVal, getProp} from 'on-to-me/on-to-me.js';
import  'mut-obs/mut-obs.js';
import {MutObs} from 'mut-obs/mut-obs.js'; //Typescript requires both of these
const p_std = 'p_std';
export class PDXCore extends PassDown{


    attachMutationEventHandler({parentElement, mutateEvents}: this){
        if(!parentElement) return;
        for(const event of mutateEvents!){
            parentElement.addEventListener(event, e => {
                if(this.lastVal !== undefined){
                    this.handleValChange(this);
                }
            })
        }
    }

    override parseValFromEvent(e: Event){
        let filteredVal = super.parseValFromEvent(e);

        return this.filterVal(filteredVal);
    }
    override attachEventHandler({addMutObs}: this){
        super.attachEventHandler(this);
        if(addMutObs){
            addDefaultMutObs(this);
        }
    }

    filterVal(val: any){
        let filteredVal = val;
        if(this.closestWeakMapKey !== undefined && filteredVal instanceof WeakMap){
            const closest = this.closest(this.closestWeakMapKey); //TODO:  cache? //dispose in disconnectedcallback()?
            if(closest !== null){
                filteredVal = filteredVal.get(closest);
                if(!filteredVal) return filteredVal;
            }
        }
        if(this.valFilter !== undefined){
            filteredVal = jsonPath(filteredVal, this.valFilter);
        }
        if(this.valFilterScriptId !== undefined){
            const rn = this.getRootNode() as DocumentFragment;
            const filterScriptElement = rn.querySelector('script#' + this.valFilterScriptId) as any;
            if(filterScriptElement !== null){
                const filterPath = this.valFilterScriptPropPath || '_modExport.filter';
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
                    filteredVal = filterFn(filteredVal);
                }
            }
        }
        return filteredVal;
    }
}
export interface PDXCore extends PassDownExtProps{}

const ce = new CE<PassDownExtProps>({
    config: {
        tagName: 'p-d-x',
        propDefaults:{
            valFilter:'',
            valFilterScriptId:'',
            addMutObs: false,
            valFilterScriptPropPath: '',
            closestWeakMapKey:'',
            
        }
    },
    superclass: PDXCore
});

export function getFrom(self: PDToFrom){
    return self.from !== undefined ? self.closest!(self.from) : self
}

export function isMatchAfterFrom(match: Element, self: PDToFrom){
    const from = getFrom(self);
    if(!from) return false;
    let prev = match.previousElementSibling;
    while(prev != null){
        if(prev === from) return true;
        prev = prev.previousElementSibling;
    }
    return false;
}

export function addDefaultMutObs(self: PDToFrom){
    const parent = getFrom(self)?.parentElement;
    if(parent){
        const mutObs = document.createElement('mut-obs') as MutObs;
        const s = mutObs.setAttribute.bind(mutObs);
        s('dispatch', p_std);
        s('child-list', '');
        s('observe', 'parentElement');
        s('on', self.to!);
        parent.appendChild(mutObs);
        mutObs.addEventListener(p_std, (e: Event) => {
            e.stopPropagation();
            const mutObj = e.target as MutObs;
            if(self.lastVal !== undefined){
                const ae = e as any;
                const match = ae.detail.match;
                if(isMatchAfterFrom(match, self)){
                    passValToMatches([match], self.lastVal, self.to, self.careOf, self.prop, self.as);
                }
            }
        });
        
    }
}
