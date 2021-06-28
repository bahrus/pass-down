import {PD} from './p-d.js';

/**
 * @element p-d
 */
export class PDDoc extends PD{
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
}