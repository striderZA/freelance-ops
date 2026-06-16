// @ts-check

export function parseJobDescription(text) {
  if (!text || typeof text !== 'string') {
    return { client: '', role: '', platform: '', url: '', description: '', budget: '', budgetType: '', engagement: '', location: '', postedDate: '', source: '' };
  }

  const result = {
    client: '',
    role: '',
    platform: 'Direct',
    url: '',
    description: text.trim(),
    budget: '',
    budgetType: '',
    engagement: '',
    location: '',
    postedDate: '',
    source: 'manual',
  };

  const urlMatch = text.match(/https?:\/\/[^\s)\]]+/);
  if (urlMatch) result.url = urlMatch[0];

  if (/upwork\.com/i.test(text)) result.platform = 'Upwork';
  else if (/freelancer\.com/i.test(text)) result.platform = 'Freelancer';
  else if (/fiverr\.com/i.test(text)) result.platform = 'Fiverr';
  else if (/toptal\.com/i.test(text)) result.platform = 'Toptal';
  else if (/linkedin\.com/i.test(text)) result.platform = 'LinkedIn';

  const clientPatterns = [
    /(?:Client|Company|Organization|Customer)\s*:\s*(.+)/i,
    /@([a-zA-Z0-9_-]+)/,
    /(?:Hiring for|Working with|Partnering with)\s+(.+?)(?:\.|$)/i,
  ];
  for (const pattern of clientPatterns) {
    const match = text.match(pattern);
    if (match) { result.client = match[1].trim(); break; }
  }

  const rolePatterns = [
    /(?:Role|Position|Title|Job Title)\s*:\s*(.+)/i,
    /^#+\s*(.+)/m,
    /^(?:We are looking for|We need|Hiring|Looking for)\s+(?:a|an|the)?\s*(.+?)(?:\.|$)/im,
    /^([A-Z][A-Za-z\s]+(?:Engineer|Developer|Designer|Manager|Analyst|Scientist|Architect|Consultant|Lead|Head|Director|Specialist|Expert))/m,
  ];
  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match) { result.role = match[1].trim(); break; }
  }
  if (!result.role) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.match(/^(https?:\/\/|#|Client|Company|Budget|Rate|Location|Remote|On-site)/i));
    if (lines.length > 0) result.role = lines[0];
  }

  const budgetPatterns = [
    /(?:Budget|Rate)\s*:\s*(\$[\d,.]+(?:\s*\/\s*(?:hr|hour|mo|month|project|fixed))?)/i,
    /(\$[\d,.]+)\s*\/\s*(hr|hour|mo|month)/i,
    /(\$[\d,.]+)\s*(?:per\s+)?(?:hour|hr|month|mo|project|fixed)/i,
    /(?:rate|budget|pay|compensation)\s*(?::|is|of)\s*(\$[\d,.]+(?:\s*[-\s]+\$[\d,.]+)?(?:\s*\/\s*(?:hr|hour|mo|month|project|fixed))?)/i,
  ];
  for (const pattern of budgetPatterns) {
    const match = text.match(pattern);
    if (match) { result.budget = match[1].trim(); break; }
  }

  if (result.budget) {
    if (/\/(?:hr|hour)\b/i.test(result.budget)) result.budgetType = 'hourly';
    else if (/\/(?:project|fixed)\b/i.test(result.budget) || /fixed/i.test(result.budget)) result.budgetType = 'fixed';
    else result.budgetType = 'hourly';
  }

  const locationPatterns = [
    /(?:Location|Loc|On-site|Onsite|Office)\s*:\s*(.+)/i,
    /\b(Remote|Hybrid|On-site|Onsite)\b/i,
    /(?:based in|located in)\s+(.+?)(?:\.|,|$)/i,
  ];
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) { result.location = match[1].trim(); break; }
  }
  if (!result.location && /\bRemote\b/i.test(text)) result.location = 'Remote';

  const engagementMatch = text.match(/\b(project|contract|freelance|gig|part-time|full-time)\b/i);
  if (engagementMatch) result.engagement = engagementMatch[1].toLowerCase();

  const datePatterns = [
    /(?:Posted|Date|Published)\s*:\s*(\d{4}-\d{2}-\d{2})/i,
    /(\d{4}-\d{2}-\d{2})/,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) { result.postedDate = match[1]; break; }
  }

  return result;
}

export async function fetchFromUrl(url) {
  let html;
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    html = await page.content();
    await browser.close();
  } catch {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      html = await response.text();
    } catch {
      throw new Error(`Failed to fetch URL: ${url}`);
    }
  }

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return parseJobDescription(text);
}

export function normalizeLead(raw) {
  return {
    client: raw.client || '',
    role: raw.role || '',
    platform: raw.platform || 'Direct',
    url: raw.url || '',
    description: raw.description || '',
    budget: raw.budget || '',
    budgetType: raw.budgetType || 'hourly',
    engagement: raw.engagement || 'project',
    location: raw.location || '',
    postedDate: raw.postedDate || new Date().toISOString().slice(0, 10),
    source: 'manual',
  };
}
