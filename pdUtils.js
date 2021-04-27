import 'mut-obs/mut-obs.js';
import { passValToMatches, passVal } from 'on-to-me/on-to-me.js';
const p_std = 'p_std';
export function getFrom(self) {
    return self.from !== undefined ? self.closest(self.from) : self;
}
export function isMatchAfterFrom(match, self) {
    const from = getFrom(self);
    if (!from)
        return false;
    let prev = match.previousElementSibling;
    while (prev != null) {
        if (prev === from)
            return true;
        prev = prev.previousElementSibling;
    }
    return false;
}
export function addDefaultMutObs(self) {
    const parent = getFrom(self)?.parentElement;
    if (parent) {
        const mutObs = document.createElement('mut-obs');
        const s = mutObs.setAttribute.bind(mutObs);
        s('dispatch', p_std);
        s('child-list', '');
        s('observe', 'parentElement');
        s('on', self.to);
        parent.appendChild(mutObs);
        mutObs.addEventListener(p_std, e => {
            e.stopPropagation();
            const mutObj = e.target;
            if (self.lastVal !== undefined) {
                const ae = e;
                const match = ae.detail.match;
                if (isMatchAfterFrom(match, self)) {
                    passValToMatches([match], self.lastVal, self.to, self.careOf, self.prop, self.as);
                }
            }
        });
    }
}
export const handleValChange = ({ lastVal, self, to, careOf, m, from, prop }) => {
    if (lastVal === undefined)
        return;
    if (self.debug) {
        debugger;
    }
    else if (self.log) {
        console.log('passVal', { lastVal, self });
    }
    const hSelf = self;
    const matches = passVal(lastVal, hSelf, to, careOf, m, from, prop, self.as);
    hSelf.setAttribute('matches', '' + matches.length);
};
export const attachMutationEventHandler = ({ mutateEvents, self }) => {
    const parentElement = self.parentElement;
    if (!parentElement)
        return;
    for (const event of mutateEvents) {
        parentElement.addEventListener(event, e => {
            if (self.lastVal !== undefined) {
                handleValChange(self);
            }
        });
    }
};
