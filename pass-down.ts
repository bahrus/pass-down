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
    if?:string;
    lastEvent?: Event;
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
        return s.split('{').map(t => t.endsWith('}') ? t.substr(0, t.length - 1) : t);
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
        setTimeout(() => this.initTarget(target, rules), 50);
    }
    initTarget(target:HTMLElement, rules: {[key: string] : IEventRule}){
        console.log({
            target: target,
            rules: rules
        })
        this.attchEvListnrs(target, rules);
    }
    attchEvListnrs(target: HTMLElement, rules: {[key: string] : IEventRule}){
        for(const key in rules){
            const rule = rules[key];
            target.addEventListener(key, (e: Event) =>{
                this._hndEv(key, e, rule, target);
            });
            if(!rule.skipInit){
                const fakeEvent = {
                    isFake: true,
                    detail: (<any>target).value,
                    target: target
                };
                this._hndEv(key, (<any>fakeEvent) as Event, rule, target);
            }
        }
        target.removeAttribute('disabled');

    }
    _hndEv(key: string, e: Event, rule: IEventRule, target:HTMLElement){
        //if(this.hasAttribute('debug')) debugger;
        //if(!e) return;
        //if(e.stopPropagation && !this._noblock) e.stopPropagation();
        if(rule.if && !(e.target as HTMLElement).matches(rule.if)) return;
        rule.lastEvent = e;
        this.passDown(target.nextElementSibling as HTMLElement, e, rule, 0)
        
    }

    passDown(start: HTMLElement | null, e: Event, rule: IEventRule, count: number) {
        let nextSib = start;
        while (nextSib) {
            if (nextSib.tagName !== 'SCRIPT') {
                rule.map!.forEach(map => {
                    if (map.isNext || (nextSib!.matches && nextSib!.matches(map.cssSelector))) {
                        count++;
                        this.setVal(e, nextSib, map)
                    }
                    const fec = nextSib!.firstElementChild as HTMLElement;
                    // if (this.id && fec && nextSib!.hasAttribute(p_d_if)) {
                    //     //if(!nextSibling[PDIf]) nextSibling[PDIf] = JSON.parse(nextSibling.getAttribute(p_d_if));
                    //     if (this.matches(nextSib!.getAttribute(p_d_if) as string)) {
                    //         this.passDown(fec, e, count);
                    //         let addedSMOTracker = (<any>nextSib)[_addedSMO];
                    //         if (!addedSMOTracker) addedSMOTracker = (<any>nextSib)[_addedSMO] = {};
                    //         if (!addedSMOTracker[this.id]) {
                    //             if (nextSib !== null) this.addMutObs(nextSib, true);
                    //             (<any>nextSib)[_addedSMO][this.id] = true;
                    //         }
                    //     }

                    // }
                })
            }
            //if (rule. && count >= this._m) break;
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