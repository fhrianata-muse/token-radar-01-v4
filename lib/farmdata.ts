// Verified farm research for the 40 watchlist protocols: research/FARM.md, every claim checked
// against a source actually opened on 2026-11-18. Verdicts, program names and sources are
// research data, not model output: the value model never sees them, and the economics in
// lib/model.ts are computed identically for researched and unresearched rows.
//
// FARM/THIN steps are FARM.md's steps verbatim (they were machine-checked at 20-600 characters
// when the research was written). SKIP protocols have no FARM.md steps - there is no honest
// plan to write for them - so each carries two hand-written steps from its FARM.md
// classification: why there is no farm, and what exists instead. lib/model.ts appends the
// verdict-and-economics closing step to every researched plan, so every watchlist row states
// its verdict and its scenario arithmetic inside board.json as well as on the dashboard.
//
// Six watchlist rows are already tokenised in reality (usdd, bittensor-dtao, plume-vaults,
// doppler-finance, mezo-earn, hive-protocol). They stay on the board - the gate requires all
// 40 watchlist slugs - and their records below say plainly that the token already exists.

import type { Verdict } from './model.ts';

/** One watchlist protocol's researched farm record. */
export interface FarmResearch {
  verdict: Verdict;
  /** The verified program's name, or 'None found' / a status note where there is none. */
  program: string;
  /** Where the verdict was verified: a source label as plain text (no links in the dashboard). */
  source: string;
  /** The plan's steps (see the header): FARM.md verbatim for FARM/THIN, two written steps for SKIP. */
  steps: string[];
}

/** Researched records by slug: all 40 watchlist protocols, in snapshot watchlist order. */
export const FARM_RESEARCH: Record<string, FarmResearch> = {
  "steakhouse-financial": {
    verdict: "SKIP",
    program: "None found",
    source: "steakhouse.financial homepage, opened 2026-11-18",
    steps: [
      "Skip the launch farm: Steakhouse is a B2B vault curator and no Steakhouse points program or token was found on its own pages (checked 2026-11-18); depositing into its Morpho vaults earns lending yield only, and nothing in that yield is a claim on a future Steakhouse token. Cost: $0. Time: 3 minutes to read.",
      "Do instead: use a Steakhouse vault only if you want the lending yield itself, sized as a yield position; if Steakhouse ever announces a program it will appear on its official channels first \u2014 do not act on third-party points claims. Cost: $0. Time: 5 minutes to set a reminder.",
    ],
  },
  "gauntlet": {
    verdict: "SKIP",
    program: "None found",
    source: "gauntlet.xyz homepage, opened 2026-11-18",
    steps: [
      "Skip the launch farm: Gauntlet is a risk manager and curator for institutions; no Gauntlet points program or token was found on its own pages (checked 2026-11-18). Its Morpho, Kamino and Aera vaults pay lending yield only. Cost: $0. Time: 3 minutes to read.",
      "Do instead: treat any Gauntlet-curated vault as a plain yield position and judge it on its APY and risk reports, not on a launch that has not been announced. Cost: $0. Time: 5 minutes to set a reminder.",
    ],
  },
  "veda": {
    verdict: "THIN",
    program: "Veda Points (real, earned indirectly via partner vaults)",
    source: "veda.tech blog, Lombard launch post, opened 2026-11-18",
    steps: [
      "Do NOT deposit into a generic 'Veda vault'. The verified route is a partner product: via Lombard, stake BTC to mint LBTC, then deposit LBTC into Lombard's DeFi Vault and hold LBTCv, which the official Veda post credits at 3x Veda Points. Capital: $150+ in BTC (points scale with size/time). Gas: ~$5-15 total on Ethereum-ecosystem chains, estimate. Setup 30 min. Risk: BTC/LBTC peg and vault strategy risk; US users are excluded.",
      "Alternative verified ecosystem route: hold ether.fi Liquid vault shares (Veda BoringVault infrastructure, curated by Nonce Capital) \u2014 but note any Veda Points for that route are UNVERIFIED in opened sources, so treat yield (~3.5% APY class) as the only certain return. Capital $150 in ETH/eETH. Gas ~$5-10 Ethereum, estimate. Ongoing 5 min/week to check the Veda Points dashboard for qualifying activities.",
      "Keep the qualifying position held continuously and check the Veda Points dashboard / Veda official X monthly for the current qualifying list \u2014 points only accrue during listed activities. No lock-up in the vault itself (withdrawable, subject to partner vault terms). Ongoing 10 min/month. Main risk: points may never convert to a token \u2014 UNVERIFIED conversion, so size this as yield-first, points as a free option.",
    ],
  },
  "usdd": {
    verdict: "SKIP",
    program: "None (USDD Earn is a yield product, not a points program)",
    source: "docs.usdd.io glossary, opened 2026-11-18",
    steps: [
      "Skip: USDD is not pre-token at all \u2014 it is a live, traded stablecoin launched in May 2022, so there is no future USDD launch to farm; the snapshot simply records no market cap for it. Cost: $0. Time: 2 minutes to read.",
      "What exists instead is USDD Earn: deposit USDD, receive sUSDD at a base APY of about 4% with flexible terms (per the USDD docs) \u2014 a yield product to judge on its own rate and risk, not a farm. Cost: $0 to read the terms. Time: 5 minutes.",
    ],
  },
  "nonce-capital": {
    verdict: "SKIP",
    program: "None found",
    source: "veda.tech ecosystem page for Nonce Capital, opened 2026-11-18",
    steps: [
      "Skip: Nonce Capital is a B2B strategy curator building vaults on ether.fi infrastructure; it has no retail vault of its own to deposit into, no points and no token (checked 2026-11-18), so there is no wallet action that farms Nonce. Cost: $0. Time: 3 minutes to read.",
      "Do instead: nothing at the Nonce level \u2014 if you want the underlying exposure, it lives in ether.fi products under ether.fi own programs, which are a different protocol and a different farm. Cost: $0. Time: 2 minutes.",
    ],
  },
  "upshift": {
    verdict: "FARM",
    program: "Upshift Points, Season 2 (live; 5x boost before $750M TVL)",
    source: "app.upshift.finance/points \u2014 Upshift own points page, opened 2026-11-18",
    steps: [
      "Open app.upshift.finance/points, connect a wallet and confirm Season 2 is shown live before depositing anything. Setup 10 min, no cost. Then pick a plain USDC vault on Ethereum or Base (avoid exotic/RWA vaults for a first farm). Main check: note that vault's stated redemption lag in the app before you deposit \u2014 exits are queued, not instant, on standard redemption.",
      "Deposit $150 USDC into the chosen Upshift vault while the 5x pre-$750M-TVL boost is still active (page showed ~$530M/$750M on 2026-11-18, so the window is closing). You earn 1x base points on any vault deposit, boosted 5x in this window. Gas: ~$1-5 on Base, ~$3-10 on Ethereum, estimate. Setup 15 min. Lock-up: queued redemption (verify lag in-app; instant exit may cost a small fee). Risk: curator strategy and smart-contract risk.",
      "Hold the vault shares untouched \u2014 points reward depositing/holding, not churn. Do NOT rotate between strategies weekly; that only burns gas. Check the points page monthly (5 min/month) for new missions the program says will be added. Ongoing ~0 min/week otherwise.",
      "Exit plan: start the standard redemption well before you need the money, since payout waits out the vault's lag plus a daily processing run (exact lag UNVERIFIED from opened sources \u2014 read it in-app). Keep total Upshift exposure sized as if points may be worth zero: no token or conversion is promised on the points page.",
    ],
  },
  "bittensor-dtao": {
    verdict: "SKIP",
    program: "None (incentives are live TAO and subnet alpha emissions)",
    source: "bittensor.com staking docs, opened 2026-11-18",
    steps: [
      "Skip: dTAO is not pre-token \u2014 TAO has traded for years and every subnet has its own live alpha token since February 2025, so there is no future launch to position for; staking earns emissions of tokens that already exist. Cost: $0. Time: 3 minutes to read.",
      "What exists instead is ordinary TAO staking (minimum 0.002 TAO, no unbonding period per the official docs): root staking stays TAO-denominated, subnet staking swaps into that subnet alpha at the pool price with full price risk. Judge it as staking, not farming. Cost: $0 to read. Time: 5 minutes.",
    ],
  },
  "onre": {
    verdict: "FARM",
    program: "OnRe Points (live; 1x hold / 2x LP / 3x lending / 4x yield trading)",
    source: "onre.finance blog, OnRe Points launch post, opened 2026-11-18",
    steps: [
      "Do NOT try to mint on app.onre.finance unless you can pass qualified-investor KYC \u2014 retail cannot redeem with OnRe. Instead buy $150 of ONyc on Solana via Kamino Swap or the Orca ONyc pools with a Solana wallet. Gas/fees: ~$0.10-1 total on Solana, estimate, plus swap slippage. Setup 20 min. You immediately earn base yield in NAV plus 1 point per ONyc per day (1x holding rate). Risk: you exit by selling on secondary markets, which can trade away from NAV.",
      "Move the ONyc into Kamino: supply it as collateral in the OnRe/Kamino market to lift points to the 3x lending rate (official table). Optionally borrow USDG against it only if you understand liquidation \u2014 borrowed-USDG incentives were promoted at launch but current availability is UNVERIFIED. Gas ~$0.10/tx, estimate. Ongoing 10 min/week to check health factor. Lock-up: none on supply, but collateral is at liquidation risk if you borrow.",
      "For 2x instead of leverage risk: provide ONyc liquidity on Orca or Raydium (official 2x LP tier). Capital can be the same $150 split ONyc/USDC or ONyc/sUSDe. Fees ~$0.10-0.50, estimate. Ongoing 15 min/week to keep a concentrated position in range. Risk: impermanent loss and range management; this is the safer multiplier step-up.",
      "Track points in the OnRe app (positions/points shown in real time per the official post) and keep a dated screenshot monthly. No lock-up on DeFi positions. Main risks overall: reinsurance/NAV risk behind ONyc, secondary-market exit discount, and Points having no published conversion to any token \u2014 size as yield-first.",
    ],
  },
  "rockawayx": {
    verdict: "SKIP",
    program: "None found",
    source: "rockawayx.com vault curation overview, opened 2026-11-18",
    steps: [
      "Skip the launch farm: RockawayX is an institutional curator (a $2B+ AUM firm) and no RockawayX points program, quests or token were found on its own pages (checked 2026-11-18); its core products are permissioned or white-label. Cost: $0. Time: 3 minutes to read.",
      "What exists instead: three retail-depositable Morpho vaults (rxUSDCp, rxUSDCy, rxWETH) paying lending yield only, withdrawable at any time subject to liquidity \u2014 a yield position, not a farm. Cost: $0 to read the vault terms. Time: 5 minutes.",
    ],
  },
  "symbiotic": {
    verdict: "FARM",
    program: "Symbiotic Points, Season 2 (live; Core V2 formula published)",
    source: "docs.symbiotic.fi, points program page, opened 2026-11-18",
    steps: [
      "Go to app.symbiotic.fi, connect an Ethereum wallet, and pick a vault whose collateral is actively delegated to networks (Season 2) rather than an idle pre-deposit vault \u2014 official docs pay points for delegated collateral, and Core V2 pays on TVL actively allocated to adapters. Setup 20 min. Gas on Ethereum ~$3-10 per tx, estimate. Before depositing, read that vault's networks/operators: delegation means slashing exposure.",
      "Deposit $150 of an accepted collateral asset (e.g. an ETH/LST position per the vault you chose \u2014 check the vault's accepted collateral in the app; do not assume USDC is accepted by the vault you want). Points accrue hourly under the published V2 formula (vault TVL allocated \u00d7 0.001/hour, shared pro-rata). Ongoing 5 min/week to confirm points are accruing in the app. Lock-up: vault-specific withdrawal terms apply \u2014 check in-app.",
      "Keep the position delegated and untouched; churn does not earn more points. Re-check monthly (10 min) that your vault is still actively allocated \u2014 an idle/migrated vault earns at the lower or zero effective rate. If you entered via an LRT wrapper instead, check points in that provider's interface, as the docs warn they may not show in the Symbiotic app.",
      "Risk sizing: Symbiotic has run points since 2024 with no token confirmed in its docs \u2014 treat points as a free option on top of restaking yield you actually want, never as the sole reason. Main risks: slashing of delegated collateral, vault curator/operator risk, and indefinite points duration.",
    ],
  },
  "opentrade": {
    verdict: "SKIP",
    program: "None found",
    source: "opentrade.io official blog, opened 2026-11-18",
    steps: [
      "Skip: OpenTrade is permissioned B2B RWA yield infrastructure \u2014 vault access is limited to KYC/KYB-cleared institutional, professional or accredited investors on a whitelist, so a retail wallet cannot deposit at all (checked 2026-11-18). Cost: $0. Time: 3 minutes to read.",
      "Do instead: nothing \u2014 there is no retail route, no points program and no token to position for; if OpenTrade ever opens a retail product it will be announced on its official channels. Cost: $0. Time: 2 minutes.",
    ],
  },
  "hyperithm": {
    verdict: "THIN",
    program: "None found for Hyperithm itself",
    source: "Morpho app, Hyperithm USDC vault page, opened 2026-11-18",
    steps: [
      "Set up a wallet for Hyperithm on Ethereum and fund it with ETH for gas plus USDC. Cost: about $5\u201315 gas to start at typical Nov 2026 mainnet fees (estimate). Setup: 15 min. No lock-up. Risk: using the wrong chain \u2014 the verified Apex vault is on Ethereum, not only Monad.",
      "Deposit $150 USDC into Hyperithm USDC Apex on Morpho (Ethereum) and keep the vault shares. Cost: $150 capital + about $3\u20138 gas (estimate). Setup: 10 min. Ongoing: 5 min/week to check APY and allocations. Lock-up: none in the vault itself. Risk: lending-market and curator allocation risk; yield is variable, about 6.8% at check time.",
      "Hold the position at least 30 days and make one small top-up (about $50 + $3\u20138 gas, estimate) in week 2 or 3 so the wallet shows sustained use, not a one-day touch. Ongoing: 10 min/week. Lock-up: none. Risk: this earns yield only \u2014 no Hyperithm points program was verified, so do not count on an airdrop.",
      "Once a month, review the vault's market allocations on Morpho and withdraw to USDC if an allocation you dislike appears or APY falls below your hurdle. Cost: about $3\u20138 gas per withdrawal (estimate). Time: 10 min/month. Risk: exit liquidity depends on Morpho market liquidity at that moment.",
    ],
  },
  "lightning-network": {
    verdict: "SKIP",
    program: "None (no issuer, no token, no points by design)",
    source: "lightning.network summary paper, opened 2026-11-18",
    steps: [
      "Skip: the Lightning Network is Bitcoin payment infrastructure \u2014 a decentralised protocol with no issuer, no points, no snapshot and no token to launch, so there is nothing to farm and any Lightning points claim is a fabrication. Cost: $0. Time: 2 minutes to read.",
      "What exists instead is simply using Lightning for payments, or running a routing node for fee income \u2014 ordinary Bitcoin activity that earns fees, not a launch allocation. Cost: $0 to read. Time: 5 minutes.",
    ],
  },
  "plume-vaults": {
    verdict: "THIN",
    program: "Plume Points \u2014 ended 2026-03-31; PLUME already trades",
    source: "plume.org blog, Portal post, opened 2026-11-18",
    steps: [
      "Bridge $150 USDC to Plume (Chain ID 98866) and mint pUSD 1:1 at pusd.plume.org; keep a little PLUME for gas. Cost: $150 capital + about $2\u20136 total bridge/gas (estimate, Plume gas is cheap). Setup: 20 min. Lock-up: none yet. Risk: bridge risk and using Ethereum by mistake \u2014 Plume Vaults do not run on Ethereum mainnet.",
      "Deposit $120 pUSD into a liquid Plume Vault such as nTBILL on the Plume Vaults portal and hold the nTOKEN receipt. Cost: $120 capital + under $1 gas (estimate). Setup: 10 min. Ongoing: 10 min/week. Lock-up: nTBILL is the liquidity buffer vault with same-day/atomic options per docs; other vaults can require 7-day cooldown. Risk: RWA counterparty and redemption-window risk. Note: this earns yield only \u2014 Plume Points Season 2 ended 2026-03-31.",
      "Put the remaining $30 pUSD into a second vault (e.g. nBASIS or nALPHA) to diversify strategy exposure. Cost: $30 capital + under $1 gas (estimate). Time: 10 min. Ongoing: 10 min/week to compare vault APYs. Lock-up: check the chosen vault's redemption window before depositing. Risk: higher-yield vaults use less liquid RWAs and settle slower.",
      "Stake a small amount of PLUME (about $20 worth) at staking.plume.org only if you want validator staking yield separate from the vaults. Cost: $20 capital + under $1 gas (estimate). Time: 10 min. Lock-up: 21-day unstake cooldown. Risk: PLUME price volatility dwarfs the staking yield at this size; skip this step if you only want stablecoin yield.",
      "Review monthly and redeem nTOKENs back to pUSD/USDC if a vault's redemption terms worsen. Cost: under $2 gas (estimate). Time: 15 min/month. Risk: structured redemption windows mean exit is not always instant \u2014 never deposit money you need this week into a cooldown vault.",
    ],
  },
  "k3-capital": {
    verdict: "THIN",
    program: "None found",
    source: "Morpho forum, K3 Capital market post, opened 2026-11-18",
    steps: [
      "Open the Morpho app, find a K3 Capital-curated vault (e.g. K3USDC on Unichain), and supply $100 USDC. Cost: $100 capital + ~$1 gas on Unichain (estimate). Setup: 15 min. Ongoing: 10 min/week. Lock-up: none at vault level; 3-day timelock governs vault parameter changes, not your exit. Risk: Morpho smart-contract and collateral (WBTC/wstETH/weETH) risk; 10% performance fee. Yield only \u2014 no K3 points exist.",
      "Check the vault's market allocations monthly in the Morpho app and withdraw if K3 adds a collateral you do not accept. Cost: ~$1 gas (estimate). Time: 10 min/month. Risk: curator can reallocate within the vault's timelock rules.",
    ],
  },
  "hive-protocol": {
    verdict: "SKIP",
    program: "None (rewards are paid in the already-live B2 token)",
    source: "KuCoin B2 page and B2 Network materials, opened 2026-11-18",
    steps: [
      "Skip: Hive is not pre-token \u2014 it pays staking rewards in B2, the B2 Network token that has been live since April 2025 (20% of B2 supply is allocated to Hive staking), so there is no future launch to farm. Cost: $0. Time: 3 minutes to read.",
      "What exists instead is staking for B2 rewards: judge it on the live token price and the staking terms, not as a pre-launch position. Cost: $0 to read the terms. Time: 5 minutes.",
    ],
  },
  "r25": {
    verdict: "THIN",
    program: "None found",
    source: "DefiLlama R25 protocol page, opened 2026-11-18 (no official program page found)",
    steps: [
      "First check eligibility: R25 vaults on Pharos are for eligible users and exclude some regions \u2014 do not deposit if your jurisdiction is restricted. Cost: $0. Setup: 15 min reading the vault terms on Pharos/R25. Lock-up: varies by vault. Risk: being ineligible means no valid position, regardless of what the UI lets you click.",
      "If eligible, bridge $150 USDC to Pharos and deposit it into the R25 pRNH vault for U.S. high-yield credit exposure (indicated target about 7%, not guaranteed). Cost: $150 capital + about $2\u20135 bridge/gas (estimate). Setup: 20 min. Ongoing: 10 min/week. Lock-up: no fixed lock-up stated, but redemption settlement follows the underlying fund's timelines. Risk: high-yield corporate credit risk \u2014 this can lose value, unlike a T-bill vault.",
      "Keep the position for a full quarter and record the actual realised yield versus the ~7% indication before adding more. Cost: $0 extra. Time: 10 min/month. Lock-up: as above. Risk: judging an RWA credit vault on two weeks of data is meaningless; settlement lags hide problems early.",
      "Submit a small test redemption (about $25) once before you need the money, to measure real settlement time. Cost: about $1\u20133 gas (estimate). Time: 15 min plus settlement wait. Risk: if the test redemption is slow or gated, exit the rest early rather than discovering it during a deadline.",
    ],
  },
  "b14g": {
    verdict: "THIN",
    program: "None found (rewards are staking yield in existing tokens)",
    source: "DefiLlama b14g protocol page, opened 2026-11-18",
    steps: [
      "Read the post-exploit status first: DefiLlama records a Protocol Logic incident for b14g on 2026-10-31 and TVL fell sharply in November 2026. Cost: $0. Setup: 20 min. Risk decision: if you cannot verify from b14g/Core official channels that staking is safe and withdrawals work, do not deposit at all \u2014 this step is a gate, not a formality.",
      "Only if the gate passes: stake a small BTC amount via Core non-custodial BTC staking paired through b14g's dual-staking (BTC stays time-locked in your own wallet per the protocol design). Cost: at least $250 BTC to be economic after Bitcoin fees of about $5\u201320 (estimate, fee-market dependent). Setup: 45 min. Lock-up: your chosen BTC time-lock period. Risk: time-locked BTC cannot be exited early, plus fresh exploit risk.",
      "Add the CORE side of the dual stake (about $50 CORE on Core chain) so the position actually qualifies for the higher dual-staking tier instead of BTC-only. Cost: $50 capital + under $2 gas on Core (estimate). Time: 15 min. Ongoing: 10 min/week. Lock-up: CORE unstaking period applies. Risk: CORE price volatility can exceed the extra yield at this size.",
      "Claim staking rewards monthly and log them against BTC+CORE price moves; unstake at the first unlock if net return is negative. Cost: about $2\u201310 in fees per claim/exit (estimate). Time: 15 min/month. Risk: rewards are paid in volatile ecosystem tokens, not in BTC \u2014 headline APY is not your realised return.",
    ],
  },
  "clearstar": {
    verdict: "THIN",
    program: "None for Clearstar; adjacent Flare earnXRP incentives exist",
    source: "flare.network news, earnXRP launch post, opened 2026-11-18",
    steps: [
      "Get FXRP on Flare: buy about $120 of XRP, bridge/mint it to FXRP (XRP represented 1:1 on Flare) following Flare's FXRP guide, and keep a little FLR for gas. Cost: $120 capital + about $1\u20133 in fees/gas (estimate, Flare gas is cheap). Setup: 30 min. Lock-up: none yet. Risk: FXRP minting/bridge steps are the fiddliest part \u2014 test with $10 first.",
      "Deposit $100 FXRP into earnXRP on Upshift (the Flare XRP Yield Vault curated by Clearstar) and hold the earnXRP receipt token. Cost: $100 capital + under $1 gas (estimate). Setup: 10 min. Ongoing: 5 min/week. Lock-up: 72-hour standard withdrawal, or pay a small fee for instant redemption. Risk: curator strategy risk across Flare lending/liquidity venues; yield is XRP-denominated and variable.",
      "Keep the position at least 30 days so the auto-compounded XRP yield and the early-user 5x Upshift Points incentive (per Flare's launch post) have time to accrue. Cost: $0 extra. Time: 5 min/week to check vault TVL and strategy notes. Risk: the points are Upshift's, not Clearstar's \u2014 do not value this position as a Clearstar airdrop farm.",
      "Withdraw once to test the exit: burn earnXRP, wait the 72-hour window, and confirm FXRP lands back in your wallet. Cost: under $1 gas (estimate) or a small instant-redemption fee. Time: 10 min plus the wait. Risk: if you need same-day liquidity, the fee/window matters \u2014 size the position accordingly.",
    ],
  },
  "saturn": {
    verdict: "FARM",
    program: "Saturn Orbital Points, Season 2 (live; registration closed 2026-11-16)",
    source: "Saturn coverage via airdrops.io, opened 2026-11-18 (third-party report)",
    steps: [
      "Check jurisdiction first: Saturn excludes US, UK, EU, EEA and other restricted regions from the airdrop. If you are in one, stop \u2014 points farming cannot pay out. Also note registration closed 2026-11-16; farming now only makes sense if Saturn opens a further registration or Season 3. Cost: $0. Setup: 10 min. Risk: earning points you can never register is the main failure mode.",
      "On Ethereum, swap $150 USDC to USDat 1:1 in the Saturn app and simply hold it to earn Orbital Points daily (the base route; exact multiplier UNVERIFIED, reported 5\u20137x). Cost: $150 capital + about $3\u20138 gas (estimate). Setup: 15 min. Ongoing: 5 min/week. Lock-up: none for USDat. Risk: USDat is Treasury-backed per Saturn, but you hold smart-contract and peg risk until the Dec 8 / TGE snapshot.",
      "Move $100 of the USDat into the Curve USDC/USDat pool for the reported 20x LP multiplier instead of the base hold rate; keep $50 as plain USDat. Cost: $100 capital + about $5\u201312 gas for approve/deposit (estimate). Time: 20 min setup, 10 min/week. Lock-up: none, but exit before the snapshot stops accrual. Risk: LP and Curve contract risk; impermanent loss is minimal on a stable pair but not zero.",
      "Optionally stake $50 USDat to sUSDat for yield (target ~11% per Saturn via STRC exposure) \u2014 only if you accept the roughly 7-day unstake processing. Cost: $50 capital + about $3\u20136 gas (estimate). Time: 10 min. Lock-up: ~7 days on exit. Risk: sUSDat carries STRC/digital-credit exposure, unlike plain USDat's Treasury backing \u2014 do not stake the whole position this close to the snapshot.",
      "Calendar the endgame now: Season 2 snapshot is at TGE or 2026-12-08, whichever comes first, and claims will only be published by @saturn_credit on X. Cost: $0. Time: 5 min/week checking the official X account. Risk: fake claim sites are the top loss vector for this farm \u2014 never connect to a claim link from DMs, replies, or search ads.",
    ],
  },
  "lagoon": {
    verdict: "THIN",
    program: "None found (vault infrastructure, no program)",
    source: "lagoon.finance official site, opened 2026-11-18",
    steps: [
      "Pick one open, non-whitelisted vault at app.lagoon.finance (check the vault page for curator, strategy, fees and any KYC/whitelist gate before depositing). Capital: $100 USDC on Base or Arbitrum to keep gas low. Gas/fees: ~$0.10-1 per tx on L2 (estimate, Nov 2026), vault performance/management fees vary by vault. Setup: 20 min. Ongoing: 5 min/week. Lock-up: none fixed, but ERC-7540 redemptions are asynchronous and settle per vault schedule. Risk: curator strategy and smart-contract risk; yield is the only return \u2014 no points are promised.",
      "Deposit $100 USDC into the chosen Lagoon vault from a fresh wallet and keep the vault shares; do not split across many vaults, since no Lagoon incentive rewards multiple touches. Gas: ~$0.10-1 on Base/Arbitrum (estimate). Setup included above. Ongoing: check NAV and curator updates 5 min/week. Lock-up: async settlement only. Risk: underlying strategy (e.g. Morpho lending, Pendle PT) can lose value or pause withdrawals.",
      "Hold for at least 30 days only to actually earn the vault's stated APY, not for any snapshot \u2014 none is documented. Cost: capital already placed, ~$0.50/week in occasional gas (estimate). Time: 5 min/week. Lock-up: none beyond settlement. Risk: APY is variable and can fall below gas/opportunity cost on $100.",
      "Exit by requesting redemption in the Lagoon app and waiting for settlement before reusing the capital elsewhere. Gas: ~$0.10-1 on L2 (estimate). Time: 10 min plus settlement wait. Lock-up: settlement window only. Risk: exit delays set by the underlying protocols the vault allocates to.",
    ],
  },
  "curvance": {
    verdict: "THIN",
    program: "None verified as live (CVE/veCVE design documented)",
    source: "docs.curvance.com, opened 2026-11-18",
    steps: [
      "Bridge $100 in USDC or AUSD plus ~$5 of MON for gas to Monad (chain 143) and open app.curvance.com from the link in docs.curvance.com only. Gas on Monad: typically <$0.05 per tx (estimate, Nov 2026). Setup: 25 min including bridging. Ongoing: 10 min/week. Lock-up: none stated. Risk: new-chain bridge and protocol risk; CVE rewards are NOT confirmed \u2014 do this only for lending yield you actually want.",
      "Supply $100 of a stablecoin into one isolated Curvance market or an Earn Vault and keep the supply position open to earn variable lending interest. Gas: <$0.05 (estimate). Setup: 10 min. Ongoing: check rate and market health 5 min/week. Lock-up: none fixed in docs opened. Risk: isolated-market liquidity can be thin; rates are variable and can drop to near zero.",
      "Optional, only if you accept liquidation risk: borrow at most 30-40% against the stablecoin supply (never near the 97.5% max LTV on select assets), hold one week, then repay in full. Capital: the $100 already supplied. Gas: <$0.10 total (estimate). Time: 10 min/week. Lock-up: none. Risk: liquidation and bad-debt socialization are documented protocol mechanics; a depeg can wipe the position.",
      "Track only official channels (docs.curvance.com, curvance.com, @Curvance) for a CVE TGE, token contract on the Monad addresses page, or a named points season before counting any token upside. Cost: $0. Time: 10 min/week. Lock-up: n/a. Risk: buying any 'CVE' token before an official contract is published \u2014 scam tokens use the same ticker.",
    ],
  },
  "galaxy-curation": {
    verdict: "THIN",
    program: "None found (institutional curation)",
    source: "galaxy.com newsroom, vault curator launch post, opened 2026-11-18",
    steps: [
      "Bridge $100 USDC to Arc and open the Galaxy USDC vault (curator: Galaxy Curation) in the Morpho app; verify the curator name on the vault page before depositing. Gas on Arc: USDC-denominated, typically <$0.10 per tx (estimate, Nov 2026). Setup: 20 min. Ongoing: 5 min/week. Lock-up: none; withdrawals subject to vault liquidity ($32.3M available at check). Risk: single-market concentration and ~3% APY that may not beat opportunity cost; no points or token upside is documented.",
      "Deposit the $100 USDC and hold the arcUSDC vault shares; yield accrues in share value automatically, no claiming or weekly action is needed. Gas: <$0.10 (estimate). Ongoing: 5 min/week to check APY and liquidity. Lock-up: none. Risk: Morpho market/collateral risk chosen by the curator; the vault allocated 100% to one market at third-party checks (UNVERIFIED detail).",
      "Do NOT add a second Galaxy vault or weekly micro-deposits to 'show sustained allocation' \u2014 no incentive counts it. Instead review monthly whether 3% still justifies Arc bridging friction, and withdraw in one transaction if not. Gas: <$0.10 (estimate). Time: 10 min/month. Lock-up: none. Risk: bridge cost can erase months of yield on $100.",
    ],
  },
  "tydro": {
    verdict: "FARM",
    program: "TydroInkPoints, Season 2 (live; weekly budgets)",
    source: "forum.tydro.com, TydroInkPoints incentives thread, opened 2026-11-18",
    steps: [
      "Bridge $150 USDC (or USDT0) plus a small amount of ETH for gas to Ink (chain 57073) via the official Ink bridge and open app.tydro.com. Gas on Ink: typically <$0.05 per tx (estimate, Nov 2026). Setup: 30 min. Ongoing: 10 min/week. Lock-up: none. Risk: Ink is a young L2; points have no guaranteed $INK conversion rate or date.",
      "Supply the full $150 USDC on Tydro \u2014 USDC supply carried the largest weekly TydroInkPoints budget in the 11-18 Nov 2026 renewal (35,000 points). Gas: <$0.05 (estimate). Setup: 10 min. Ongoing: confirm your points balance weekly in the app/Merkl view. Lock-up: none; supplied assets stay withdrawable subject to utilisation. Risk: utilisation spikes can temporarily block withdrawals.",
      "Add the borrow leg only if you can monitor it: borrow ~$40 USDT0 against the USDC supply (USDT borrow budget 10,000 points that week), keep health factor high, repay within the week and re-borrow only while a borrow budget exists. Gas: <$0.10 total (estimate). Time: 10 min/week. Lock-up: none. Risk: liquidation if collateral/borrow prices move; borrow interest can exceed points value.",
      "Chase a Season 2 boost you genuinely qualify for (e.g. holding >=$100 kBTC gives a 5% kBTC-holder boost; prior Aave/Morpho lending history can add track-record boosts, global cap 50%) instead of splitting capital thinly. Cost: reallocating part of the $150. Gas: <$0.10 (estimate). Time: 15 min once. Lock-up: lender-track-record boost references a 30-day held balance for larger tiers. Risk: kBTC adds BTC wrapper/price risk.",
      "Re-check the official renewals thread every week and rotate supply toward assets whose budgets were renewed (budgets shrink over time \u2014 USDC supply fell from 48,000 to 35,000 across Oct-Nov renewals). Cost: $0 beyond gas if rotating (~$0.05, estimate). Time: 10 min/week. Lock-up: none. Risk: chasing budgets into illiquid assets like kHYPE for only 400 points/week is poor value.",
    ],
  },
  "valos": {
    verdict: "SKIP",
    program: "None found",
    source: "valos.io official site, opened 2026-11-18",
    steps: [
      "Skip: Valos is an institutional private-credit manager with disciplined onboarding and no retail app, no points and no token verified on its official pages (checked 2026-11-18) \u2014 a retail wallet has no deposit route. Cost: $0. Time: 3 minutes to read.",
      "Do instead: nothing \u2014 there is no retail action available; revisit only if Valos announces a retail product on its official channels. Cost: $0. Time: 2 minutes.",
    ],
  },
  "armitage-by-wintermute": {
    verdict: "THIN",
    program: "None found (yield only, withdraw anytime)",
    source: "armitage.wintermute.com docs, opened 2026-11-18",
    steps: [
      "On Ethereum in the Morpho app, open the curator page for 'Armitage by Wintermute' and choose Prime (blue-chip only) or Select (broader, higher yield \u2014 5.85% APY, $45M deposits at check). Capital: $100 USDC. Gas on Ethereum: ~$2-8 per tx at typical Nov 2026 levels (estimate) \u2014 batch actions to avoid repeated mainnet fees. Setup: 15 min. Ongoing: 5 min/week. Lock-up: none. Risk: Morpho market and collateral risk; yield only, no points.",
      "Deposit the $100 USDC in one transaction (approve + deposit) and hold the vault shares; yield compounds inside the vault and fees are currently 0% on Core vaults per official docs. Gas: ~$4-16 total for approve+deposit on mainnet (estimate). Ongoing: check allocation/APY monthly, not weekly \u2014 nothing rewards activity. Lock-up: none. Risk: fees can be changed by the curator after timelock; re-check the vault page quarterly.",
      "Withdraw in a single transaction when the yield no longer beats a plain Morpho blue-chip vault or you need the capital; official docs state 0% force-deallocate penalty. Gas: ~$2-8 (estimate). Time: 10 min. Lock-up: none, but exits depend on underlying market liquidity. Risk: high utilisation can delay full exit.",
    ],
  },
  "lofty": {
    verdict: "SKIP",
    program: "None found",
    source: "lofty.ai official site, opened 2026-11-18",
    steps: [
      "Skip: Lofty is not DeFi farming \u2014 it sells $50 fractional LLC membership shares in individual US rental properties, KYC-gated, so a deposit-and-farm plan misdescribes a regulated real-estate purchase (checked 2026-11-18). Cost: $0. Time: 3 minutes to read.",
      "What exists instead is buying a property share for rental income after KYC \u2014 a real-estate decision with property and legal risk, to be judged on the property, not on any token launch. Cost: $0 to read a listing. Time: 10 minutes.",
    ],
  },
  "doppler-finance": {
    verdict: "FARM",
    program: "Doppler Points, Season 3 (live; XDP already trades)",
    source: "blog.doppler.finance, DP Season 3 post, opened 2026-11-18",
    steps: [
      "Set up an XRPL wallet (e.g. Xaman) with ~$10 of XRP for the account reserve/fees, then buy $100 of RLUSD (or use XRP you already hold) for the Doppler RLUSD Vault at app.doppler.finance. XRPL fees: fractions of a cent per tx (estimate). Setup: 30 min. Ongoing: 5 min/week. Lock-up: 7-day withdrawal processing. Risk: yield comes from CeDeFi/RWA strategies via custodians \u2014 counterparty risk beyond plain on-chain lending.",
      "Deposit the $100 RLUSD into the RLUSD Vault to earn vault yield plus Doppler Points at the official Season 3 base rate of 0.01 DP per $1 per hour (~240 DP/day on $100). Fees: ~$0 network (estimate). Setup: 10 min. Ongoing: check DP balance weekly. Lock-up: 7-day exit processing. Risk: DP Season 3 conversion/reward terms are not published on pages opened \u2014 points may be worth little.",
      "Optional boost leg: buy $50 of XDP on Base or a listed exchange, bridge/register it as the official staking portal requires, and stake it to earn DP at 0.2 DP per $1 per hour (20x the vault rate). Gas on Base: <$0.10 (estimate). Setup: 20 min. Ongoing: 5 min/week. Lock-up: 7-day unstaking wait. Risk: XDP is a small, volatile token \u2014 price loss on $50 can exceed all points value.",
      "Keep both legs running for the full Season 3 and record DP weekly; do not churn deposits, since DP accrues per hour on balance \u2014 time in vault is the farming variable, not transaction count. Cost: $0 beyond capital. Time: 5 min/week. Lock-up: 7-day exits. Risk: season rules can change; any future DP-to-reward conversion is unannounced.",
    ],
  },
  "ember": {
    verdict: "THIN",
    program: "None found",
    source: "ember.so official site, opened 2026-11-18",
    steps: [
      "Use only a permissionless Ember vault you can verify at ember.so (e.g. the Ember Earn USDC vault on Sui, receipt token eEARN): set up a Sui wallet, fund it with $100 USDC plus ~$2 SUI for gas. Sui gas: typically <$0.05 per tx (estimate, Nov 2026). Setup: 25 min. Ongoing: 5 min/week. Lock-up: vault withdrawal periods run ~2-3 days for core Sui vaults per third-party data (UNVERIFIED). Risk: operator can move vault assets to whitelisted strategy accounts; yield is a target, not a guarantee, and there are no points.",
      "Deposit the $100 USDC and hold eEARN; return shows up as a rising receipt-token price rather than claimable rewards, so there is nothing to claim weekly. Gas: <$0.05 (estimate). Ongoing: check the vault rate and TVL weekly. Lock-up: withdrawal window above. Risk: cross-chain/CeDeFi strategy exposure inside eEARN is opaque versus a plain lending vault.",
      "Skip gated products unless you truly qualify: e.g. PPLUS (Ember-operated, Bitwise-curated) is non-U.S. Persons only, charges 15% performance fee and settles withdrawals T+4/T+7 \u2014 misrepresenting eligibility is a compliance risk, not a farm. Cost: $0. Time: 10 min to read terms. Lock-up: T+7 worst case if used legitimately. Risk: up to 5x leveraged RWA credit can lose principal.",
      "Exit by submitting a withdrawal request in the Ember app and waiting out the vault's processing period before redeploying. Gas: <$0.05 on Sui / $2-8 on Ethereum (estimates). Time: 10 min plus wait. Lock-up: processing period only. Risk: exit NAV is set at processing, not at request.",
    ],
  },
  "keyrock": {
    verdict: "THIN",
    program: "None found (Morpho shows 0.00% rewards)",
    source: "Morpho app vault list, opened 2026-11-18",
    steps: [
      "Bridge $50 USDC to Arc and open Keyrock Prime USDC (curator: Keyrock) in the Morpho app; confirm the curator name and current APY (2.31% at check) before depositing \u2014 at that rate, only proceed if you specifically want Arc/Morpho exposure. Gas on Arc: USDC-denominated, <$0.10 per tx (estimate, Nov 2026). Setup: 20 min. Ongoing: 5 min/month. Lock-up: none, subject to vault liquidity ($22.7M available at check). Risk: low yield minus a reported 1%/yr management fee (UNVERIFIED) can make net return negligible.",
      "Deposit the $50 in one transaction and hold krUSDC shares; no weekly action, second vault, or top-up improves anything \u2014 there is no incentive program counting activity. Gas: <$0.10 (estimate). Ongoing: re-check APY and fees monthly. Lock-up: none. Risk: curator allocation and Morpho market risk; single-vault concentration on Arc, a young chain.",
      "Set a hard exit rule: if net APY stays under ~3% for a month, withdraw in one transaction and move the USDC to a higher-yielding Morpho vault rather than waiting for a Keyrock incentive that has never been announced. Gas: <$0.10 (estimate). Time: 10 min. Lock-up: none. Risk: bridge-out costs on $50 can consume the entire yield earned.",
    ],
  },
  "noble": {
    verdict: "FARM",
    program: "Noble Points, Season 2 (live; published NOBLE allocations)",
    source: "Noble official Medium post on Points Season 2, opened 2026-11-18",
    steps: [
      "Get USDN on Noble: swap/bridge about $500 of stablecoins into USDN via dollar.noble.xyz or Osmosis and move it to a Noble (Cosmos) wallet. Capital $500 est. Gas/fees under $1 total est. (Cosmos fees are cents). Setup 30 min. No lock-up yet. Risk: bridge and stablecoin depeg risk.",
      "Deposit the full $500 USDN into the Noble Points Vault (not the Boosted Yield Vault) at the points portal. You forfeit the ~4% Treasury yield while in the vault \u2014 that is the cost of points. Earns 5 points/day at the verified 1 pt per $100/day rate. Gas under $0.50 est. Setup 10 min. Risk: opportunity cost if NOBLE value disappoints.",
      "Complete claim Step 1 now: link your Cosmos address to an Ethereum mainnet address in the Noble claim flow, well before the December 31, 2026 deadline. Cost $0 plus under $1 gas est. Time 10 min, once. Missing this step forfeits the allocation regardless of points. Risk: linking the wrong Ethereum address is irreversible in effect.",
      "Hold the Points Vault position without test withdrawals until Season 2 ends (trigger: Hyperliquid vault launch). Check the points dashboard weekly, 5 min/week. Withdrawals can cut your projected allocation and, for S1 participants, permanently lose the 2x tier. Lock-up: none hard, but exiting early destroys value. Risk: projected allocation changes daily and is not final.",
    ],
  },
  "tori-finance": {
    verdict: "THIN",
    program: "Tori Cores (live; docs state Cores are NOT a token promise)",
    source: "docs.tori.finance, Cores page, opened 2026-11-18",
    steps: [
      "On Ethereum, swap $200 USDC or USDT for trUSD in the Tori app (app.tori.finance). Capital $200. Gas $2\u20135 est. for swap approvals on mainnet. Setup 15 min. No lock-up on trUSD itself. Risk: trUSD is a synthetic dollar backed by hedged trading positions, not fiat reserves \u2014 peg and issuer risk apply.",
      "Stake the trUSD to strUSD in the app. strUSD accrues trading rewards via its exchange rate and earns Cores for staking. Gas $1\u20133 est. Setup 5 min. Ongoing 5 min/week checking the Activities/Rewards tab for your Cores by source. Lock-up: 7-day cooldown on unstake. Risk: strategy rewards are variable and can be low or negative in bad regimes.",
      "Optionally deposit USDC/USDT into the Tori Ecosystem Vault (etrUSD, curated by RockawayX on Upshift) instead of or alongside strUSD, if the app shows a better Cores multiplier for it. Capital $100+ est. Gas $2\u20135 est. Withdrawals take 7 days after the soft lock-up. Risk: extra vault/curator layer (RockawayX/Upshift) on top of Tori risk.",
      "Hold for at least 60 days and do not churn: Cores accrue per dollar per day, so duration is the farm. Check multipliers monthly, 10 min/month, and rebalance only if a listed venue multiplier clearly beats plain strUSD. Risk: Cores may never convert to anything \u2014 official docs promise no token or payment, so size this as yield-first, points as a free option.",
    ],
  },
  "infinifi": {
    verdict: "FARM",
    program: "infiniFi Points (Season 3 continuation third-party reported)",
    source: "airdrops.io infiniFi page, opened 2026-11-18 (third-party report)",
    steps: [
      "First verify INFI's contract and Season 3 status on infiniFi's official X account and app (app.infinifi.xyz) \u2014 do not trust third-party contract addresses blindly. Cost $0. Time 10 min, once. Risk: fake INFI tokens circulate around launches; only use addresses the protocol itself publishes.",
      "Deposit $200 USDC on Ethereum in the infiniFi app to mint iUSD. Capital $200. Gas $3\u20138 est. for approve + mint on mainnet. Setup 15 min. Points accrue automatically in 6-hour checkpoints. No lock-up on plain iUSD. Risk: fractional-reserve-style stablecoin design \u2014 iUSD is not a fully reserved fiat stablecoin.",
      "Stake at least half the iUSD to siUSD for yield plus points, and lock a smaller slice (e.g. $50) to liUSD for 4\u201313 weeks for the higher lock multiplier. Gas $2\u20135 est. per action. Setup 10 min. Lock-up: liUSD is locked for the chosen term and cannot be exited early. Risk: lock illiquidity plus Pendle/strategy exposure if you use boosted routes.",
      "Maintain the position across full weekly Chapters (they close Mondays): check the Points page weekly, 5 min/week, and top up $25\u201350 monthly instead of churning. Ongoing gas under $5/month est. Risk: Season 3's INFI pool size and conversion are unpublished (UNVERIFIED), so points value is speculative even though the activity is real.",
    ],
  },
  "axis": {
    verdict: "THIN",
    program: "Axis Coordinates (live via Upshift vault page; conversion unverified)",
    source: "app.upshift.finance, Axis Origin vault page, opened 2026-11-18",
    steps: [
      "Deposit $200 USDC or USDT into the Axis Origin USDx vault (ogUSDx) on Upshift, Ethereum. Capital $200. Gas $3\u20138 est. Setup 15 min. Yield comes from Axis's delta-neutral engine plus Curve/Pendle allocations and accrues in the ogUSDx share price. Risk: USDx is a synthetic dollar that can trade off $1; trading-book and venue risk sit underneath.",
      "Keep the ogUSDx position untouched for at least 60 days so Coordinates accrue on the balance over time; check the Axis coordinates page monthly, 5 min/month. Gas $0 while holding. Lock-up: none hard now, but withdrawals settle through a 7-day queue or cost ~0.30% for instant redemption. Risk: Coordinates have no published token conversion \u2014 treat them as speculative.",
      "When exiting, use the standard 7-day redemption queue instead of instant redemption to avoid the ~0.30% fee, unless you need the funds. Cost $0 extra vs ~$0.60 fee on $200 instant est. Time 5 min to queue. Risk: you receive USDx, not USDC \u2014 budget one more swap (gas $2\u20135 est.) and possible spread to fully exit to fiat stablecoins.",
    ],
  },
  "reti-pooling": {
    verdict: "THIN",
    program: "None found (rewards are ALGO consensus rewards)",
    source: "Reti Open Pooling gitbook by TxnLab, opened 2026-11-18",
    steps: [
      "Set up a Pera or Defly wallet on Algorand and fund it with at least the chosen Reti pool's minimum plus a fee buffer \u2014 check the minimum on reti.nodely.io first (many pools want 100\u20131,000 ALGO; budget about $100\u2013300 of ALGO est.). Algorand fees are ~0.001 ALGO per tx (under $0.01 est.). Setup 15 min. Risk: ALGO price volatility dwarfs the staking yield.",
      "Stake the ALGO to one well-filled, long-running validator pool on reti.nodely.io (prefer pools comfortably above the 30,000 ALGO reward threshold in aggregate, with a modest commission). Gas under $0.01 est. Setup 5 min. No protocol lock-up \u2014 Algorand staking has no bonding period, but rewards only accrue pro-rata for time actually staked in each epoch. Risk: validator downtime reduces rewards; no slashing on Algorand.",
      "Leave the stake untouched and verify rewards monthly on the Reti dashboard or AlgoNodeRewards, 5 min/month. Do not add/remove mid-epoch for cosmetic activity \u2014 it only dilutes your pro-rata epoch rewards. Ongoing cost ~$0. Risk: this is a yield-only position in ALGO; there is no verified token or points upside, so only farm it if you want ALGO exposure anyway.",
    ],
  },
  "gami-labs": {
    verdict: "THIN",
    program: "None found",
    source: "upshift.finance blog, Stellar earnUSDC/earnXLM post, opened 2026-11-18",
    steps: [
      "Create a Freighter wallet, fund it with native Stellar USDC (via CCTP or an exchange that supports USDC on Stellar) \u2014 $150 plus a small XLM reserve for fees. Stellar fees are under $0.01 per tx est. Setup 20 min (most of it is getting USDC onto Stellar correctly; wrong-network USDC is the main beginner loss). No lock-up. Risk: bridge/exchange withdrawal mistakes.",
      "Deposit the $150 USDC into Gami earnUSDC on app.upshift.finance (Upshift Stellar vault, co-curated by Gami Labs and Stake Capital). You receive earnUSDC shares; yield from Blend/Aquarius/Sushi/Templar allocations accrues in the share price. Gas under $0.01 est. Setup 5 min. Risk: curator allocation risk plus bugs in any underlying Stellar protocol; Stellar DeFi liquidity is thin, so large exits can be slow.",
      "Hold at least 30\u201360 days and check the vault page monthly, 5 min/month \u2014 there are no points, claims, or weekly actions to perform, so extra transactions only add risk. Optional: put a small XLM amount ($25\u201350 est.) into earnXLM only if you already hold XLM. Risk: earnXLM keeps full XLM price exposure; yield is variable and not guaranteed.",
    ],
  },
  "yuzu-money": {
    verdict: "FARM",
    program: "Yuzu Juice points (live)",
    source: "app.yuzu.money points page, opened 2026-11-18",
    steps: [
      "Bridge $200 of USDT0/USDC to Plasma (chain 9745) and keep a small XPL balance for gas. Plasma fees are low, under $0.10 per tx est.; bridging costs $1\u20135 est. depending on route. Setup 25 min. First check in the Yuzu app whether direct yzUSD minting is open to your wallet; if it is gated, buy yzUSD on Curve (Plasma) instead. Risk: Plasma is a young chain; bridge and liquidity risk.",
      "Acquire yzUSD and stake it to syzUSD in the Yuzu app so the position both earns the staking yield and is tracked for Yuzu Juice. Capital $200 total. Gas under $0.50 total est. Setup 10 min. Check your Juice balance on the official Points page after the first epoch to confirm the position is being credited before adding more. Risk: yzUSD is an overcollateralized strategy-backed dollar \u2014 backing is curated DeFi strategies, not cash.",
      "Add a referral code when you register (referees get a +5% Juice boost, verified on the official Points page) and share your own code afterwards \u2014 referrers earn 10% of referees' Juice. Cost $0. Time 5 min, once. Ongoing: check Juice and leaderboard weekly, 5 min/week, and hold at least 60 days since Juice accrues on positions over time. Risk: Juice-to-$YUZU conversion is UNVERIFIED; treat any token value as speculative and the syzUSD yield as the base case.",
      "Optional higher-risk slice: put at most $25\u201350 into yzPP (the first-loss Protection Pool tranche) only if you accept losing it \u2014 yzPP absorbs strategy losses first in exchange for a higher target yield and Juice weight. Lock-up: follow the app's redemption terms; redemption fees on yzUSD/syzUSD are documented by third parties (UNVERIFIED rates). Risk: first-loss means first-loss \u2014 this slice can go to zero on a strategy failure.",
    ],
  },
  "mezo-earn": {
    verdict: "FARM",
    program: "Mezo Earn emissions, veBTC/veMEZO (MEZO already live)",
    source: "mezo.org blog, getting-started post, opened 2026-11-18",
    steps: [
      "Bridge BTC to Mezo via mezo.org Deposit. For native BTC the minimum is 0.01 BTC (budget ~$900\u20131,000 of BTC est. plus $1\u20135 L1 fee est.; arrival 1\u20132 hours). Cheaper entry: bridge tBTC or cbBTC from Ethereum instead, where minimums are lower (check the deposit page). Keep a small BTC balance for gas \u2014 BTC is Mezo's gas token. Setup 30 min. Risk: bridge (tBTC) and BTC price exposure.",
      "Lock BTC under Earn \u2192 Lock to receive veBTC: choose 28 days (the maximum BTC lock) for the most voting weight per BTC. Gas under $0.50 est. on Mezo. Setup 5 min. veBTC earns a share of protocol revenues (DEX, MUSD and bridge fees). Lock-up: funds are locked for the chosen 1\u201328 days. Risk: short lock means you must re-lock roughly monthly to stay active.",
      "Vote on gauges every epoch (Thursday 00:00 UTC to Thursday) \u2014 votes persist, so set them once and review monthly, 5 min/week max. Optionally buy a small MEZO amount ($25\u201350 est.) on the Mezo DEX, lock it to veMEZO and pair it with your veBTC for up to 5x boost, or rent the boost out in the Matching Market if you skip BTC. Gas under $1 total est. Risk: veMEZO locks can run up to 4 years \u2014 choose a short lock unless you are sure.",
      "Use one more product so your wallet shows real usage, which official Phase 1 methodology rewarded over parked deposits: deposit MUSD into the MUSD Savings Vault for sMUSD (no lock-up, no withdrawal fee) or add a small BTC/MUSD LP position. Capital $50\u2013100 est. Gas under $1 est. Setup 10 min. Ongoing 5 min/week. Risk: LP impermanent loss; borrowing MUSD needs a 2,000 MUSD minimum loan at 110% collateralization \u2014 do not borrow just to farm.",
    ],
  },
  "tulipa-capital": {
    verdict: "SKIP",
    program: "None found",
    source: "tulipa.capital official site, opened 2026-11-18",
    steps: [
      "Skip: Tulipa Capital is a curation firm, not a farmable protocol \u2014 no own token, no points and no Tulipa-owned retail vault product were found on its official site (checked 2026-11-18), so there is no position that farms Tulipa itself. Cost: $0. Time: 3 minutes to read.",
      "Do instead: nothing at the Tulipa level \u2014 vaults it curates on other platforms pay their own yield under those platforms terms, which is a yield decision, not a Tulipa launch farm. Cost: $0. Time: 2 minutes.",
    ],
  },
  "firelight": {
    verdict: "FARM",
    program: "Firelight Points (live; stake FXRP as cover backer)",
    source: "flare.network news, Firelight launch post, opened 2026-11-18",
    steps: [
      "Get XRP exposure ready: hold about $150 of XRP in an XRPL wallet (e.g. Xaman) or FXRP on Flare. If starting from XRP, use Flare Smart Accounts at fsa.flare.network \u2014 one signature mints FXRP 1:1 via FAssets and deposits it into Firelight; no FLR needed, fees are charged in FXRP (under $1 est.). Setup 20 min. Risk: FAssets/FSA contract layers on top of Firelight risk.",
      "Stake the FXRP in the Firelight Vault at app.firelight.finance and receive stXRP. Capital $150. Flare gas under $0.10 per tx est. Setup 5 min. Your stake backs DeFi cover for covered vaults (first: Sentora's protected vaults) \u2014 this is underwriting, not passive staking. Risk: SLASHING \u2014 if a covered exploit is validated by the Risk Consortium, staked capital pays out claims; compounded rewards are slashable too.",
      "Hold stXRP and let FXRP emissions compound into your position; check the Firelight app monthly, 5 min/month, for the Points-based first-emissions eligibility announcement \u2014 only trust claim details from Firelight's official channels (the Flare post explicitly warns other claim links are scams). Ongoing gas ~$0. Lock-up: unstaking takes time and the window increases to match 30-day coverage periods in the cover phase. Risk: exit is slow by design; do not stake funds you may need within a month.",
      "Optional: use a small part of the stXRP (max $50) as collateral or LP in Flare DeFi to add real usage history, keeping at least $100 staked plain. Gas under $0.50 total est. Setup 10 min. Risk: adding lending/LP layers stacks liquidation and impermanent-loss risk on top of slashing risk \u2014 skip this step if you do not actively monitor positions weekly.",
    ],
  },
};
