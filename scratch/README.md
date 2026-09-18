# Scratch — local issue tracker

Lightweight tracker for **Booth Buddy** MVP work. Not synced to GitHub or any external board.

**Source:** [PRD.md](../PRD.md) · [CONTEXT.md](../CONTEXT.md) · grill session Aug 28, 2026  
**Branch snapshot:** `master` @ `af16581` + uncommitted **008 item photos** WIP (Sep 18, 2026)

## Status key

- `open` — not started / remaining work
- `in progress` — active WIP on branch
- `done` — shipped (update when merged)

## Issues

| # | Title | Type | Blocked by | Status |
|---|-------|------|------------|--------|
| [001](issues/001-first-run-setup.md) | First-run setup: Pass Code + first Item | AFK | — | done |
| [002](issues/002-market-day-lifecycle.md) | Market Day lifecycle (start, end, reopen) | AFK | 001 | done |
| [003](issues/003-admin-item-catalog.md) | Owner Item catalog (add, edit, archive) | AFK | 001 | done |
| [004](issues/004-admin-sales-dashboard.md) | Owner sales dashboard (totals + Sale list) | AFK | 002 | done |
| [005](issues/005-admin-edit-sale.md) | Owner edit Sale | AFK | 004 | done |
| [006](issues/006-export-market-day-csv.md) | Export Closed Market Day (CSV + share sheet) | AFK | 002, 004 | done |
| [007](issues/007-running-tab.md) | Running Tab: off-day sales + preorders + date-range export | AFK | 001, 003 | open (near done) |
| [008](issues/008-item-photos.md) | Optional Item photos | AFK | 003 | in progress (WIP) |
| [009](issues/009-visual-polish.md) | Visual polish (fonts + Booth Buddy brand) | HITL | — | open (HITL) |
| [010](issues/010-app-store-submission.md) | App Store submission | HITL | 001–007 | open |
| [011](issues/011-market-day-menu.md) | Market Day Menu (default all Items, remove, sold out) | AFK | 002, 003 | done |
| [012](issues/012-web-help-site-content.md) | Web help site content (features + FAQ) | HITL | — | open |

## Suggested order (now)

1. ~~001–006, 011~~ shipped  
2. Finish **007** leftover — mark date-range exported sales (`sales.exported_at`)  
3. Land **008** WIP (photos + emoji picker) → device permission check  
4. **009** iPad visual sign-off  
5. **010** Apple Developer + EAS + TestFlight (fair target was Sep 18)  
6. **012** help site anytime  

## Already shipped (scaffold + post-grill)

- Rebrand → **Booth Buddy** (Owner / Staff copy, logo palette)
- Staff sell flow: Home Items → **Make a Sale** or **+ Pre-order** → menu steppers + cart → payment → celebration → Fix
- Off-day / Running Tab checkout + **Sales** tab all-time list + date-range CSV export UI
- Preorders tab: prep summary, overdue/upcoming, printable export, pickup payment, **Mark Delivered**
- Owner area tabs: Events · Inventory · Preorders · Sales · Settings (business / passcode / Zelle·Venmo)
- Onboarding: welcome → Pass Code → optional profile → first Item; Home empty-state **Add Item**
- SQLite schema · HeroUI Native + Uniwind · Fredoka/Nunito visual tokens
- v2-002 change Pass Code — done (see [v2/](v2/))
