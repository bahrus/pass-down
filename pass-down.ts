import {observeCssSelector} from 'xtal-latx/observeCssSelector.js';
import {define} from 'xtal-latx/define.js';
import {qsa} from 'xtal-latx/qsa.js';

const p_d_on = 'p-d-on';
const p_d_rules = 'p-d-rules';
const p_d_if = 'p-d-if';

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
    if?:string;
    lastEvent?: Event;
}
const pass_to = 'pass-to';
const pass_to_next = 'pass-to-next';
const and_to = 'and-to';
const and_to_next = 'and-to-next';
interface IPDTarget extends HTMLElement{
    [p_d_rules] : {[key: string] : IEventRule}
}

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
            const region = e.target;
            setTimeout(() =>{
                this.getTargets(region);
            }, 0);
        }
    }
    onPropsChange(){
        if(!this._conn) return;
        this.addCSSListener(PassDown.is, '[pass-down-region]', this.insertListener);
    }
    toLHSRHS(s: string){
        const pos = s.indexOf(':');
        return {
            lhs: s.substr(0, pos),
            rhs: s.substr(pos + 1),
        }
    }
    parseBr(s: string){
        return s.split('{').map(t => t.endsWith('}') ? t.substr(0, t.length - 1) : t);
    }
    getTargets(region: HTMLElement){
        qsa('[data-on]', region).forEach(target =>{
            this.parse(target as IPDTarget);
        })

    }
    parse(target: IPDTarget){
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
                        if(token.startsWith('if(')){
                            console.log('TODO');
                        }else{
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
                                vals = rhs[1];
                            }
                            cssProp.setProps = [];
                            vals.split(';').forEach(val =>{
                                const lR = this.toLHSRHS(val);
                                cssProp.setProps.push({
                                    propSource: lR.rhs,
                                    propTarget: lR.lhs
                                })
                            })
                        }


                }
            }
        })
        target[p_d_rules] = rules;
        setTimeout(() => this.initTarget(target), 50);
    }
    initTarget(target: IPDTarget){
        console.log({
            target: target,
            rules: target[p_d_rules]
        })
        this.attchEvListnrs(target);
        this.addMutObs(target);
    }
    addMutObs(target: Element) {
        return;
        let elToObs = target.parentElement as HTMLElement;
        if(!(<any>elToObs)['__addedMutObs']){
            const obs = new MutationObserver((m : MutationRecord[]) =>{
                qsa('[data-on]', elToObs).forEach(el => {
                    const rules = ((<any>el) as IPDTarget)[p_d_rules];
                    if(rules){
                        for(const key in rules){
                            const rule = rules[key];
                            if(rule.lastEvent){
                                this._hndEv(rule.lastEvent);
                            }
                        }
                    }
                })
            });
            obs.observe(elToObs, {
                childList: true,
                subtree: true
            });
            (<any>elToObs)['__addedMutObs'] = true;
        }
        
    }
    attchEvListnrs(target: IPDTarget){
        const rules = target[p_d_rules];
        for(const key in rules){
            const rule = rules[key];
            target.addEventListener(key, this._hndEv)
            if(!rule.skipInit){
                const fakeEvent = {
                    type: key,
                    isFake: true,
                    detail: {
                        value: (<any>target).value,
                    },
                    target: target
                };
                this._hndEv((<any>fakeEvent) as Event);
            }
        }
        target.removeAttribute('disabled');

    }
    _hndEv(e: Event){
        const target = e.target as IPDTarget;
        const rule = target[p_d_rules][e.type];
        if(rule.if && !(e.target as HTMLElement).matches(rule.if)) return;
        rule.lastEvent = e;
        this.passDown(target, e, rule, 0, target);
        
    }

    passDown(start: HTMLElement, e: Event, rule: IEventRule, count: number, original: IPDTarget) {
        let nextSib = start;
        while (nextSib) {
            if (nextSib.tagName !== 'SCRIPT') {
                rule.map!.forEach(map => {
                    if (map.isNext || (nextSib!.matches && nextSib!.matches(map.cssSelector))) {
                        count++;
                        this.setVal(e, nextSib, map)
                    }
                    const fec = nextSib!.firstElementChild as HTMLElement;
                    if(fec && nextSib.hasAttribute(p_d_if)){
                        const pdIF = nextSib.getAttribute(p_d_if);
                        if(pdIF){
                            if(original.matches(pdIF)){
                                this.passDown(fec, e, rule, count, original);
                            }
                        }
                    }
                })
            }
            nextSib = nextSib.nextElementSibling as HTMLElement;
        }
    }

    setVal(e: Event, target: any, map: ICssPropMap){
        map.setProps.forEach(setProp =>{
            const propFromEvent = this.getPropFromPath(e, setProp.propSource);
            this.commit(target, setProp.propTarget, propFromEvent);
        })
        //const gpfp = this.getPropFromPath.bind(this);
        //const propFromEvent = map.propSource ? gpfp(e, map.propSource) : gpfp(e, 'detail.value') || gpfp(e, 'target.value');
        
       
    }

    commit(target: HTMLElement, key: string, val: any){
        (<any>target)[key] = val;
    }

    getPropFromPath(val: any, path: string){
        if(!path || path==='.') return val;
        return this.getProp(val, path.split('.'));
    }
    getProp(val: any, pathTokens: string[]){
        let context = val;
        let firstToken = true;
        const cp = 'composedPath';
        const cp_ = cp + '_';
        pathTokens.forEach(token => {
            if(context)  {
                if(firstToken && context[cp]){
                    firstToken = false;
                    const cpath = token.split(cp_);
                    if(cpath.length === 1){
                        context = context[cpath[0]];
                    }else{
                        context = context[cp]()[parseInt(cpath[1])];
                    }
                }else{
                    context = context[token];
                }
                
            }
        });
        return context;
    }

}

define(PassDown);