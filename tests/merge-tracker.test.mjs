import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('merge-tracker.mjs handles new 10-column TSV format', () => {
  const dir = mkdtempSync(join(tmpdir(), 'merge-test-'));
  try {
    const trackerDir = join(dir, 'data');
    const batchDir = join(dir, 'batch', 'tracker-additions');
    mkdirSync(trackerDir, { recursive: true });
    mkdirSync(batchDir, { recursive: true });
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n');
    writeFileSync(join(batchDir, '001-acme-co.tsv'),
      '001\t2026-06-15\tAcme Co\tAI consulting\tUpwork\tQualified\t$95/hr\t4.5/5\t[001](reports/001-acme-co-2026-06-15.md)\tStrong fit\n');

    const scriptPath = join(import.meta.dirname, '..', 'merge-tracker.mjs');
    execFileSync('node', [scriptPath], {
      cwd: dir,
      env: { ...process.env, freelance_ops_TRACKER: join(trackerDir, 'leads.md'), freelance_ops_ADDITIONS: batchDir },
      stdio: 'pipe',
    });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    assert.match(result, /Acme Co/);
    assert.match(result, /Upwork/);
    assert.match(result, /\$95\/hr/);
    assert.match(result, /4\.5\/5/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('merge-tracker.mjs is idempotent (running twice does not duplicate)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'merge-test-'));
  try {
    const trackerDir = join(dir, 'data');
    const batchDir = join(dir, 'batch', 'tracker-additions');
    mkdirSync(trackerDir, { recursive: true });
    mkdirSync(batchDir, { recursive: true });
    writeFileSync(join(trackerDir, 'leads.md'),
      '# Tracker\n\n| # | Date | Client/Company | Role/Scope | Platform | Status | Rate | Score | Report | Notes |\n|---|------|----------------|------------|----------|--------|------|-------|--------|-------|\n');
    writeFileSync(join(batchDir, '001-acme-co.tsv'),
      '001\t2026-06-15\tAcme Co\tAI consulting\tUpwork\tQualified\t$95/hr\t4.5/5\t[001](reports/001-acme-co-2026-06-15.md)\tStrong fit\n');

    const scriptPath = join(import.meta.dirname, '..', 'merge-tracker.mjs');
    const env = { ...process.env, freelance_ops_TRACKER: join(trackerDir, 'leads.md'), freelance_ops_ADDITIONS: batchDir };
    execFileSync('node', [scriptPath], { cwd: dir, env, stdio: 'pipe' });
    execFileSync('node', [scriptPath], { cwd: dir, env, stdio: 'pipe' });

    const result = readFileSync(join(trackerDir, 'leads.md'), 'utf8');
    const matches = result.match(/Acme Co/g) || [];
    assert.equal(matches.length, 1, 'should appear exactly once after two runs');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
