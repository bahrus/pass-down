import { IXtalTestRunner, IXtalTestRunnerOptions } from 'xtal-test/index.js';
const xt = require('xtal-test/index') as IXtalTestRunner;
const test = require('tape');
import { Page } from "puppeteer"; //typescript
import { Test } from "tape";
async function customTests(page: Page) {
    await page.waitFor(1000);
    const hyper = await page.$eval('a', (a: any) => a.click());
    await page.waitFor(1000);
    const spanText = await page.$eval('span', (s: any) => s.innerText);
    const TapeTestRunner = {
        test: test
    } as Test;
    TapeTestRunner.test('testing dev.html', (t: any) => {
        t.equal(spanText, 'i am here');
        t.end();
    });

}

(async () => {
    await xt.runTests({
        path: 'demo/dev.iife.html'
    }, customTests);
})();