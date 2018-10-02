(function(){function getHost(el){let parent=el;while(parent=parent.parentNode){if(11===parent.nodeType){return parent.host}else if("BODY"===parent.tagName){return null}}return null}function observeCssSelector(superClass){const eventNames=["animationstart","MSAnimationStart","webkitAnimationStart"];return class extends superClass{addCSSListener(id,targetSelector,insertListener){if(this._boundInsertListener)return;const style=document.createElement("style");style.innerHTML=`
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
            `;const host=getHost(this);if(null!==host){host.shadowRoot.appendChild(style)}else{document.body.appendChild(style)}this._boundInsertListener=insertListener.bind(this);const container=host?host.shadowRoot:document;eventNames.forEach(name=>{container.addEventListener(name,this._boundInsertListener,!1)})}disconnectedCallback(){if(this._boundInsertListener){const host=getHost(this),container=host?host.shadowRoot:document;eventNames.forEach(name=>{container.removeEventListener(name,this._boundInsertListener)})}if(super.disconnectedCallback!==void 0)super.disconnectedCallback()}}}const debounce=(fn,time)=>{let timeout;return function(){clearTimeout(timeout);timeout=setTimeout(()=>fn.apply(this,arguments),time)}},p_d_rules="p-d-rules",p_d="data-pd",pass_to_next="pass-to-next";class PassDown extends observeCssSelector(HTMLElement){static get is(){return"pass-down"}connectedCallback(){this.style.display="none";this._conn=!0;this.onPropsChange();this._syncRangedb=debounce(srp=>this.syncRange(srp),50)}insertListener(e){if(e.animationName===PassDown.is){const region=e.target;setTimeout(()=>{this.getTargets(region,!0)},0)}}onPropsChange(){if(!this._conn)return;this.addCSSListener(PassDown.is,`[${p_d}]`,this.insertListener)}toLHSRHS(s){const pos=s.indexOf(":");return{lhs:s.substr(0,pos),rhs:s.substr(pos+1)}}parseBr(s){return s.split("{").map(t=>t.endsWith("}")?t.substr(0,t.length-1):t)}syncRange(srp){Array.from(srp.region.children).forEach(child=>{const ds=child.dataset;if(ds&&ds.on){const aRules=child[p_d_rules];for(const rk in aRules){const eRules=aRules[rk];eRules.forEach(r=>{if(srp.r&&!r.recursive)return;if(r.lastEvent){this._hndEv(r.lastEvent)}})}}})}getTargets(region,init){Array.from(region.children).forEach(child=>{const ds=child.dataset;if(ds&&ds.on&&!child[p_d_rules]){this.parse(child)}});if(init){setTimeout(()=>this.addMutObs(region),50)}}parse(target){const on=target.dataset.on.split(" "),rules={};let rule;on.forEach(tkn=>{const token=tkn.trim();if(""===token)return;if(token.endsWith(":")){const evtName=token.substr(0,token.length-1);if(!rules[evtName])rules[evtName]=[];rule={};rules[evtName].push(rule)}else{switch(token){case"skip-init":rule.skipInit=!0;break;case"recursive":rule.recursive=!0;break;default:if(token.startsWith("if(")){rule.if=token.substring(3,token.length-1)}else{const lhsRHS=this.toLHSRHS(token),lhs=lhsRHS.lhs;switch(lhs){case"pass-to":case pass_to_next:rule.map=[];break;}const cssProp={};rule.map.push(cssProp);switch(lhs){case pass_to_next:case"and-to-next":cssProp.max=1;cssProp.isNext=!0;break;}const rhs=this.parseBr(lhsRHS.rhs);let vals;if(!cssProp.isNext){cssProp.max=parseInt(rhs[2]);vals=rhs[1];cssProp.cssSelector=rhs[0]}else{vals=rhs[1]}cssProp.setProps=[];vals.split(";").forEach(val=>{const lR=this.toLHSRHS(val);cssProp.setProps.push({propSource:lR.rhs,propTarget:lR.lhs})})}}}});target[p_d_rules]=rules;this.initTarget(target)}initTarget(target){this.attchEvListnrs(target)}addMutObs(region){const obs=new MutationObserver(()=>{let top=region,hasP=!1;this._syncRangedb({region:region,r:!1});while("-r"===top.dataset.pd){hasP=!0;top=top.parentElement}if(hasP&&top!==region)this._syncRangedb({region:top,r:!0})});obs.observe(region,{childList:!0})}attchEvListnrs(target){const aRules=target[p_d_rules],b=this._hndEv.bind(this);for(const key in aRules){target.addEventListener(key,b);const eRules=aRules[key];if(-1<eRules.findIndex(rule=>rule.skipInit))continue;const fakeEvent={type:key,isFake:!0,detail:{value:target.value},target:target};this._hndEv(fakeEvent)}target.removeAttribute("disabled")}_hndEv(e){const ct=e.currentTarget||e.target,eRules=ct[p_d_rules][e.type];eRules.forEach(rule=>{if(rule.if&&!e.target.matches(rule.if))return;rule.lastEvent=e;rule.map.forEach(v=>{v.count=0});this.passDown({start:ct,e:e,rule:rule,topEl:ct})})}passDown(p){let nextSib=p.start;while(nextSib){if("SCRIPT"!==nextSib.tagName){p.rule.map.forEach(map=>{if(0<map.max&&map.count>map.max)return;if(map.isNext||nextSib.matches&&nextSib.matches(map.cssSelector)){map.count++;this.setVal(p.e,nextSib,map)}if(p.rule.recursive){const fec=nextSib.firstElementChild,isPD=nextSib.hasAttribute(p_d);if(isPD){if(fec){nextSib.dataset.pd="-r";const cl=Object.assign({},p);cl.start=fec;this.passDown(cl)}}}})}nextSib=nextSib.nextElementSibling}}setVal(e,target,map){map.setProps.forEach(setProp=>{const propFromEvent=this.getPropFromPath(e,setProp.propSource);this.commit(target,setProp.propTarget,propFromEvent)})}commit(target,key,val){target[key]=val}getPropFromPath(val,path){if(!path||"."===path)return val;return this.getProp(val,path.split("."))}getProp(val,pathTokens){let context=val;pathTokens.forEach(token=>{if(context)context=context[token]});return context}}(function(custEl){let tagName=custEl.is;if(customElements.get(tagName)){console.warn("Already registered "+tagName);return}customElements.define(tagName,custEl)})(PassDown)})();