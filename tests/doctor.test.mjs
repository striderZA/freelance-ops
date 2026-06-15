import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('doctor.mjs reports onboardingNeeded when rates.yml is missing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'doctor-test-'));
  try {
    mkdirSync(join(dir, 'config'), { recursive: true });
    mkdirSync(join(dir, 'modes'), { recursive: true });
    mkdirSync(join(dir, 'data'), { recursive: true });
    writeFileSync(join(dir, 'profile.md'), '# me\n');
    writeFileSync(join(dir, 'config', 'profile.yml'), 'name: test\n');
    writeFileSync(join(dir, 'config', 'platforms.yml'), 'platforms: []\n');
    writeFileSync(join(dir, 'modes', '_profile.md'), 'niches: []\n');
    writeFileSync(join(dir, 'data', 'leads.md'), '| # |\n');

    const scriptPath = join(import.meta.dirname, '..', 'doctor.mjs');
    const result = execFileSync('node', [scriptPath, '--json', '--target', dir], { encoding: 'utf8' });
    const json = JSON.parse(result);
    assert.equal(json.onboardingNeeded, true);
    assert.ok(json.missing.includes('config/rates.yml'),
      `should list rates.yml as missing, got: ${JSON.stringify(json.missing)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor.mjs reports onboardingNeeded=false when all files present', () => {
  const dir = mkdtempSync(join(tmpdir(), 'doctor-test-'));
  try {
    mkdirSync(join(dir, 'config'), { recursive: true });
    mkdirSync(join(dir, 'modes'), { recursive: true });
    mkdirSync(join(dir, 'data'), { recursive: true });
    writeFileSync(join(dir, 'profile.md'), '# me\n');
    writeFileSync(join(dir, 'config', 'profile.yml'), 'name: test\n');
    writeFileSync(join(dir, 'config', 'rates.yml'), 'rate_floor: $50/hr\n');
    writeFileSync(join(dir, 'config', 'platforms.yml'), 'platforms: []\n');
    writeFileSync(join(dir, 'modes', '_profile.md'), 'niches: []\n');
    writeFileSync(join(dir, 'data', 'leads.md'), '| # |\n');

    const scriptPath = join(import.meta.dirname, '..', 'doctor.mjs');
    const result = execFileSync('node', [scriptPath, '--json', '--target', dir], { encoding: 'utf8' });
    const json = JSON.parse(result);
    assert.equal(json.onboardingNeeded, false);
    assert.deepEqual(json.missing, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('doctor.mjs accepts legacy cv.md instead of profile.md', () => {
  const dir = mkdtempSync(join(tmpdir(), 'doctor-test-'));
  try {
    mkdirSync(join(dir, 'config'), { recursive: true });
    mkdirSync(join(dir, 'modes'), { recursive: true });
    mkdirSync(join(dir, 'data'), { recursive: true });
    writeFileSync(join(dir, 'cv.md'), '# me\n');
    writeFileSync(join(dir, 'config', 'profile.yml'), 'name: test\n');
    writeFileSync(join(dir, 'config', 'rates.yml'), 'rate_floor: $50/hr\n');
    writeFileSync(join(dir, 'config', 'platforms.yml'), 'platforms: []\n');
    writeFileSync(join(dir, 'modes', '_profile.md'), 'niches: []\n');
    writeFileSync(join(dir, 'data', 'leads.md'), '| # |\n');

    const scriptPath = join(import.meta.dirname, '..', 'doctor.mjs');
    const result = execFileSync('node', [scriptPath, '--json', '--target', dir], { encoding: 'utf8' });
    const json = JSON.parse(result);
    assert.equal(json.onboardingNeeded, false,
      `cv.md (legacy) should satisfy profile check, got: ${JSON.stringify(json)}`);
    assert.ok(!json.missing.includes('profile.md'),
      'should not list profile.md as missing when cv.md is present');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
