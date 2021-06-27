import { PD } from './p-d.js';
import { jsonPath } from 'jsonpathesm/JSONPath.js';
import { convert } from 'on-to-me/on-to-me.js';
import { structuralClone } from 'xtal-element/lib/structuralClone.js';
import { define } from 'xtal-element/lib/define.js';
export class PDX extends PD {
    static is = 'p-d-x';
    valFromEvent(e) {
        if (!this.val || !this.val.startsWith('$'))
            return super.valFromEvent(e);
        let valToPass = jsonPath(e, this.val);
        if (this.parseValAs !== undefined) {
            valToPass = convert(valToPass, this.parseValAs);
        }
        return this.cloneVal ? structuralClone(valToPass) : valToPass;
    }
}
define(PDX);
