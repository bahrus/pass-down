
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
const p_d_on = 'p-d-on';
const p_d_rules = 'p-d-rules';
const p_d_if = 'p-d-if';
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
        return s.split('{').map(t => t.endsWith('}') ? t.substr(0, t.length - 1) : t);
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
                        if (token.startsWith('if(')) {
                            console.log('TODO');
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
        setTimeout(() => this.initTarget(target), 50);
    }
    initTarget(target) {
        console.log({
            target: target,
            rules: target[p_d_rules]
        });
        this.attchEvListnrs(target);
        this.addMutObs(target);
    }
    addMutObs(target) {
        let elToObs = target.parentElement;
        if (!elToObs['__addedMutObs']) {
            const obs = new MutationObserver((m) => {
                qsa('[data-on]', elToObs).forEach(el => {
                    const rules = el[p_d_rules];
                    if (rules) {
                        for (const key in rules) {
                            const rule = rules[key];
                            if (rule.lastEvent) {
                                this._hndEv(rule.lastEvent);
                            }
                        }
                    }
                });
            });
            obs.observe(elToObs, {
                childList: true,
                subtree: true
            });
        }
    }
    attchEvListnrs(target) {
        const rules = target[p_d_rules];
        for (const key in rules) {
            const rule = rules[key];
            target.addEventListener(key, this._hndEv);
            if (!rule.skipInit) {
                const fakeEvent = {
                    type: key,
                    isFake: true,
                    detail: target.value,
                    target: target
                };
                this._hndEv(fakeEvent);
            }
        }
        target.removeAttribute('disabled');
    }
    _hndEv(e) {
        const target = e.target;
        const rule = target[p_d_rules][e.type];
        if (rule.if && !e.target.matches(rule.if))
            return;
        rule.lastEvent = e;
        this.passDown(target, e, rule, 0, target);
    }
    passDown(start, e, rule, count, original) {
        let nextSib = start;
        while (nextSib) {
            if (nextSib.tagName !== 'SCRIPT') {
                rule.map.forEach(map => {
                    if (map.isNext || (nextSib.matches && nextSib.matches(map.cssSelector))) {
                        count++;
                        this.setVal(e, nextSib, map);
                    }
                    const fec = nextSib.firstElementChild;
                    if (fec && nextSib.hasAttribute(p_d_if)) {
                        const pdIF = nextSib.getAttribute(p_d_if);
                        if (pdIF) {
                            if (original.matches(pdIF)) {
                                this.passDown(fec, e, rule, count, original);
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
        //const gpfp = this.getPropFromPath.bind(this);
        //const propFromEvent = map.propSource ? gpfp(e, map.propSource) : gpfp(e, 'detail.value') || gpfp(e, 'target.value');
    }
    commit(target, key, val) {
        target[key] = val;
    }
    getPropFromPath(val, path) {
        if (!path || path === '.')
            return val;
        return this.getProp(val, path.split('.'));
    }
    getProp(val, pathTokens) {
        let context = val;
        let firstToken = true;
        const cp = 'composedPath';
        const cp_ = cp + '_';
        pathTokens.forEach(token => {
            if (context) {
                if (firstToken && context[cp]) {
                    firstToken = false;
                    const cpath = token.split(cp_);
                    if (cpath.length === 1) {
                        context = context[cpath[0]];
                    }
                    else {
                        context = context[cp]()[parseInt(cpath[1])];
                    }
                }
                else {
                    context = context[token];
                }
            }
        });
        return context;
    }
}
define(PassDown);
    })();  
        