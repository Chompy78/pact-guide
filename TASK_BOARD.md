# PACT RULES AND GUIDE — Task Board

**Project: PACT Rules and Guide (`/Personal/dev/PACT-guide/`) — do not confuse with other PACT projects (PACT-Campaign, PACT-copilot-only).**

File: TASK_BOARD.md
Last Updated: 2026-08-13

> Open work only. Finished work lives in CHANGELOG.md — this file never keeps a "recently done" section.
> Replaces the former `DESIGN-BACKLOG.md` (D-xxx table) as of 2026-07-17; see
> D-2026-07-17-adopt-standard-file-shapes in DECISIONS.md.
>
> **Area tags below use project-specific extensions** (`balance`, `pricing`, `onboarding`, `rules`, `tooling`)
> on top of the standard starter list, since this is a rules-design project rather than a build project —
> added explicitly per the standard's "extend the area list, but say so" rule.
>
> These design tasks stay open until backed by evidence: don't mark one done without a linked DECISIONS.md
> entry or clear PLAYTEST-EVIDENCE.md support (the old DESIGN-BACKLOG "Completed" rule, carried over into
> each task's Done-when).

---

# NOW

### Run the first `documents-rules` stamp on the guide
- Tags: tooling, pricing
- Status: open
- Risk: low — Ambiguity: low (the tool and marker format are already built and specified, see
  D-2026-08-12-guide-rules-pointer). Damage: low (display-only pointer, no rules-logic effect).
- Context: `py/tools/stamp_guide_rules.mjs` exists but has never been run — `PACT-Players-Guide.html`
  currently carries no `documents-rules` marker at all. Before running `stamp`, actually reconcile the
  guide's prose against the current `py/vendor/engine/` snapshot (or confirm the 2026-08-12 Grit-table
  sync already covers everything that's changed since that snapshot was last refreshed) — stamping
  without that check would falsely assert a reconciliation that didn't happen.
- Done when: `node py/tools/stamp_guide_rules.mjs` has been run following an actual reconciliation pass,
  `PACT-Players-Guide.html` carries a `documents-rules` marker, and
  `node py/tools/stamp_guide_rules.mjs --check` exits 0.

### Decide per-gate fate of PACT-verify-all.py's five missing scripts (A1, A2, B1, B2, D1)
- Tags: tooling
- Status: open
- Risk: low — investigation/decision task, not a code change by itself.
- See D-2026-08-12-retire-pact-staleness-gate: while retiring the dead D2 gate, found that five
  of the remaining six gates in `PACT-verify-all.py` (`A1 PACT-Full-Audit.py`,
  `A2 PACT-cross-check.py`, `B1/B2 pact-engine/regress_chassis.py`/`regress_grid.py`,
  `D1 PACT-mutation-test.py`) reference scripts that don't exist under `py/` — only
  `C1 PACT-PHB-Audit.py` is real. `pact-engine/regress_chassis.py` specifically matches a gap
  AGENTS.md already documents as searched-for-and-not-found. `PACT-verify-all.py` also still
  hardcodes `PACT-Players-Guide-v0.332.html` (now v0.333) via its `G` constant, used by A1.
  Confirmed via `git stash` this predates 2026-08-12 — the aggregate gate has likely been
  reporting `🔴 ALL: FAILED` for reasons mostly unrelated to actual guide correctness for some
  time, meaning nobody can currently read a real signal from it.
- Done when: each of the five gates has an explicit decision (recover a lost script, rebuild it,
  or retire it like D2) recorded in DECISIONS.md, same as D2's — not silently left broken.

### Review Expertise pricing
- Tags: decision balance
- Status: blocked
- Blocked reason: needs real PLAYTEST-EVIDENCE.md data (question Q-001) on Expertise uptake vs cost before
  a pricing call can be made — blocked on evidence, not on a design dispute.
- Risk: high — Ambiguity: a genuine balance judgment with no objective right answer (the price is a
  deliberate lever, not a checkable fact). Damage scale is only moderate — a published price is editable —
  but the ambiguity alone gates it high.
- Review whether Expertise (currently on the "Steady" moderate-escalation pattern on the Master Cost
  Table) is priced correctly relative to how much it swings skill checks at the table. Formerly backlog
  item D-001; linked question Q-001 (OPEN-QUESTIONS.md); evidence PT-001 (PLAYTEST-EVIDENCE.md).
- Done when: a DECISIONS.md entry records whether Expertise's price changes, citing PLAYTEST-EVIDENCE.md
  data on how often players buy vs skip it, and why.

### Review Invocation pricing
- Tags: decision balance
- Status: blocked
- Blocked reason: needs PLAYTEST-EVIDENCE.md data (question Q-002) on Warlock invocation pick rate vs cost.
- Risk: high — Ambiguity: genuine balance judgment, no objective right answer, blocked on evidence.
- Review whether Eldritch Invocation pricing (on the Warlock's own acquisition track, separate from the
  general feature menu) produces the intended Warlock playstyle rather than pushing toward or away from
  invocation-heavy builds unintentionally. Formerly D-002; linked question Q-002; evidence PT-002.
- Done when: a DECISIONS.md entry records whether Invocation pricing changes, citing playtest data on
  invocation picks vs AP spent elsewhere.

### AP budget review
- Tags: decision balance
- Status: blocked
- Blocked reason: needs PLAYTEST-EVIDENCE.md data (question Q-005) on AP pressure by level, against the
  535 AP / level-20 standard-track baseline (corrected 2026-08-05 from a stale 491; see
  D-2026-08-05-add-lean-budget-track). A new lean track (455 AP/L20) now exists alongside standard
  and generous — playtest evidence should note which track a table is using.
- Risk: high — Damage scale: the AP budget underpins every build in the system, so a wrong call ripples
  across all characters rather than one feature; also a genuine judgment currently blocked on evidence.
- Review whether the AP curve creates uneven pressure spikes at specific levels/tiers rather than feeling
  smooth across the curve (advancement-pace table, guide §17). Formerly D-005; linked question Q-005;
  evidence PT-004.
- Done when: a DECISIONS.md entry records any AP-curve change, citing logged AP-constrained decisions ("I
  wanted X but couldn't afford it") by character level.

### Add an automatic trigger for the engine.js price sync
- Tags: tooling pricing
- Status: open
- Risk: low — Ambiguity: low, this is choosing among 2-3 concrete named mechanisms (session-start
  check / scheduled task / stay manual), not a design judgment. Damage scale: low — the sync itself
  already works correctly; this only affects how often it's remembered to be re-run.
- Context: the engine.js auto-sync pipeline itself (vendoring, price export, `catalog.py` refactor) was
  built and verified 2026-08-11 — see D-2026-08-11-engine-js-auto-sync-pipeline and
  PYTHON-FILES-OVERVIEW.md's "engine.js Auto-Sync Pipeline" section. The owner explicitly deferred
  choosing a trigger mechanism that session ("skip the trigger for now") rather than have one picked
  for them. Right now the sync is a manual step: re-copy `py/vendor/engine/`'s 4 files, then run
  `node py/tools/sync_engine_prices.mjs && python3 py/tools/reconcile_catalog.py`.
- Options (from the implementation plan's Open Question A, still valid): check at PACT-guide's own
  session start (piggybacks on the existing AGENTS.md procedure, zero new infrastructure); a recurring
  scheduled task; or confirm staying manual is fine for now.
- Done when: a DECISIONS.md entry records which trigger was chosen and why, and PYTHON-FILES-OVERVIEW.md's
  pipeline section is updated to describe it (replacing "No automatic trigger exists yet").

### Extend the character builder's "direction" to filter features by theme
- Tags: tooling
- Status: open
- Risk: low — Ambiguity: low-medium (defining "what counts as offense/defense/utility" per feature is a
  judgment call, but a bounded, reviewable one — not an open design question). Damage scale: low — this
  is a build-assistance tool, not a rules/pricing change; a wrong tag just produces a less-thematic
  suggested build, nothing more.
- Context: `py/tools/build_character.mjs` (built 2026-08-11, see PYTHON-FILES-OVERVIEW.md) currently uses
  `direction` (melee/caster/tanky/balanced) to set stat priority and optional subclass choice only —
  feature purchases default to cheapest-first, since `DATA.features` carries no thematic tagging to
  filter on. A real "build me an offense-focused Barbarian" experience needs that tagging added, either
  by hand-classifying each class's feature list or by some other means.
- Done when: `build_character.mjs`'s `direction` demonstrably changes WHICH features get bought (not just
  stat priorities) for at least 2 classes, cross-checked by a human that the resulting build actually
  reads as "melee-flavoured" vs "caster-flavoured."

---

# NEXT

### Set up a public GitHub repo for community sharing
- Tags: docs tooling onboarding
- Status: open
- Risk: medium — Ambiguity: low, the shape is already decided (see D-2026-08-13-public-community-repo).
  Damage scale: medium — this is a real public-exposure decision (making design reasoning and the guide
  visible to strangers), though scoped deliberately to exclude anything player-identifying.
- Create a new, dedicated public GitHub repo (separate from `chompy78/pact`, which is the unrelated
  PACT-copilot-only tools project) hosting: the finished Player's Guide, `TASK_BOARD.md`, `DECISIONS.md`,
  `OPEN-QUESTIONS.md`, and the player survey (static HTML, Formspree-backed — see the survey's own
  rebuild task below). Enable Issues/Discussions for community feedback and PRs for wording fixes.
  Explicitly excludes `playtest/PLAYTEST-EVIDENCE.md`, session notes, and anything player-identifying —
  those stay in this Forgejo-hosted project, unchanged. See D-2026-08-13-public-community-repo for the
  full reasoning and the G/H options considered.
- Needs a Claude Code session (real GitHub push access) rather than this project's usual MCP-connector
  sessions, which can't create repos or push to GitHub directly.
- Open sub-decisions, not yet made: repo name, license, whether `TASK_BOARD.md`/`DECISIONS.md`/
  `OPEN-QUESTIONS.md` are pushed as periodically-refreshed copies or live-synced (and if the latter,
  what refresh discipline — the project's old `for-copilot/` mirror pattern is the closest precedent,
  though that was retired for M365 Copilot specifically, see D-2026-08-06-retire-copilot-sync-rule).
- Done when: the repo exists, is public, contains the four items listed above, Issues/Discussions are
  on, and the survey's public link (once rebuilt — see below) resolves from it.

### Rebuild the player survey off Claude-artifact hosting (Formspree + static HTML)
- Tags: tooling onboarding
- Status: blocked
- Blocked reason: needs a Formspree form endpoint from the owner (sign up at formspree.io, create a
  form, provide the `https://formspree.io/f/...` address) before the submit wiring can be finished.
- Risk: low — Ambiguity: low, the target shape is decided (drop `window.storage`, POST to Formspree,
  remove the results-view panel and "Copy as PT-xxx draft" button that depended on Claude's storage).
  Damage: low — reversible, no rules/pricing content involved.
- Context: the survey (`playtest/surveys/onboarding-spellcasting-survey.html`) was originally built as
  a Claude-artifact page using `window.storage` for response collection. Repeated mobile-testing
  failures (submissions silently not saving) — not fully root-caused despite adding a visible error
  box and a standalone storage-diagnostic artifact that confirmed storage itself worked fine — led to
  abandoning that delivery path. See D-2026-08-13-public-community-repo for the full pivot reasoning.
  Response collection moves to Formspree (private, DM-only via their own account); hosting moves to
  the new public repo above via GitHub Pages (or equivalent).
- Done when: the survey submits successfully to Formspree from a real mobile test, the page no longer
  references `window.storage` anywhere, and it's confirmed reachable at a public URL served from the
  new repo.

### Beginner onboarding
- Tags: docs onboarding
- Status: open
- Risk: medium — Ambiguity: a UX-wording judgment, though observable against real first-time players; low
  damage since guide text is easily revised.
- Determine where brand-new players actually get stuck during character creation, and whether §3's worked
  examples cover every entry point (e.g. a caster build vs a martial build). Formerly D-003; linked
  question Q-003; evidence PT-003.
- Evidence-gathering tool: `playtest/surveys/onboarding-spellcasting-survey.html` covers this task
  (Section II). Currently blocked on the Formspree rebuild above before it can be sent to players — the
  original Claude-artifact delivery hit repeated mobile-submission failures.
- Done when: a DECISIONS.md entry records whether onboarding content changes, backed by an observed
  first-time player building a character unassisted.

### Spellcasting clarity
- Tags: docs rules
- Status: open
- Risk: medium — Ambiguity: which steps of the spellcasting stack confuse players is a judgment call
  pending table observation; low damage since it's wording, easily revised.
- Identify which parts of the multi-step spellcasting stack (§13: Foundation, Rank per Tradition, the HD
  gate, slots, spells known) cause confusion at the table. Formerly D-004; linked question Q-004; evidence
  PT-005.
- Evidence-gathering tool: `playtest/surveys/onboarding-spellcasting-survey.html` covers this task
  (Section III, skipped for non-casters). Same delivery blocker as Beginner onboarding above.
- Done when: a DECISIONS.md entry records any spellcasting-clarity change, backed by table reports of
  where casters stall.

---

# LATER

### Fix stale AP totals in Appendix I's hero-roster intro
- Tags: docs pricing
- Status: open
- Risk: low — Ambiguity: none, this is a mechanical check against the roster's own entries, not a design
  judgment. Damage scale: low — prose-only, no balance impact.
- Appendix I's intro claims its 20-hero sample roster "run[s] from a 1st-level recruit (50 AP) to a
  20th-level archmage (491 AP)" — but the actual first hero (Brann Coalfoot, Level 1) totals 59 AP and the
  actual last hero (the Level 20 Wizard — Evoker) totals 483 AP; neither figure matches. Flagged
  2026-08-05 during the lean-budget-track pass (D-2026-08-05-add-lean-budget-track) but deliberately left
  untouched at the time — it's a distinct, pre-existing imprecision describing that specific roster's own
  range, not the same bug as the standard-track benchmark fix.
- Done when: Appendix I's intro sentence is corrected to cite the roster's actual first/last totals (or, if
  time allows, every entry in the 20-hero list is re-verified in case other totals also drifted from their
  headline description), and a DECISIONS.md entry or CHANGELOG line records the fix.
