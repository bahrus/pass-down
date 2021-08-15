import {PassDown} from './pass-down.js';
import {def} from 'trans-render/lib/def.js';

export class PD extends PassDown{
    static is = 'p-d';
}

def(PD);