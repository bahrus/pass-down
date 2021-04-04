import {asAttr} from 'on-to-me/types.d.js';

export class P extends HTMLElement {

    /**
     * The event name to monitor for, from previous non-petalian element.
     * @attr
     */
    on: string | undefined;

    /**
     * css pattern to match for from downstream siblings.
     * @attr
     */
    to: string | undefined;

    /**
     * CSS Selector to use to select single child within the destination element.
     * @attr care-of
     * 
     */
    careOf: string | undefined;

    /**
     * Don't block event propagation.
     * @attr
     */
    noblock: boolean | undefined;

    /**
     * Only act on event if target element css-matches the expression specified by this attribute.
     * @attr
     */
    ifTargetMatches: string | undefined;

    /**
     * Name of property to set on matching (downstream) siblings.
     * @attr
     */
    prop: string | undefined;

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
    
    // /**
    //  * Don't raise a "fake" event when attaching to element.
    //  * @attr skip-init
    //  */
    // skipInit: boolean | undefined;
    
    debug!: boolean;

    log!: boolean;

    async!: boolean;

    parseValAs: 'int' | 'float' | 'bool' | 'date' | 'truthy' | 'falsy' | undefined;  
    
    /**
     * A Boolean indicating that events of this type will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
    */
    capture!: boolean;

    previousOn: string | undefined;

    lastEvent: Event | undefined;

    lastVal: any;

    as: asAttr;

    cloneVal: boolean | undefined;


}
