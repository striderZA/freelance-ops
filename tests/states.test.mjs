import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const statesPath = join(__dirname, '..', 'templates', 'states.yml');

test('states.yml has 14 states total', () => {
  const content = readFileSync(statesPath, 'utf8');
  const matches = content.match(/- name: /g) || [];
  assert.equal(matches.length, 14, `expected 14 states, found ${matches.length}`);
});

test('states.yml includes all 10 main pipeline states', () => {
  const content = readFileSync(statesPath, 'utf8');
  const required = ['New','Qualified','Proposed','Negotiating','Contracted',
                    'In Progress','Delivered','Invoiced','Paid','Reviewed'];
  for (const s of required) {
    assert.match(content, new RegExp(`- name: ${s.replace(/ /g, ' ')}\\b`), `missing state: ${s}`);
  }
});

test('states.yml includes all 4 terminal states', () => {
  const content = readFileSync(statesPath, 'utf8');
  for (const s of ['Rejected','Ghosted','Withdrew','Disputed']) {
    assert.match(content, new RegExp(`- name: ${s}\\b`), `missing state: ${s}`);
  }
});
