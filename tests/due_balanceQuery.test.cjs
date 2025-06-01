const fs = require('fs');
const path = require('path');
const assert = require('assert');

const filePath = path.join(__dirname, '..', 'server', 'routes', 'due_balance.js');
const content = fs.readFileSync(filePath, 'utf8');

const distinctPattern = /SELECT\s+DISTINCT\s+b\.id,\s*b\.amount/i;
const sumPattern = /SUM\(distinct_bills\.amount\)/i;

assert.ok(distinctPattern.test(content), 'Query should select DISTINCT bill IDs');
assert.ok(sumPattern.test(content), 'Query should sum from distinct set');

console.log('All due_balance query tests passed.');

