
    //@ts-check
    (function () {
    function define(custEl) {
    let tagName = custEl.is;
    if (customElements.get(tagName)) {
        console.warn('Already registered ' + tagName);
        return;
    }
    customElements.define(tagName, custEl);
}
function getHost(el) {
    let parent = el;
    while (parent = (parent.parentNode)) {
        if (parent.nodeType === 11) {
            return parent['host'];
        }
        else if (parent.tagName === 'BODY') {
            return null;
        }
    }
    return null;
}
function observeCssSelector(superClass) {
    const eventNames = ["animationstart", "MSAnimationStart", "webkitAnimationStart"];
    return class extends superClass {
        addCSSListener(id, targetSelector, insertListener) {
            // See https://davidwalsh.name/detect-node-insertion
            if (this._boundInsertListener)
                return;
            const styleInner = /* css */ `
            @keyframes ${id} {
                from {
                    opacity: 0.99;
                }
                to {
                    opacity: 1;
                }
            }
    
            ${targetSelector}{
                animation-duration: 0.001s;
                animation-name: ${id};
            }
            `;
            const style = document.createElement('style');
            style.innerHTML = styleInner;
            const host = getHost(this);
            if (host !== null) {
                host.shadowRoot.appendChild(style);
            }
            else {
                document.body.appendChild(style);
            }
            this._boundInsertListener = insertListener.bind(this);
            const container = host ? host.shadowRoot : document;
            eventNames.forEach(name => {
                container.addEventListener(name, this._boundInsertListener, false);
            });
            // container.addEventListener("animationstart", this._boundInsertListener, false); // standard + firefox
            // container.addEventListener("MSAnimationStart", this._boundInsertListener, false); // IE
            // container.addEventListener("webkitAnimationStart", this._boundInsertListener, false); // Chrome + Safari
        }
        disconnectedCallback() {
            if (this._boundInsertListener) {
                const host = getHost(this);
                const container = host ? host.shadowRoot : document;
                eventNames.forEach(name => {
                    container.removeEventListener(name, this._boundInsertListener);
                });
                // document.removeEventListener("animationstart", this._boundInsertListener); // standard + firefox
                // document.removeEventListener("MSAnimationStart", this._boundInsertListener); // IE
                // document.removeEventListener("webkitAnimationStart", this._boundInsertListener); // Chrome + Safari
            }
            if (super.disconnectedCallback !== undefined)
                super.disconnectedCallback();
        }
    };
}
const debounce = (fn, time) => {
    let timeout;
    return function () {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};
//const p_d_on = 'p-d-on';
const p_d_rules = 'p-d-rules';
const p_d = 'data-pd';
const pass_to = 'pass-to';
const pass_to_next = 'pass-to-next';
const and_to = 'and-to';
const and_to_next = 'and-to-next';
class PassDown extends observeCssSelector(HTMLElement) {
    static get is() { return 'pass-down'; }
    connectedCallback() {
        this.style.display = 'none';
        this._conn = true;
        this.onPropsChange();
        this._syncRangedb = debounce((srp) => this.syncRange(srp), 50);
    }
    insertListener(e) {
        if (e.animationName === PassDown.is) {
            const region = e.target;
            setTimeout(() => {
                this.getTargets(region, true);
            }, 0);
        }
    }
    onPropsChange() {
        if (!this._conn)
            return;
        this.addCSSListener(PassDown.is, `[${p_d}]`, this.insertListener);
    }
    toLHSRHS(s) {
        const pos = s.indexOf(':');
        return {
            lhs: s.substr(0, pos),
            rhs: s.substr(pos + 1),
        };
    }
    parseBr(s) {
        return s.split('{').map(t => t.endsWith('}') ? t.substr(0, t.length - 1) : t);
    }
    syncRange(srp) {
        Array.from(srp.region.children).forEach(child => {
            const ds = child.dataset;
            if (ds && ds.on) {
                const aRules = child[p_d_rules]; //allRules
                for (const rk in aRules) {
                    const eRules = aRules[rk];
                    eRules.forEach(r => {
                        if (srp.r && !r.recursive)
                            return;
                        if (r.lastEvent) {
                            this._hndEv(r.lastEvent);
                        }
                    });
                }
            }
        });
    }
    getTargets(region, init) {
        //region.__region = region.getAttribute(p_d)!;
        Array.from(region.children).forEach(child => {
            const ds = child.dataset;
            if (ds && ds.on && !child[p_d_rules]) {
                this.parse(child);
            }
        });
        if (init) {
            setTimeout(() => this.addMutObs(region), 50);
        }
    }
    parse(target) {
        const on = target.dataset.on.split(' ');
        const rules = {};
        let rule;
        on.forEach(tkn => {
            const token = tkn.trim();
            if (token === '')
                return;
            if (token.endsWith(':')) {
                const evtName = token.substr(0, token.length - 1);
                if (!rules[evtName])
                    rules[evtName] = [];
                rule = {};
                rules[evtName].push(rule);
            }
            else {
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
                        }
                        else {
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
                            }
                            else {
                                vals = rhs[1];
                            }
                            cssProp.setProps = [];
                            vals.split(';').forEach(val => {
                                const lR = this.toLHSRHS(val);
                                cssProp.setProps.push({
                                    propSource: lR.rhs,
                                    propTarget: lR.lhs
                                });
                            });
                        }
                }
            }
        });
        target[p_d_rules] = rules;
        this.initTarget(target);
    }
    initTarget(target) {
        this.attchEvListnrs(target);
        //this.addMutObs(target);
    }
    addMutObs(region) {
        const obs = new MutationObserver((m) => {
            let top = region;
            let hasP = false;
            //debounce(() => this.getTargets(region, false), 50);
            this._syncRangedb({ region: region, r: false });
            while (top.dataset.pd === '-r') {
                hasP = true;
                top = top.parentElement;
            }
            //if(hasP) debounce(() => this.syncRange(top), 50);
            if (hasP && (top !== region))
                this._syncRangedb({ region: top, r: true });
        });
        obs.observe(region, {
            childList: true,
        });
    }
    attchEvListnrs(target) {
        const aRules = target[p_d_rules];
        const b = this._hndEv.bind(this);
        for (const key in aRules) {
            target.addEventListener(key, b);
            const eRules = aRules[key];
            if (eRules.findIndex(rule => rule.skipInit) > -1)
                continue;
            const fakeEvent = {
                type: key,
                isFake: true,
                detail: {
                    value: target.value,
                },
                target: target
            };
            this._hndEv(fakeEvent);
        }
        target.removeAttribute('disabled');
    }
    _hndEv(e) {
        const ct = (e.currentTarget || e.target);
        const eRules = ct[p_d_rules][e.type];
        eRules.forEach(rule => {
            if (rule.if && !e.target.matches(rule.if))
                return;
            rule.lastEvent = e;
            // if(rule.recursive){
            //     eRules.stack = [];
            // }
            rule.map.forEach(v => {
                v.count = 0;
            });
            //this.passDown(ct, e, rule, 0, ct, null);
            this.passDown({
                start: ct,
                e: e,
                rule: rule,
                topEl: ct,
            });
        });
    }
    // passDown(start: HTMLElement, e: Event, rule: IEventRule, count: number, topEl: IPDTarget, mutEl: IPDTarget | null) {
    passDown(p) {
        let nextSib = p.start;
        while (nextSib) {
            if (nextSib.tagName !== 'SCRIPT') {
                p.rule.map.forEach(map => {
                    if (map.max > 0 && map.count > map.max)
                        return;
                    if (map.isNext || (nextSib.matches && nextSib.matches(map.cssSelector))) {
                        map.count++;
                        this.setVal(p.e, nextSib, map);
                    }
                    if (p.rule.recursive) {
                        const fec = nextSib.firstElementChild;
                        const isPD = nextSib.hasAttribute(p_d);
                        if (isPD) {
                            // (<IPDTarget>nextSib).__topEl = p.topEl; 
                            if (fec) {
                                nextSib.dataset.pd = '-r';
                                const cl = Object.assign({}, p);
                                cl.start = fec;
                                this.passDown(cl);
                            }
                        }
                    }
                });
            }
            nextSib = nextSib.nextElementSibling;
        }
    }
    setVal(e, target, map) {
        map.setProps.forEach(setProp => {
            const propFromEvent = this.getPropFromPath(e, setProp.propSource);
            this.commit(target, setProp.propTarget, propFromEvent);
        });
    }
    commit(target, key, val) {
        const s = key.split('.');
        if (s.length === 1) {
            target[key] = val;
            return;
        }
        let key2 = s.pop();
        let target2 = target;
        let isNew = false;
        switch (key2) {
            case 'new()':
                isNew = true;
                key2 = s.pop();
                break;
        }
        let r = s.reverse();
        let tk = r.pop();
        let f = tk;
        while (tk !== undefined) {
            if (!target2[tk]) {
                target2[tk] = {};
            }
            target2 = target2[tk];
            tk = r.pop();
        }
        target2[key2] = val;
        if (isNew) {
            target[f] = Object.assign({}, target[f]);
        }
    }
    getPropFromPath(val, path) {
        if (!path || path === '.')
            return val;
        return this.getProp(val, path.split('.'));
    }
    getProp(val, pathTokens) {
        let context = val;
        pathTokens.forEach(token => {
            if (context)
                context = context[token];
        });
        return context;
    }
}
define(PassDown);
    })();  
        