import { xc } from 'xtal-element/lib/XtalCore.js';
import { P } from './p.js';
/**
 * @element p-d
 */
export class PD extends P {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
    }
    connectedCallback() {
        this.style.display = 'none';
        //xc.hydrate()
    }
}
PD.is = 'p-d';
const propActions = [];
const str1 = {
    type: String,
    dry: true,
};
const bool1 = {
    type: Boolean,
    dry: true,
};
const propDefMap = {
    on: str1, to: str1, careOf: str1, ifTargetMatches: str1,
    noblock: bool1, prop: str1, propFromEvent: str1, val: str1,
    fireEvent: str1, skipInit: bool1, debug: bool1, log: bool1,
    async: bool1, parseValAs: str1, capture: bool1
};
xc.define(PD);