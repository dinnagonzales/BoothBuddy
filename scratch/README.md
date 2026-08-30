# Scratch — local issue tracker

Lightweight tracker for Market Day MVP work. Not synced to GitHub or any external board.

**Source:** [PRD.md](../PRD.md) · [CONTEXT.md](../CONTEXT.md) · grill session Aug 28, 2026

## Status key

- `open` — not started
- `done` — shipped (update when merged)

## Issues

| # | Title | Type | Blocked by | Status |
|---|-------|------|------------|--------|
| [001](issues/001-first-run-setup.md) | First-run setup: parental gate + first Item | AFK | — | done |
| [002](issues/002-market-day-lifecycle.md) | Market Day lifecycle (start, end, undo close) | AFK | 001 | done |
| [003](issues/003-admin-item-catalog.md) | Admin Item catalog (add, edit, archive) | AFK | 001 | done |
| [004](issues/004-admin-sales-dashboard.md) | Admin sales dashboard (totals + Sale list) | AFK | 002 | done |
| [005](issues/005-admin-edit-sale.md) | Admin edit Sale | AFK | 004 | open |
| [006](issues/006-export-market-day-csv.md) | Export Closed Market Day (CSV + share sheet) | AFK | 002, 004 | done |
| [007](issues/007-running-tab.md) | Running Tab: log sale + date-range export | AFK | 001, 003 | open |
| [008](issues/008-item-photos.md) | Optional Item photos | AFK | 003 | open |
| [009](issues/009-visual-polish.md) | Visual polish (mock fonts + spacing) | HITL | — | open (HITL) |
| [010](issues/010-app-store-submission.md) | App Store submission | HITL | 001–007 | open |
| [011](issues/011-market-day-menu.md) | Market Day Menu (default all Items, remove, sold out) | AFK | 002, 003 | done |
| [012](issues/012-web-help-site-content.md) | Web help site content (features + FAQ for kids) | HITL | — | open |

## Suggested order

1. **001** (gate + wizard) — unblocks all admin work  
2. **002** + **003** in parallel  
3. **011** (after 002 + 003) — day-of booth menu before hardening checkout  
4. **004** → **005** → **006**  
5. **007** (after 003)  
6. **008**, **009** anytime (**009** code done — iPad sign-off left)  
7. **010** when 001–007 are demo-ready  

## Already in scaffold (done)

- Kid sell flow: Home Items menu → **Make a Sale** (always) or **+ Pre-order** → menu steppers + cart summary → payment → celebration → Fix  
- SQLite schema  
- HeroUI Native + Uniwind theme  
- Visual polish — Fredoka/Nunito, mock-aligned spacing/radii (`constants/visual.ts`)
