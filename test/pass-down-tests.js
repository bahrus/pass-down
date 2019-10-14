const xt = require('xtal-test/index');
const test = require('tape');
async function customTests(page) {
    await page.waitFor(1000);
    const hyper = await page.$eval('a', (a) => a.click());
    await page.waitFor(1000);
    const spanText = await page.$eval('span', (s) => s.innerText);
    const TapeTestRunner = {
        test: test
    };
    TapeTestRunner.test('testing dev.html', (t) => {
        t.equal(spanText, 'i am here');
        t.end();
    });
}
(async () => {
    await xt.runTests({
        path: 'demo/dev.iife.html'
    }, customTests);
})();
