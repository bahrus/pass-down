import {CE, Action, PropInfo} from 'trans-render/lib/CE.js';
import {NotifyMixin, INotifyPropInfo} from 'trans-render/lib/mixins/notify.js';
import {PassDownProps, IPassDown, IPassDownWithIPDMixin, PassDownActions} from './types.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {structuralClone} from 'trans-render/lib/structuralClone.js';
import {PDMixin, addDefaultMutObs} from './PDMixin.js';

type pd = IPassDown;
const ce = new CE<IPassDownWithIPDMixin, INotifyPropInfo, PassDownActions>();
class PassDownCore extends HTMLElement implements IPassDown {

    connectedCallback(){
        this.style.display = 'none';
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
        if(this.observeClosest){
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

    attachEventHandler(self: this) {
        const {on, _wr, previousOn, handleEvent, capture, parentElement, ifTargetMatches} = self;
        const previousElementToObserve = _wr !== undefined ? _wr.deref() : undefined; //TODO switch to ?. when bundlephobia catches up to the 2020's.
        self._wr = undefined;
        const elementToObserve = self.observedElement;
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
        self.setAttribute('status', '👂');
        self.previousOn = on;
        addDefaultMutObs(self);
    };

    doInit(self: this) {
        const {observedElement, initEvent, parseValAs, cloneVal} = self;
        if(observedElement === null){
            console.error('404');
            return;
        }
        const foundInitVal = setInitVal({parseValAs, cloneVal}, self, observedElement!);
        if(!foundInitVal && initEvent){
            observedElement!.addEventListener(initEvent, e => {
                setInitVal({parseValAs, cloneVal}, self, observedElement!);
            }, {once: true});
        }
    };

    doEvent(self: this) {
        const {lastEvent, noblock, valFromEvent} = self;
        self.setAttribute('status', '🌩️');
        if(!noblock) lastEvent!.stopPropagation();
        let valToPass = valFromEvent(lastEvent!);
        self.lastVal = valToPass;
        //holding on to lastEvent could introduce memory leak
        delete self.lastEvent;
        self.setAttribute('status', '👂');
    }


    onValFromTarget(self: this){
        const {valFromTarget} = self;
        const valFromTargetOrValue = valFromTarget === '' ? 'value' : valFromTarget!;
        self.initVal = valFromTargetOrValue;
        self.val = 'target.' + valFromTargetOrValue;
        if(self.on === undefined) self.on = ce.toLisp(valFromTargetOrValue) + '-changed';
    };
    
    setAliases(self: this){
        self.valFromTarget = self.vft;
    }
}

interface PassDownCore extends PassDownProps{}


const defaultFilters: Partial<Action<pd>> = {
    ifAllOf: ['isC', 'enabled'],
}

const stringProp: PropInfo = {
    type: 'String'
};

const filters = ['isC', 'disabled'];

export const PassDown: {new(): IPassDownWithIPDMixin} = ce.def({
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
        },
        propInfo:{
            disabled:{
                notify:{toggleTo:'enabled'}
            },
            on:stringProp, initEvent:stringProp, parseValAs: stringProp, observe: stringProp, initVal:stringProp, ifTargetMatches:stringProp,
            val:stringProp, propFromTarget:stringProp, to:stringProp, careOf:stringProp, from:stringProp, prop:stringProp, as:stringProp,
            mutateEvents:stringProp, valFromTarget:stringProp, vft:stringProp,
        },
        actions:{
            doInit:{
                ifAllOf: ['initVal', 'initEvent', 'parseValAs', 'cloneVal', 'isC', 'enabled'],
                ...defaultFilters
            },
            attachEventHandler:{
                ifAnyOf: ['on', 'observe', 'ifTargetMatches', 'isC', 'enabled'],
                ifAllOf: ['isC', 'on', 'enabled'],
            },
            doEvent:{
                ifAnyOf: ['val', 'parseValAs', 'noblock', 'lastEvent', 'isC', 'enabled'],
                ifAllOf: ['isC', 'lastEvent', 'enabled'],
            },
            handleValChange:{
                ifAnyOf: ['lastVal', 'debug', 'log', 'm', 'propFromTarget', 'to', 'careOf', 'from', 'prop', 'as', 'isC', 'enabled'],
                ifAllOf: ['isC', 'lastVal', 'enabled'],
            },
            attachMutationEventHandler:{
                ifAllOf: ['mutateEvents', 'isC', 'enabled'],
            },
            onValFromTarget:{
                ifAllOf: ['valFromTarget', 'isC', 'enabled'],
            },
            setAliases: {
                ifAllOf: ['vft'],
            }
        }

    },
    superclass: PassDownCore,
    mixins: [NotifyMixin, PDMixin]
});


function setInitVal({parseValAs, cloneVal}: Partial<pd>, self: IPassDown, elementToObserve: Element){
    let val = self.parseInitVal(elementToObserve);
    if(val === undefined) return false;
    if(parseValAs) val = convert(val, parseValAs);
    if(cloneVal) val = structuralClone(val);
    self.lastVal = val;
    return true;
}

