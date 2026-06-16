import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseJobDescription } from '../providers/manual.mjs';

test('parseJobDescription extracts client name from "Client:" pattern', () => {
  const result = parseJobDescription('Client: Acme Corp\nBudget: $95/hr\nRole: Senior Engineer');
  assert.equal(result.client, 'Acme Corp');
  assert.equal(result.budget, '$95/hr');
  assert.equal(result.budgetType, 'hourly');
  assert.equal(result.role, 'Senior Engineer');
});

test('parseJobDescription handles minimal input', () => {
  const result = parseJobDescription('We need a developer');
  assert.ok(result.platform === 'Direct' || result.platform === '');
});

test('parseJobDescription detects Upwork from url pattern', () => {
  const result = parseJobDescription('Client: Test\nLink: https://www.upwork.com/jobs/~test');
  assert.equal(result.platform, 'Upwork');
});

test('parseJobDescription handles empty input', () => {
  const result = parseJobDescription('');
  assert.equal(result.role, '');
});

test('parseJobDescription extracts hourly rate', () => {
  const result = parseJobDescription('Client: Acme\nRate: $100/hr');
  assert.equal(result.budget, '$100/hr');
  assert.equal(result.budgetType, 'hourly');
});

test('parseJobDescription extracts Company pattern', () => {
  const result = parseJobDescription('Company: MegaCorp\nRole: Full Stack Developer\nBudget: $80/hr');
  assert.equal(result.client, 'MegaCorp');
  assert.equal(result.role, 'Full Stack Developer');
  assert.equal(result.budget, '$80/hr');
});

test('parseJobDescription extracts location from Location: pattern', () => {
  const result = parseJobDescription('Client: X\nLocation: New York, NY');
  assert.equal(result.location, 'New York, NY');
});

test('parseJobDescription detects Remote keyword', () => {
  const result = parseJobDescription('Client: X\nRole: Dev\nThis is a Remote position');
  assert.equal(result.location, 'Remote');
});

test('parseJobDescription returns empty fields for non-matching text', () => {
  const result = parseJobDescription('Some random text without any job structure');
  assert.equal(result.client, '');
  assert.equal(result.budget, '');
});

test('normalizeLead fills defaults', async () => {
  const { normalizeLead } = await import('../providers/manual.mjs');
  const result = normalizeLead({});
  assert.equal(result.platform, 'Direct');
  assert.equal(result.budgetType, 'hourly');
  assert.equal(result.engagement, 'project');
  assert.equal(result.source, 'manual');
  assert.match(result.postedDate, /^\d{4}-\d{2}-\d{2}$/);
});

test('normalizeLead preserves provided values', async () => {
  const { normalizeLead } = await import('../providers/manual.mjs');
  const result = normalizeLead({ client: 'Acme', role: 'Dev', budget: '$100/hr', budgetType: 'hourly' });
  assert.equal(result.client, 'Acme');
  assert.equal(result.role, 'Dev');
  assert.equal(result.budget, '$100/hr');
  assert.equal(result.budgetType, 'hourly');
});
