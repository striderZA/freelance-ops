import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('verify-pipeline.mjs exits 0 on a fixture with one entry per state', () => {
  const dir = mkdtempSync(join(tmpdir(), 'verify-test-'));
  try {
    const trackerDir = join(dir, 'data');
    const reportsDir = join(dir, 'reports');
    mkdirSync(trackerDir, { recursive: true });
    mkdirSync(reportsDir, { recursive: true });
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | A | work | Upwork | New | | | [1](r.md) | |\n' +
      '| 2 | 2026-06-15 | B | work | Upwork | Qualified | $95/hr | 4.0/5 | [2](r.md) | |\n');
    writeFileSync(join(reportsDir, 'r.md'), '# report\n');

    const scriptPath = join(import.meta.dirname, '..', 'verify-pipeline.mjs');
    // Success = exits with code 0 and stdout has no "❌" errors.
    let stdout;
    try {
      stdout = execFileSync('node', [scriptPath], {
        cwd: dir,
        env: { ...process.env, freelance_ops_TRACKER: join(trackerDir, 'leads.md'), freelance_ops_REPORTS_DIR: reportsDir },
        stdio: 'pipe',
      }).toString();
    } catch (e) {
      assert.fail(`verify-pipeline.mjs should have exited 0, got: ${e.status}\nstdout: ${e.stdout?.toString()}`);
    }
    assert.doesNotMatch(stdout, /❌/, `should have no errors, got: ${stdout}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('verify-pipeline.mjs exits non-zero on unknown status', () => {
  const dir = mkdtempSync(join(tmpdir(), 'verify-test-'));
  try {
    const trackerDir = join(dir, 'data');
    mkdirSync(trackerDir, { recursive: true });
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n' +
      '| 1 | 2026-06-15 | A | work | Upwork | BogusState | | | [1](r.md) | |\n');

    const scriptPath = join(import.meta.dirname, '..', 'verify-pipeline.mjs');
    assert.throws(
      () => execFileSync('node', [scriptPath], {
        cwd: dir,
        env: { ...process.env, freelance_ops_TRACKER: join(trackerDir, 'leads.md') },
        stdio: 'pipe',
      }),
      (err) => err && err.status !== 0,
      'should exit non-zero on unknown state'
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
