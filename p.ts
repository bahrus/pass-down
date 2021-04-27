import {PassDownProps} from './types.d.js';
export function getFrom(self: PassDownProps){
    return self.from !== undefined ? self.closest(self.from) : self
}

export function isMatchAfterFrom(match: Element, self: PassDownProps){
    const from = getFrom(self);
    if(!from) return false;
    let prev = match.previousElementSibling;
    while(prev != null){
        if(prev === from) return true;
        prev = prev.previousElementSibling;
    }
    return false;
}