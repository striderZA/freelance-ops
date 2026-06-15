import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('dedup-tracker.mjs dedupes by client+scope across new schema', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dedup-test-'));
  try {
    const trackerDir = join(dir, 'data');
    mkdirSync(trackerDir, { recursive: true });
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | Acme | AI consulting | Upwork | Qualified | $95/hr | 4.5/5 | [1](r1.md) | first |\n' +
      '| 2 | 2026-06-15 | Acme | AI consulting | Upwork | Qualified | $95/hr | 4.5/5 | [2](r2.md) | duplicate |\n');

    const scriptPath = join(import.meta.dirname, '..', 'dedup-tracker.mjs');
    execFileSync('node', [scriptPath], {
      cwd: dir,
      env: { ...process.env, freelance_ops_TRACKER: join(trackerDir, 'leads.md') },
      stdio: 'pipe',
    });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    const acmeCount = (result.match(/\| Acme \|/g) || []).length;
    assert.equal(acmeCount, 1, 'should keep only one Acme AI consulting row');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('dedup-tracker.mjs preserves Applied+ row even with identical role/title (regression)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dedup-test-'));
  try {
    const trackerDir = join(dir, 'data');
    mkdirSync(trackerDir, { recursive: true });
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | Acme | AI consulting | Upwork | Evaluated | $95/hr | 4.5/5 | [1](r1.md) | first |\n' +
      '| 2 | 2026-06-15 | Acme | AI consulting | Upwork | Applied | $95/hr | 4.5/5 | [2](r2.md) | in progress |\n');

    const scriptPath = join(import.meta.dirname, '..', 'dedup-tracker.mjs');
    execFileSync('node', [scriptPath], {
      cwd: dir,
      env: { ...process.env, freelance_ops_TRACKER: join(trackerDir, 'leads.md') },
      stdio: 'pipe',
    });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    const acmeCount = (result.match(/\| Acme \|/g) || []).length;
    assert.equal(acmeCount, 2, 'should preserve both Acme AI consulting rows (one Applied, one Evaluated)');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
