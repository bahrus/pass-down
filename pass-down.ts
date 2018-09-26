import {observeCssSelector} from 'xtal-latx/observeCssSelector.js';
import {define} from 'xtal-latx/define.js';

const p_d_on = 'p-d-on';

export interface ISetProp{
    propTarget: string;
    propSource: string;
}

export interface ICssPropMap {
    cssSelector: string;
    setProps: ISetProp[];
    max?: number;
    isNext?: boolean;
}
interface IEventRule{
    skipInit?: boolean
    map?: ICssPropMap[];
    
}
const pass_to = 'pass-to';
const pass_to_next = 'pass-to-next';
const and_to = 'and-to';
const and_to_next = 'and-to-next';

export class PassDown extends observeCssSelector(HTMLElement){
    static get is(){return 'pass-down';}
    _conn!: boolean;
    connectedCallback(){
        this.style.display = 'none';
        this._conn = true;
        this.onPropsChange();
    }
    insertListener(e: any){
        if (e.animationName === PassDown.is) {
            const target = e.target;
            setTimeout(() =>{
                this.parse(target);
                //this.registerScript(target);
            }, 0);
        }
    }
    onPropsChange(){
        if(!this._conn) return;
        this.addCSSListener(PassDown.is, '[data-on]', this.insertListener);
    }
    toLHSRHS(s: string){
        const pos = s.indexOf(':');
        return {
            lhs: s.substr(0, pos),
            rhs: s.substr(pos + 1),
        }
    }
    parseBr(s: string){
        return s.split('}').map(t => t.substr(1)); 
    }
    parse(target: HTMLElement){
        console.log(target);
        const on = (target.dataset.on as string).split(' ');
        const rules : {[key: string] : IEventRule} = {};
        let rule : IEventRule;
        on.forEach(tkn =>{
            const token = tkn.trim();
            if(token==='') return;
            if(token.endsWith(':')){
                rule = {};
                rules[token.substr(0, token.length - 1)] = rule;
            }else{
                switch(token){
                    case 'skip-init':
                        rule.skipInit = true;
                        break;
                    default:
                        const lhsRHS = this.toLHSRHS(token);
                        const lhs = lhsRHS.lhs;
                        switch(lhs){
                            case pass_to:
                            case pass_to_next:
                                rule.map = [];
                                break;
                        }
                        const cssProp = {
                        } as ICssPropMap;
                        rule.map!.push(cssProp);
                        //let toNext = false;
                        switch(lhs){
                            case pass_to_next:
                            case and_to_next:
                                cssProp.max = 1;
                                cssProp.isNext = true;
                                break;
                        }
                        const rhs = this.parseBr(lhsRHS.rhs);
                        let vals;
                        if(!cssProp.isNext){
                            cssProp.max = parseInt(rhs[2]);
                            vals = rhs[1];
                            cssProp.cssSelector = rhs[0];
                        }else{
                            vals = rhs[0]
                        }

                }
            }
        })
    }
}

define(PassDown);