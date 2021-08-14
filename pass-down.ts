import {define, Action, PropInfo, camelToLisp} from 'liquid-xtal/define.js';
import {PassDownProps} from './types.js';
import {getPreviousSib, passVal, nudge, getProp, convert} from 'on-to-me/on-to-me.js';
import {structuralClone} from 'xtal-element/lib/structuralClone.js';
import {PDMixin, addDefaultMutObs} from './PDMixin.js';

export class PassDownMixin {

    init(){
        this.style.display = 'none';
    }
    //https://web.dev/javascript-this/
    handleEvent = (e: Event) => {
        if((this as unknown as PassDownProps).ifTargetMatches !== undefined){
            if(!(e.target as HTMLElement).matches((this as unknown as PassDownProps).ifTargetMatches!)) return;
        }
        if(!this.filterEvent(e)) return;
        (this as unknown as PassDownProps).lastEvent = e;
    }

    parseValFromEvent(e: Event){
        const val = this.val || 'target.value';
        const valToPass = getProp(e, val.split('.'), this);
        return valToPass;        
    }

    parseInitVal(elementToObserve: Element){
        const initVal =  (this as unknown as PassDownProps).initVal;
        if(initVal === undefined) return undefined;
        return getProp(elementToObserve,initVal.split('.'), this);
    }

    valFromEvent(e: Event){
        const val = this.val || 'target.value';
        let valToPass = this.parseValFromEvent(e);
        
        if(valToPass === undefined){
            const target = e.target as HTMLElement || this.observedElement;
            const attribVal = target.getAttribute(val);
            if(attribVal !== null){
                valToPass = attribVal;
            }
        }
        if(this.parseValAs !== undefined){
            valToPass = convert(valToPass, (this as unknown as PassDownProps).parseValAs!);
        }
        return (this as unknown as PassDownProps).cloneVal ? structuralClone(valToPass) :  valToPass;
    }

    filterEvent(e: Event) : boolean{
        return true;
    }

    _wr: WeakRef<Element> | undefined;
    get observedElement() : Element | null{
        const element = this._wr?.deref();
        if(element !== undefined){
            return element;
        }
        let elementToObserve: Element | null;
        if(this.observeClosest !== undefined){
            elementToObserve = this.closest(this.observeClosest);
            if(elementToObserve !== null && this.observe !== undefined){
                elementToObserve = getPreviousSib(elementToObserve.previousElementSibling || elementToObserve.parentElement as HTMLElement, this.observe) as Element;
            }
        }else{
            elementToObserve = getPreviousSib(this.previousElementSibling || this.parentElement as HTMLElement, this.observe ?? null) as Element;
        }
        if(elementToObserve === null) return null;
        this._wr = new WeakRef(elementToObserve);
        return elementToObserve;
    }

    attachEventHandler(self: PD) {
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

    onInitVal(self: PD) {
        const {observedElement, initEvent, parseValAs, cloneVal} = self;
        if(observedElement === null){
            console.error('404');
            return;
        }
        const foundInitVal = setInitVal({parseValAs, cloneVal}, self, observedElement);
        if(!foundInitVal && initEvent !== undefined){
            observedElement.addEventListener(initEvent, e => {
                setInitVal({parseValAs, cloneVal}, self, observedElement);
            }, {once: true});
        }
    };

    doEvent(self: PD) {
        const {lastEvent, noblock, valFromEvent} = self;
        self.setAttribute('status', '🌩️');
        if(!noblock) lastEvent!.stopPropagation();
        let valToPass = valFromEvent(lastEvent!);
        self.lastVal = valToPass;
        //holding on to lastEvent could introduce memory leak
        delete self.lastEvent;
        self.setAttribute('status', '👂');
    }

    handleValChange(self: PD){
        const {lastVal, prop, debug, log, propFromTarget, to, careOf, m, from, as} = self;
        if(debug){
            debugger;
        }else if(log){
            console.log('passVal', {lastVal, self});
        }
        let dynProp = prop;
        if(propFromTarget !== undefined){
            dynProp = getProp(self.observedElement, propFromTarget.split('.'), self);
        }
        const matches = passVal(lastVal, self, to, careOf, m, from, dynProp, as);
        self.setAttribute('matches', '' + matches.length);
        
    }

    attachMutationEventHandler(self: PD){
        const {parentElement, mutateEvents} = self;
        if(!parentElement) return;
        for(const event of mutateEvents!){
            parentElement.addEventListener(event, e => {
                if(self.lastVal !== undefined){
                    self.handleValChange(self);
                }
            })
        }
    };

    onValFromTarget(self: PD){
        const {valFromTarget} = self;
        const valFromTargetOrValue = valFromTarget === '' ? 'value' : valFromTarget!;
        self.initVal = valFromTargetOrValue;
        self.val = 'target.' + valFromTargetOrValue;
        if(self.on === undefined) self.on = camelToLisp(valFromTargetOrValue) + '-changed';
    };
    
    setAliases(self: PD){
        self.valFromTarget = self.vft;
    }
}

export interface PassDownMixin extends PDMixin, PassDownProps{}

const disabledFilter: Partial<Action<PassDownMixin>> = {
    rift: ['disabled']
};

const defaultFilters: Partial<Action<PassDownMixin>> = {
    riff: ['isC'],
    ...disabledFilter,
}

const isStringProp: PropInfo = {
    type: 'String'
};

const filters = ['isC', 'disabled'];

export const PassDown = define<PassDownMixin>({
    config: {
        tagName: 'pass-down',
        initMethod: 'init',
        initPropMerge:{
            isC: true,
            disabled: false,
            debug: false,
            log: false,
            m: Infinity,
            cloneVal: false,
            noblock: false,
        },
        actions:[
            {
                do: 'onInitVal',
                upon: [
                    'initVal', isStringProp, 'initEvent', isStringProp, 'parseValAs', isStringProp, 'cloneVal',
                    ...filters
                ],
                ...defaultFilters
            },{
                do: 'attachEventHandler',
                upon: [
                    'on', isStringProp, 'observe', isStringProp, 'ifTargetMatches', isStringProp,
                    ...filters
                ],
                riff: ['isC', 'on'],
                ...disabledFilter,
            },{
                do: 'doEvent',
                upon: [
                    'val', isStringProp, 'parseValAs', isStringProp, 
                    'noblock', 'lastEvent', 
                    ...filters
                ],
                riff: ['isC', 'lastEvent'],
                ...disabledFilter
            },{
                do: 'handleValChange',
                upon: [
                    'lastVal', 'debug', 'log', 'm',
                    'propFromTarget', isStringProp, 'to', isStringProp, 'careOf', isStringProp, 'from', isStringProp, 'prop', isStringProp,
                    ...filters
                ], 
                riff: ['isC', 'lastVal'],
                ...disabledFilter
            },{
                do: 'attachMutationEventHandler',
                upon: [
                    'mutateEvents', isStringProp,
                    ...filters
                ],
                riff: ['isC', 'mutateEvents'],
                ...disabledFilter
            },{
                do: 'onValFromTarget',
                upon: [
                    'valFromTarget', isStringProp,
                    ...filters
                ],
                riff: ['isC', 'onValFromTarget'],
                ...disabledFilter
            },{
                do: 'setAliases',
                upon: [
                    'vft', isStringProp
                ],
                riff: ['vft']
            }
            
        ]
    },
    mixins: [PassDownMixin]
}) as any as PassDownMixin;


function setInitVal({parseValAs, cloneVal}: Partial<PD>, self: PD, elementToObserve: Element){
    let val = self.parseInitVal(elementToObserve);
    if(val === undefined) return false;
    if(parseValAs !== undefined) val = convert(val, parseValAs);
    if(cloneVal) val = structuralClone(val);
    self.lastVal = val;
    return true;
}

type PD = PassDownMixin;

export interface PassDownMixin extends PassDownProps{}