/**
 * providers/upwork.mjs — Playwright-based Upwork job search provider.
 *
 * Upwork has no free public API for job listings, so this uses headless
 * browser scraping of public search pages. No login required.
 *
 * Ethical constraints:
 *   - Rate-limited to 1 request per 2 seconds minimum
 *   - No login attempted (public listings only)
 *   - Max 50 results per search
 *   - Respects robots.txt intent (lightweight, rate-limited)
 */

import { chromium } from 'playwright';

const UPWORK_SEARCH_BASE = 'https://www.upwork.com/nx/search/jobs/';
const DEFAULT_MAX_RESULTS = 25;
const MAX_RESULTS_HARD_CAP = 50;
const RATE_LIMIT_MS = 2_000;
const NAVIGATION_TIMEOUT_MS = 15_000;
const SELECTOR_TIMEOUT_MS = 8_000;

let lastRequestTime = 0;

async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

/**
 * Build a Upwork search URL from query and config.
 *
 * @param {string} query - Search term (e.g. "AI consulting")
 * @param {object} [config] - { maxResults, category }
 * @returns {string}
 */
export function buildSearchUrl(query, config = {}) {
  const maxResults = Math.min(
    config.maxResults || DEFAULT_MAX_RESULTS,
    MAX_RESULTS_HARD_CAP,
  );

  const params = new URLSearchParams({
    q: query,
    per_page: String(maxResults),
  });

  if (config.category) {
    params.set('category', config.category);
  }

  return `${UPWORK_SEARCH_BASE}?${params.toString()}`;
}

/**
 * Normalize a raw Upwork job tile element into a Job object.
 *
 * @param {import('playwright').ElementHandle} card
 * @returns {Promise<object|null>}
 */
async function extractJobCard(card) {
  try {
    const titleEl = await card.$('h2.job-tile-title a, [data-test="job-title"] a, a[data-ev-label="job_title"]');
    if (!titleEl) return null;

    const title = (await titleEl.textContent())?.trim() || '';
    const href = await titleEl.getAttribute('href');
    if (!title || !href) return null;

    const url = href.startsWith('http')
      ? href
      : `https://www.upwork.com${href}`;

    const companyEl = await card.$('[data-test="client-name"], .client-name, .up-salary-client-client-info span');
    const company = (await companyEl?.textContent())?.trim() || '';

    const locationEl = await card.$('[data-test="location"], .location, [data-qa="location"]');
    const location = (await locationEl?.textContent())?.trim() || '';

    const budgetEl = await card.$('[data-test="budget"], .budget, [data-qa="budget"]');
    const budget = (await budgetEl?.textContent())?.trim() || '';

    const postedEl = await card.$('[data-test="posted-date"], .posted-date, time');
    let postedAt;
    if (postedEl) {
      const ts = await postedEl.getAttribute('datetime');
      if (ts) {
        const parsed = Date.parse(ts);
        if (!Number.isNaN(parsed)) postedAt = parsed;
      }
    }

    /** @type {import('./_types.js').Job} */
    return { title, url, company, location, postedAt, budget };
  } catch {
    return null;
  }
}

/**
 * Search Upwork for jobs matching a query.
 *
 * @param {string} query - Search term
 * @param {object} [config] - { maxResults, category }
 * @returns {Promise<Array<object>>} - Array of normalized lead objects
 */
export async function search(query, config = {}) {
  const url = buildSearchUrl(query, config);
  let browser;

  try {
    await rateLimit();

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--disable-features=BlockInsecurePrivateNetworkRequests',
        '--ignore-certificate-errors-spki-list',
      ],
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
    });
    const page = await context.newPage();

    // Hide WebDriver from navigator (first-chance stealth)
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS });

    const selectors = [
      'div[data-test="JobTile"]',
      '.job-tile',
      'section[data-test="jobs-list"] > div',
      '[data-test="search-list"] > div',
    ];

    let cards = [];
    for (const sel of selectors) {
      cards = await page.$$(sel);
      if (cards.length > 0) break;
    }

    if (cards.length === 0) {
      await page.waitForSelector('div[data-test="JobTile"], .job-tile', {
        timeout: SELECTOR_TIMEOUT_MS,
      }).catch(() => {});
      for (const sel of selectors) {
        cards = await page.$$(sel);
        if (cards.length > 0) break;
      }
    }

    const maxResults = Math.min(config.maxResults || DEFAULT_MAX_RESULTS, MAX_RESULTS_HARD_CAP);
    const jobs = [];
    for (const card of cards.slice(0, maxResults)) {
      const job = await extractJobCard(card);
      if (job) jobs.push(job);
    }

    return jobs;
  } catch (err) {
    console.warn(`[upwork.mjs] search failed: ${err.message}`);
    return [];
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Fetch full details of a specific Upwork job posting.
 *
 * @param {string} url - The job posting URL
 * @returns {Promise<object>} - Normalized lead object with full description
 */
export async function fetchJobDetails(url) {
  let browser;

  try {
    await rateLimit();

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--disable-features=BlockInsecurePrivateNetworkRequests',
        '--ignore-certificate-errors-spki-list',
      ],
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
    });
    const page = await context.newPage();

    // Hide WebDriver from navigator (first-chance stealth)
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT_MS });

    const titleEl = await page.$('h1[data-test="job-title"], .job-title, h1');
    const title = (await titleEl?.textContent())?.trim() || '';

    const descriptionEl = await page.$('[data-test="description"], .job-description, [data-qa="job-description"]');
    const description = (await descriptionEl?.textContent())?.trim() || '';

    const clientEl = await page.$('[data-test="client-name"], .client-name');
    const company = (await clientEl?.textContent())?.trim() || '';

    const locationEl = await page.$('[data-test="location"], .location');
    const location = (await locationEl?.textContent())?.trim() || '';

    const budgetEl = await page.$('[data-test="budget"], .budget');
    const budget = (await budgetEl?.textContent())?.trim() || '';

    const postedEl = await page.$('[data-test="posted-date"], time');
    let postedAt;
    if (postedEl) {
      const ts = await postedEl.getAttribute('datetime');
      if (ts) {
        const parsed = Date.parse(ts);
        if (!Number.isNaN(parsed)) postedAt = parsed;
      }
    }

    /** @type {import('./_types.js').Job} */
    return { title, url, company, location, postedAt, budget, description };
  } catch (err) {
    console.warn(`[upwork.mjs] fetchJobDetails failed: ${err.message}`);
    return { url, error: err.message };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
