import {asAttr} from 'on-to-me/types.js';
import {PD} from './p-d.js';

export interface PDToFrom extends HTMLElement{
    /**
     * css pattern to match for from downstream siblings.
     * @attr
     */
    to?: string;

    /**
     * Find the closest ancestor matching this css pattern.
     * Use that as the base element to pass down the value from.
     * @attr
     */
    from?: string;

    /**
     * @private
     */
    lastVal?: any;

    /**
     * CSS Selector to use to select single child within the destination element.
     * @attr care-of
     * 
     */
    careOf?: string;

    /**
     * Name of property to set on matching (downstream) siblings.
     * @attr
     */
    prop?: string;

    /**
     * Pass value to an attribute
     * @attr as-attr
     */
    as?: asAttr;

    mutateEvents?: string[];

    /**
     * Add runtime breakpoints at critical points
     * @attr
     */
    debug?: boolean;

    /**
     * Add console.logs at critical points
     * @attr
     */
    log?: boolean;

    /**
     * Maximum number of elements to search for
     * @attr
     */
    m?: number;

    disabled?: boolean;

    enabled?: boolean;

    
}

export interface PassDownProps extends PDToFrom{

    async?: boolean;

    cloneVal?: boolean;

    /**
     * Artificially fire event on target element whose name is specified by this attribute.
     * @attr fire-event
     */
    fireEvent?: string;

        
    /**
     * In some cases, the initVal can only be obtained after initEvent fires
     */
    initEvent?: string;

    initVal?: string;

    initDelay?: number;

    isC?: boolean;

    lastEvent?: Event;

    mutateEvents?: string[];

    parseValAs?: 'int' | 'float' | 'bool' | 'date' | 'truthy' | 'falsy' | '' | 'string' | 'object';  

    previousOn?: string;

    /**
     * Dynamically determined name of property to set on matching (downstream) siblings from target.
     * @attr prop-from-target
     */
    propFromTarget?: string;
    
    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    val?: string;

    

    //valFromEvent?: string;

    valFromTarget?: string;

    vft?: string;

    _wr: WeakRef<Element> | undefined; //TODO:  make private?

    trueVal: string;
    falseVal: string;
    cnt:number;

}

// export interface PassDownActions {
//     doInit(self: this): void;
//     doEvent(self: this): void;
//     setValFromTarget(self: this): void;
//     setAliases(self: this): void;
//     attachEventHandler(self: this): void;
// }

export interface PassDown extends PassDownProps{

}

export interface PassDownExtProps extends PassDownProps{
    /**
     * @prop {string} [valFilter] - JSONPath expression
     * @attr {string} [val-filter] - JSONPath expression
     */
    valFilter?: string;
    /**
     * Id within the ShadowDOM Realm of p-d-x of a script tag.
     * The script tag is expected to have a property path where a custom filter function is specified.
     * This custom filter function is applied to the value.
     */
    valFilterScriptId?: string;
    /**
     * @prop {string} [valFilterScriptPropPath=] - Property path from the script tag, where custom filter function can be obtained.
     */
    valFilterScriptPropPath?: string;

    closestWeakMapKey?: string;

    addMutObs?: boolean;


}

export interface PDMixinActions {
    handleValChange(self: IPDMixin): void;
    attachMutationEventHandler(self: IPDMixin): void;
}

export interface IPDMixin extends PassDownProps, PDMixinActions{}

export interface PassDownCompositeActions extends PDMixinActions, PassDownActions{}

type pd = PassDownActions;
export interface PassDownActions{
    doEvent(self: this): void;    
    parseInitVal(elementToObserve: Element): any;
    setAliases(self: this): void;
    doInit(self: this): void;
    setValFromTarget(self: this): void;
    valFromEvent(e: Event): void;
    parseValFromEvent(e: Event): any;
    onFromProp(initVal: string): string;
}

// export interface IPassDownWithIPDMixin extends Pass, IPDMixin{}