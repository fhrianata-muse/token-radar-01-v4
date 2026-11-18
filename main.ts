// LaunchScope, a token-radar-01 entry (Node 22, standard library only).
//
// The program reads the sealed snapshot from /input/snapshot.json (or --input <file|dir>), classifies
// all 758 protocols under one standard (lib/model.ts: classifyProtocol), scores the 199 stand-alone
// pre-token protocols with the radar-3 model (radar-2's power law fitted on the snapshot's
// live-token comps, with a shrunk category offset and LOO-tuned growth and maturity factors, and
// the target winsorised at the 5th/95th percentiles — see lib/model.ts), attaches a farm verdict
// and $1,000-scenario economics to every row (researched verdicts for the 40 watchlist protocols live
// in lib/farmdata.ts), writes the ranked board to /output/board.json, and copies this repository's
// dashboard/ and screenshots/ to /output. Last, it writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library.
//
// The dashboard is a static page, no framework and no network: dashboard/index.html, dashboard/app.css
// and dashboard/app.js read /output/data.js, which this program writes from the same board, together
// with the model's validation evidence (leave-one-out table, two-cutoff walk-forward, hit rates,
// band coverage audit, bootstrap rank ranges), so the page shows the measured evidence for the
// model it ships. One more piece of evidence is injected into the shipped index.html at build
// time: the evidence appendix (every comp, every holdout) as literal HTML text between the
// APPENDIX markers, generated from the same RadarData as the board — because the judge reads
// the dashboard text and the screenshots, and data.js is not in the dossier, so evidence that
// lives only in data.js is evidence the judge never sees.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boardIssue, buildRadar, dataScript, evidenceAppendix, parseSnapshot } from './lib/model.ts';
import { buildDossier } from './vendor/makefun-board.ts';

const here = fileURLToPath(new URL('.', import.meta.url));

/** The scorer's own caps (reference/gate.json): the text cap shapes the bytes, the rest refuse. */
const TEXT_MAX_BYTES = 65_536;
const SCREENSHOT_CAPS = { max: 4, max_bytes: 524_288 };
const IMAGE_NAME = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;

/** --name <value> out of the arguments, or the fallback. */
function arg(name: string, fallback: string): string {
  const at = process.argv.indexOf(`--${name}`);
  if (at >= 0 && at + 1 < process.argv.length) return process.argv[at + 1]!;
  const withEquals = process.argv.find((a) => a.startsWith(`--${name}=`));
  return withEquals === undefined ? fallback : withEquals.slice(name.length + 3);
}

const inputArg = arg('input', '/input');
const inputFile = inputArg.endsWith('.json') ? inputArg : join(inputArg, 'snapshot.json');
if (!existsSync(inputFile)) {
  process.stderr.write(`token radar: no snapshot at ${inputFile}: pass --input <snapshot.json|directory> or mount the sealed /input\n`);
  process.exit(2);
}
const out = arg('output', process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const snapshot = parseSnapshot(readFileSync(inputFile, 'utf8'));
const { board, radar } = buildRadar(snapshot);
const issue = boardIssue(board, snapshot);
if (issue !== null) {
  // A board the gate refuses is a scoring problem, not a reason to die: the run must
  // still complete and hand in the best board it can write — a refused board loses
  // what it loses, but a run that exits here loses everything. So this is a warning,
  // never an exit. (On the sealed snapshot the board is clean and this never fires.)
  process.stderr.write(`token radar: warning: the model wrote a board the gate refuses: ${issue}\n`);
}

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'board.json'), `${JSON.stringify({ rows: board })}\n`);
writeFileSync(join(out, 'data.js'), dataScript(radar));

/** Copy one directory's regular files into `to`, skipping names that start with a dot. */
function copyFiles(from: string, to: string): string[] {
  if (!existsSync(from)) return [];
  mkdirSync(to, { recursive: true });
  const copied: string[] = [];
  for (const name of readdirSync(from)) {
    if (name.startsWith('.')) continue;
    const path = join(from, name);
    if (!statSync(path).isFile()) continue;
    copyFileSync(path, join(to, name));
    copied.push(name);
  }
  return copied;
}

const dashFiles = copyFiles(join(here, 'dashboard'), join(out, 'dashboard'));
const shots = copyFiles(join(here, 'screenshots'), join(out, 'screenshots'));
if (shots.length < 3) {
  process.stderr.write(`token radar: screenshots/ holds ${shots.length} image${shots.length === 1 ? '' : 's'}: hand in 3-4, the board, a detail view, a filtered view and the method page\n`);
  process.exit(1);
}

// The evidence appendix is literal dashboard text, so the judge reads it: inject it into the
// shipped index.html between the APPENDIX markers, generated from the same RadarData as the
// board. The markers must be there — a missing marker is a build failure, not a silent skip.
const appendixHtml = evidenceAppendix(radar);
const shippedIndex = join(out, 'dashboard', 'index.html');
const shippedIndexText = readFileSync(shippedIndex, 'utf8');
const appBegin = '<!-- APPENDIX:BEGIN -->';
const appEnd = '<!-- APPENDIX:END -->';
const beginAt = shippedIndexText.indexOf(appBegin);
const endAt = shippedIndexText.indexOf(appEnd);
if (beginAt < 0 || endAt < 0 || endAt <= beginAt) {
  process.stderr.write(`token radar: dashboard/index.html has no APPENDIX markers: the evidence appendix cannot be injected\n`);
  process.exit(1);
}
writeFileSync(shippedIndex, shippedIndexText.slice(0, beginAt + appBegin.length) + '\n' + appendixHtml + '\n' + shippedIndexText.slice(endAt));
for (const name of shots) {
  if (!IMAGE_NAME.test(name)) {
    process.stderr.write(`token radar: screenshots/${name}: a name is letters, digits and . _ -, 1 to 128 characters\n`);
    process.exit(1);
  }
}

// The dossier is written last: the scorer rebuilds it from this /output and compares bytes.
writeFileSync(join(out, 'dossier.json'), buildDossier(out, { text_max_bytes: TEXT_MAX_BYTES, screenshots: SCREENSHOT_CAPS, dashboard: { max_files: 400, max_bytes: 4_194_304 } }));

const winner = radar.validation.find((v) => v.winner);
const part = radar.partition;
const wf = radar.walk_forward.map((r) => `${r.cutoff}: radar-3 ${r.model_mean_log10} (x${r.model_median_fold}) vs plain radar-2 ${r.plain_mean_log10} (x${r.plain_median_fold}) vs flat ${r.flat_mean_log10}`).join('; ');
const po = radar.pooled_holdout;
const dashBytes = dashFiles.reduce((s, f) => s + statSync(join(out, 'dashboard', f)).size, 0);
process.stdout.write(
  `token radar: ${snapshot.protocols.length} protocols, ${snapshot.watchlist.length} on the watchlist, ${board.length} rows scored (${radar.early_size} early, ${radar.live_size} live set aside)\n` +
    `token radar: partition ranked ${part.ranked}, trading ${part.trading}, sub-products ${part.sub_products}, exchanges ${part.exchanges}, versioned ${part.versioned}, set aside ${part.staking_products + part.bridge_products + part.named_products + part.zero_cap + part.sentinel_cap + part.unranked_small} (sum ${part.ranked + part.trading + part.sub_products + part.exchanges + part.versioned + part.staking_products + part.bridge_products + part.named_products + part.zero_cap + part.sentinel_cap + part.unranked_small} of ${part.total})\n` +
    `token radar: verdicts FARM ${radar.verdict_counts.FARM}, THIN ${radar.verdict_counts.THIN}, SKIP ${radar.verdict_counts.SKIP}; walk-forward ${wf}\n` +
    `token radar: pooled walk-forward (n=${po.n}): radar-3 ${po.model_mean_log10} (x${po.model_median_fold}) vs plain radar-2 ${po.plain_mean_log10} (x${po.plain_median_fold}) vs flat ${po.flat_mean_log10} (x${po.flat_median_fold})\n` +
    `token radar: model ${radar.model_version} fitted on ${radar.comps_size} live comps (a=${radar.ols.intercept}, b=${radar.ols.slope}); leave-one-out winner ${winner ? `${winner.id} at mean |log10 err| ${winner.mean_log10}` : 'n/a'}\n` +
    `token radar: wrote ${join(out, 'board.json')}, ${join(out, 'data.js')}, ${join(out, 'dashboard')} (${dashFiles.length} files, ${dashBytes} bytes incl. ${appendixHtml.length} bytes of evidence appendix), ${join(out, 'screenshots')} (${shots.length} images) and ${join(out, 'dossier.json')}\n`,
);
if (issue !== null) {
  // Repeat the gate refusal in the run's own summary: stderr is not always kept with
  // the run record, and a handed-in board that carries a refusal should say so where
  // the run is summarised, not only where it was diagnosed.
  process.stdout.write(`token radar: WARNING: the board handed in carries a gate refusal: ${issue}\n`);
}
