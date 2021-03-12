import {xc, PropAction, PropDef, PropDefMap, ReactiveSurface} from 'xtal-element/lib/XtalCore.js';
import {} from 'on-to-me/on-to-me.js';
import {P} from './p.js';

/**
 * @element p-d
 */
export class PD extends P implements ReactiveSurface{
    static is = 'p-d';
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);
    connectedCallback(){
        this.style.display = 'none';
        //xc.hydrate()
    }
}

const propActions = [] as PropAction[];

const str1: PropDef = {
    type: String,
    dry: true,
};

const bool1: PropDef = {
    type: Boolean,
    dry: true,
}

const propDefMap: PropDefMap<PD> = {
    on: str1, to: str1, careOf: str1, ifTargetMatches: str1,
    noblock: bool1, prop: str1, propFromEvent: str1, val: str1,
    fireEvent: str1, skipInit: bool1, debug: bool1, log: bool1,
    async: bool1, parseValAs: str1, capture: bool1
};

xc.define(PD);