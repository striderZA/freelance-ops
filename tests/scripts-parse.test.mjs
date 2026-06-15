import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const repoRoot = import.meta.dirname.replace(/[\\/]+tests$/, '');

test('reserve-report-num.mjs runs without error and prints a slot number', () => {
  const result = execFileSync('node', [join(repoRoot, 'reserve-report-num.mjs')], { encoding: 'utf8' });
  assert.match(result.trim(), /^\d{1,3}$/, 'should print a single zero-padded number');
});

test('tracker-links.mjs runs without error (smoke test)', () => {
  // The script exports a function; running it directly is a no-op with no side effects.
  // This guards against syntax errors and broken imports.
  execFileSync('node', [join(repoRoot, 'tracker-links.mjs')], { stdio: 'pipe' });
});
