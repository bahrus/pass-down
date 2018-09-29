const jiife = require('jiife');
const xtal = 'node_modules/xtal-latx/';
const base = [xtal + 'define.js', xtal + 'getHost.js', xtal + 'observeCssSelector.js', xtal + 'debounce.js'];
const passDown = base.concat('pass-down.js');
jiife.processFiles(passDown, 'pass-down.iife.js');