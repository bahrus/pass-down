import {asAttr} from 'on-to-me/types.js';
import {PD} from './p-d.js';

export interface PDToFrom extends HTMLElement{
    /**
     * css pattern to match for from downstream siblings.
     * @attr
     */
    to?: string | undefined;

    /**
     * Find the closest ancestor matching this css pattern.
     * Use that as the base element to pass down the value from.
     * @attr
     */
    from?: string | undefined;

    /**
     * @private
     */
    lastVal?: any;

    /**
     * CSS Selector to use to select single child within the destination element.
     * @attr care-of
     * 
     */
    careOf?: string | undefined;

    /**
     * Name of property to set on matching (downstream) siblings.
     * @attr
     */
    prop?: string | undefined;

    /**
     * Pass value to an attribute
     * @attr as-attr
     */
    as?: asAttr | undefined;

    mutateEvents?: string[] | undefined;

    self: PDToFrom;

    /**
     * Add runtime breakpoints at critical points
     * @attr
     */
    debug?: boolean | undefined;

    /**
     * Add console.logs at critical points
     * @attr
     */
    log?: boolean | undefined;

    /**
     * Maximum number of elements to search for
     * @attr
     */
    m?: number | undefined;
}

export interface PassDownProps extends PDToFrom{
    self: PD;
    /**
    * The event name to monitor for, from previous non-petalian element.
    * @attr
    */
    on?: string | undefined;

    /**
     * Don't block event propagation.
     * @attr
     */
    noblock?: boolean | undefined;

    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches: string | undefined;



    /**
     * Dynamically determined name of property to set on matching (downstream) siblings from event object.
     * @attr prop-from-event
     */
    propFromEvent: string | undefined;
    
    /**
     * Specifies path to JS object from event, that should be passed to downstream siblings.  Value of '.' passes entire entire object.
     * @attr
     */
    val: string | undefined;
    
    /**
     * Specifies element to latch on to, and listen for events.
     * Searches previous siblings, parent, previous siblings of parent, etc.
     * Stops at Shadow DOM boundary.
     * @attr
     */
    observe: string | undefined;
    
    /**
     * Artificially fire event on target element whose name is specified by this attribute.
     * @attr fire-event
     */
    fireEvent: string | undefined;

    initVal: string | undefined;
    
    /**
     * In some cases, the initVal can only be obtained after initEvent fires
     */
    initEvent: string | undefined;


    async: boolean | undefined;

    parseValAs: 'int' | 'float' | 'bool' | 'date' | 'truthy' | 'falsy' | undefined;  
    
    /**
     * A Boolean indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
    */
    capture: boolean | undefined;

    previousOn: string | undefined;

    lastEvent: Event | undefined;

    

    

    cloneVal: boolean | undefined;



    mutateEvents: string[] | undefined;

    valFromTarget: string | undefined;
}

export interface PassDownExtProps extends PassDownProps{
    valFilter: string;
}