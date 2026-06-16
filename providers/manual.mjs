/**
 * providers/manual.mjs — Manual job description parser for the --manual flag.
 *
 * Exports:
 *   parseJobDescription(text) — Extract normalized lead from free-text JD
 *   fetchFromUrl(url)         — Enrich lead by fetching the URL (page title, status)
 */

export function parseJobDescription(text) {
  if (!text) return null;

  const result = {
    client: '',
    role: '',
    platform: 'Direct',
    url: '',
    rate: '',
    location: '',
    notes: '',
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
    if (rateMatch) { result.rate = rateMatch[1].trim(); continue; }

    const locMatch = trimmed.match(/^(?:location|loc|place|office|site|remote|onsite|hybrid)\s*[:;]\s*(.+)/i);
    if (locMatch) { result.location = locMatch[1].trim(); continue; }

    const platMatch = trimmed.match(/^(?:platform|source|portal|via|site|board)\s*[:;]\s*(.+)/i);
    if (platMatch) { result.platform = platMatch[1].trim(); continue; }

    const urlMatch = trimmed.match(/(https?:\/\/[^\s|)]+)/);
    if (urlMatch && !result.url) {
      result.url = urlMatch[1];
    }
  }

  return result;
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
