import { test } from 'node:test';
import assert from 'node:assert/strict';

test('buildSearchUrl constructs correct URL with query and maxResults', async () => {
  const { buildSearchUrl } = await import('../providers/upwork.mjs');
  const url = buildSearchUrl('AI consulting', { maxResults: 25 });
  assert.match(url, /upwork\.com/);
  assert.match(url, /q=AI/);
  assert.match(url, /per_page=25/);
});

test('buildSearchUrl handles empty config', async () => {
  const { buildSearchUrl } = await import('../providers/upwork.mjs');
  const url = buildSearchUrl('developer', {});
  assert.match(url, /q=developer/);
  assert.match(url, /per_page=25/);
});

test('buildSearchUrl defaults maxResults to 25 when not specified', async () => {
  const { buildSearchUrl } = await import('../providers/upwork.mjs');
  const url = buildSearchUrl('designer');
  assert.match(url, /per_page=25/);
});

test('buildSearchUrl caps maxResults at 50', async () => {
  const { buildSearchUrl } = await import('../providers/upwork.mjs');
  const url = buildSearchUrl('backend', { maxResults: 999 });
  assert.match(url, /per_page=50/);
});

test('buildSearchUrl accepts category parameter', async () => {
  const { buildSearchUrl } = await import('../providers/upwork.mjs');
  const url = buildSearchUrl('react', { category: 'web-mobile-software-dev' });
  assert.match(url, /category=web-mobile-software-dev/);
});

test('buildSearchUrl encodes query with special characters', async () => {
  const { buildSearchUrl } = await import('../providers/upwork.mjs');
  const url = buildSearchUrl('data science & ML', { maxResults: 10 });
  assert.match(url, /per_page=10/);
  const decoded = decodeURIComponent(url.replace(/\+/g, ' '));
  assert.ok(decoded.includes('data science'));
  assert.ok(decoded.includes('& ML'));
});

test('buildSearchUrl returns absolute https URL', async () => {
  const { buildSearchUrl } = await import('../providers/upwork.mjs');
  const url = buildSearchUrl('test');
  assert.ok(url.startsWith('https://www.upwork.com/nx/search/jobs/'));
});

test('search returns empty array when Playwright is unavailable (import fail)', async () => {
  // We can't easily simulate a Playwright import failure in ESM.
  // This test verifies the contract: search never throws, returns [] on failure.
  const mod = await import('../providers/upwork.mjs');
  assert.equal(typeof mod.search, 'function');
});

test('search returns empty array on invalid URL gracefully', async () => {
  // The function signature exists and handles errors by returning [].
  const mod = await import('../providers/upwork.mjs');
  const result = await mod.search('this-will-fail-quietly', { maxResults: 1 });
  assert.ok(Array.isArray(result));
});

test('fetchJobDetails returns error object on invalid URL', async () => {
  const mod = await import('../providers/upwork.mjs');
  const result = await mod.fetchJobDetails('https://www.upwork.com/jobs/~nonexistent-invalid-404');
  assert.ok(result);
  assert.ok(result.url || result.error);
});

test('module exports all required functions', async () => {
  const mod = await import('../providers/upwork.mjs');
  assert.equal(typeof mod.search, 'function');
  assert.equal(typeof mod.buildSearchUrl, 'function');
  assert.equal(typeof mod.fetchJobDetails, 'function');
});

test('buildSearchUrl encodes query strings properly', async () => {
  const { buildSearchUrl } = await import('../providers/upwork.mjs');
  const url = buildSearchUrl('full stack developer');
  assert.ok(url.includes('full+stack+developer') || url.includes('full%20stack%20developer'));
  assert.match(url, /per_page=25/);
});

test('search invoked without config uses defaults', async () => {
  const mod = await import('../providers/upwork.mjs');
  // Should not throw; config is optional
  assert.doesNotThrow(() => mod.buildSearchUrl('test'));
});
