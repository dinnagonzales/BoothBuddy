# Market Day — Product Requirements Document (v0.2)

> Resolved via grill session Aug 28, 2026. Domain language lives in [CONTEXT.md](./CONTEXT.md).

## Overview

Market Day is a kid-friendly point-of-sale app for a young vendor (age 12) selling 3D-printed items at in-person craft fairs and markets. It replaces a spreadsheet workflow with a fast, tappable interface a child can operate solo during a busy sales session, while giving the adult owner (Dinna) item/cost setup and data export for Excel reconciliation.

## Problem

The current Excel workbook works for after-the-fact bookkeeping but is too slow and error-prone live at a booth. The seller needs something that takes seconds per sale, requires no typing of item names or math, and can't fat-finger a formula.

## Goals

- A 12-year-old can log a multi-item sale in well under 15 seconds, unsupervised.
- Zero spreadsheet exposure for the kid — no formulas, no cost math, no item typing.
- The adult sets up Items/prices once before market day and exports clean sales data afterward.
- Works reliably on a phone or tablet at a booth, single device.

## Non-goals (v1)

- Friend/partner profit-share tracking.
- Inventory/stock-level tracking.
- Multi-vendor or multi-booth support.
- Offline mode (assume hotspot/wifi).
- User accounts / login.

## Target users

- **Seller** — child operating the app at the booth during an Active Market Day.
- **Admin** — adult owner; setup, Market Day management, Running Tab sales, export.

---

## Core flows

### First launch (admin setup wizard)

1. Admin opens app → guided setup: set parental code → add at least one Item.
2. Kid can browse Home (Items menu) but **Sell something!** stays disabled until admin starts a Market Day.

### Start a Market Day (admin)

1. Admin taps gear → enters parental code.
2. **Start Market Day** → name it (default suggested, e.g. "Market Day – Sep 18, 2026").
3. Kid's **Sell something!** becomes enabled.

### Log a sale (seller — primary flow)

1. **Home** — read-only **Items** list (icon, name, price) + **Sell something!** (disabled if no Active Market Day).
2. **Pick Items** — scrollable list with **+** buttons; cart pinned at bottom with **− / +** per line, running total, **Checkout**.
3. **Payment** — total; **Cash** or **Venmo/Zelle** (mutually exclusive).
   - **Cash:** quick-tap bills ($1, $5, $10, $20, $100 — each replaces amount), **− / +** steppers ($1 increments), numeric input, **Change** displayed.
   - **Venmo/Zelle:** checkbox only; assumed paid in full.
4. **Celebration** — "Sold!" + item count + total; **Fix** reopens cart; tap elsewhere → **Home**.

### Log a Running Tab sale (admin)

Same checkout flow as seller, launched from grown-up settings → **Log a sale**. Routed to Running Tab (not Active Market Day).

### End a Market Day (admin)

1. **End Market Day** in grown-up settings.
2. **Undo close** available until export.
3. After export, close is permanent (edits still allowed; bucket flagged for re-export).

### Grown-up settings (admin)

Behind gear icon + parental gate (numeric code). Shows:

- Active / most recent Market Day dashboard: totals, item count, Cash vs Venmo/Zelle breakdown, sale list with Sale numbers.
- Running Tab summary.
- Item management (name, cost, price, emoji icon, optional photo).
- Archive Items (soft delete — hidden from seller, preserved in history). UnArchive restores them.
- **Admin edit** any Sale (line items, payment, cash received); changed line items re-snapshot current price/cost.
- Export (see below).

---

## Data model

**Item:** id, name, icon (emoji default, photo optional), cost, price, archived (boolean)

**Market Day:** id, name, startedAt, closedAt, exportedAt

**Sale:** saleNumber (global auto-increment), timestamp, marketDayId (nullable → Running Tab), line items, total, paymentMethod, cashReceived (if cash)

**Line item:** itemId, quantity, priceAtSale, costAtSale

Price and cost snapshot at checkout. Admin edit re-snapshots on save.

---

## Payment

- Cash and Venmo/Zelle are mutually exclusive per Sale.
- Cash: cash received + change shown; cash received stored for export.
- Venmo/Zelle: no additional input.

---

## Export

- **Market Day:** one CSV per Closed Market Day; name in filename and rows.
- **Running Tab:** date range picker → CSV for sales in range; marks sales exported.
- Columns include: sale number, date/time, market day name (if any), items (name, qty, price, cost), total, payment method, cash received, profit.
- Export locks undo-close for Market Days.
- Edits after export flag bucket **out of date — re-export recommended**.

---

## Success criteria

- Seller completes a 3-item cash sale start-to-finish without help.
- No sale requires keyboard typing (numeric entry only for cash).
- End-of-day export reconciles against manual cash/Venmo/Zelle counts.
- Kid never sees cost or sales totals.

## Resolved open questions (from v0.1)

| Question | Decision |
|----------|----------|
| Undo/edit sales? | **Fix** on celebration; **admin edit** anytime in grown-up settings |
| Cash received? | Record + show **change**; quick bills + $1 steppers |
| Session reset? | **Market Day** = explicit session; **Running Tab** for misc |
| Emoji vs photo? | **Emoji default, photo optional** |
| History view? | **Removed** — Home is Items menu; no Stickers tab |
| Kid sees totals? | **No** — admin-only |
| Sale reference? | Global **Sale number**, admin/export only |

## Out of scope for v0.2

- Visual design system (see [mocks/screens.html](./mocks/screens.html)).
- Technical implementation (storage, hosting, stack).
