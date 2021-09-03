import {CE, Action, PropInfo} from 'trans-render/lib/CE.js';
import {NotifyMixin, INotifyPropInfo} from 'trans-render/lib/mixins/notify.js';
import {PassDownProps, PassDownActions, PassDownCompositeActions} from './types.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {structuralClone} from 'trans-render/lib/structuralClone.js';


type pd = PassDownActions;
const ce = new CE<PassDownProps, PassDownCompositeActions, INotifyPropInfo>();
class PassDownCore extends HTMLElement implements PassDownActions {


    doInit({observedElement, parseValAs, cloneVal, initEvent}: this){
        if(observedElement === null){
            console.error('404');
            return;
        }
        const foundInitVal = setInitVal({parseValAs, cloneVal}, this, observedElement!);
        if(!foundInitVal && initEvent){
            observedElement!.addEventListener(initEvent, e => {
                setInitVal({parseValAs, cloneVal}, this, observedElement!);
            }, {once: true});
        }
    }

    //https://web.dev/javascript-this/
    handleEvent = (e: Event) => {
        if(this.ifTargetMatches !== undefined){
            if(!(e.target as HTMLElement).matches(this.ifTargetMatches!)) return;
        }
        if(!this.filterEvent(e)) return;
        this.lastEvent = e;
    }

    parseValFromEvent(e: Event){
        const val = this.val || 'target.value';
        const valToPass = getProp(e, val.split('.'), this);
        return valToPass;        
    }

    parseInitVal(elementToObserve: Element){
        const initVal =  this.initVal;
        if(initVal === undefined) return undefined;
        return getProp(elementToObserve,initVal.split('.'), this);
    }

    valFromEvent = (e: Event) => {
        const val = this.val || 'target.value';
        let valToPass = this.parseValFromEvent(e);
        
        if(valToPass === undefined){
            const target = e.target as HTMLElement || this.observedElement;
            const attribVal = target.getAttribute(val);
            if(attribVal !== null){
                valToPass = attribVal;
            }
        }
        if(this.parseValAs){
            valToPass = convert(valToPass, (this as unknown as PassDownProps).parseValAs!);
        }
        return this.cloneVal ? structuralClone(valToPass) :  valToPass;
    }

    filterEvent(e: Event) : boolean{
        return true;
    }

    _wr: WeakRef<Element> | undefined;
    get observedElement() : Element | null{
        const element = this._wr === undefined ? undefined : this._wr?.deref(); //TODO  wait for bundlephobia to get over it's updatephobia
        if(element !== undefined){
            return element;
        }
        let elementToObserve: Element | null;
        if(this.observeHost){
            elementToObserve = (<any>this.getRootNode()).host;
        }
        else if(this.observeClosest){
            elementToObserve = this.closest(this.observeClosest);
            if(elementToObserve !== null && this.observe){
                elementToObserve = getPreviousSib(elementToObserve.previousElementSibling || elementToObserve.parentElement as HTMLElement, this.observe) as Element;
            }
        }else{
            elementToObserve = getPreviousSib(this.previousElementSibling || this.parentElement as HTMLElement, this.observe ?? null) as Element;
        }
        if(elementToObserve === null) return null;
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }

    attachEventHandler({on, _wr, previousOn, handleEvent, capture, parentElement, ifTargetMatches}: this) {
        const previousElementToObserve = this._wr?.deref();
        this._wr = undefined;
        const elementToObserve = this.observedElement;
        if(!elementToObserve) throw "Could not locate element to observe.";
        let doNudge = previousElementToObserve !== elementToObserve;
        if((previousElementToObserve !== undefined) && (previousOn !== undefined || (previousElementToObserve !== elementToObserve))){
            previousElementToObserve.removeEventListener(previousOn || on as keyof ElementEventMap, handleEvent);
        }else{
            doNudge = true;
        }
        elementToObserve.addEventListener(on!, handleEvent, {capture: capture});
        if(doNudge){
            if(elementToObserve === parentElement && ifTargetMatches !== undefined){
                elementToObserve.querySelectorAll(ifTargetMatches).forEach(publisher =>{
                    nudge(publisher);
                });
            }else{
                nudge(elementToObserve);
            }
            
        }
        this.setAttribute('status', '👂');
        this.previousOn = on;
    };



    doEvent({lastEvent, noblock, valFromEvent}: this) {
        this.setAttribute('status', '🌩️');
        if(!noblock) lastEvent!.stopPropagation();
        let valToPass = valFromEvent(lastEvent!);
        this.lastVal = valToPass;
        //holding on to lastEvent could introduce memory leak
        this.lastEvent = undefined; //wtf? why does't delete work?
        this.setAttribute('status', '👂');
    }


    setValFromTarget({valFromTarget}: this){
        const initVal = valFromTarget === '' ? 'value' : valFromTarget!;
        const val = 'target.' + initVal;
        const on = this.on === undefined ? ce.toLisp(initVal) + '-changed' : this.on;
        return {on, val, initVal};
    };
    
    setAliases(self: this){
        self.valFromTarget = self.vft;
    }
}

interface PassDownCore extends PassDownProps{}


const stringProp: PropInfo = {
    type: 'String'
};

const filters = ['isC', 'disabled'];

export const PassDown = ce.def({
    config: {
        tagName: 'pass-down',
        propDefaults:{
            isC: true,     
            disabled: false,
            enabled: true,
            debug: false,
            log: false,
            m: Infinity,
            cloneVal: false,
            noblock: false,
            observeHost: false,
        },
        propInfo:{
            disabled:{
                notify:{toggleTo:'enabled'}
            },
            lastVal:{
                dry: false,
            },
            on:stringProp, initEvent:stringProp, parseValAs: stringProp, observe: stringProp, initVal:stringProp, ifTargetMatches:stringProp,
            val:stringProp, propFromTarget:stringProp, to:stringProp, careOf:stringProp, from:stringProp, prop:stringProp, as:stringProp,
            mutateEvents:stringProp, valFromTarget:stringProp, vft:stringProp,
        },
        actions:{
            doInit:{
                ifAllOf: ['initVal', 'isC', 'enabled'],
                ifKeyIn: ['initEvent', 'parseValAs', 'cloneVal'],
            },
            attachEventHandler:{
                ifAllOf: ['isC', 'on', 'enabled'],
                ifKeyIn: ['observe', 'ifTargetMatches', 'isC', 'observeHost'],
            },
            doEvent:{
                ifAllOf: ['isC', 'lastEvent', 'enabled'],
                ifKeyIn: ['val', 'parseValAs', 'noblock'],
            },
            handleValChange:{
                ifAllOf: ['isC', 'enabled'],
                ifKeyIn: ['lastVal', 'debug', 'log', 'm', 'propFromTarget', 'to', 'careOf', 'from', 'prop', 'as', 'isC', 'enabled'],
                
            },
            attachMutationEventHandler:{
                ifAllOf: ['mutateEvents', 'isC', 'enabled'],
            },
            setValFromTarget:{
                ifAllOf: ['valFromTarget', 'isC', 'enabled'],
            },
            setAliases: {
                ifAllOf: ['vft'],
            }
        },
        style:{
            display: 'none'
        }

    },
    superclass: PassDownCore,
    mixins: [NotifyMixin]
});


function setInitVal({parseValAs, cloneVal}: Partial<PassDownProps>, self: PassDownActions & PassDownProps, elementToObserve: Element){
    let val = self.parseInitVal(elementToObserve);
    if(val === undefined) return false;
    if(parseValAs) val = convert(val, parseValAs);
    if(cloneVal) val = structuralClone(val);
    self.lastVal = val;
    return true;
}

