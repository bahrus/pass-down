
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
        setTimeout(() => this.initTarget(target, rules), 50);
    }
    initTarget(target, rules) {
        console.log({
            target: target,
            rules: rules
        });
        this.attchEvListnrs(target, rules);
    }
    attchEvListnrs(target, rules) {
        for (const key in rules) {
            const rule = rules[key];
            target.addEventListener(key, (e) => {
                this._hndEv(key, e, rule, target);
            });
            if (!rule.skipInit) {
                const fakeEvent = {
                    isFake: true,
                    detail: target.value,
                    target: target
                };
                this._hndEv(key, fakeEvent, rule, target);
            }
        }
        target.removeAttribute('disabled');
    }
    _hndEv(key, e, rule, target) {
        //if(this.hasAttribute('debug')) debugger;
        //if(!e) return;
        //if(e.stopPropagation && !this._noblock) e.stopPropagation();
        if (rule.if && !e.target.matches(rule.if))
            return;
        rule.lastEvent = e;
        this.passDown(target.nextElementSibling, e, rule, 0);
    }
    passDown(start, e, rule, count) {
        let nextSib = start;
        while (nextSib) {
            if (nextSib.tagName !== 'SCRIPT') {
                rule.map.forEach(map => {
                    if (map.isNext || (nextSib.matches && nextSib.matches(map.cssSelector))) {
                        count++;
                        this.setVal(e, nextSib, map);
                    }
                    const fec = nextSib.firstElementChild;
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
                });
            }
            //if (rule. && count >= this._m) break;
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
        