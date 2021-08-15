import {PassDown} from './pass-down.js';
import {define} from 'xtal-element/lib/define.js';

export class PD extends PassDown{
    static is = 'p-d';
}

define(PD);