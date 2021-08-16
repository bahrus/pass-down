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
}

export interface PassDownProps extends PDToFrom{

    async?: boolean;

    /**
     * A Boolean indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
    */
    capture?: boolean;

    cloneVal?: boolean;

    /**
     * Artificially fire event on target element whose name is specified by this attribute.
     * @attr fire-event
     */
    fireEvent?: string;

    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches?: string;

        
    /**
     * In some cases, the initVal can only be obtained after initEvent fires
     */
    initEvent?: string;

    initVal?: string;

    isC?: boolean;

    lastEvent?: Event;

    mutateEvents?: string[];

    /**
     * Don't block event propagation.
     * @attr
     */
    noblock?: boolean;

    /**
     * Specifies element to latch on to, and listen for events.
     * Searches previous siblings, parent, previous siblings of parent, etc.
     * Stops at Shadow DOM boundary.
     * @attr
     */
    observe?: string;

    observeClosest?: string;

    observedElement?: Element | null;

    /**
    * The event name to monitor for, from previous non-petalian element.
    * @attr
    */
    on?: string;

    parseValAs?: 'int' | 'float' | 'bool' | 'date' | 'truthy' | 'falsy';  

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

    

    


}

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


}

export interface IPDMixin extends PassDownProps{}

type pd = IPassDown;
export interface IPassDown extends IPDMixin{
    attachEventHandler(self: pd): void;
    attachMutationEventHandler(self: pd): void;
    doEvent(self: pd): void;    
    handleEvent: (e: Event) => void;
    handleValChange(self: pd): void; 
    init(self: pd): void;
    parseInitVal(elementToObserve: Element): any;
    setAliases(self: pd): void;
    onInitVal(self: pd): void;
    onValFromTarget(self: pd): void;
    valFromEvent(e: Event): void;
    _wr: WeakRef<Element> | undefined; //TODO:  make private?
}