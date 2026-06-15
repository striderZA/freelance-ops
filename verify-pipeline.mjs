#!/usr/bin/env node
/**
 * verify-pipeline.mjs — Health check for freelance-ops pipeline integrity
 *
 * Checks:
 * 1. All statuses are canonical (per states.yml)
 * 2. No duplicate company+role entries
 * 3. All report links point to existing files
 * 4. Scores match format X.XX/5 or N/A or DUP
 * 5. All rows have proper pipe-delimited format
 * 6. No pending TSVs in tracker-additions/ (only in merged/ or archived/)
 * 7. states.yml canonical IDs for cross-system consistency
 *
 * Run: node freelance-ops/verify-pipeline.mjs
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, unlinkSync, statSync } from 'fs';
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
const ADDITIONS_DIR = process.env.freelance_ops_ADDITIONS
  ? process.env.freelance_ops_ADDITIONS
  : join(freelance_ops, 'batch/tracker-additions');
const REPORTS_DIR = process.env.freelance_ops_REPORTS_DIR
  ? process.env.freelance_ops_REPORTS_DIR
  : join(freelance_ops, 'reports');
const STATES_FILE = existsSync(join(freelance_ops, 'templates/states.yml'))
  ? join(freelance_ops, 'templates/states.yml')
  : join(freelance_ops, 'states.yml');

// Ensure required directories exist (fresh setup)
mkdirSync(join(freelance_ops, 'data'), { recursive: true });
mkdirSync(REPORTS_DIR, { recursive: true });

// Freelance-ops state machine — 14 canonical states from templates/states.yml
// (10 main pipeline + 4 terminal off-ramps).
const CANONICAL_STATUSES = [
  'new', 'qualified', 'proposed', 'negotiating', 'contracted',
  'in progress', 'delivered', 'invoiced', 'paid', 'reviewed',
  'rejected', 'ghosted', 'withdrew', 'disputed',
];

const ALIASES = {
  // New
  'lead': 'new', 'incoming': 'new', 'captured': 'new',
  // Qualified
  'qual': 'qualified',
  // Proposed
  'sent': 'proposed', 'submitted': 'proposed',
  // Negotiating
  'negotiation': 'negotiating', 'in negotiation': 'negotiating',
  // Contracted
  'hired': 'contracted', 'signed': 'contracted',
  // In Progress
  'in-progress': 'in progress', 'inprogress': 'in progress', 'in_progress': 'in progress',
  'wip': 'in progress', 'working': 'in progress',
  // Delivered
  'complete': 'delivered', 'completed': 'delivered',
  // Withdrew
  'withdrawn': 'withdrew',
  // Rejected
  'declined': 'rejected',
  // Ghosted
  'no response': 'ghosted',
  // Legacy aliases — kept for backwards compat with old tracker data
  'evaluated': 'evaluated', 'evaluada': 'evaluated',
  'condicional': 'evaluated', 'hold': 'evaluated', 'evaluar': 'evaluated', 'verificar': 'evaluated',
  'applied': 'applied', 'aplicado': 'applied', 'enviada': 'applied', 'aplicada': 'applied',
  'responded': 'responded', 'respondido': 'responded',
  'interview': 'interview', 'entrevista': 'interview',
  'offer': 'offer', 'oferta': 'offer',
  'rejected': 'rejected', 'rechazado': 'rejected', 'rechazada': 'rejected',
  'discarded': 'discarded', 'descartado': 'discarded', 'descartada': 'discarded',
  'cerrada': 'discarded', 'cancelada': 'discarded',
  'no aplicar': 'skip', 'no_aplicar': 'skip', 'skip': 'skip', 'monitor': 'skip', 'geo blocker': 'skip',
};

let errors = 0;
let warnings = 0;

function error(msg) { console.log(`❌ ${msg}`); errors++; }
function warn(msg) { console.log(`⚠️  ${msg}`); warnings++; }
function ok(msg) { console.log(`✅ ${msg}`); }

// --- Read applications.md ---
if (!existsSync(APPS_FILE)) {
  console.log('\n📊 No applications.md found. This is normal for a fresh setup.');
  console.log('   The file will be created when you evaluate your first offer.\n');
  process.exit(0);
}
const content = readFileSync(APPS_FILE, 'utf-8');
const lines = content.split('\n');

// Map columns by header name so the checks work whether the tracker uses the
// freelance-ops 10-column layout, the original 9-column layout, or a
// customized one with an extra column (e.g. a Location column after Role).
// Fixed-position indexing would otherwise read Platform where Score is
// expected and flag false errors. Falls back to the legacy fixed layout when
// no recognizable header row is found.
const LEGACY_COLMAP = { num: 1, date: 2, company: 3, role: 4, score: 5, status: 6, pdf: 7, report: 8, notes: 9 };
const HEADER_ALIASES = {
  '#': 'num', 'num': 'num', 'date': 'date',
  'company': 'company', 'client/company': 'clientOrCompany', 'client': 'clientOrCompany', 'empresa': 'clientOrCompany',
  'role': 'role', 'role/scope': 'roleOrScope', 'scope': 'roleOrScope', 'puesto': 'roleOrScope',
  'location': 'location', 'platform': 'platform',
  'score': 'score', 'rate': 'rate',
  'status': 'status', 'pdf': 'pdf', 'report': 'report', 'notes': 'notes',
};
function detectColumns(allLines) {
  for (const line of allLines) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map(s => s.trim().toLowerCase());
    if (!cells.includes('client/company') && !cells.includes('company') && !cells.includes('client')) continue;
    if (!cells.includes('role/scope') && !cells.includes('role')) continue;
    const map = {};
    cells.forEach((c, i) => { if (HEADER_ALIASES[c] != null) map[HEADER_ALIASES[c]] = i; });
    if (map['num'] != null && map['clientOrCompany'] != null && map['roleOrScope'] != null && map['status'] != null) return map;
  }
  return null;
}
const COLMAP = detectColumns(lines) || LEGACY_COLMAP;
const MAX_IDX = Math.max(...Object.values(COLMAP));
const isFreelance = COLMAP.clientOrCompany != null;
const companyKey = isFreelance ? 'clientOrCompany' : 'company';
const roleKey = isFreelance ? 'roleOrScope' : 'role';

const entries = [];
for (const line of lines) {
  if (!line.startsWith('|')) continue;
  const parts = line.split('|').map(s => s.trim());
  if (parts.length <= MAX_IDX) continue;
  const num = parseInt(parts[COLMAP.num]);
  if (isNaN(num)) continue;
  entries.push({
    num,
    date: parts[COLMAP.date],
    company: parts[COLMAP[companyKey]],
    role: parts[COLMAP[roleKey]],
    location: COLMAP.location != null ? parts[COLMAP.location] : '',
    platform: COLMAP.platform != null ? parts[COLMAP.platform] : '',
    rate: COLMAP.rate != null ? parts[COLMAP.rate] : '',
    score: parts[COLMAP.score],
    status: parts[COLMAP.status],
    pdf: COLMAP.pdf != null ? parts[COLMAP.pdf] : '',
    report: parts[COLMAP.report],
    notes: COLMAP.notes != null ? (parts[COLMAP.notes] || '') : '',
  });
}

console.log(`\n📊 Checking ${entries.length} entries in applications.md\n`);

// --- Check 1: Canonical statuses ---
let badStatuses = 0;
for (const e of entries) {
  const clean = e.status.replace(/\*\*/g, '').trim().toLowerCase();
  // Strip trailing dates
  const statusOnly = clean.replace(/\s+\d{4}-\d{2}-\d{2}.*$/, '').trim();

  if (!CANONICAL_STATUSES.includes(statusOnly) && !ALIASES[statusOnly]) {
    error(`#${e.num}: Non-canonical status "${e.status}"`);
    badStatuses++;
  }

  // Check for markdown bold in status
  if (e.status.includes('**')) {
    error(`#${e.num}: Status contains markdown bold: "${e.status}"`);
    badStatuses++;
  }

  // Check for dates in status
  if (/\d{4}-\d{2}-\d{2}/.test(e.status)) {
    error(`#${e.num}: Status contains date: "${e.status}" — dates go in date column`);
    badStatuses++;
  }
}
if (badStatuses === 0) ok('All statuses are canonical');

// --- Check 2: Duplicates ---
const companyRoleMap = new Map();
let dupes = 0;
for (const e of entries) {
  const key = e.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '::' +
    e.role.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  if (!companyRoleMap.has(key)) companyRoleMap.set(key, []);
  companyRoleMap.get(key).push(e);
}
for (const [key, group] of companyRoleMap) {
  if (group.length > 1) {
    warn(`Possible duplicates: ${group.map(e => `#${e.num}`).join(', ')} (${group[0].company} — ${group[0].role})`);
    dupes++;
  }
}
if (dupes === 0) ok('No exact duplicates found');

// --- Check 3: Report links ---
// Markdown links resolve relative to the file that contains them, so report
// links must resolve against the tracker's own directory (see #760). For the
// transition we also accept legacy root-relative links: try the tracker dir
// first, then fall back to the configured REPORTS_DIR (defaults to
// <freelance_ops>/reports), then to the repo root, before flagging a link
// broken. The env override supports test fixtures with their own reports
// directory.
const TRACKER_DIR = dirname(APPS_FILE);
let brokenReports = 0;
for (const e of entries) {
  const match = e.report.match(/\]\(([^)]+)\)/);
  if (!match) continue;
  const link = match[1];
  if (!existsSync(join(TRACKER_DIR, link)) && !existsSync(join(REPORTS_DIR, link)) && !existsSync(join(freelance_ops, link))) {
    error(`#${e.num}: Report not found: ${link}`);
    brokenReports++;
  }
}
if (brokenReports === 0) ok('All report links valid');

// --- Check 4: Score format ---
let badScores = 0;
for (const e of entries) {
  const s = e.score.replace(/\*\*/g, '').trim();
  // Empty scores are allowed: a New lead has not been evaluated yet and the
  // Rate/Score columns are intentionally blank. Only flag filled scores that
  // don't match the X.X/5 format (or the explicit N/A / DUP sentinels).
  if (s === '') continue;
  if (!/^\d+\.?\d*\/5$/.test(s) && s !== 'N/A' && s !== 'DUP') {
    error(`#${e.num}: Invalid score format: "${e.score}"`);
    badScores++;
  }
}
if (badScores === 0) ok('All scores valid');

// --- Check 5: Row format ---
let badRows = 0;
for (const line of lines) {
  if (!line.startsWith('|')) continue;
  if (line.includes('---') || line.includes('Empresa')) continue;
  const parts = line.split('|');
  if (parts.length <= MAX_IDX) {
    error(`Row with too few columns (need ${MAX_IDX} data cols): ${line.substring(0, 80)}...`);
    badRows++;
  }
}
if (badRows === 0) ok('All rows properly formatted');

// --- Check 6: Pending TSVs ---
let pendingTsvs = 0;
if (existsSync(ADDITIONS_DIR)) {
  const files = readdirSync(ADDITIONS_DIR).filter(f => f.endsWith('.tsv'));
  pendingTsvs = files.length;
  if (pendingTsvs > 0) {
    warn(`${pendingTsvs} pending TSVs in tracker-additions/ (not merged)`);
  }
}
if (pendingTsvs === 0) ok('No pending TSVs');

// --- Check 7: Bold in scores ---
let boldScores = 0;
for (const e of entries) {
  if (e.score.includes('**')) {
    warn(`#${e.num}: Score has markdown bold: "${e.score}"`);
    boldScores++;
  }
}
if (boldScores === 0) ok('No bold in scores');

// --- Check 8: Stale report-number sentinels (GC) ---
// reserve-report-num.mjs drops NNN-RESERVED.md files in reports/ when a
// number is claimed.  If the process crashed before writing the real report
// and deleting the sentinel it will linger.  Sentinels older than 4 h are
// stale; remove them here so they don't skew the next slot allocation.
const SENTINEL_MAX_AGE_MS = 4 * 60 * 60 * 1000;
let staleSentinels = 0;
if (existsSync(REPORTS_DIR)) {
  const now = Date.now();
  for (const name of readdirSync(REPORTS_DIR)) {
    if (!name.endsWith('-RESERVED.md')) continue;
    const full = join(REPORTS_DIR, name);
    try {
      const { mtimeMs } = statSync(full);
      if (now - mtimeMs > SENTINEL_MAX_AGE_MS) {
        unlinkSync(full);
        warn(`Removed stale reservation sentinel: ${name}`);
        staleSentinels++;
      }
    } catch {
      // Already gone between readdir and stat — fine.
    }
  }
}
if (staleSentinels === 0) ok('No stale reservation sentinels');

// --- Summary ---
console.log('\n' + '='.repeat(50));
console.log(`📊 Pipeline Health: ${errors} errors, ${warnings} warnings`);
if (errors === 0 && warnings === 0) {
  console.log('🟢 Pipeline is clean!');
} else if (errors === 0) {
  console.log('🟡 Pipeline OK with warnings');
} else {
  console.log('🔴 Pipeline has errors — fix before proceeding');
}

process.exit(errors > 0 ? 1 : 0);
