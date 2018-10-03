import { observeCssSelector } from 'xtal-latx/observeCssSelector.js';
import { define } from 'xtal-latx/define.js';
import { debounce } from 'xtal-latx/debounce.js';

//const p_d_on = 'p-d-on';
const p_d_rules = 'p-d-rules';
const p_d = 'data-pd';
//const p_d_if = 'p-d-if';

export interface ISetProp {
    propTarget: string;
    propSource: string;
}

export interface ICssPropMap {
    cssSelector: string;
    setProps: ISetProp[];
    max?: number;
    count?:number;
    isNext?: boolean;
}
interface IEventRule {
    skipInit?: boolean
    map?: ICssPropMap[];
    if?: string;
    lastEvent?: Event;
    recursive?: boolean;
    stack?: IPDTarget[];
}
const pass_to = 'pass-to';
const pass_to_next = 'pass-to-next';
const and_to = 'and-to';
const and_to_next = 'and-to-next';
interface IPDTarget extends HTMLElement {
    [p_d_rules]: { [key: string]: IEventRule[] };
}

interface IPassDownParams {
    start: HTMLElement,
    e: Event,
    rule: IEventRule,
    //count: number,
    topEl: IPDTarget,
    mutEl?: IPDTarget,
    
    //recursively?: boolean,
}

interface ISyncRangeParams {
    region: IPDTarget,
    r: boolean,
}

export class PassDown extends observeCssSelector(HTMLElement) {
    static get is() { return 'pass-down'; }
    _conn!: boolean;
    connectedCallback() {
        this.style.display = 'none';
        this._conn = true;
        this.onPropsChange();
        this._syncRangedb =  debounce((srp) => this.syncRange(srp), 50);
    }
    insertListener(e: any) {
        if (e.animationName === PassDown.is) {
            const region = e.target;
            setTimeout(() => {
                this.getTargets(region, true);
            }, 0);
        }
    }
    onPropsChange() {
        if (!this._conn) return;
        this.addCSSListener(PassDown.is, `[${p_d}]`, this.insertListener);
    }
    toLHSRHS(s: string) {
        const pos = s.indexOf(':');
        return {
            lhs: s.substr(0, pos),
            rhs: s.substr(pos + 1),
        }
    }
    parseBr(s: string) {
        return s.split('{').map(t => t.endsWith('}') ? t.substr(0, t.length - 1) : t);
    }
    syncRange(srp : ISyncRangeParams){
        Array.from(srp.region.children).forEach(child => {
            const ds = (<HTMLElement>child).dataset;
            if (ds && ds.on){
                const aRules = (<IPDTarget>child)[p_d_rules]; //allRules
                for(const rk in aRules){
                    const eRules = aRules[rk];
                    eRules.forEach(r =>{
                        if(srp.r && !r.recursive) return;
                        if(r.lastEvent){
                            this._hndEv(r.lastEvent);
                        }
                    })
                    
                }
            } 
        })
    }
    getTargets(region: IPDTarget, init: boolean) {
        //region.__region = region.getAttribute(p_d)!;
        Array.from(region.children).forEach(child => {
            const ds = (<HTMLElement>child).dataset;
            if (ds && ds.on && !(<any>child)[p_d_rules]) {
                this.parse(child as IPDTarget);
            }
        })
        if(init){
            setTimeout(() => this.addMutObs(region), 50);
        }
    }
    parse(target: IPDTarget) {
        const on = (target.dataset.on as string).split(' ');
        const rules: { [key: string]: IEventRule[] } = {};
        let rule: IEventRule;
        on.forEach(tkn => {
            const token = tkn.trim();
            if (token === '') return;
            if (token.endsWith(':')) {
                const evtName = token.substr(0, token.length - 1);
                if(!rules[evtName]) rules[evtName] = [];
                rule = {};
                rules[evtName].push(rule);
            } else {
                switch (token) {
                    case 'skip-init':
                        rule.skipInit = true;
                        break;
                    case 'recursive':
                        rule.recursive = true;
                        break;
                    default:
                        if (token.startsWith('if(')) {
                            rule.if = token.substring(3, token.length - 1);
                        } else {
                            const lhsRHS = this.toLHSRHS(token);
                            const lhs = lhsRHS.lhs;
                            switch (lhs) {
                                case pass_to:
                                case pass_to_next:
                                    rule.map = [];
                                    break;
                            }
                            const cssProp = {
                            } as ICssPropMap;
                            rule.map!.push(cssProp);
                            //let toNext = false;
                            switch (lhs) {
                                case pass_to_next:
                                case and_to_next:
                                    cssProp.max = 1;
                                    cssProp.isNext = true;
                                    break;
                            }
                            const rhs = this.parseBr(lhsRHS.rhs);
                            let vals;
                            if (!cssProp.isNext) {
                                cssProp.max = parseInt(rhs[2]);
                                vals = rhs[1];
                                cssProp.cssSelector = rhs[0];
                            } else {
                                vals = rhs[1];
                            }
                            cssProp.setProps = [];
                            vals.split(';').forEach(val => {
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
        this.initTarget(target);

    }
    initTarget(target: IPDTarget) {
        this.attchEvListnrs(target);
        //this.addMutObs(target);
    }
    _syncRangedb: any;
    addMutObs(region: IPDTarget) {
        const obs = new MutationObserver((m: MutationRecord[]) => {
            let top : IPDTarget = region;
            let hasP = false;
            //debounce(() => this.getTargets(region, false), 50);
            this._syncRangedb({region: region, r: false});
            while(top.dataset.pd === '-r'){
                hasP = true;
                top = top.parentElement as IPDTarget;
            }
            //if(hasP) debounce(() => this.syncRange(top), 50);
            if(hasP && (top !== region)) this._syncRangedb({region: top, r: true});
        });
        obs.observe(region, {
            childList: true,
            //subtree: true,
        });

    }
    attchEvListnrs(target: IPDTarget) {
        const aRules = target[p_d_rules];
        const b = this._hndEv.bind(this);
        for (const key in aRules) {
            target.addEventListener(key, b);
            const eRules = aRules[key];
            if(eRules.findIndex(rule => rule.skipInit!) > -1) continue;
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
        target.removeAttribute('disabled');

    }
    _hndEv(e: Event) {
        const ct = (e.currentTarget || e.target) as IPDTarget;
        const eRules = ct[p_d_rules][e.type];
        eRules.forEach(rule =>{
            if (rule.if && !(e.target as HTMLElement).matches(rule.if)) return;
            rule.lastEvent = e;
            // if(rule.recursive){
            //     eRules.stack = [];
            // }
            rule.map!.forEach(v => {
                v.count = 0
            });
            //this.passDown(ct, e, rule, 0, ct, null);
            this.passDown({
                start: ct,
                e: e,
                rule: rule,
                topEl: ct, 
            })
        })


    }

    // passDown(start: HTMLElement, e: Event, rule: IEventRule, count: number, topEl: IPDTarget, mutEl: IPDTarget | null) {
    passDown(p: IPassDownParams){
        let nextSib = p.start;
        while (nextSib) {
            if (nextSib.tagName !== 'SCRIPT') {
                p.rule.map!.forEach(map => {
                    if(map.max! > 0 && map.count! > map.max!) return;
                    if (map.isNext || (nextSib!.matches && nextSib!.matches(map.cssSelector))) {
                        map.count!++;
                        this.setVal(p.e, nextSib, map);
                    }
                    if(p.rule.recursive){
                        const fec = nextSib!.firstElementChild as HTMLElement;
                        const isPD = nextSib.hasAttribute(p_d);
                        if(isPD){
                            // (<IPDTarget>nextSib).__topEl = p.topEl; 
                            if(fec){
                                nextSib.dataset.pd = '-r';
                                const cl = Object.assign({}, p);
                                cl.start = fec;
                                this.passDown(cl);
                            }
                        }
                        
                    }

                })
            }
            nextSib = nextSib.nextElementSibling as HTMLElement;
        }
    }

    setVal(e: Event, target: any, map: ICssPropMap) {
        map.setProps.forEach(setProp => {
            const propFromEvent = this.getPropFromPath(e, setProp.propSource);
            this.commit(target, setProp.propTarget, propFromEvent);
        })

    }

    commit(target: HTMLElement, key: string, val: any) {
        const s = key.split('.');
        if(s.length === 1){
            (<any>target)[key] = val;
            return;
        }
        let key2 = s.pop() as string;
        let target2 = target as any;
        let isNew = false;
        switch(key2){
            case 'new()':
                isNew = true;
                key2 = s.pop() as string;
                break;
        }
        let r = s.reverse();
        let tk = r.pop();
        let f = tk as string;
        while(tk !== undefined){
            if(!target2[tk]){
                target2[tk] = {};
            }
            target2 = target2[tk];
            tk = r.pop();
        }
        target2[key2] = val;
        if(isNew){
            (<any>target)[f] = Object.assign({}, (<any>target)[f]);
        }
    }

    getPropFromPath(val: any, path: string) {
        if (!path || path === '.') return val;
        return this.getProp(val, path.split('.'));
    }
    getProp(val: any, pathTokens: string[]) {
        let context = val;
        pathTokens.forEach(token => {
            if (context) context = context[token];
        });
        return context;
    }

    

}

define(PassDown);