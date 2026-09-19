# Booth Buddy — Product Requirements Document (v0.2)

> Resolved via grill session Aug 28, 2026. Domain language lives in [CONTEXT.md](./CONTEXT.md).

## Overview

Booth Buddy is a booth-friendly point-of-sale app for a young vendor (age 12) selling 3D-printed items at in-person craft fairs and markets. It replaces a spreadsheet workflow with a fast, tappable interface staff can operate solo during a busy sales session, while giving the owner item/cost setup and data export for Excel reconciliation.

## Problem

The current Excel workbook works for after-the-fact bookkeeping but is too slow and error-prone live at a booth. Staff need something that takes seconds per sale, requires no typing of item names or math, and can't fat-finger a formula.

## Goals

- A 12-year-old can log a multi-item sale in well under 15 seconds, unsupervised.
- Zero spreadsheet exposure for staff — no formulas, no cost math, no item typing.
- The owner sets up Items/prices once before market day and exports clean sales data afterward.
- Works reliably on a phone or tablet at a booth, single device.

## Non-goals (v1)

- Friend/partner profit-share tracking.
- Inventory/stock-level tracking.
- Multi-vendor or multi-booth support.
- Offline mode (assume hotspot/wifi).
- User accounts / login.

## Target users

- **Staff** — person operating the app at the booth during an Active Market Day.
- **Owner** — shop owner; setup, Market Day management, Running Tab sales, export.

---

## Core flows

### First launch (admin setup wizard)

1. Owner opens app → guided setup: set Pass Code → add at least one Item.
2. Staff can browse Home (Items menu). **Make a Sale** is always available.

### Start a Market Day (admin)

1. Owner taps gear → enters Pass Code.
2. **Start Market Day** → enter a **Market Name** (required); date defaults to today.
3. While active, a **Market Day** banner appears on Home and **Make a Sale** attaches new sales to that day.

### Log a sale (staff — primary flow)

1. **Home** — **Items** list (icon, name, price) + **Make a Sale** (always enabled). Optional **Market Day** banner when a day is active.
2. **Pick Items** — scrollable menu with **− / qty / +** steppers per row (**0** when not in cart); cart pinned at bottom shows **Name(qty)** and line subtotal, **N items** + total, **Checkout**.
   - **Active Market Day:** checkout uses today's **Menu**; no name/notes fields; sale attaches to that **Market Day**.
   - **No active Market Day:** checkout uses the full non-archived catalog; optional **Sale name** and **Sale notes** above the cart; sale saves to **Running Tab** (`marketDayId` null).
3. **Payment** — **Order Total**; when **Cash** or **Venmo/Zelle** is selected, an amount-entry card (**Amount Paid** with **− / +** steppers — amount turns red below total, green when enough) → bill chips → **Change** or **Still $X due** → optional **Keep change?** when overpaid); **Cash** and **Venmo/Zelle** selector cards below (mutually exclusive).
   - **Cash** or **Venmo/Zelle:** **Amount Paid** row first, then quick-tap bills ($1, $5, $10, $20, $100 — each adds), **Exact amount**, **Clear**. **Venmo/Zelle** defaults to **Exact amount** on tap. When overpaid, centered **Keep change?** outline control with checkbox (unchecked by default on a new sale; restored from the sale when re-editing if change was kept) records kept change for export.
   - **Venmo/Zelle selected:** a **Scan or send payment** card appears (above amount-entry) when the owner has configured payment info in **Settings** — Zelle full name (for bank-app confirmation), email/phone, optional uploaded QR; Venmo `@handle`, optional uploaded QR, or auto-generated Venmo QR with order amount.
4. **Celebration** — "Sold!" + item count + total; **Go to Dashboard** or **✕** → **Home**; **Edit this sale** reopens cart.

### Log a preorder (staff)

1. Tap **+ Pre-order** on Home (top bar, next to gear).
2. Same cart flow as staff checkout, but always a **Preorder**: **Sale name**, **Sale notes**, and **Complete date** required above the cart; screen title **Pre-order**.
3. Uses the global non-archived catalog (not today's **Menu**), whether or not an **Active Market Day** is running.
4. **Payment** — **Pay on pickup** by default at creation; **Cash** or **Venmo/Zelle** allowed if they pay now. Sale saves to **Running Tab** (`marketDayId` null) and appears in the **Preorders tab** until **Mark complete** / **Mark Delivered**.
5. **Celebration** — "Preorder saved!" + **Invoice #N**; dismiss → **Home**.

### Fulfill preorders (admin)

1. **Preorders tab** — **Prepare** summary at top shows total quantity per item across all open orders.
2. **Overdue** section lists orders past their **Complete date**; **Upcoming** lists the rest (sorted by complete date).
3. **Export preorders for printing** — share sheet → printable checklist with prep summary and one block per order (`[ ]` lines to cross off).
4. Tap an order to record payment and **Mark complete**, or **Mark Delivered** if already paid; sale moves to **Sales tab**.

### Log a Running Tab sale (off-day)

Off-day sales come from **Make a Sale** when no **Active Market Day** is open (optional name/notes), or from **+ Pre-order** (always). Both save with `marketDayId` null. During an active **Market Day**, only **+ Pre-order** bypasses the day — **Make a Sale** still attaches to that day.

### End a Market Day (admin)

1. **End Market Day** in owner settings.
2. **Undo close** available until export.
3. After export, close is permanent (edits still allowed; bucket flagged for re-export).

### Owner area

Behind gear icon + Pass Code (numeric code by default). Five bottom tabs:

- **Events** — Active Market Day dashboard (totals, item count, Cash vs Venmo/Zelle breakdown with tips subline when applicable), Today's Menu, sales list; when no active day, start form + Past Events.
- **Inventory** — item catalog (cost, price, archive).
- **Preorders** — open preorders, prep summary, printable export.
- **Sales** — all-time completed sales + Running Tab date-range export.
- **Settings** — business profile (name, logo), **Passcode** (change 4-digit code; **Require Pass Code for Settings** toggle — on by default; turning off skips the gear gate; changing the toggle requires the current code), and **Payment** (Zelle full name, email/phone, optional QR upload; Venmo username, optional QR upload).

Same summary card metrics on Past Events detail, Market Day staff dashboard (without profit), and Sales tab (all-time).

Other owner capabilities (across tabs):

- Item management (name, cost, price, emoji icon, optional photo).
- Archive Items (soft delete — hidden from staff, preserved in history). UnArchive restores them.
- **Owner edit** any Sale (payment method, optional name/notes, complete date for preorders, remove whole sale); line-item quantity edit deferred — use remove + re-log for wrong items.
- Export (see below).

---

## Data model

**Item:** id, name, icon (emoji default, photo optional), cost, price, archived (boolean)

**Market Day:** id, name, startedAt, closedAt, exportedAt

**Sale:** saleNumber (global auto-increment), timestamp, marketDayId (nullable → Running Tab), line items, total, paymentMethod, cashReceived (if cash), changeKept (if cash and staff checked **Keep Change?**), name (optional, owner-only), notes (optional, owner-only), completeDate (required for preorders — pickup-ready date)

**Line item:** itemId, quantity, priceAtSale, costAtSale

Price and cost snapshot at checkout. Owner edit re-snapshots on save.

---

## Payment

- Cash and Venmo/Zelle are mutually exclusive per Sale.
- **Cash** and **Venmo/Zelle** share the same amount-entry UI: **Amount Paid** row (**− / +** flanking amount — gray when $0, red when below total, green when enough), then bill chips, change/due line, then **Keep change?** (centered outline + checkbox; only when amount paid exceeds total; always defaults unchecked). Amount paid stored for export. **Keep change?** records when the customer lets staff keep the difference (tips); sale total and profit exclude tips. **Venmo/Zelle** pre-fills **Exact amount** when selected.
- **Venmo/Zelle checkout** shows configured pay-to info (Zelle name + contact + optional QR; Venmo handle + uploaded or generated QR with amount) so customers can scan or send payment before staff confirm **Amount Paid**.

---

## Export

- **Market Day:** one CSV per Closed Market Day; name in filename and rows.
- **Running Tab:** date range picker → CSV for sales in range; marks sales exported.
- **Preorders:** printable text file from the **Preorders tab** — prep summary (total quantities per item) plus one block per open order with checkbox lines for crossing off at pickup. Share sheet (Mail, AirDrop, Files).
- Columns (CSV) include: sale number, date/time, market day name (if any), items (name, qty, price, cost), line total, line profit, sale total, payment method, cash received, change kept, customer name (when set on the sale).
- Summary footer (blank lines between blocks): **Zelle total** / **Zelle order total** / **Zelle tips total**; **Cash total** / **Cash order total** / **Cash tips total**; **Overall total** / **Order overall total** / **Tips overall total** / **Overall profit** — amounts in the Sale Total column.
- Export locks undo-close for Market Days.
- Edits after export flag bucket **out of date — re-export recommended**.

---

## Success criteria

- Staff completes a 3-item cash sale start-to-finish without help.
- No sale requires keyboard typing (numeric entry only for cash).
- End-of-day export reconciles against manual cash/Venmo/Zelle counts; kept change appears in **Tips overall total** / per-method tips rows and **Change kept** per row.
- Staff never see cost or sales totals.

## Resolved open questions (from v0.1)

| Question | Decision |
|----------|----------|
| Undo/edit sales? | **Edit this sale** on celebration; **owner edit** anytime in owner settings |
| Cash received? | Record amount paid + show **change** for Cash and Venmo/Zelle; quick bills + $1 steppers; optional **Keep Change?** when overpaid |
| Session reset? | **Market Day** = explicit session; **Running Tab** for misc |
| Emoji vs photo? | **Emoji default, photo optional** |
| History view? | **Removed** — Home is Items menu; no Stickers tab |
| Staff sees totals? | **No** — owner-only |
| Sale reference? | Global **Sale number**, admin/export only |

## Visual design

Typography and layout follow [mocks/screens.html](./mocks/screens.html):

- **Fredoka** — headings, prices, buttons
- **Nunito** — body copy, section labels
- **Palette** — purple/lavender screen (`#F3E9FF`), ink/cream accents (see `market-day/constants/theme.ts`)
- **Tokens** — radii, spacing, and touch targets in `market-day/constants/visual.ts` (tested in `visual-polish-test.ts`)

Screens polished for the Sep 18 fair: Home, sell, payment, celebration, owner settings. Final **HITL** pass: staff + owner iPad review at the booth.

## Out of scope for v0.2

- Technical implementation (storage, hosting, stack).
