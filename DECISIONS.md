# PACT RULES AND GUIDE — Decisions

**Project: PACT Rules and Guide (`/Personal/dev/PACT-guide/`) — do not confuse with other PACT projects (PACT-Campaign, PACT-copilot-only).**

File: DECISIONS.md
Last Updated: 2026-08-13

> Record every meaningful decision here so a future session understands *why* something was done. Newest on
> top. Never renumber or rewrite past entries — add a new one instead. Replaces the former
> `DESIGN-DECISIONS.md` (DEC-xxx log) as of 2026-07-17; the three original entries were migrated verbatim
> into the standard format, with their old DEC-xxx IDs preserved parenthetically. See
> D-2026-07-17-adopt-standard-file-shapes below.

---

## D-2026-08-13-public-community-repo — New dedicated public GitHub repo for community sharing; player-evidence files stay private

- **Context:** Wanted a way to share this project with the community for feedback and potential
  collaboration, plus a reliable delivery mechanism for the player survey built this session
  (Q-003/Q-004/Q-005 evidence-gathering). The survey was originally built as a Claude-artifact
  HTML page using `window.storage`, but repeated mobile-testing failures (submissions not saving,
  unclear cause even after adding a visible error box and a standalone storage-diagnostic
  artifact that confirmed storage itself worked) led to abandoning that delivery path in favour of
  a plain self-hosted static page. While researching hosting options, found an existing public
  repo (`chompy78/pact`) referenced elsewhere in this project's own `DECISIONS.md`/`CURRENT-WORK.md`
  (engine.js vendoring, `documents-rules` version pointer) — owner confirmed that repo is
  the **PACT-copilot-only** project (the character generator software), not this rules/guide
  project, so out of scope here per this file's own project-boundary rule.
- **Options considered:**
  - **G** — Use `chompy78/pact` (the copilot-only tools repo) as the community front door too.
    Rejected: confirmed out of scope, belongs to a different project with its own governance.
  - **H** — Create a new, dedicated public repo for this project's community-facing material only.
- **Decision:** H. A new public GitHub repo will host:
  - The finished Player's Guide
  - `TASK_BOARD.md`, `DECISIONS.md`, `OPEN-QUESTIONS.md` — design reasoning and open questions,
    judged genuinely useful for real collaborators, not just "finished" material
  - The player survey (static HTML, no Claude dependency)
  - GitHub Issues/Discussions enabled for community feedback; PRs possible for wording fixes to
    the guide
- **Explicitly excluded from the public repo:** `playtest/PLAYTEST-EVIDENCE.md`, session notes, and
  any file containing player-identifying content or specific-player commentary. Reasoning: design
  discussion is fair to share and useful to collaborators, but raw player feedback was given to
  the DM, not for publication — that's a consent question, not a tidiness one. These stay in the
  existing Forgejo-hosted working project, unchanged.
- **Survey response collection:** the public repo hosts the survey **questions** (public, static
  HTML), not the **answers**. Responses submit to Formspree (a third-party form-relay service),
  visible only via the DM's own Formspree account (email + dashboard export) — kept separate from
  the public repo entirely, so there's no path from "public survey link" to "public response data."
- **Status:** Decided, not yet implemented. Repo creation requires real GitHub push access this
  chat session doesn't have — a Claude Code session (confirmed to already have working
  `Chompy78` GitHub access, per this project's `Sessions/` notes on the unrelated copilot-only
  repo) is the intended executor. The survey's Formspree rewiring (dropping `window.storage`,
  removing the results-view panel and PT-xxx draft button that depended on it) is still pending —
  blocked on the owner providing a Formspree form endpoint.
- **Follow-up needed:** decide the new repo's name, add a license, write a short README/
  CONTRIBUTING note, and decide whether `TASK_BOARD.md`/`DECISIONS.md`/`OPEN-QUESTIONS.md` are
  pushed as live copies (needing a refresh discipline, like the old — now-retired —
  `for-copilot/` mirrors) or as periodic manual snapshots.

---

## D-2026-08-12-guide-rules-pointer — Guide declares a machine-generated `documents-rules:` pointer, separate from `content-version`; canonical file renamed off its version number

- **Context:** The PACT repo (`chompy78/pact`) tracked "Reconcile guide↔engine rules-version drift" —
  this project's `content-version:` HTML comment was being conflated with (and in the PACT repo's served
  copy, silently drifting from) the actual engine rules version the guide's prose was checked against. A
  cold-reviewed plan (4 independent reviewers) was drafted in that repo at
  `docs/plans/2026-08-12-guide-engine-version-pointer.md`; this entry records this project's half of
  implementing it.
- **Decision:**
  1. Mirrored branch is `Chompy78/PACT`'s `main` — matches the existing `py/vendor/engine/` vendoring
     pipeline's own choice (not `preview`), since `main` is what's actually live for players.
  2. The guide now declares TWO markers with distinct meanings, adjacent HTML comments at the top of the
     file: `content-version` (unchanged — hand-maintained, moves on prose edits, this project's own
     independent doc revision) and `documents-rules` (new — asserts the prose was reconciled against a
     specific engine rules version; format `version=vX.XXX; branch=main; commit=<7-hex>;
     reconciled=<date>`).
  3. `documents-rules` is a **reconciliation assertion, not a vendor-refresh artifact** — it must only be
     stamped as a deliberate action after actually checking the guide against the currently-vendored
     `py/vendor/engine/` snapshot, never auto-advanced just because that snapshot was refreshed for the
     pricing sync. Built `py/tools/stamp_guide_rules.mjs` with `stamp` (writes the marker) and `--check`
     (non-mutating staleness check) modes, reading `py/vendor/engine/SYNCED_FROM.txt`'s "Last commit that
     touched these 4 files" field (chosen over the source-repo HEAD field on the same file, since that's
     the commit that actually determines the vendored `DATA.version`'s content).
  4. `BUILD` (the web-tool's cosmetic build number) is never mirrored in the guide — checked; the guide
     body carries no such reference today.
  5. Canonical file renamed `PACT-Players-Guide-v0.333.html` → `PACT-Players-Guide.html` — the embedded
     version guaranteed a stale hardcoded reference on every bump, and already had: `py/PACT-Style-Audit.py`,
     `py/PACT-slot-audit.py`, and `py/PACT-verify-all.py`'s `G` constant were all still hardcoded to
     `-v0.332.html` even though the live file was already `-v0.333.html`. All three, plus two live
     references in `AGENTS.md`, updated to the versionless name.
- **Not done in this change — deliberately:** the first real `documents-rules` stamp. Stamping now would
  assert the whole guide was reconciled against the current vendored snapshot, which wasn't actually
  audited in this change (only the mechanical rename/tooling work was done) — that would be exactly the
  false-compatibility-claim failure mode this design exists to prevent. See the new `TASK_BOARD.md` entry:
  the first stamp is pending the next real reconciliation pass.
- **Cross-project counterpart:** the PACT repo's `docs/VERSION-SYNC.md` gets a matching section (branch
  choice, marker semantics, the manual copy procedure for that repo's served `docs/PACT-Players-Guide.html`)
  and its own `DECISIONS.md` entry.
- **Status:** Active. Mechanical/tooling half done here; the first stamp and the PACT-repo-side copy are
  follow-ups (see `TASK_BOARD.md`).

---

## D-2026-08-12-retire-pact-staleness-gate — Retired PACT-staleness.py and PACT-changelog.py (dead D2 gate); removed D2 from PACT-verify-all.py

- **Context:** While applying an unrelated patch set (Grit divergence resolution, see the two
  D-2026-08-11 Grit entries below), `python3 py/PACT-staleness.py` was run as instructed rather
  than blind-fixed, and returned exit 2, "cannot read ground truth" — it looks for `VERSION`,
  `INDEX.md`, and `pact-class-builds.jsonl` inside `py/` (none exist there) and hardcodes
  `PACT-Players-Guide-v0.332.html` by exact filename (guide is now v0.333). Investigating what
  "repair" would actually take: `VERSION` and `INDEX.md` were never committed to this repo at
  any point in its git history — not moved, not deleted, never existed. Its companion,
  `PACT-changelog.py` (the only tool that would have created them, via `--bump`), writes its
  changelog entries to `archive/PACT-DECISION-HISTORY.md`, which also never existed — what's
  actually in `archive/` is `DESIGN-DECISIONS-retired-2026-07-17.md`, the pre-standardization
  predecessor this project retired the day it adopted `AGENTS.md`/`CHANGELOG.md`/`DECISIONS.md`/
  `TASK_BOARD.md`. Conclusion: this whole `VERSION`+`INDEX.md` state-tracking design predates
  that 2026-07-17 standardization and was, as far as any git evidence shows, never actually
  turned on even before the migration — there was nothing live to repair.
- **Options considered:** (A) Repair — build `VERSION`/`INDEX.md` for real, fix `GUIDE`'s path
  and hardcoded filename. (B) Retire — remove the D2 gate and its two source scripts from active
  use, keep them archived for reference.
- **Decision:** B, on the owner's explicit call after the investigation above was relayed back
  (initial instinct was A, revised once the "never existed" finding surfaced).
- **Why:** Option A would mean building a second, competing version/changelog-tracking system
  alongside the one this project already standardized on — the exact "two overlapping sync
  mechanisms" trap flagged elsewhere in this same session's work (see the engine.js auto-sync
  pipeline's own Open Question A, still unresolved, about that pipeline's trigger mechanism).
  Nothing was actually being protected by D2 — it has apparently never returned anything but a
  read failure — so retiring it doesn't remove real coverage, only a check that already couldn't
  check anything.
- **Consequences:** `py/PACT-staleness.py` → `archive/PACT-staleness-retired-2026-08-12.py`,
  `py/PACT-changelog.py` → `archive/PACT-changelog-retired-2026-08-12.py` (both `git mv`, history
  preserved; both given a retirement header pointing back here). D2's row removed from
  `PACT-verify-all.py`'s `CHECKS` list. Confirmed via a fresh run that D2 no longer appears in
  its output.
- **Found in passing, not fixed here:** `PACT-verify-all.py`'s remaining six gates (A1, A2, B1,
  B2, C1, D1) reference scripts under `py/` — only `PACT-PHB-Audit.py` (C1) actually exists;
  `PACT-Full-Audit.py`, `PACT-cross-check.py`, `pact-engine/regress_chassis.py`,
  `pact-engine/regress_grid.py`, and `PACT-mutation-test.py` (A1, A2, B1, B2, D1) are all
  missing — `pact-engine/regress_chassis.py` specifically matches a gap AGENTS.md already
  documents as searched-for-and-not-found. `PACT-verify-all.py` itself also still hardcodes
  `PACT-Players-Guide-v0.332.html` (its `G` constant, used by A1). This means the aggregate
  gate has been reporting `🔴 ALL: FAILED` for reasons almost entirely unrelated to guide
  correctness — confirmed via `git stash` that this predates today's changes. Worth its own
  TASK_BOARD.md entry: decide per-gate whether to recover, rebuild, or retire each, rather than
  leaving a 6-of-7-broken aggregate gate that nobody can currently read a real signal from.
- **Status:** Active.

---

## D-2026-08-11-grit-pricing-correction — Grit's AP formula reverts to 2/4/6/9/12/15/18 (purchase-indexed); the 2/4/6/8/10/12 redesign was wrong

- **Context:** While drafting a bug-fix brief for `engine.js` (the separate web-tools project;
  see D-2026-08-11-engine-js-auto-sync-pipeline), a Grit pricing mismatch was flagged between
  this project's guide/`py/pricing.py` (2/4/6/8/10/12…, i.e. 2×N per purchase) and `engine.js`'s
  actual code (2/4/6/9/12/15/18…). The first draft of that brief wrongly concluded `engine.js`
  was the one that was broken — it wasn't. Checking `engine.js`'s OWN decision log (not this
  project's) surfaced `D-GH-2026-08-05-grit-ladder-correction`: a carefully-audited fix, with a
  direct owner quote ("grit 1:2, 2:4, 3:6, 4:9 etc.") and dedicated regression tests (CG-010/
  CG-011) pinning the value at 147 AP for 10 purchases at CON 16. That decision's own Context
  section quotes the ORIGINAL guide text it was correcting: "Situational by tier — 2 / 4 / 6 / 9
  / 12 / 15 / 18" — i.e. this project's OWN pre-redesign numbers were already right; only the
  *indexing* (by character tier, so cost rose as you levelled) was the bug.
- **What actually happened:** the same week (2026-08-05), two separate AI sessions in two
  separate projects — this one and the `engine.js`/web-tools one — independently found the
  *same* underlying problem (Grit priced by tier is inconsistent/confusing) and fixed it two
  different ways. `engine.js`'s session did the minimal, surgical fix: keep the same seven
  numbers, just index them by purchase count instead of tier. This project's session (which
  became D-2026-08-05-grit-cost-steep-curve, then D-2026-08-06-grit-base-cost-2) instead
  redesigned the numbers from scratch to match the "Steep" curve pattern used elsewhere — a
  much bigger change, made with "no additional balance rationale... direct owner instruction"
  and no check of whether `engine.js` (this project's own declared pricing source of truth per
  D-2026-07-20-engine-js-is-pricing-source-of-truth) had already addressed the same issue.
- **Decision:** Revert to the original per-purchase values — `2, 4, 6, 9, 12, 15, 18`, then
  `+2/4/6/8/10` for purchases 8–12 (`20, 24, 30, 38, 48`) — matching `engine.js` exactly,
  byte-for-byte cross-checked this session for n=1..15. Keep the genuinely-correct part of this
  project's 2026-08-05 redesign: pricing **by purchase count, not by character tier/level**
  (level-independence was the real fix; the specific replacement numbers were not).
- **A second bug found and fixed in the same pass:** `py/pricing.py`'s CON-mod surcharge
  condition was ALSO subtly wrong — it applied once `(n-1) > con_mod` where `engine.js`'s actual
  condition (read directly from its `compute()`: `n > vgcap ? 1 : 0`) is `n > con_mod`, one
  purchase earlier. This wasn't part of the original mismatch investigation — it was only caught
  because the fixture cross-check (`grit_block(10, con_mod=3)` should equal 147) came up 146
  until corrected. Both bugs are now covered by a new `py/regress_grit.py` regression test.
- **Why the correction, not the reverse:** `engine.js`'s fix has much stronger evidence — a
  specific numeric owner quote, a cross-tool audit that found the bug in the first place
  (CharGen vs. Live Sheet disagreeing by 39 AP), and dedicated regression tests. This project's
  redesign has weaker evidence — an abstract "match the Steep pattern" argument with no
  specific owner-confirmed numbers and no test coverage. Combined with this project's own
  existing commitment (D-2026-07-20) to treat `engine.js` as authoritative, the correction goes
  this direction.
- **Consequence:** `PACT-Players-Guide-v0.332.html` corrected in all 5 locations that stated
  Grit's formula (Hit Points table row + prose, Quick-Reference Card, two Glossary entries) —
  wording kept as "priced by purchase count, not by character level," numbers reverted to
  2/4/6/9/12/15/18. `py/pricing.py`'s `grit_ap`/`grit_block` corrected to match, with the
  surcharge off-by-one also fixed. New `py/regress_grit.py` added — this project had zero
  automated Grit-price coverage before this, the same root cause `engine.js`'s own decision
  record flagged as "the more alarming finding" about its prior gap.
  D-2026-08-05-grit-cost-steep-curve and D-2026-08-06-grit-base-cost-2 are superseded by this
  entry — kept in the log (never rewritten), but their numeric conclusion is now known wrong.
- **Meta-lesson, worth stating plainly:** this project's own "engine.js is pricing source of
  truth" decision doesn't help if a session doing pricing design work never actually checks
  `engine.js`'s current state (or its own decision log) before redesigning something from
  scratch. Two independently-argued, internally-consistent "corrections" to the same mechanic
  is not evidence either is right — it's a sign neither session had the other's context. Worth
  a standing habit: before changing any pricing mechanic here, check whether `engine.js` already
  has an answer, not just whether this project's own docs are internally consistent.
- **Status:** Active. Applied 2026-08-11. Superseded in effect 2026-08-12: engine.js adopted the 2N Steep
  curve (D-GH-2026-08-12-grit-steep-ladder), so the divergence these records describe no longer exists.
  The chosen formula is unchanged; only its "diverging" status is. **Provenance note:** this resolution
  was reported to this session secondhand — relayed via John from a separate Claude Code session working
  directly in the `Chompy78/PACT` repo, which itself is not accessible from here. Not independently
  verified against that repo's actual commit/CI state; treat as [VERIFY] until confirmed directly (e.g.
  next time `py/tools/sync_engine_prices.mjs` re-vendors `engine.js` and its `_gritPrice()` can be read
  first-hand — see `py/vendor/engine/engine.js`, still showing the OLD `[2,4,6,9,12,15,18]` ladder as of
  its 2026-08-11 snapshot, one day before this claimed change).

---

## D-2026-08-11-grit-steep-curve-final — Grit stays on the clean Steep curve (2/4/6/8/10/12…), knowingly diverging from engine.js

- **Context:** Directly follows D-2026-08-11-grit-pricing-correction (immediately above/before
  this entry in the log), which corrected PACT-guide's guide text and `py/pricing.py` to match
  `engine.js`'s tested formula (2/4/6/9/12/15/18…, reusing PACT's "Situational" tier-price
  table, owner-confirmed via "grit 1:2, 2:4, 3:6, 4:9 etc." and pinned by that project's own
  CG-010/CG-011 regression tests). After that correction was made, the owner reviewed the full
  evidence on both sides directly in this session — the specific quote and tests on the
  engine.js side, versus the "Evidence Used: None" honesty already on record for this project's
  own two prior Grit decisions (D-2026-08-05-grit-cost-steep-curve,
  D-2026-08-06-grit-base-cost-2) — and the exact cross-project timeline (this project's
  redesign committed 2026-08-06T01:48:14Z, `engine.js`'s correction 2026-08-06T01:52:24Z, four
  minutes later).
- **Decision:** Keep the clean Steep curve — `2, 4, 6, 8, 10, 12, 14…` (2N AP for the Nth
  purchase) — as PACT-guide's own intended Grit formula, explicitly overriding the "match
  engine.js" correction made minutes earlier in this same session. This is a **deliberate,
  informed choice to diverge from `engine.js`**, not a reversion to a prior mistake and not an
  oversight.
- **What this means going forward:** PACT-guide's guide text, `py/pricing.py`, and
  `py/regress_grit.py` all now intentionally state a DIFFERENT Grit formula than the one
  `engine.js` (the actual character-generator/live-sheet tool players use) currently charges.
  This is a real, live, known inconsistency between what this project's guide says and what the
  actual web tool does — not something the engine.js auto-sync pipeline (D-2026-08-11-engine-js-
  auto-sync-pipeline) will paper over, since Grit is chassis-level pricing handled directly by
  `py/pricing.py`, not pulled from `engine.js`'s `DATA.features` export at all.
- **Open follow-up, not resolved here:** whether `engine.js` itself should also be changed to
  match this decision (making the live tool and the guide agree again, this time on the clean
  curve), or whether this divergence is accepted as a known, permanent difference between
  "PACT-guide's intended design" and "what's currently shipped in the web tools." Left for the
  owner to decide separately — changing `engine.js` means asking a session in that other
  project to reverse a specifically owner-confirmed, tested correction, which needs its own
  explicit go-ahead, not an assumption either way.
- **Why:** Owner's explicit, informed call after full evidence review — not re-litigated
  further here. See the full evidence summary (both sides) in this session's own record.
- **Status:** Active. Applied 2026-08-11. Supersedes D-2026-08-11-grit-pricing-correction's
  numeric conclusion (that entry's finding that engine.js's formula is better-evidenced stays
  true and is not retracted — the owner chose the other option with full knowledge of that).
  Superseded in effect 2026-08-12: engine.js adopted the 2N Steep curve (D-GH-2026-08-12-grit-steep-ladder),
  so the divergence described in "What this means going forward" above no longer exists — the "Open
  follow-up" question this entry left unresolved (should engine.js also change to match?) is now answered:
  it did. Same provenance caveat as the entry above — relayed secondhand, not independently verified from
  this session; see that entry's note.

---

## D-2026-08-11-engine-js-auto-sync-pipeline — Built the engine.js auto-sync pipeline; `catalog.py` now reads live-engine prices instead of a hand-typed Appendix-A transcription

- **Context:** Implements D-2026-07-20-engine-js-is-pricing-source-of-truth, which settled that
  `engine.js` (the separate PACT web-tools project's live pricing engine) is the pricing source of truth
  and that `catalog.py`'s divergent hand-typed prices should be retired in favour of it, via an automatic
  sync — but left the actual mechanism, and three open implementation questions, unbuilt. A cold-reviewed
  implementation plan was drafted first (`plans/2026-08-11-engine-js-auto-sync-pipeline-plan.md`), then
  built and verified against real data this same session.
- **What was built:** `py/vendor/engine/` (a stamped, point-in-time copy of `engine.js` + its 3 imports,
  pulled from the live `Chompy78/PACT` repo's `main` branch, verified against the actual GitHub remote —
  not just a local clone assumed current); `py/tools/sync_engine_prices.mjs` (exports the engine's
  already-priced `DATA` dictionaries to `py/generated/engine-prices.json`, with shape validation);
  `py/tools/reconcile_catalog.py` (matches `catalog.py`'s existing feature names against that export,
  writing `py/generated/catalog_kits.json`); `py/tools/verify_engine_prices.mjs` (the gate check — a
  lossless round-trip check plus a live `compute()` smoke test); and `catalog.py`'s `kit_for()` now loads
  the generated data instead of hardcoded lists, which are kept as historical-only
  `_LEGACY_CLASS_KITS`.
- **Reconciliation result:** 315 of `catalog.py`'s 321 feature entries (98.1%) are now priced live from
  the engine — not a blind bulk rename: every category (exact matches, stepped/repeatable features,
  subclass spell bundles, merged/duplicate entries) was individually audited against the *old* values as
  a cross-check, and two real bugs in the reconciliation script itself were caught and fixed during that
  audit (a substring-matching collision that silently mispriced 4 Warlock/Cleric spell-grant entries onto
  the wrong subclass; a second substring bug that collapsed 3 of Fighter's Weapon Mastery steps onto one
  price) before being trusted. The remaining 6 entries were checked directly against the engine's full
  feature list (not just a naive name-match miss) and are genuinely absent — left on their old
  Appendix-A-derived value, flagged `NOT_IN_ENGINE`.
- **Notable findings surfaced by this work, not previously recorded:**
  - `engine.js`'s live `DATA.version` had drifted again (v0.342 vs. this project's recorded v0.336) —
    corrected in `CURRENT-WORK.md`. Confirms the exact staleness pattern this pipeline exists to prevent.
  - AGENTS.md's tool-gotchas entry describing Barbarian's "Brutal Strike, improved" as a confirmed
    tier-crossing pricing bug (Tier 7 At-Will vs. the PHB's Tier 6) is now stale — the live engine has
    since collapsed Brutal Strike into a single Tier-5 feature. `catalog.py`'s two old separate entries
    for it are now correctly merged onto that one price.
  - `DATA.subclasses[Class][Subclass].spellBundle` already contains the "Bundle N" pricing formula
    AGENTS.md described as undocumented and blocking 12 tier-crossing subclass-spell-grant corrections —
    resolved as a side effect of this pipeline (19 of `catalog.py`'s spell-bundle entries now correctly
    priced per-subclass, where they'd previously all shared one hand-typed guess).
  - Fighter's "Tactical Mind / Shift / Master" is genuinely ONE purchasable feature in the live engine;
    `catalog.py` had it as three separately-priced entries (over-charging by summing all three). Now
    correctly merged to one price.
  - Cleric/Paladin's "Harness Divine Power" (a Tasha's Cauldron option) IS present in the engine, flagged
    `{tasha:true, noncore:true, req:"TCoE · DM approval"}` — not absent as first concluded; a
    name-matching miss, corrected during reconciliation.
- **Decisions made mid-build (owner confirmed live, not silently picked):** Option D2 (vendor the engine's
  JS files and run them under Node inside PACT-guide, rather than asking the separate web-tools repo to
  export JSON itself) — Node was confirmed installed (v24.18.0) and needs zero npm packages. The trigger
  mechanism (Open Question A) was explicitly deferred — "skip the trigger for now" — see the new
  TASK_BOARD.md task "Add an automatic trigger for the engine.js price sync." Open Questions B/C from the
  plan were resolved during implementation: generated files live in `py/generated/`; a missing generated
  file raises `IncompleteCatalog` (loud failure) rather than a silent fallback.
- **Two use cases this unblocks:** `python3 py/engine.py` (pre-existing tool, previously running on
  inaccurate data) now prints an accurate level 1–20 × 12-class AP-cost grid. A new tool,
  `py/tools/build_character.mjs`, builds a real `compute()`-validated character to an AP budget and a
  rough direction (melee/caster/tanky/balanced) — first version; see PYTHON-FILES-OVERVIEW.md for its
  documented limitations (direction doesn't yet filter features by theme) and the follow-up task on
  TASK_BOARD.md.
- **Status:** Active. Applied 2026-08-11.

---

## D-2026-08-06-retire-copilot-sync-rule — Retire the Microsoft 365 Copilot for-copilot/*.txt mirror rule

- **Context:** AGENTS.md carried a rule (added when the standard file shapes were adopted) requiring a
  byte-identical `.txt` mirror of every Read Order file in `for-copilot/`, on the grounds that Microsoft 365
  Copilot doesn't reliably read `.md` files. The owner confirmed this session that the rule is no longer
  relevant and asked for it to be removed.
- **Decision:** Removed the rule from AGENTS.md entirely: the three "Microsoft 365 Copilot…" sections
  (compatibility rule, mirror-freshness/offline-sync note, and Copilot-workflow patch loop), the Read Order
  step requiring `for-copilot/*.txt` staleness disclosure, the Session Wrap-Up step to refresh mirrors, the
  `for-copilot/` line under Supporting Files, and the Microsoft 365 Copilot mention in Concurrent Editing.
  Also deleted the 9 existing `.txt` mirror files in `for-copilot/` (AGENTS, CHANGELOG, CURRENT-WORK,
  DECISIONS, OPEN-QUESTIONS, PLAYTEST-EVIDENCE, PROJECT_KNOWLEDGE, PYTHON-FILES-OVERVIEW, TASK_BOARD), since
  nothing will reference or refresh them going forward.
- **Why:** Direct owner instruction; no further rationale recorded in this session.
- **Consequence:** This project is no longer edited via Microsoft 365 Copilot against `.txt` mirrors — future
  sessions should treat the `.md`/`.html` files as the only copies, with no parallel sync step. The
  `.github/copilot-instructions.md` stub (a different thing — a GitHub Copilot coding-agent pointer to this
  file, not the M365 mirror workaround) was deliberately left in place, not part of this decision's scope.
- **Evidence Used:** None — a housekeeping/process decision, not a game-balance decision.
- **Status:** Active. Applied 2026-08-06.

## D-2026-08-06-grit-base-cost-2 — Grit's Steep-curve base cost drops from 3 AP to 2 AP

- **Context:** D-2026-08-05-grit-cost-steep-curve (the previous day) set Grit's Steep-curve base at 3 AP
  (3/5/7/9/11/13…). In a follow-up session the owner asked to lower that base to 2 AP.
- **Decision:** Grit's base cost changes from 3 AP to 2 AP. The curve is now 2/4/6/8/10/12… (2N AP for the
  Nth purchase), plus the existing +1 AP surcharge once the character already owns more Grit purchases than
  their Constitution modifier. All other Grit mechanics (the +4 HP granted per purchase, the CON-mod
  surcharge trigger) are unchanged.
- **Options:** Not applicable — a direct owner instruction to change one number, not a menu of alternatives.
- **Why:** Owner-directed adjustment; no additional balance rationale was recorded in this session. Noted in
  passing, not as a stated reason: this also brings Grit's curve shape (2/4/6/8…) into line with the
  Metamagic ladder's Steep curve (Appendix E House Rules table: "option 1 costs 2, 2nd 4…"), rather than the
  offset-by-one shape (4/6/8…) used for cantrips and attunement slots.
- **Evidence Used:** None — direct owner instruction, not a playtest-driven balance response.
- **Consequence:** Updated PACT-Players-Guide-v0.332.html (Hit Points section table row + prose,
  Quick-Reference Card, two Glossary entries) and `py/pricing.py`'s `grit_ap` base formula (`2*n+1` →
  `2*n`). Also fixed, in the same pass, a pre-existing unrelated typo flagged (but not fixed) by
  D-2026-08-05-grit-cost-steep-curve: the "Two HP rules worth boxing" callout's explanatory sentence said
  "each Grit purchase adds a flat 5" against the correct ×4 figure used in the formula beside it — corrected
  to "4".
- **Status:** Active. Applied 2026-08-06.

## D-2026-08-05-keep-vigor-pricing-as-is — Considered simplifying Vigor's AP cost; decided to leave it unchanged

- **Context:** While fixing Grit's cost (D-2026-08-05-grit-cost-steep-curve), the owner flagged that Vigor's
  own cost mechanism has the same root problem Grit did, and more centrally: each Vigor rank is priced off
  "the Passive band of your current Hit-Dice tier" — i.e. the buyer's live tier at the moment of that
  specific purchase, not a fixed value tied to the rank itself. Every other repeatable purchase in the
  system (Gentle/Steady/Steep curves, and Grit as of today) prices purely off "which purchase number is
  this," independent of when it was bought — Vigor is the one exception, which makes it hard to price
  programmatically for the open "Build the engine.js auto-sync pipeline (AP-cost generator)" task, since a
  generator would need to reconstruct purchase order/timing, not just a finished character's final rank
  count. A related, narrower instance of the same pattern (racial traits bought "in play" after creation,
  priced at the buyer's current tier) was also found and deliberately left out of scope, since it's a single
  well-defined late-buy branch, not an escalating per-purchase mechanism like Vigor's.
- **Options considered:** A range of alternatives was explored across two rounds — (1) reindex the existing
  Passive-band lookup by rank instead of live tier, same AP numbers; (2) move Vigor onto one of the three
  named curves (Gentle/Steady/Steep), a real balance change; (3) flatten the CON-mod cap and drop the
  undocumented "die-match ranks free of the cap" exception found in the Quick-Reference Card (never
  explained in the main Hit Points prose); (4) merge Vigor and Grit into a single ladder; (5) a flat
  uniform per-rank price; (6) reuse the Focus-point Gentle-band-of-two model; (7) fold Vigor into the Hit
  Die purchase itself; (8) price each rank as rank-number × current Hit Dice, a clean formula (with a few
  damping variants) that collapses two lookups (HD → Tier → Passive band) into one multiplication.
- **Decision:** None of the above. Vigor's pricing, its CON-mod cap, and the undocumented "die-match ranks
  free of the cap" exception all stay exactly as shipped. No guide text or `py/pricing.py` change was made.
- **Why:** No option surfaced that the owner was confident improving on, weighed against touching a
  mechanic that isn't currently broken for players at the table — only awkward for a not-yet-built tool.
  Revisit if and when the auto-sync pipeline work actually starts and needs a concrete answer.
- **Consequence:** The "Build the engine.js auto-sync pipeline (AP-cost generator)" task (TASK_BOARD.md,
  NOW) still needs to account for Vigor's live-current-tier pricing as a special case, unlike every other
  priced item it will walk. The undocumented "die-match ranks free of the cap" exception in the
  Quick-Reference Card also remains unresolved — flagged here for whenever Vigor is revisited, but not
  itself acted on.
- **Evidence Used:** None — a design-direction call, not a balance response to playtest data.
- **Status:** Active. Applied 2026-08-05.

## D-2026-08-05-add-lean-budget-track — Add a third "lean" AP budget track; correct the stale standard-track total the level-by-level table shipped with

- **Context:** The guide already offered two AP budget tracks — standard (79 AP at L1, +24/level, 535 at L20)
  and generous (+28/level, 615 at L20) — off a shared Level-0 anchor of 55 AP, stated consistently in the
  §2 "starting budget" callout and the §18 Quick-Reference Card's Benchmark Budgets line. While adding a
  third track, a separate pre-existing bug surfaced: §17's detailed level-by-level table (with its
  Sessions-to-next / AP-per-session columns) ran an entirely different, non-matching progression — L1 50,
  L2 92, L3 134… L20 **491**, not 535 — that doesn't fit the 55+24×level formula at all (its early jumps are
  +42/+42 before settling to +21/level). The stale 491 figure had also propagated into §2's own AP intro
  paragraph, `PROJECT_KNOWLEDGE.md`'s Experimental design elements, `OPEN-QUESTIONS.md` Q-005, and
  `TASK_BOARD.md`'s "AP budget review" task — all citing 491 as "the baseline" despite the guide's own
  callout and Quick-Reference already superseding it with 535.
- **Options:**
  - A) Add lean only where standard/generous already live cleanly (the §2 callout and Quick-Reference
    Card), and leave the §17 detailed table's 491-vs-535 mismatch as a separately-flagged pre-existing bug
    for the open "AP budget review" task/Q-005 to resolve later.
  - B) Reconcile the §17 table in the same pass: rebuild it against the 55+rate×level formula, Level 0
    through Level 20, and extend it to show lean, standard, and generous side by side.
- **Decision:** B. Lean is 55 AP at Level 0, +20 AP a level (75 at L1, 455 at L20) — four sessions per level
  at 5 AP a session, alongside standard's 6 AP/session and generous's 7 AP/session (all at four
  sessions/level, matching the cadence already stated for standard/generous). The §17 table was rebuilt for
  all three tracks, Level 0–20, replacing the old Sessions-to-next/AP-per-session columns (now redundant —
  the cadence is a constant per track, not a per-level variable). The stale 491 reference in §2's AP intro,
  `PROJECT_KNOWLEDGE.md`, `OPEN-QUESTIONS.md` Q-005, and `TASK_BOARD.md`'s "AP budget review" task were all
  corrected to 535 (standard track), noting lean (455) and generous (615) alongside it.
- **Why:** Leaving the mismatch in place (Option A) would have meant adding a third, internally-consistent
  track right next to a table that already contradicted the other two — making the section harder to trust,
  not easier. Reconciling now was the same amount of work either way, since extending the table to a third
  column required rebuilding it regardless.
- **Evidence Used:** None — a clarity/consistency fix plus an additive design choice (a third pacing
  option), not a balance response to playtest data. Q-005 ("does the AP curve create pressure spikes")
  remains open and blocked on evidence; this decision only corrects the reference numbers it's measured
  against, not the underlying question.
- **Consequence:** Updated PACT-Players-Guide-v0.332.html: §2's AP intro and starting-budget callout, the
  "Why start at 79?" callout, all of §17 (intro paragraph, the rebuilt table, "Reading it," and the cadence
  sentence), and the §18 Quick-Reference Card's Benchmark Budgets line. Updated `PROJECT_KNOWLEDGE.md`,
  `OPEN-QUESTIONS.md` (Q-005), and `TASK_BOARD.md` ("AP budget review") to cite the corrected 535 baseline.
  Separately noted but NOT fixed by this decision: Appendix I's intro claims its 20-hero sample roster spans
  "50 AP to 491 AP," but the actual first and last heroes in that roster are 59 AP and 483 AP — a distinct,
  pre-existing imprecision describing that specific roster's range rather than the formal budget table,
  flagged for a separate fix.
- **Status:** Active. Applied 2026-08-05.

## D-2026-08-05-grit-cost-steep-curve — Grit's AP cost moves from a tier-locked lookup to the Steep curve (base 3), CON-mod surcharge retained

- **Context:** The shipped guide (PACT-Players-Guide-v0.332.html, Hit Points section) priced Grit as
  “Situational by tier — 2 / 4 / 6 / 9 / 12 / 15 / 18; +1 per purchase past CON mod,” a tier-locked lookup
  keyed to the buyer's current Hit-Dice tier. This was the one repeatable purchase in the whole cost system
  that didn't climb one of the three named curves (Gentle/Steady/Steep) the guide's own Master Cost Table
  section says every other repeatable purchase uses — “learn three patterns instead of a dozen.” It was
  flagged as confusing in a 2026-08-05 chat review; no DECISIONS.md entry, OPEN-QUESTIONS.md question, or
  TASK_BOARD.md task existed for Grit's mechanism at all, and unlike Vigor (whose Passive-band-by-tier price
  matches `TIER_BANDS["Passive"]` in `py/pricing.py`), Grit had no coded formula anywhere in the Python
  tooling — only guide prose/table.
- **Options:**
  - A) Leave the tier-locked lookup mechanism as-is; only clarify the wording.
  - B) Replace it with a purchase-count-based ladder, matching every other repeatable item on the Gentle/
    Steady/Steep system. Under B — B1) Steep curve from base 3, drop the CON-mod surcharge entirely for
    maximum simplicity; B2) Steep curve from base 3, keep the +1-per-purchase-past-CON-mod surcharge
    stacked on top, so Constitution still matters for Grit specifically, not just Vigor.
- **Decision:** B2. A Grit purchase's base cost follows the Steep curve from 3 AP (3, 5, 7, 9, 11, 13…, i.e.
  2N+1 AP for the Nth purchase), plus +1 AP once the character already owns more Grit purchases than their
  Constitution modifier.
- **Why:** The tier-locked lookup was the outlier mechanism in the cost system and the direct source of the
  confusion flagged this session. Moving Grit onto the Steep curve (the same +2-per-step pattern already used
  for cantrips and attunement slots) removes that inconsistency. The owner chose to keep the CON-mod surcharge
  rather than drop it, so Constitution still has a bearing on Grit's price, not only on Vigor's rank cap.
- **Evidence Used:** None — a clarity/consistency fix to an internally-inconsistent mechanism, not a
  balance response to playtest data.
- **Consequence:** Updated PACT-Players-Guide-v0.332.html's Hit Points section (Grit table row + prose), the
  Quick-Reference Card, and the two Glossary entries mentioning Grit's cost. Added `grit_ap`/`grit_block` to
  `py/pricing.py` (Grit previously had no coded formula at all, unlike Vigor). No change to Vigor, Frail, or
  the HP granted per Grit purchase (+4 HP, unchanged). Separately noted but NOT fixed by this decision: the
  guide's “Two HP rules worth boxing” callout states the total-HP formula as `Grit purchases × 4` but its
  own explanatory sentence says “each Grit purchase adds a flat 5” — an unrelated internal typo, flagged for
  a separate fix.
- **Status:** Active. Applied 2026-08-05.

## D-2026-07-28-technical-access-not-scope — Add a "technical access ≠ scope" rule to AGENTS.md

- **Context:** Direct testing on Home AI Server (a different project sharing this AI_templates standard)
  confirmed a real gap: a session with broad, non-enforced filesystem/connector access (there, a Windows
  app's drive mapping covering multiple projects, not a project-scoped one) reasoned it *would* edit a
  different project's files if asked, since it saw no rule stopping it. This project is itself edited from
  Dropbox/Claude/Copilot per its own Concurrent Editing section, so the same gap applies here.
- **Options:** A) leave it as an unstated assumption; B) state it explicitly in AGENTS.md, matching the
  standard-level rule now added to AI_templates' `AGENTS_TEMPLATE.md`/`AI_RULES.md`.
- **Decision:** B.
- **Why:** The Home AI Server test showed the assumption in option A doesn't hold — a session without an
  enforced technical boundary needs to actually be told, not just expected to infer it.
- **Status:** Active. See AI_templates' `D-2026-07-28-technical-access-not-scope` for the full cross-project
  reasoning.

## D-2026-07-20-engine-js-is-pricing-source-of-truth — engine.js is the pricing source of truth; build an automatic sync pipeline, not a one-off Python reference

- **Context:** This project's Python pricing tooling (`pricing.py`/`model_config.py`/`catalog.py`/
  `engine.py`) was recovered from a local backup on 2026-07-17 and verified to run, but `catalog.py`'s own
  docstring states its RAW-kit prices "DIVERGE from the grid's curated class_features by design... not a
  grid verification." Meanwhile `engine.js` (in the separate PACT-copilot-only project) is the actual live
  pricing engine behind the real web tools, and its own header calls it the single source of truth for
  those tools. A 960-build "master card" snapshot (`pact-class-builds.jsonl`) generated from `engine.js` at
  some past point independently validated `pricing.py`'s chassis (Hit-Dice/Proficiency) math at 960/960 —
  but no script exists to regenerate that snapshot, so it can silently go stale as `engine.js` changes
  (confirmed already happening once: the docs said rules dataset v0.332 while live `engine.js` was already
  at v0.336).
- **Options:**
  - B1) Treat `engine.js`/the master-card data as ground truth; retire `catalog.py`'s divergent RAW-kit
    estimate; refresh the master-card snapshot manually/on-demand via a new generator tool when it's
    needed for a specific piece of work.
  - B2) Same core (retire `catalog.py`'s divergent estimate; `engine.js` is ground truth), but build the
    generator as an automatic, continuously-run pipeline rather than a manual on-demand tool, so the Python
    tooling is never stale relative to `engine.js` without a manual refresh step.
  - B3) Retire the Python engine entirely. Rejected outright before B1/B2 were compared — it would discard
    the one part already proven correct (the chassis math) for no offsetting benefit.
- **Decision:** B2. `engine.js` is the pricing source of truth. `catalog.py`'s divergent RAW-kit price
  estimates are retired in favour of engine.js-derived numbers. The standalone generator tool (see
  TASK_BOARD.md) is to be built as an automatic sync pipeline, not a manual/on-demand refresh tool.
- **Why:** The owner chose continuous/automatic sync over occasional/on-demand refresh — B1 and B2 need the
  same underlying generator either way (calling `engine.js`'s `compute()` programmatically), so the marginal
  cost of B2's automation layer on top of that shared generator was judged worth it, rather than accepting
  even an occasional staleness window between manual refreshes.
- **Consequence:** `pricing.py`'s already-verified chassis functions (`hit_dice_block`, `proficiency_block`)
  are retained — they're independently correct, not part of `catalog.py`'s divergent estimate, and nothing
  here requires touching them. `catalog.py`'s RAW-kit `Feature` costs (as distinct from the chassis
  functions) should be treated as superseded once the generator exists and produces engine.js-derived
  numbers — until then, `catalog.py`'s costs remain flagged `APPROX`/uncorrected per the 2026-07-17
  level-gate audit (see CHANGELOG.md) and should not be trusted for actual pricing decisions. This decision
  couples PACT-guide's Python tooling to PACT-copilot-only's `engine.js` going forward — a cross-project
  dependency that didn't exist before. `catalog.py`'s docstring's "diverges by design" framing is now
  historical context for *why* the old numbers differ, not a live design intent to preserve.
- **Status:** Active. Un-blocks the "Build a standalone AP-cost generator" task in TASK_BOARD.md. The
  automatic-sync pipeline itself is not yet built — this decision settles which engine it targets and that
  it should be automatic, not the implementation.

## D-2026-07-19-remove-current-status-section — Remove the "Current Status" section from AGENTS.md; status lives in CURRENT-WORK.md, TASK_BOARD.md, and CHANGELOG.md

- **Context:** AGENTS.md carried a "Current Status" section (Current Phase / Current Goal / Current Blockers
  / Next Action, plus a live version line) that duplicated `CURRENT-WORK.md` — this project's dedicated
  session entry-point / status file — and went stale in AGENTS.md, which is meant to be static/structural
  and isn't edited every session. AI_templates fixed this at the template level
  (D-2026-07-19-remove-current-status-from-template); applied here as part of that rollout.
- **Options:** Considered removing the section entirely, redirecting status to
  `CURRENT-WORK.md`/`TASK_BOARD.md`/`CHANGELOG.md`, versus keeping it with a "refresh each session"
  instruction. Chose full removal.
- **Decision:** Removed the "Current Status" section from AGENTS.md. Added a Source Of Truth static-only
  line pointing current status to `CURRENT-WORK.md` (the entry point) and `TASK_BOARD.md`, with completed
  work in `CHANGELOG.md`. Reworded the Session Start briefing (step 3) to draw status from `CURRENT-WORK.md`
  and `TASK_BOARD.md`, and Session Wrap-Up (step 5) to structural-only.
- **Why:** The section was a straight duplicate of `CURRENT-WORK.md`, which already holds current focus, the
  top-five priorities, blockers, recommended next task, and the same `v0.336 / v0.107` version line — so
  removal lost nothing, and AGENTS.md had simply been the copy that went stale. Status now lives only in the
  files that are edited every session.
- **Status:** Active. Applied 2026-07-19. Mirrors AI_templates' D-2026-07-19-remove-current-status-from-template;
  the same fix was applied to Dad's Super and Home AI Server.

## D-2026-07-19-rename-design-context-to-project-knowledge — Rename DESIGN-CONTEXT.md → PROJECT_KNOWLEDGE.md (the standard durable-knowledge filename)

- **Context:** AI_templates introduced `PROJECT_KNOWLEDGE.md` as the single canonical durable-knowledge
  filename (D-2026-07-19-project-knowledge-file) for the "stable background facts / designed shape / locked
  design elements" slot. This project's `DESIGN-CONTEXT.md` is exactly that slot.
- **Options:** Considered keeping `DESIGN-CONTEXT.md` as an organic name — this project deliberately keeps
  organic companion names (see D-2026-07-17-adopt-standard-file-shapes) — versus renaming to the canonical
  `PROJECT_KNOWLEDGE.md` for cross-project consistency of the durable-knowledge slot. Chose the rename
  (owner's standing preference to fix the durable-knowledge filename once, everywhere).
- **Decision:** Renamed `DESIGN-CONTEXT.md` → `PROJECT_KNOWLEDGE.md` (recreated with an updated title;
  content otherwise unchanged). Updated every *live* reference: AGENTS.md (Read Order, Working Rules,
  Supporting Files, the conversion Note), `CURRENT-WORK.md` (×2), the `.github/copilot-instructions.md`
  stub, the `for-copilot/` mirror (`DESIGN-CONTEXT.txt` → `PROJECT_KNOWLEDGE.txt`), and
  `00-PROJECT-DIRECTORY.md`'s PACT-guide entry. Historical references inside past `DECISIONS.md`/`CHANGELOG.md`
  entries were deliberately left unchanged (append-only history — those entries correctly name the file as it
  was at the time).
- **Why:** Cross-project consistency of the durable-knowledge slot specifically. The other companion files
  (`CURRENT-WORK.md`, `OPEN-QUESTIONS.md` with Q-xxx, `PLAYTEST-EVIDENCE.md` with PT-xxx,
  `PYTHON-FILES-OVERVIEW.md`) remain organic extensions the standard doesn't define; only the
  durable-knowledge file — which the standard now defines — was standardised.
- **Status:** Active. Applied 2026-07-19. Note: `PROJECT_KNOWLEDGE.md` still shows rules dataset **v0.332**
  in its "Current guide version" section, while `CURRENT-WORK.md` and the live engine show the corrected
  **v0.336** — a pre-existing content staleness, left as-is by this rename (the file's own rule says raise
  such corrections via `OPEN-QUESTIONS.md` rather than editing it directly). Flagged for follow-up.

## D-2026-07-17-adopt-standard-file-shapes — Convert PACT-guide fully to the standard file shapes (reverses the earlier keep-native-names choice)

- **Context:** PACT-guide originally kept its native file names and ID schemes — `DESIGN-BACKLOG.md`
  (D-xxx design items), `DESIGN-DECISIONS.md` (DEC-xxx), `OPEN-QUESTIONS.md` (Q-xxx),
  `PLAYTEST-EVIDENCE.md` (PT-xxx) — and mapped the first two to the standard's TASK_BOARD/DECISIONS roles
  in AGENTS.md rather than renaming them, deliberately, to avoid breaking the heavy cross-referencing
  between them. The owner subsequently decided to bring the project into full conformance with the
  AI_templates standard.
- **Options:**
  - A1) Conformance pass keeping native formats — add the Risk field and audit AGENTS.md, but leave
    DESIGN-BACKLOG.md / DESIGN-DECISIONS.md named and formatted as-is.
  - A2) Full conversion to the standard filenames and shapes.
  - Under A2 — C1) preserve the existing IDs as a documented extension (zero broken references); or
    C2) pure standard: rename, adopt standard task-block and `D-YYYY-MM-DD-slug` decision formats, drop the
    D-xxx backlog-ID scheme, and renumber DEC-xxx into dated-slug IDs.
- **Decision:** A2 + C2. `DESIGN-BACKLOG.md` → `TASK_BOARD.md` (standard task blocks, mandatory Risk field,
  D-xxx IDs dropped); `DESIGN-DECISIONS.md` → `DECISIONS.md` (DEC-001–003 migrated to `D-2026-07-03-*`
  dated-slug IDs, old IDs noted parenthetically). Both old files moved to `archive/` with a `-retired`
  suffix.
- **Why:** The owner prioritised full standard conformance over the existing cross-reference convenience,
  and explicitly accepted the trade-off C2 carries: the loss of the stable D-xxx backlog-ID scheme and of
  the Q→task ID linkage. This reverses the earlier keep-native-names choice recorded in AGENTS.md and the
  2026-07-17 CHANGELOG entry.
- **Consequence:** Cross-references in `OPEN-QUESTIONS.md`, `PLAYTEST-EVIDENCE.md`, `DESIGN-CONTEXT.md`, and
  `CURRENT-WORK.md` were rewired — questions and evidence now point at tasks by title (since tasks no longer
  carry stable IDs) and at decisions by the new dated-slug IDs. The `Q-xxx` and `PT-xxx` schemes are
  retained: those files are project-specific extensions the standard doesn't define, so they keep their own
  IDs. `00-PROJECT-DIRECTORY.md`'s PACT-guide entry was corrected to drop the native-names note.
- **Status:** Active.

## D-2026-07-03-evidence-distinct-from-decisions — Treat playtest evidence as distinct from design decisions (migrated from DEC-003)

- **Context:** A single table observation could be mistaken for a settled design conclusion if evidence and
  decisions live in the same place.
- **Options:** 1) Record playtest observations directly as decisions. 2) Keep playtest evidence in its own
  file, separate from decisions, and only promote it to a decision deliberately.
- **Decision:** Treat playtest evidence as distinct from design decisions. Observations live in
  `PLAYTEST-EVIDENCE.md`; they only become binding once a decision here explicitly cites them under
  Evidence Used.
- **Why:** Prevents one anecdote from being treated as a final ruling, while still keeping a clear path from
  observation to decision.
- **Evidence Used:** None — a process decision about how evidence and decisions relate, not a game-balance
  decision.
- **Risks:** None significant identified.
- **Status:** Active (originally dated 2026-07-03; migrated from DEC-003 on 2026-07-17).

## D-2026-07-03-split-context-from-current-work — Split stable context from active work (migrated from DEC-002)

- **Context:** Mixing permanent project facts with day-to-day active work in one document makes it slow for
  a new session to find what's current.
- **Options:** 1) One combined design document. 2) Split stable context (`DESIGN-CONTEXT.md`) from
  active/current work (`CURRENT-WORK.md`).
- **Decision:** Split stable context from current work into two separate files.
- **Why:** A new session can read the short, current file first and only pull in the stable-context file
  when it actually needs background — keeping token usage low.
- **Evidence Used:** None — a process decision about document structure, not a game-balance decision.
- **Risks:** Information could drift out of sync between the two files if not maintained; mitigate by keeping
  `CURRENT-WORK.md` short and pointing to IDs rather than repeating content.
- **Status:** Active (originally dated 2026-07-03; migrated from DEC-002 on 2026-07-17). _(The stable-context
  file referred to here, `DESIGN-CONTEXT.md`, was renamed to `PROJECT_KNOWLEDGE.md` on 2026-07-19 — see
  D-2026-07-19-rename-design-context-to-project-knowledge. This historical entry is left as written.)_

## D-2026-07-03-evidence-led-design-tracking — Adopt evidence-led design tracking (migrated from DEC-001)

- **Context:** Design changes to PACT's mechanics (pricing, rules clarity) risk being made on gut feel
  alone, with no record of why.
- **Options:** 1) Keep tracking informal, decide changes ad hoc. 2) Require every mechanics change to trace
  back to logged evidence and a recorded decision.
- **Decision:** Adopt evidence-led design tracking — mechanics changes should be backed by
  `PLAYTEST-EVIDENCE.md` entries and recorded here, not made from memory alone.
- **Why:** Keeps the design history auditable and lets a future session see *why* a rule is the way it is,
  not just what it is.
- **Evidence Used:** None — a process decision about how the design system operates, not a game-balance
  decision.
- **Risks:** Adds overhead to recording observations; if not kept up, the log goes stale.
- **Status:** Active (originally dated 2026-07-03; migrated from DEC-001 on 2026-07-17).
