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
2. Kid can browse Home (Items menu). **Make a Sale** is always available.

### Start a Market Day (admin)

1. Admin taps gear → enters parental code.
2. **Start Market Day** → enter a **Market Name** (required); date defaults to today.
3. While active, a **Market Day** banner appears on Home and **Make a Sale** attaches new sales to that day.

### Log a sale (seller — primary flow)

1. **Home** — **Items** list (icon, name, price) + **Make a Sale** (always enabled). Optional **Market Day** banner when a day is active.
2. **Pick Items** — scrollable list with **+** buttons; cart pinned at bottom with **− / +** per line, running total, **Checkout**.
   - **Active Market Day:** checkout uses today's **Menu**; no name/notes fields; sale attaches to that **Market Day**.
   - **No active Market Day:** checkout uses the full non-archived catalog; optional **Sale name** and **Sale notes** above the cart; sale saves to **Running Tab** (`marketDayId` null).
3. **Payment** — total; when **Cash** is selected, a cash-entry card (bill chips → amount received → **− / +** steppers → **Change** or **Still $X due** → optional **Keep change?** when change is due); **Cash** and **Venmo/Zelle** selector cards below (mutually exclusive).
   - **Cash:** quick-tap bills ($1, $5, $10, $20, $100 — each adds to amount), **Exact amount**, **Clear**, **− / +** steppers ($1 increments). When change is due, centered **Keep change?** outline control with checkbox (always unchecked by default, including when editing a sale) records kept change for export.
   - **Venmo/Zelle:** selector only; assumed paid in full.
4. **Celebration** — "Sold!" + item count + total; **Go to Dashboard** or **✕** → **Home**; **Edit this sale** reopens cart.

### Log a preorder (seller)

1. Tap **+ Pre-order** on Home (top bar, next to gear).
2. Same cart flow as seller checkout, but always a **Preorder**: **Sale name**, **Sale notes**, and **Complete date** required above the cart; screen title **Pre-order**.
3. Uses the global non-archived catalog (not today's **Menu**), whether or not an **Active Market Day** is running.
4. **Payment** — **Pay on pickup** only at creation; sale saves to **Running Tab** (`marketDayId` null) and appears in the **Preorders tab** until **Mark complete**.
5. **Celebration** — "Preorder saved!" + **Invoice #N**; dismiss → **Home**.

### Fulfill preorders (admin)

1. **Preorders tab** — **Prepare** summary at top shows total quantity per item across all open orders.
2. **Overdue** section lists orders past their **Complete date**; **Upcoming** lists the rest (sorted by complete date).
3. **Export preorders for printing** — share sheet → printable checklist with prep summary and one block per order (`[ ]` lines to cross off).
4. Tap an order to record payment and **Mark complete**; sale moves to **Sales tab**.

### Log a Running Tab sale (off-day)

Off-day sales come from **Make a Sale** when no **Active Market Day** is open (optional name/notes), or from **+ Pre-order** (always). Both save with `marketDayId` null. During an active **Market Day**, only **+ Pre-order** bypasses the day — **Make a Sale** still attaches to that day.

### End a Market Day (admin)

1. **End Market Day** in grown-up settings.
2. **Undo close** available until export.
3. After export, close is permanent (edits still allowed; bucket flagged for re-export).

### Grown-up settings (admin)

Behind gear icon + parental gate (numeric code). Shows:

- Active / most recent Market Day dashboard: totals, item count, Cash vs Venmo/Zelle breakdown, sale list with Sale numbers (and optional sale names when set).
- Running Tab summary.
- Item management (name, cost, price, emoji icon, optional photo).
- Archive Items (soft delete — hidden from seller, preserved in history). UnArchive restores them.
- **Admin edit** any Sale (payment method, optional name/notes, complete date for preorders, remove whole sale); line-item quantity edit deferred — use remove + re-log for wrong items.
- Export (see below).

---

## Data model

**Item:** id, name, icon (emoji default, photo optional), cost, price, archived (boolean)

**Market Day:** id, name, startedAt, closedAt, exportedAt

**Sale:** saleNumber (global auto-increment), timestamp, marketDayId (nullable → Running Tab), line items, total, paymentMethod, cashReceived (if cash), changeKept (if cash and seller checked **Keep Change?**), name (optional, admin-only), notes (optional, admin-only), completeDate (required for preorders — pickup-ready date)

**Line item:** itemId, quantity, priceAtSale, costAtSale

Price and cost snapshot at checkout. Admin edit re-snapshots on save.

---

## Payment

- Cash and Venmo/Zelle are mutually exclusive per Sale.
- **Cash** UI: bill chips at top of the cash-entry card, then amount received, **− / +** steppers, change/due line, then **Keep change?** (centered outline + checkbox; only when change is due; always defaults unchecked). Cash received stored for export. **Keep change?** records when the customer lets the seller keep the difference (tips); sale total and profit exclude tips.
- Venmo/Zelle: no additional input.

---

## Export

- **Market Day:** one CSV per Closed Market Day; name in filename and rows.
- **Running Tab:** date range picker → CSV for sales in range; marks sales exported.
- **Preorders:** printable text file from the **Preorders tab** — prep summary (total quantities per item) plus one block per open order with checkbox lines for crossing off at pickup. Share sheet (Mail, AirDrop, Files).
- Columns (CSV) include: sale number, date/time, market day name (if any), items (name, qty, price, cost), line total, line profit, sale total, payment method, cash received, change kept, customer name (when set on the sale).
- Summary footer (blank line, then four rows): **Total (without tips)**, **Gross (without tips)**, **Profit (without tips)**, **Tips total** — amounts in the Sale Total column.
- Export locks undo-close for Market Days.
- Edits after export flag bucket **out of date — re-export recommended**.

---

## Success criteria

- Seller completes a 3-item cash sale start-to-finish without help.
- No sale requires keyboard typing (numeric entry only for cash).
- End-of-day export reconciles against manual cash/Venmo/Zelle counts; kept change appears in **Tips total** and **Change kept** per row.
- Kid never sees cost or sales totals.

## Resolved open questions (from v0.1)

| Question | Decision |
|----------|----------|
| Undo/edit sales? | **Edit this sale** on celebration; **admin edit** anytime in grown-up settings |
| Cash received? | Record + show **change**; quick bills + $1 steppers; optional **Keep Change?** when change is due |
| Session reset? | **Market Day** = explicit session; **Running Tab** for misc |
| Emoji vs photo? | **Emoji default, photo optional** |
| History view? | **Removed** — Home is Items menu; no Stickers tab |
| Kid sees totals? | **No** — admin-only |
| Sale reference? | Global **Sale number**, admin/export only |

## Visual design

Typography and layout follow [mocks/screens.html](./mocks/screens.html):

- **Fredoka** — headings, prices, buttons
- **Nunito** — body copy, section labels
- **Palette** — purple/lavender screen (`#F3E9FF`), ink/cream accents (see `market-day/constants/theme.ts`)
- **Tokens** — radii, spacing, and touch targets in `market-day/constants/visual.ts` (tested in `visual-polish-test.ts`)

Screens polished for the Sep 18 fair: Home, sell, payment, celebration, grown-up settings. Final **HITL** pass: kid + admin iPad review at the booth.

## Out of scope for v0.2

- Technical implementation (storage, hosting, stack).
