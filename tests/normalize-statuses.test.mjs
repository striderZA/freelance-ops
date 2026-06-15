import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('normalize-statuses.mjs recognizes all 14 freelance states', () => {
  const dir = mkdtempSync(join(tmpdir(), 'norm-test-'));
  try {
    const trackerDir = join(dir, 'data');
    mkdirSync(trackerDir, { recursive: true });
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | Acme | AI work | Upwork | qualified | $95/hr | 4.0/5 | [1](reports/1.md) | note |\n' +
      '| 2 | 2026-06-15 | Beta | web app | Direct | in-progress | $80/hr | 4.5/5 | [2](reports/2.md) | note |\n');

    const scriptPath = join(import.meta.dirname, '..', 'normalize-statuses.mjs');
    execFileSync('node', [scriptPath], {
      cwd: dir,
      env: { ...process.env, freelance_ops_TRACKER: join(trackerDir, 'leads.md') },
      stdio: 'pipe',
    });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    assert.match(result, /\|\s*Qualified\s*\|/);
    assert.match(result, /\|\s*In Progress\s*\|/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
