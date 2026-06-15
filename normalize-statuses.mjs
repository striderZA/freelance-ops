#!/usr/bin/env node
/**
 * normalize-statuses.mjs — Clean non-canonical states in the tracker
 *
 * Maps all non-canonical statuses to canonical ones per templates/states.yml:
 *   New, Qualified, Proposed, Negotiating, Contracted, In Progress, Delivered,
 *   Invoiced, Paid, Reviewed, Rejected, Ghosted, Withdrew, Disputed
 *
 * Also strips markdown bold (**) and dates from the status field,
 * moving DUPLICADO info to the notes column.
 *
 * Run: node freelance-ops/normalize-statuses.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const freelance_ops = dirname(fileURLToPath(import.meta.url));
// Support all three layouts: data/leads.md (current freelance-ops default),
// data/applications.md (boilerplate), and applications.md (legacy). Lookup
// order is newest → oldest so a fresh setup lands on the new schema.
// freelance_ops_TRACKER overrides the path (used by tests and non-standard layouts).
const APPS_FILE = process.env.freelance_ops_TRACKER
  ? process.env.freelance_ops_TRACKER
  : existsSync(join(freelance_ops, 'data/leads.md'))
    ? join(freelance_ops, 'data/leads.md')
    : existsSync(join(freelance_ops, 'data/applications.md'))
    ? join(freelance_ops, 'data/applications.md')
    : join(freelance_ops, 'applications.md');
const DRY_RUN = process.argv.includes('--dry-run');

// Ensure required directories exist (fresh setup)
mkdirSync(join(freelance_ops, 'data'), { recursive: true });
mkdirSync(dirname(APPS_FILE), { recursive: true });

// Canonical status list (mirrors templates/states.yml — the source of truth).
const CANONICAL_STATES = [
  'New', 'Qualified', 'Proposed', 'Negotiating', 'Contracted',
  'In Progress', 'Delivered', 'Invoiced', 'Paid', 'Reviewed',
  'Rejected', 'Ghosted', 'Withdrew', 'Disputed',
];

// Aliases for common variants. Keys are lowercase; values are canonical labels.
const NORMALIZE = {
  // New
  'new': 'New',
  'lead': 'New', 'incoming': 'New', 'captured': 'New',
  // Qualified
  'qualified': 'Qualified',
  'qual': 'Qualified',
  // Proposed
  'proposed': 'Proposed',
  'sent': 'Proposed',
  'submitted': 'Proposed',
  // Negotiating
  'negotiating': 'Negotiating',
  'negotiation': 'Negotiating',
  'in negotiation': 'Negotiating',
  // Contracted
  'contracted': 'Contracted',
  'hired': 'Contracted',
  'signed': 'Contracted',
  // In Progress
  'in progress': 'In Progress',
  'in-progress': 'In Progress',
  'inprogress': 'In Progress',
  'in_progress': 'In Progress',
  'wip': 'In Progress',
  'working': 'In Progress',
  // Delivered
  'delivered': 'Delivered',
  'complete': 'Delivered',
  'completed': 'Delivered',
  // Invoiced
  'invoiced': 'Invoiced',
  // Paid
  'paid': 'Paid',
  // Reviewed
  'reviewed': 'Reviewed',
  // Rejected
  'rejected': 'Rejected',
  'declined': 'Rejected',
  // Ghosted
  'ghosted': 'Ghosted',
  'no response': 'Ghosted',
  // Withdrew
  'withdrew': 'Withdrew',
  'withdrawn': 'Withdrew',
  // Disputed
  'disputed': 'Disputed',
};

/**
 * Convert raw addition status text into one canonical tracker state.
 *
 * Batch workers and older tracker rows may emit lower-case variants, mixed
 * casing, Markdown bold, trailing dates, or reposts. The normalize script maps
 * all of those to the canonical freelance-ops state machine in
 * templates/states.yml.
 *
 * @param {string} status - Raw status string from a tracker row.
 * @returns {{status: string|null, unknown?: boolean, moveToNotes?: string}}
 *   Canonical status, plus a flag for non-canonical input that the caller can
 *   surface to the user. `moveToNotes` carries DUPLICADO/repost text that
 *   belongs in the notes column.
 */
function normalizeStatus(raw) {
  // Strip markdown bold and any trailing date suffix
  let s = String(raw ?? '').replace(/\*\*/g, '').replace(/\s+\d{4}-\d{2}-\d{2}.*$/, '').trim();
  const lower = s.toLowerCase();

  // DUPLICADO variants → Discarded... actually we don't have Discarded anymore.
  // Map to Withdrew (candidate-side) — caller can re-classify manually.
  if (/^duplicado/i.test(s) || /^dup\b/i.test(s)) {
    return { status: 'Withdrew', moveToNotes: raw.trim() };
  }

  // Repost #NNN → Withdrew (caller can re-classify)
  if (/^repost/i.test(s)) {
    return { status: 'Withdrew', moveToNotes: raw.trim() };
  }

  // Legacy em-dash / empty → leave alone (caller treats as unknown)
  if (s === '—' || s === '-' || s === '') return { status: null, unknown: true };

  // Already canonical (with right casing) — return as-is
  for (const c of CANONICAL_STATES) {
    if (lower === c.toLowerCase()) return { status: c };
  }

  // Aliases → canonical
  if (NORMALIZE[lower]) return { status: NORMALIZE[lower] };

  // Unknown — flag it
  return { status: null, unknown: true };
}

// Read applications.md / leads.md
if (!existsSync(APPS_FILE)) {
  console.log('No tracker file found. Nothing to normalize.');
  process.exit(0);
}
const content = readFileSync(APPS_FILE, 'utf-8');
const lines = content.split('\n');

let changes = 0;
let unknowns = [];

// Column layout. The freelance-ops 10-column schema places Status at index 6
// and Notes at index 10; the legacy 9-column schema also uses index 6 for
// Status and 9 for Notes. Both layouts are handled by the same indices.
const STATUS_IDX = 6;
const SCORE_IDX = 8;
const NOTES_IDX = 10;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.startsWith('|')) continue;

  const parts = line.split('|').map(s => s.trim());
  // Format: ['', '#', 'date', 'client/company', 'role/scope', 'platform', 'STATUS', 'rate', 'score', 'report', 'notes', '']
  if (parts.length < 9) continue;
  if (parts[1] === '#' || parts[1] === '---' || parts[1] === '') continue;

  const num = parseInt(parts[1]);
  if (isNaN(num)) continue;

  const rawStatus = parts[STATUS_IDX];
  const result = normalizeStatus(rawStatus);

  if (result.unknown) {
    unknowns.push({ num, rawStatus, line: i + 1 });
    continue;
  }

  if (result.status === rawStatus) continue; // Already canonical

  // Apply change
  const oldStatus = rawStatus;
  parts[STATUS_IDX] = result.status;

  // Move DUPLICADO info to notes if needed
  if (result.moveToNotes && parts[NOTES_IDX]) {
    const existing = parts[NOTES_IDX] || '';
    if (!existing.includes(result.moveToNotes)) {
      parts[NOTES_IDX] = result.moveToNotes + (existing ? '. ' + existing : '');
    }
  } else if (result.moveToNotes && !parts[NOTES_IDX]) {
    parts[NOTES_IDX] = result.moveToNotes;
  }

  // Also strip bold from score field
  if (parts[SCORE_IDX]) {
    parts[SCORE_IDX] = parts[SCORE_IDX].replace(/\*\*/g, '');
  }

  // Reconstruct line
  const newLine = '| ' + parts.slice(1, -1).join(' | ') + ' |';
  lines[i] = newLine;
  changes++;

  console.log(`#${num}: "${oldStatus}" → "${result.status}"`);
}

if (unknowns.length > 0) {
  console.log(`\n⚠️  ${unknowns.length} unknown statuses:`);
  for (const u of unknowns) {
    console.log(`  #${u.num} (line ${u.line}): "${u.rawStatus}"`);
  }
}

console.log(`\n📊 ${changes} statuses normalized`);

if (!DRY_RUN && changes > 0) {
  // Backup first
  copyFileSync(APPS_FILE, APPS_FILE + '.bak');
  writeFileSync(APPS_FILE, lines.join('\n'));
  console.log(`✅ Written to ${APPS_FILE} (backup: ${APPS_FILE}.bak)`);
} else if (DRY_RUN) {
  console.log('(dry-run — no changes written)');
} else {
  console.log('✅ No changes needed');
}
