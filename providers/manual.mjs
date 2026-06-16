/**
 * providers/manual.mjs — Manual job description parser for the --manual flag.
 *
 * Exports:
 *   parseJobDescription(text) — Extract normalized lead from free-text JD
 *   fetchFromUrl(url)         — Enrich lead by fetching the URL (page title, status)
 */

export function parseJobDescription(text) {
  if (!text || text.trim() === '') return { client: '', role: '', platform: 'Direct', url: '', budget: '', budgetType: '', location: '', notes: '', engagement: 'project', source: 'manual', postedDate: new Date().toISOString().slice(0, 10) };

  const result = {
    client: '',
    role: '',
    platform: 'Direct',
    url: '',
    budget: '',
    budgetType: 'hourly',
    location: '',
    notes: '',
    engagement: 'project',
    source: 'manual',
    postedDate: new Date().toISOString().slice(0, 10),
  };

  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const clientMatch = trimmed.match(/^(?:client|company|employer|organization|hiring\s*company)\s*[:;]\s*(.+)/i);
    if (clientMatch) { result.client = clientMatch[1].trim(); continue; }

    const roleMatch = trimmed.match(/^(?:role|title|position|job\s*(?:title)?)\s*[:;]\s*(.+)/i);
    if (roleMatch) { result.role = roleMatch[1].trim(); continue; }

    const rateMatch = trimmed.match(/^(?:rate|salary|budget|compensation|pay|hourly|annual|range)\s*[:;]\s*(.+)/i);
    if (rateMatch) { result.budget = rateMatch[1].trim(); continue; }

    const locMatch = trimmed.match(/^(?:location|loc|place|office|site)\s*[:;]\s*(.+)/i);
    if (locMatch) { result.location = locMatch[1].trim(); continue; }

    if (/^(?:remote|fully\s*remote|100%\s*remote)\s*$/i.test(trimmed)) {
      result.location = 'Remote';
    } else if (/\bremote\b/i.test(trimmed) && !result.location) {
      result.location = 'Remote';
    }

    const platMatch = trimmed.match(/^(?:platform|source|portal|via|site|board)\s*[:;]\s*(.+)/i);
    if (platMatch) { result.platform = platMatch[1].trim(); continue; }

    if (/upwork\.com/i.test(trimmed) && result.platform === 'Direct') {
      result.platform = 'Upwork';
    }

    const urlMatch = trimmed.match(/(https?:\/\/[^\s|)]+)/);
    if (urlMatch && !result.url) {
      result.url = urlMatch[1];
    }
  }

  // Detect budget type
  if (result.budget && /\bhr?\b/i.test(result.budget)) {
    result.budgetType = 'hourly';
  } else if (result.budget && /\bfixed\b|\bproject\b|\bflat\b/i.test(result.budget)) {
    result.budgetType = 'fixed';
  }

  return result;
}

export function normalizeLead(raw) {
  return {
    client: raw.client ?? '',
    role: raw.role ?? '',
    platform: raw.platform ?? 'Direct',
    url: raw.url ?? '',
    budget: raw.budget ?? '',
    budgetType: raw.budgetType || 'hourly',
    location: raw.location ?? '',
    notes: raw.notes ?? '',
    engagement: raw.engagement ?? 'project',
    source: raw.source ?? 'manual',
    postedDate: raw.postedDate ?? new Date().toISOString().slice(0, 10),
  };
}

export async function fetchFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return {
      fetched: true,
      url,
      title: titleMatch ? titleMatch[1].trim() : null,
      status: response.status,
    };
  } catch (err) {
    return { fetched: false, url, error: err.message };
  }
}
