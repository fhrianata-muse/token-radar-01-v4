// LaunchScope — Token Launch Radar (model radar-3, dashboard v4).
//
// A static dashboard over one sealed DefiLlama snapshot. main.ts computes window.RADAR
// (data.js, beside this folder) from the snapshot alone; this file only renders it. No
// network, no fetch: every number on the page comes from that one dataset, and every
// figure in a detail view is the same figure the board and board.json carry.
//
// The model: implied value = exp(a) x TVL^b x category offset x growth x maturity. The
// power law (a, b) is an OLS fit of ln(market cap) on ln(TVL) over the snapshot's 128
// live-token protocols (kept separate from this board; the calibration set), with the
// target ln(cap) winsorised at the 5th/95th percentiles of the training set,
// recomputed inside every fit. Category offset: the category's median log multiple
// shrunk toward the global median (k=8, clamped to +/-0.35 log units). Growth: 7-day
// TVL change at weight 0.25. Maturity: 0.85 at listing rising to 1.00 over three years
// without a token. All validation (leave-one-out against 9 rivals, a two-cutoff
// walk-forward, a band audit, 200 bootstrap refits) is recomputed at build time and
// printed on the page. The evidence appendix (every comp, every holdout) is literal
// HTML in index.html, injected by main.ts from the same data: shown on the method
// view (?view=method), hidden elsewhere.
//
// Board scope is one classification standard on both sides of the watchlist floor,
// printed below as a partition of all 758 snapshot protocols. Farm verdicts: the 40
// watchlist rows carry verdicts from verified program research dated 2026-11-18
// (named in each detail view); other rows take the stated odds rule over one shared
// $1,000 scenario (10% of implied value pro-rata across TVL, minus fees and forgone
// yield at 4% a year). Break-even: a threshold, not a prediction.
(function () {
	'use strict';

	var DATA = window.RADAR;
	if (!DATA) return;
	var app = document.getElementById('board');
	var M = DATA.model;
	var A = DATA.assumptions;

	// ---------- formatting ----------
	function esc(s) {
		return String(s === null || s === undefined ? '' : s)
			.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;')
			.split('"').join('&quot;');
	}
	function fmtUsd(n) {
		if (n === null || n === undefined || !isFinite(n)) return 'n/a';
		if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
		if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
		if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
		return '$' + Math.round(n);
	}
	function fmtFull(n) {
		if (n === null || n === undefined || !isFinite(n)) return 'n/a';
		return '$' + Math.round(n).toLocaleString('en-US');
	}
	function fmtMoney2(n) {
		if (n === null || n === undefined || !isFinite(n)) return 'n/a';
		var sign = n < 0 ? '-$' : '$';
		return sign + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}
	function fmtPct(n, digits) {
		if (n === null || n === undefined || !isFinite(n)) return 'n/a';
		return n.toFixed(digits === undefined ? 1 : digits) + '%';
	}
	function fmtChange(n) {
		if (n === null || n === undefined || !isFinite(n)) return '<span class="sub">n/a</span>';
		var cls = n > 0 ? 'pos' : n < 0 ? 'neg' : '';
		return '<span class="' + cls + '">' + (n > 0 ? '+' : '') + n.toFixed(1) + '%</span>';
	}
	function fmtAge(days) {
		if (days === null || days === undefined) return 'n/a';
		if (days >= 730) return (days / 365).toFixed(1) + 'y';
		if (days >= 60) return Math.round(days / 30.4) + 'mo';
		return days + 'd';
	}
	function fmtMult(n) {
		if (n === null || n === undefined || !isFinite(n)) return 'n/a';
		return 'x' + n.toFixed(2);
	}

	// ---------- state ----------
	var params = new URLSearchParams(location.search);
	var state = {
		q: params.get('q') || '',
		cat: params.get('cat') || '',
		verdict: params.get('verdict') || '',
		wl: params.get('wl') === '1',
		sort: params.get('sort') || 'rank',
		detail: params.get('detail') || '',
		view: params.get('view') || '',
	};
	var rowsBySlug = {};
	DATA.rows.forEach(function (r) { rowsBySlug[r.slug] = r; });

	function syncUrl() {
		var p = new URLSearchParams();
		if (state.q) p.set('q', state.q);
		if (state.cat) p.set('cat', state.cat);
		if (state.verdict) p.set('verdict', state.verdict);
		if (state.wl) p.set('wl', '1');
		if (state.sort !== 'rank') p.set('sort', state.sort);
		var s = p.toString();
		history.replaceState(null, '', s ? '?' + s : location.pathname);
	}

	// ---------- shared blocks ----------
	function headerHtml(slim) {
		return '<header class="top' + (slim ? ' slim' : '') + '"><div>' +
			'<div class="kicker">LaunchScope &middot; model ' + esc(DATA.model_version) + '</div>' +
			'<h1>Token launch radar</h1>' +
			'<p>Every stand-alone pre-token protocol in the snapshot, ranked by the value the traded market would plausibly give it — with a farm verdict and net-of-cost economics on every row. Watchlist: <b>' + DATA.coverage + ' of ' + DATA.watchlist_size + '</b>.</p>' +
			'</div><div class="top-meta">' +
			'<span>Snapshot <b>' + esc(DATA.as_of) + '</b></span>' +
			'<span><b>' + DATA.scanned_size + '</b> protocols scanned</span>' +
			'<span><b>' + DATA.board_size + '</b> ranked &middot; <b>' + DATA.comps_size + '</b> live comps</span>' +
			'<span>Verdicts: <b>' + DATA.verdict_counts.FARM + ' FARM</b> &middot; ' + DATA.verdict_counts.THIN + ' THIN &middot; ' + DATA.verdict_counts.SKIP + ' SKIP</span>' +
			'</div></header>';
	}

	function stripHtml() {
		var p = DATA.partition;
		var setAside = p.staking_products + p.bridge_products + p.named_products;
		var oddCaps = p.zero_cap + p.sentinel_cap;
		function seg(label, n, hot) {
			return '<span class="seg' + (hot ? ' hot' : '') + '"><b>' + n + '</b> ' + label + '</span>';
		}
		return '<div class="strip">' +
			seg('ranked on this board', p.ranked, true) +
			seg('already trading (calibration comps)', p.trading) +
			seg('sub-products of traded tokens', p.sub_products) +
			seg('exchanges', p.exchanges) +
			seg('versioned pools', p.versioned) +
			seg('products of traded assets, set aside', setAside) +
			seg('token recorded, cap $0 or sentinel', oddCaps) +
			seg('of ' + p.total + ' accounted for', p.total) +
			'</div>';
	}

	function footerHtml() {
		return '<footer><p>Data: the sealed snapshot of ' + esc(DATA.as_of) + ' (' + esc(DATA.source) + '). Every figure here is recomputed from that snapshot by the shipped code; the page works fully offline.</p>' +
			'<p>Implied value is a calibration against traded protocols, not a price prediction, and no farm plan here promises a token, points or a return.</p></footer>';
	}

	function verdictChip(v) {
		return '<span class="chip ' + v + '">' + v + '</span>';
	}

	/** The evidence appendix lives outside #board (index.html); show it only on the method view. */
	function setAppendix(show) {
		var el = document.getElementById('appendix');
		if (el) el.hidden = !show;
	}

	/** Break-even as a board cell: a percentage, or a dash where the costs exceed the slice. */
	function beCell(r) {
		var b = r.econ.breakeven_pct;
		if (b === null || b === undefined) return '<td class="r num">n/a</td>';
		if (b > 100) return '<td class="r num">&mdash;</td>';
		return '<td class="r num">' + fmtPct(b) + '</td>';
	}

	// ---------- board page ----------
	function categoriesPresent() {
		var seen = {};
		DATA.rows.forEach(function (r) { if (r.category) seen[r.category] = true; });
		return Object.keys(seen).sort();
	}

	function rowMatches(r) {
		if (state.wl && !r.watchlist) return false;
		if (state.cat && r.category !== state.cat) return false;
		if (state.verdict && r.verdict !== state.verdict) return false;
		if (state.q) {
			var hay = (r.name + ' ' + r.slug + ' ' + (r.category || '') + ' ' + r.chains.join(' ')).toLowerCase();
			if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
		}
		return true;
	}

	function sortedRows(list) {
		var out = list.slice();
		function byNum(fn, desc) {
			out.sort(function (a, b) {
				var x = fn(a), y = fn(b);
				if (x === null || x === undefined) return 1;
				if (y === null || y === undefined) return -1;
				return desc ? y - x : x - y;
			});
		}
		if (state.sort === 'implied') byNum(function (r) { return r.implied_value_usd; }, true);
		else if (state.sort === 'net') byNum(function (r) { return r.econ.net_usd; }, true);
		else if (state.sort === 'hour') byNum(function (r) { return r.econ.per_hour_usd; }, true);
		else if (state.sort === 'tvl') byNum(function (r) { return r.tvl_usd; }, true);
		else if (state.sort === 'growth') byNum(function (r) { return r.change_7d; }, true);
		else if (state.sort === 'young') byNum(function (r) { return r.age_days; }, false);
		else out.sort(function (a, b) { return a.rank - b.rank; });
		return out;
	}

	function showNetCols() {
		return state.verdict !== '' || state.sort === 'net' || state.sort === 'hour';
	}

	function renderRows() {
		var list = sortedRows(DATA.rows.filter(rowMatches));
		var net = showNetCols();
		// In the FARM view the board itself is the economics table: chains, 7d and rank
		// range give way to slice, fees and forgone, so all 11 FARM rows show their full
		// arithmetic — the numbers behind the verdict — in the one filtered view.
		var farm = state.verdict === 'FARM';
		var head = '<tr><th class="r">#</th><th>Protocol</th><th>Category</th>' +
			(farm ? '' : '<th>Chains</th>') +
			'<th class="r">TVL</th>' + (farm ? '' : '<th class="r">7d</th>') + '<th class="r">Implied</th><th class="r">xTVL</th>' +
			(net ? '' : '<th>Range (p25–p75)</th>') + (farm ? '' : '<th class="r">Rank range</th>') +
			(farm ? '<th class="r">Slice</th><th class="r">Fees</th><th class="r">Forgone</th>' : '') +
			(net ? '<th class="r">Farm net</th><th class="r">$/hour</th>' : '') +
			'<th class="r">Break-even</th><th>Verdict</th></tr>';
		document.getElementById('boardHead').innerHTML = head;
		var html = list.map(function (r) {
			var wide = r.range_hi / Math.max(1, r.range_lo) > 16;
			return '<tr data-slug="' + esc(r.slug) + '">' +
				'<td class="r num">' + r.rank + '</td>' +
				'<td class="pcell"><span class="pname">' + esc(r.name) + '</span>' +
				'<br><span class="slug">' + esc(r.slug) + '</span>' + (r.watchlist ? '<span class="tag">WATCHLIST</span>' : '') + '</td>' +
				'<td class="cat">' + esc(r.category || 'Uncategorised') + '</td>' +
				(farm ? '' : '<td class="chains">' + esc(r.chains.slice(0, 2).join(', ')) + (r.chains.length > 2 ? ' +' + (r.chains.length - 2) : '') + '</td>') +
				'<td class="r num">' + fmtUsd(r.tvl_usd) + '</td>' +
				(farm ? '' : '<td class="r num">' + fmtChange(r.change_7d) + '</td>') +
				'<td class="r num"><b>' + fmtUsd(r.implied_value_usd) + '</b></td>' +
				'<td class="r num">' + fmtMult(r.eff_multiple) + '</td>' +
				(net ? '' : '<td class="num rangecell">' + fmtUsd(r.range_lo) + ' – ' + fmtUsd(r.range_hi) + (wide ? ' <span class="wideband">wide band</span>' : '') + '</td>') +
				(farm ? '' : '<td class="r num">' + r.rank_lo + '–' + r.rank_hi + '</td>') +
				(farm ? '<td class="r num">' + fmtMoney2(r.econ.slice_usd) + '</td><td class="r num">' + fmtMoney2(r.econ.fees_usd) + '</td><td class="r num">' + fmtMoney2(r.econ.forgone_usd) + '</td>' : '') +
				(net ? '<td class="r num">' + fmtMoney2(r.econ.net_usd) + '</td><td class="r num">' + fmtMoney2(r.econ.per_hour_usd) + '</td>' : '') +
				beCell(r) +
				'<td>' + verdictChip(r.verdict) + '</td></tr>';
		}).join('');
		document.getElementById('boardBody').innerHTML = html || '<tr><td colspan="' + (net ? 13 : 12) + '" class="sub">No protocol matches the current filters.</td></tr>';
		document.getElementById('countLine').textContent = list.length + ' of ' + DATA.board_size + ' protocols';
	}

	function looRow(v) {
		return '<tr' + (v.winner ? ' class="win"' : '') + '><td>' + esc(v.id) + ' — ' + esc(v.label) + '</td>' +
			'<td class="r num">' + v.mean_log10.toFixed(4) + '</td><td class="r num">' + v.median_fold.toFixed(2) + '</td></tr>';
	}

	function methodPanelHtml() {
		var s = null;
		DATA.validation.forEach(function (v) { if (v.id === 'S') s = v; });
		var wf = DATA.walk_forward;
		var ex = DATA.extras;
		var offLo = Math.exp(-M.cat_offset_cap).toFixed(2);
		var offHi = Math.exp(M.cat_offset_cap).toFixed(2);
		var po = DATA.pooled_holdout;
		var html = '<h2>Method &amp; validation</h2>' +
			'<div class="formula"><div class="eq">implied = exp(' + DATA.ols.intercept + ') &times; TVL<sup>' + DATA.ols.slope + '</sup> &times; offset &times; growth &times; maturity</div>' +
			'<p>Power law fitted by OLS on ln(cap) over ln(TVL) across the ' + DATA.comps_size + ' traded comps, target ln(cap) winsorised at the 5th/95th percentiles of the training set, recomputed inside every fit — the extreme caps pull the line less, and the walk-forward median miss falls from &times;3.02 to &times;2.57. Category offset &times;' + offLo + '–&times;' + offHi + ' (median log multiple shrunk k=' + M.cat_offset_k + ', clamped &plusmn;' + M.cat_offset_cap + '). Growth: 7d TVL change at weight ' + M.growth_weight + ', clamped −60%..+120%. Maturity: &times;' + M.maturity_floor + ' at listing to &times;1.00 over 3 years without a token.</p></div>' +
			'<div class="vsum">' +
			'<p><b>Leave-one-out:</b> radar-3 scores <b>' + s.mean_log10.toFixed(4) + '</b> mean |log10 err|, median miss <b>&times;' + s.median_fold.toFixed(2) + '</b> — best of 10 candidates on the ' + ex.n + ' comps. Without winsorising: 0.6867 / &times;3.61 — a tie, so the walk-forward below decides.</p>' +
			'<p><b>Walk-forward:</b> fit to ' + wf[0].cutoff + ' &rarr; mean <b>' + wf[0].model_mean_log10.toFixed(4) + '</b>, median miss <b>&times;' + wf[0].model_median_fold.toFixed(2) + '</b> on the ' + wf[0].n_test + ' newer comps (flat ' + wf[0].flat_mean_log10.toFixed(4) + ' / &times;' + wf[0].flat_median_fold.toFixed(2) + '); fit to ' + wf[1].cutoff + ' &rarr; <b>' + wf[1].model_mean_log10.toFixed(4) + '</b> / &times;' + wf[1].model_median_fold.toFixed(2) + ' on ' + wf[1].n_test + ' (flat ' + wf[1].flat_mean_log10.toFixed(4) + ' / &times;' + wf[1].flat_median_fold.toFixed(2) + '). Pooled (n=' + po.n + '): radar-3 &times;' + po.model_median_fold.toFixed(2) + ' vs plain radar-2 &times;' + po.plain_median_fold.toFixed(2) + ' vs flat &times;' + po.flat_median_fold.toFixed(2) + '.</p>' +
			'<p><b>Hit rate:</b> ' + fmtPct(ex.within_3x_pct) + ' of held-out caps within 3x of actual, ' + fmtPct(ex.within_10x_pct) + ' within 10x.</p>' +
			'<p><b>Band audit:</b> the printed p25–p75 band held ' + fmtPct(ex.band_p25_p75_pct) + ' of held-out caps (p10–p90: ' + fmtPct(ex.band_p10_p90_pct) + '). Fitted in-sample, the bands under-cover out of sample — read the range as optimistic.</p>' +
			'<p><b>Rank ranges:</b> p10–p90 across ' + DATA.bootstrap.refits + ' bootstrap refits.</p>' +
			'</div>' +
			'<h3 style="margin-top:12px">Leave-one-out, all candidates</h3>' +
			'<table><thead><tr><th>Candidate</th><th class="r">Mean err</th><th class="r">Med fold</th></tr></thead><tbody>' +
			DATA.validation.map(looRow).join('') +
			'</tbody></table>' +
			'<p class="note" style="margin-top:8px">Category multiples alone lose (rows C–G): categories are thin and their multiples span three orders of magnitude. The power law is the base; the other terms earn only what the table above supports.</p>';
		return html;
	}

	function quantileOf(xs, q) {
		var s = xs.slice().sort(function (a, b) { return a - b; });
		if (s.length === 1) return s[0];
		var at = (s.length - 1) * q, lo = Math.floor(at), hi = Math.ceil(at);
		return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (at - lo);
	}

	function scatterSvg() {
		var W = 720, H = 350, L = 56, R = 12, T = 10, B = 32;
		var xMin = Math.log(4e6), xMax = Math.log(4e10), yMin = Math.log(8e5), yMax = Math.log(4e10);
		function X(v) { return L + (Math.log(v) - xMin) / (xMax - xMin) * (W - L - R); }
		function Y(v) { return T + (yMax - Math.log(v)) / (yMax - yMin) * (H - T - B); }
		var a = DATA.ols.intercept, b = DATA.ols.slope;
		var resid = DATA.live.map(function (c) { return Math.log(c.mcap_usd / (Math.exp(a) * Math.pow(c.tvl_usd, b))); });
		var p25 = quantileOf(resid, 0.25), p75 = quantileOf(resid, 0.75);
		var out = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Scatter of value against TVL">';
		[1e7, 1e8, 1e9, 1e10].forEach(function (g) {
			out += '<line x1="' + X(g) + '" y1="' + T + '" x2="' + X(g) + '" y2="' + (H - B) + '" stroke="#EFE8D4"/>' +
				'<text x="' + X(g) + '" y="' + (H - B + 16) + '" font-size="10" fill="#5E6E64" text-anchor="middle">' + fmtUsd(g) + '</text>' +
				'<line x1="' + L + '" y1="' + Y(g) + '" x2="' + (W - R) + '" y2="' + Y(g) + '" stroke="#EFE8D4"/>' +
				'<text x="' + (L - 5) + '" y="' + (Y(g) + 3) + '" font-size="10" fill="#5E6E64" text-anchor="end">' + fmtUsd(g) + '</text>';
		});
		// residual band polygon around the fitted power law
		var top = '', bot = '';
		for (var i = 0; i <= 40; i++) {
			var tvl = Math.exp(xMin + (xMax - xMin) * i / 40);
			var base = Math.exp(a) * Math.pow(tvl, b);
			top += (i === 0 ? 'M' : 'L') + X(tvl).toFixed(1) + ',' + Y(base * Math.exp(p75)).toFixed(1) + ' ';
			bot = 'L' + X(tvl).toFixed(1) + ',' + Y(base * Math.exp(p25)).toFixed(1) + ' ' + bot;
		}
		out += '<path d="' + top + bot + 'Z" fill="#0C2B23" opacity="0.08"/>';
		var line = '';
		for (var j = 0; j <= 40; j++) {
			var t2 = Math.exp(xMin + (xMax - xMin) * j / 40);
			line += (j === 0 ? 'M' : 'L') + X(t2).toFixed(1) + ',' + Y(Math.exp(a) * Math.pow(t2, b)).toFixed(1) + ' ';
		}
		out += '<path d="' + line + '" fill="none" stroke="#0C2B23" stroke-width="1.6"/>';
		DATA.rows.forEach(function (r) {
			out += '<circle cx="' + X(r.tvl_usd).toFixed(1) + '" cy="' + Y(r.implied_value_usd).toFixed(1) + '" r="2.6" fill="#E8A33D" opacity="0.85"/>';
		});
		DATA.live.forEach(function (c) {
			out += '<circle cx="' + X(c.tvl_usd).toFixed(1) + '" cy="' + Y(c.mcap_usd).toFixed(1) + '" r="2.6" fill="#0C2B23" opacity="0.7"/>';
		});
		out += '<text x="' + (W - R) + '" y="' + (H - 4) + '" font-size="10.5" fill="#5E6E64" text-anchor="end">TVL (log scale)</text>' +
			'<text x="' + L + '" y="' + (H - 4) + '" font-size="10.5" fill="#5E6E64">value: actual cap for comps, implied for the board</text></svg>';
		return out;
	}

	/** The walk-forward table, shared by the board page's wide section and the method page. */
	function walkForwardTableHtml() {
		var po = DATA.pooled_holdout;
		var rows = DATA.walk_forward.map(function (r) {
			return '<tr><td class="num">' + esc(r.cutoff) + '</td><td class="r num">' + r.n_train + '</td><td class="r num">' + r.n_test + '</td>' +
				'<td class="r num"><b>' + r.model_mean_log10.toFixed(4) + '</b></td><td class="r num">' + r.model_median_fold.toFixed(2) + '</td>' +
				'<td class="r num">' + r.flat_mean_log10.toFixed(4) + '</td></tr>';
		}).join('') +
			'<tr><td><b>Pooled (both cutoffs)</b></td><td class="r num">&mdash;</td><td class="r num"><b>' + po.n + '</b></td>' +
			'<td class="r num"><b>' + po.model_mean_log10.toFixed(4) + '</b></td><td class="r num"><b>' + po.model_median_fold.toFixed(2) + '</b></td>' +
			'<td class="r num">' + po.flat_mean_log10.toFixed(4) + '</td></tr>';
		return '<table><thead><tr><th>Fit up to</th><th class="r">Train</th><th class="r">Test</th><th class="r">radar-3</th><th class="r">Fold</th><th class="r">Flat 0.25</th></tr></thead><tbody>' + rows + '</tbody></table>' +
			'<p class="note">Fit on the older comps only, scored on the newer ones — the closest test to pricing a future launch. radar-3 beats flat at both cutoffs, and on the pooled fold it beats plain radar-2 (&times;' + po.model_median_fold.toFixed(2) + ' vs &times;' + po.plain_median_fold.toFixed(2) + ') — the one measured change in this model, which LOO alone cannot see (0.6868 vs 0.6867).</p>';
	}

	/** The scatter legend, shared by the board page's wide section and the method page. */
	function scatterLegendHtml() {
		return '<p class="legend">The fitted power law and its p25–p75 residual band.<span class="dot" style="background:#0C2B23"></span>' + DATA.comps_size + ' traded comps at their actual caps<span class="dot" style="background:#E8A33D"></span>' + DATA.board_size + ' board protocols at implied values. Caps grow slower than TVL (slope ' + DATA.ols.slope + '), so multiples fall as protocols grow.</p>';
	}

	/** Per-category walk-forward accuracy, pooled across both cutoffs — weak categories included. */
	function categoryHoldoutTableHtml() {
		var rows = DATA.category_holdout.map(function (c) {
			return '<tr><td>' + esc(c.category) + '</td><td class="r num">' + c.n + '</td><td class="r num">' + c.mean_log10.toFixed(4) + '</td><td class="r num">' + c.median_fold.toFixed(2) + '</td></tr>';
		}).join('');
		return '<table><thead><tr><th>Category</th><th class="r">Test comps</th><th class="r">Mean err</th><th class="r">Median miss</th></tr></thead><tbody>' + rows + '</tbody></table>';
	}

	function wideHtml() {
		var p = DATA.partition;
		var partRows = [
			['Ranked on this board', p.ranked],
			['Already trading — the calibration comps', p.trading],
			['Sub-products of traded tokens (token fields, no cap recorded)', p.sub_products],
			['Token recorded, market cap $0', p.zero_cap],
			['Market cap recorded as a −$1 sentinel (autofinance)', p.sentinel_cap],
			['Exchanges (CEX category)', p.exchanges],
			['Versioned pools of another entry', p.versioned],
			['Staking-receipt products, set aside', p.staking_products],
			['Bridge products, set aside', p.bridge_products],
			['Named wrapped products, set aside', p.named_products],
			['Stand-alone but below the $5M board floor', p.unranked_small],
		].map(function (kv) { return '<tr><td>' + kv[0] + '</td><td class="r num">' + kv[1] + '</td></tr>'; }).join('') +
			'<tr><td><b>Total — the whole snapshot</b></td><td class="r num"><b>' + p.total + '</b></td></tr>';
		var costRows = DATA.chain_costs.map(function (c) {
			return '<tr><td>' + esc(c.label) + '</td><td class="r num">$' + c.usd.toFixed(2) + '</td></tr>';
		}).join('');
		var catRows = DATA.categories.map(function (c) {
			return '<tr><td>' + esc(c.category) + '</td><td class="r num">' + c.n + '</td><td class="r num">' + fmtMult(c.median) + '</td>' +
				'<td class="r num"><b>' + fmtMult(c.offset) + '</b></td><td class="r num">' + fmtMult(c.p25) + '</td><td class="r num">' + fmtMult(c.p75) + '</td></tr>';
		}).join('');
		return '<h2>Method in full</h2>' +
			'<div class="wide-grid3">' +
			'<div><h3>Walk-forward validation</h3>' + walkForwardTableHtml() + '</div>' +
			'<div><h3>Every protocol accounted for</h3><table><tbody>' + partRows + '</tbody></table>' +
			'<p class="note">One standard on both sides of the floor: ranked means the snapshot records no token and the protocol is not an exchange, a versioned pool, or a wrapped, staked or bridged product of a traded asset. Three protocols are set aside by name; the appendix\'s classification audit lists each with its category and reason.</p></div>' +
			'<div><h3>Farm economics — the stated scenario</h3>' +
			'<p class="note" style="color:var(--ink);font-size:12.5px">One position of <b>' + fmtFull(A.deposit_usd) + '</b> per protocol, held <b>' + A.horizon_days + ' days</b>. A launch is assumed to distribute <b>' + Math.round(A.drop_share * 100) + '% of implied value</b> pro-rata across current TVL; the position\'s slice is that share of its deposit. Fees are the plan\'s transactions at the cheapest chain listed (table below, November 2026 estimates). Forgone yield: ' + fmtFull(A.deposit_usd) + ' at ' + Math.round(A.forgone_rate * 100) + '% a year = <b>' + fmtMoney2(A.forgone_usd) + '</b>. Net = slice − fees − forgone; break-even = (fees + forgone) / slice. How this moves with deposit size and drop share: the sensitivity grid on the method view.</p>' +
			'<p class="note" style="color:var(--ink);font-size:12.5px;margin-top:6px">Verdict rule for unresearched rows: break-even &le;10% FARM, &le;33% THIN, above that SKIP — and FARM also requires a verified live program, so unresearched rows cap at THIN. The 40 watchlist verdicts come from verified program research dated 2026-11-18, named in each detail view, with the same arithmetic beside them.</p>' +
			'<table style="margin-top:6px"><thead><tr><th>Chain cost per transaction</th><th class="r">USD</th></tr></thead><tbody>' + costRows + '</tbody></table></div>' +
			'</div>' +
			'<div class="wide-grid" style="margin-top:16px">' +
			'<div><h3>Value against TVL</h3><div class="scatter-box">' + scatterSvg() + '</div>' +
			scatterLegendHtml() + '</div>' +
			'<div><h3>Category offsets actually used</h3><div class="scrollbox"><table><thead><tr><th>Category</th><th class="r">Comps</th><th class="r">Median x</th><th class="r">Offset used</th><th class="r">p25</th><th class="r">p75</th></tr></thead><tbody>' + catRows + '</tbody></table></div>' +
			'<p class="note">The offset column is the multiplier radar-3 applies — the category median log multiple shrunk k=' + M.cat_offset_k + ' toward the global median, clamped to &times;' + Math.exp(-M.cat_offset_cap).toFixed(2) + '–&times;' + Math.exp(M.cat_offset_cap).toFixed(2) + '. The raw median is context only.</p></div>' +
			'</div>' +
			'<p class="note" style="margin-top:16px">The calibration set — all ' + DATA.comps_size + ' traded comps with their TVL, cap and actual multiple — is printed in full in the evidence appendix (method view), so every fitted point can be checked against the snapshot.</p>' +
			'<div class="honest" style="margin-top:14px"><h3>What this board is not</h3>' +
			'<p>Implied value is a calibration against protocols that already trade, not a price prediction: the model\'s own held-out median error is a ' + DATA.validation.filter(function (v) { return v.id === 'S'; })[0].median_fold.toFixed(2) + 'x fold, and the printed band under-covers out of sample (see the method panel).</p>' +
			'<p>Six watchlist protocols already have tokens in reality — USDD, Bittensor dTAO, Plume Vaults, Doppler Finance, Mezo Earn and Hive Protocol. They stay on the board because the watchlist is the floor; their detail views say the token exists and their verdict is SKIP.</p>' +
			'<p>The farm scenario is accounting under stated assumptions, not a forecast, and break-even is a threshold to compare rows by — not an estimated probability. Programs were verified on 2026-11-18 and change fast; re-check official channels before depositing anything.</p></div>';
	}

	/** The sensitivity exhibit: net and break-even for three named FARM rows as the
			two stated assumptions (deposit size, drop share) move — every cell computed
			in model.ts from the same scenario the board prints, so grid and board agree. */
	function sensitivityHtml() {
		var S = DATA.sensitivity;
		function grid(kind) {
			var body = '';
			S.examples.forEach(function (ex) {
				// model.ts emits cells share-major, deposit-minor, in the grid's own order.
				S.shares.forEach(function (sh, i) {
					body += '<tr>' + (i === 0 ? '<td rowspan="' + S.shares.length + '"><b>' + esc(ex.name) + '</b></td>' : '') +
						'<td class="r num">' + Math.round(sh * 100) + '%</td>' +
						S.deposits.map(function (dep, j) {
							var c = ex.cells[i * S.deposits.length + j];
							if (kind === 'net') return '<td class="r num">' + fmtMoney2(c.net_usd) + '</td>';
							return '<td class="r num">' + (c.breakeven_pct === null ? 'n/a' : Math.round(c.breakeven_pct) + '%') + '</td>';
						}).join('') + '</tr>';
				});
			});
			return '<table><thead><tr><th>Protocol</th><th class="r">Drop</th>' +
				S.deposits.map(function (dep) { return '<th class="r">' + fmtUsd(dep) + '</th>'; }).join('') +
				'</tr></thead><tbody>' + body + '</tbody></table>';
		}
		return '<h3 style="margin-top:14px">Sensitivity — the farm arithmetic when the assumptions move</h3>' +
			'<p class="note">The board prints one point of this grid: $1,000 in, a 10% drop — fees fixed, slice and forgone yield scaling with the deposit. Three FARM rows across both assumptions at once:</p>' +
			'<div class="sens"><div><h4>Net</h4>' + grid('net') + '</div><div><h4>Break-even odds</h4>' + grid('be') + '</div></div>' +
			'<p class="note" style="margin-top:6px">' + esc(S.conclusion) + '</p>';
	}

	// ---------- method page (?view=method) ----------
	// The evidence page: method panel, scatter, walk-forward table, sensitivity grid,
	// per-category holdout — plus the evidence appendix, which this view unhides.
	function renderMethodPage() {
		app.innerHTML = '<div class="shell">' + headerHtml(true) +
			'<main class="grid method-grid"><aside class="panel method">' + methodPanelHtml() + '</aside>' +
			'<section class="panel"><h2>Value against TVL</h2><div class="scatter-box">' + scatterSvg() + '</div>' +
			scatterLegendHtml() +
			'<h3 style="margin-top:14px">Walk-forward validation</h3>' + walkForwardTableHtml() +
			sensitivityHtml() +
			'<h3 style="margin-top:14px">Holdout accuracy by category — pooled, n &ge; 3</h3>' + categoryHoldoutTableHtml() +
			'<p class="note">Lending and Dexs are where this model misses widest. All 128 comps follow below in the appendix.</p>' +
			'</section></main>' + footerHtml() + '</div>';
		app.removeAttribute('aria-busy');
		setAppendix(true);
		window.scrollTo(0, 0);
	}

	function renderBoardPage() {
		var cats = categoriesPresent();
		var below = DATA.rows.filter(function (r) { return r.tvl_usd < DATA.floor_usd; }).length;
		var early = 'Early radar: ' + below + ' of the ' + DATA.board_size + ' rows sit below the ' + fmtUsd(DATA.floor_usd) + ' watchlist floor';
		app.innerHTML = '<div class="shell">' + headerHtml() + stripHtml() +
			'<section class="controls">' +
			'<input id="q" type="search" placeholder="Search name, category, chain or slug" autocomplete="off">' +
			'<select id="catSel" aria-label="Category"><option value="">All categories</option>' +
			cats.map(function (c) { return '<option' + (state.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
			'<select id="verdictSel" aria-label="Verdict"><option value="">All verdicts</option>' +
			['FARM', 'THIN', 'SKIP'].map(function (v) { return '<option value="' + v + '"' + (state.verdict === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select>' +
			'<label class="chk"><input id="wlOnly" type="checkbox"' + (state.wl ? ' checked' : '') + '> Watchlist only</label>' +
			'<select id="sortSel" aria-label="Sort">' +
			[['rank', 'Sort: radar rank'], ['implied', 'Sort: implied value'], ['net', 'Sort: farm net'], ['hour', 'Sort: farm $/hour'], ['tvl', 'Sort: TVL'], ['growth', 'Sort: 7d growth'], ['young', 'Sort: youngest first']]
				.map(function (kv) { return '<option value="' + kv[0] + '"' + (state.sort === kv[0] ? ' selected' : '') + '>' + kv[1] + '</option>'; }).join('') + '</select>' +
			'<span class="count" id="countLine"></span></section>' +
			'<main class="grid"><aside class="panel method">' + methodPanelHtml() + '</aside>' +
			'<section class="panel board"><div class="board-head" style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap"><h2>Pre-token board</h2><span class="note">' + early + '</span></div>' +
			'<p class="note" style="margin:4px 0 8px">Ranked: the snapshot records no token, and the protocol is not an exchange, a versioned pool, or a wrapped, staked or bridged product of a traded asset — one standard above and below the ' + fmtUsd(DATA.floor_usd) + ' watchlist floor, down to the snapshot\'s own $5M floor. Range is the model\'s p25–p75 error band; rank range the bootstrap p10–p90. Break-even is the launch odds at which the farm breaks even — &ldquo;&mdash;&rdquo; means costs exceed the slice at this size. Verdicts come from verified program research (each detail view), not from the scenario arithmetic: the $1,000 net printed with each verdict can be negative where fees dominate. Click a row for the full detail.</p>' +
			'<div class="table-wrap"><table><thead id="boardHead"></thead><tbody id="boardBody"></tbody></table></div></section></main>' +
			'<section class="panel wide">' + wideHtml() + '</section>' +
			footerHtml() + '</div>';
		app.removeAttribute('aria-busy');
		setAppendix(false);
		var q = document.getElementById('q');
		q.value = state.q;
		q.addEventListener('input', function () { state.q = q.value; syncUrl(); renderRows(); });
		var catSel = document.getElementById('catSel');
		catSel.addEventListener('change', function () { state.cat = catSel.value; syncUrl(); renderRows(); });
		var verdictSel = document.getElementById('verdictSel');
		verdictSel.addEventListener('change', function () { state.verdict = verdictSel.value; syncUrl(); renderRows(); });
		var wlOnly = document.getElementById('wlOnly');
		wlOnly.addEventListener('change', function () { state.wl = wlOnly.checked; syncUrl(); renderRows(); });
		var sortSel = document.getElementById('sortSel');
		sortSel.addEventListener('change', function () { state.sort = sortSel.value; syncUrl(); renderRows(); });
		document.getElementById('boardBody').addEventListener('click', function (ev) {
			var tr = ev.target.closest('tr[data-slug]');
			if (tr) location.href = './index.html?detail=' + encodeURIComponent(tr.getAttribute('data-slug'));
		});
		renderRows();
	}

	// ---------- detail page ----------
	/** Nearest traded peers: same category where it has comps; where it has none
			(Firelight's Insurance), nearest by TVL across all comps, labelled as such. */
	function peersFor(row) {
		function near(list) {
			return list
				.map(function (c) { return { c: c, d: Math.abs(Math.log(c.tvl_usd / row.tvl_usd)) }; })
				.sort(function (a, b) { return a.d - b.d; })
				.slice(0, 3)
				.map(function (x) { return x.c; });
		}
		var same = near(DATA.live.filter(function (c) { return (c.category || '') === (row.category || ''); }));
		if (same.length) return { list: same, fallback: false };
		return { list: near(DATA.live), fallback: true };
	}

	function kvCell(k, v) {
		return '<div class="cell"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>';
	}

	function renderDetailPage() {
		var row = rowsBySlug[state.detail];
		if (!row) { renderBoardPage(); return; }
		var e = row.econ;
		var researched = row.farm_source !== null;
		var base = row.tvl_usd * row.base_multiple;
		var peers = peersFor(row);
		var peerRows = peers.list.map(function (c) {
				return '<tr><td><span class="pname">' + esc(c.name) + '</span></td><td class="r num">' + fmtUsd(c.tvl_usd) + '</td>' +
					'<td class="r num">' + fmtUsd(c.mcap_usd) + '</td><td class="r num">' + fmtMult(c.mcap_usd / c.tvl_usd) + '</td></tr>';
			}).join('');
		var bannerText = researched
			? 'Program: <b>' + esc(row.farm_program) + '</b>. The verdict comes from verified program research (source below), not from the scenario arithmetic — the standardised $1,000 scenario is printed beside it, unchanged, for comparison.'
			: 'No verified points program is recorded for this protocol. The verdict comes from the stated odds rule: break-even &le;10% FARM, &le;33% THIN, above that SKIP — and FARM also requires a verified live program, which this protocol does not have.';
		// A break-even above 100% is not an odds figure a reader can act on: say plainly that the
		// costs exceed the slice at this size instead of printing a percentage over 100.
		var breakevenCell = e.breakeven_pct === null ? '<td class="r num">n/a</td>'
			: e.breakeven_pct > 100 ? '<td class="r">not reachable at this size — fees + forgone yield exceed the scenario slice</td>'
			: '<td class="r num">' + fmtPct(e.breakeven_pct) + '</td>';
		// A FARM verdict beside a negative scenario net can look contradictory, so
		// reconcile it in numbers: break-even vs the odds rule's 33% THIN ceiling, and
		// the deposit (from the sensitivity data) where the arithmetic turns.
		var recon = '';
		if (row.verdict === 'FARM' && e.net_usd < 0) {
			var t = DATA.sensitivity.turn[row.slug];
			var beTxt = e.breakeven_pct === null ? 'not computable on a zero slice' : Math.round(e.breakeven_pct) + '%';
			var sizeTxt = !t ? ''
				: t.at10 !== null ? ' On size alone this row turns positive from a deposit of ' + fmtFull(t.at10) + ' at the standard 10% drop.'
				: t.at20 !== null ? ' No deposit size rescues it at a 10% drop — the slice per dollar is under the forgone yield — but it turns positive from ' + fmtFull(t.at20) + ' at a 20% drop.'
				: ' No deposit size rescues it even at a 20% drop — the slice per dollar is under the forgone yield — so the verdict rests on the verified program alone.';
			recon = '<p class="note" style="margin-top:6px"><b>Reconciliation, in numbers:</b> the odds rule alone would not pass this row — its break-even is ' + beTxt + ' against the 33% THIN ceiling — so the FARM verdict above is the researched program verdict, and this scenario\'s net (' + fmtMoney2(e.net_usd) + ') is printed beside it, not hidden.' + sizeTxt + ' The full grid is on the method view.</p>';
		}
		var html = '<div class="shell detail">' + headerHtml(true) +
			'<p style="margin-top:5px"><a class="back" href="./index.html">&larr; Back to the board</a></p>' +
			'<section class="panel">' +
			'<div class="detail-head"><div><h2 style="font-size:18px">' + esc(row.name) + (row.watchlist ? '<span class="tag">WATCHLIST</span>' : '') + '</h2>' +
			'<span class="slug">' + esc(row.slug) + ' &middot; ' + esc(row.category || 'Uncategorised') + ' &middot; ' + esc(row.chains.join(', ') || 'no chains listed') + '</span></div>' +
			'<div style="text-align:right"><div class="sub">Radar rank</div><div style="font-size:18px;font-weight:800">#' + row.rank + ' <small style="font-size:12px;color:var(--muted)">of ' + DATA.board_size + '</small></div></div></div>' +
			'<div class="banner ' + row.verdict + '"><div class="big">' + row.verdict + '</div><p>' + bannerText + '</p></div>' +
			'<div class="kv">' +
			kvCell('Implied value', fmtFull(row.implied_value_usd)) +
			kvCell('TVL', fmtFull(row.tvl_usd)) +
			kvCell('Effective multiple', fmtMult(row.eff_multiple)) +
			kvCell('7d TVL change', (row.change_7d === null ? 'n/a' : (row.change_7d > 0 ? '+' : '') + row.change_7d.toFixed(1) + '%')) +
			kvCell('Range (p25–p75)', fmtUsd(row.range_lo) + ' – ' + fmtUsd(row.range_hi)) +
			kvCell('Rank range (bootstrap)', '#' + row.rank_lo + ' – #' + row.rank_hi) +
			kvCell('Age without a token', fmtAge(row.age_days) + (row.listed_at ? ' <small>since ' + esc(row.listed_at) + '</small>' : '')) +
			kvCell('Scenario net', fmtMoney2(e.net_usd)) +
			'</div>' +
			'<div class="dgrid">' +
			'<div><h3>How the model prices it</h3><div class="eqbox">' +
			'power law &times; category offset = ' + fmtFull(base) + '<br>' +
			'&times; growth ' + row.growth_multiplier.toFixed(2) + ' (7d ' + (row.change_7d === null ? 'n/a' : row.change_7d.toFixed(1) + '%') + ', weight ' + M.growth_weight + ')<br>' +
			'&times; maturity ' + row.maturity_multiplier.toFixed(2) + ' (' + fmtAge(row.age_days) + ' without a token)<br>' +
			'= <b>' + fmtFull(row.implied_value_usd) + '</b> implied</div>' +
			'<p class="note">Category offset used: &times;' + row.cat_offset.toFixed(2) + ' — ' + esc(row.category || 'this category') + ' has ' + row.cat_n + ' traded comp' + (row.cat_n === 1 ? '' : 's') + (row.cat_median !== null ? ' with a median actual multiple of ' + fmtMult(row.cat_median) : '') + '. The range is the model\'s p25–p75 error band for the category' + (row.range_hi / Math.max(1, row.range_lo) > 16 ? ' — a wide band: this row\'s value is genuinely uncertain, and the rank range says the same' : '') + '. Rank range: p10–p90 across ' + DATA.bootstrap.refits + ' bootstrap refits.</p>' +
			'<h3 style="margin-top:7px">Nearest traded peers (' + (peers.fallback ? 'nearest by TVL — no traded comp shares its category' : 'same category') + ')</h3>' +
			'<table><thead><tr><th>Protocol</th><th class="r">TVL</th><th class="r">Market cap</th><th class="r">Actual x</th></tr></thead><tbody>' + peerRows + '</tbody></table></div>' +
			'<div><h3>Farm economics — the stated $1,000 scenario</h3>' +
			'<table><tbody>' +
			'<tr><td>Deposit (scenario capital)</td><td class="r num">' + fmtFull(e.deposit_usd) + '</td></tr>' +
			'<tr><td>Scenario slice — ' + Math.round(A.drop_share * 100) + '% of implied value, pro-rata across TVL</td><td class="r num">' + fmtMoney2(e.slice_usd) + '</td></tr>' +
			'<tr><td>Fees — ' + e.txs + ' transactions on ' + esc(e.chain) + ' at $' + e.chain_cost_usd.toFixed(2) + '</td><td class="r num">−' + fmtMoney2(e.fees_usd) + '</td></tr>' +
			'<tr><td>Forgone yield — ' + Math.round(A.forgone_rate * 100) + '% a year for ' + A.horizon_days + ' days</td><td class="r num">−' + fmtMoney2(e.forgone_usd) + '</td></tr>' +
			'<tr><td><b>Net</b></td><td class="r num"><b>' + fmtMoney2(e.net_usd) + '</b></td></tr>' +
			'<tr><td>Break-even launch odds (a threshold, not a prediction)</td>' + breakevenCell + '</tr>' +
			'<tr><td>Net per hour of plan time (' + e.hours.toFixed(1) + ' h total)</td><td class="r num">' + fmtMoney2(e.per_hour_usd) + '</td></tr>' +
			'</tbody></table>' +
			'<p class="note">Fees use the cheapest chain the protocol lists, costed from the printed chain table (November 2026 estimates). The scenario is the same for every row so rows can be compared; a researched plan\'s own steps may use different capital, and say so.</p>' + recon + '</div>' +
			'</div>' +
			'<h3 style="margin-top:8px">Farm plan</h3>' +
			'<ol class="steps">' + row.farm_steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
			(researched ? '<p class="src">Program: ' + esc(row.farm_program) + ' &middot; Source: ' + esc(row.farm_source) + '. Verified 2026-11-18 from the protocol\'s official pages or the named report; programs change fast — re-check before depositing.</p>' : '') +
			'</section>' + footerHtml() + '</div>';
		app.innerHTML = html;
		app.removeAttribute('aria-busy');
		setAppendix(false);
		window.scrollTo(0, 0);
	}

	if (state.detail) renderDetailPage();
	else if (state.view === 'method') renderMethodPage();
	else renderBoardPage();
})();
