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
            `;const host=getHost(this);if(null!==host){host.shadowRoot.appendChild(style)}else{document.body.appendChild(style)}this._boundInsertListener=insertListener.bind(this);const container=host?host.shadowRoot:document;eventNames.forEach(name=>{container.addEventListener(name,this._boundInsertListener,!1)})}disconnectedCallback(){if(this._boundInsertListener){const host=getHost(this),container=host?host.shadowRoot:document;eventNames.forEach(name=>{container.removeEventListener(name,this._boundInsertListener)})}if(super.disconnectedCallback!==void 0)super.disconnectedCallback()}}}const pass_to_next="pass-to-next";class PassDown extends observeCssSelector(HTMLElement){static get is(){return"pass-down"}connectedCallback(){this.style.display="none";this._conn=!0;this.onPropsChange()}insertListener(e){if(e.animationName===PassDown.is){const target=e.target;setTimeout(()=>{this.parse(target)},0)}}onPropsChange(){if(!this._conn)return;this.addCSSListener(PassDown.is,"[data-on]",this.insertListener)}toLHSRHS(s){const pos=s.indexOf(":");return{lhs:s.substr(0,pos),rhs:s.substr(pos+1)}}parseBr(s){return s.split("}").map(t=>t.substr(1))}parse(target){console.log(target);const on=target.dataset.on.split(" "),rules={};let rule;on.forEach(tkn=>{const token=tkn.trim();if(""===token)return;if(token.endsWith(":")){rule={};rules[token.substr(0,token.length-1)]=rule}else{switch(token){case"skip-init":rule.skipInit=!0;break;default:const lhsRHS=this.toLHSRHS(token),lhs=lhsRHS.lhs;switch(lhs){case"pass-to":case pass_to_next:rule.map=[];break;}const cssProp={};rule.map.push(cssProp);switch(lhs){case pass_to_next:case"and-to-next":cssProp.max=1;break;}}}})}}(function(custEl){let tagName=custEl.is;if(customElements.get(tagName)){console.warn("Already registered "+tagName);return}customElements.define(tagName,custEl)})(PassDown)})();