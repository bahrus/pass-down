import { observeCssSelector } from 'xtal-latx/observeCssSelector.js';
import { define } from 'xtal-latx/define.js';
const p_d_on = 'p-d-on';
const pass_to = 'pass-to';
const pass_to_next = 'pass-to-next';
const and_to = 'and-to';
const and_to_next = 'and-to-next';
export class PassDown extends observeCssSelector(HTMLElement) {
    static get is() { return 'pass-down'; }
    connectedCallback() {
        this.style.display = 'none';
        this._conn = true;
        this.onPropsChange();
    }
    insertListener(e) {
        if (e.animationName === PassDown.is) {
            const target = e.target;
            setTimeout(() => {
                this.parse(target);
                //this.registerScript(target);
            }, 0);
        }
    }
    onPropsChange() {
        if (!this._conn)
            return;
        this.addCSSListener(PassDown.is, '[data-on]', this.insertListener);
    }
    toLHSRHS(s) {
        const pos = s.indexOf(':');
        return {
            lhs: s.substr(0, pos),
            rhs: s.substr(pos + 1),
        };
    }
    parseBr(s) {
        return s.split('}').map(t => t.substr(1));
    }
    parse(target) {
        console.log(target);
        const on = target.dataset.on.split(' ');
        const rules = {};
        let rule;
        on.forEach(tkn => {
            const token = tkn.trim();
            if (token === '')
                return;
            if (token.endsWith(':')) {
                rule = {};
                rules[token.substr(0, token.length - 1)] = rule;
            }
            else {
                switch (token) {
                    case 'skip-init':
                        rule.skipInit = true;
                        break;
                    default:
                        const lhsRHS = this.toLHSRHS(token);
                        const lhs = lhsRHS.lhs;
                        switch (lhs) {
                            case pass_to:
                            case pass_to_next:
                                rule.map = [];
                                break;
                        }
                        const cssProp = {};
                        rule.map.push(cssProp);
                        switch (lhs) {
                            case pass_to_next:
                            case and_to_next:
                                cssProp.max = 1;
                                break;
                        }
                }
            }
        });
    }
}
define(PassDown);
//# sourceMappingURL=pass-down.js.map