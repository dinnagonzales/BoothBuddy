# Market Day

A kid-friendly point-of-sale app for in-person craft fairs and markets. Replaces a spreadsheet at the booth with a fast, tappable interface the seller operates solo, while the adult owner handles item setup and data export for Excel reconciliation.

## Language

**Market Day**:
One discrete selling event — one fair, one booth, one stretch of time. The admin creates and closes Market Days, naming each one (with a suggested default like "Market Day – Sep 18, 2026"). Sales during an Active Market Day belong to that Market Day. The name appears in grown-up settings, export filenames, and CSV rows.
_Avoid_: Session, event, day (calendar sense)

**Running Tab**:
The always-open bucket for sales that are not part of an Active Market Day — porch sales, one-offs, and completed off-day **Make a Sale** checkouts. Never closed; accumulates over time. Running Tab sales have no Market Day and appear in the Sales tab with the rest of all-time history once complete. Pending **Preorders** stay in the **Preorders tab** until **Mark complete**. Off-day **Make a Sale** uses the global non-archived catalog; **+ Pre-order** always uses the global catalog (not the active Market Day's Menu). Off-day export uses a date range picker on the Sales tab; exported sales are marked exported and flag re-export if later edited. Pending preorders are excluded from export.
_Avoid_: Orphan bucket, misc tab, default session

**+ Pre-order**:
Preorder checkout launched from the **+ Pre-order** button next to the gear on Home. Same cart flow as the seller — **Sale number** shown as **Invoice #N** in the header — with required **Sale name**, **Sale notes**, and **Complete date** above the cart (no checkbox; entering via this button is always a preorder). Saves to the Running Tab (`marketDayId` null), whether or not an Active Market Day is running. Payment at creation is always **Pay on pickup** only. Dismissing celebration returns to Home.
_Avoid_: Quick Sale, log a sale, porch mode

**Home**:
The seller's landing screen and return point after every Sale. Shows the **Items** list (from today's **Menu** when an **Active Market Day** is open; otherwise the full non-archived catalog). **Make a Sale** is always available. When a day is active, a **Market Day** banner appears at the top. The top bar has a gear icon (grown-up settings) and **+ Pre-order**. Does not show sales totals — those are admin-only.
_Avoid_: Dashboard, today view

**Item**:
A sellable product the vendor offers. Has name, price, cost (admin-only), and icon — emoji by default, optional photo. An Item with past Sales can be **archived** (hidden from Home and checkout) but remains in history and exports. The admin can **UnArchive** an Item to restore it to the seller.
_Avoid_: Product, SKU, listing

**Menu**:
The set of Items offered during one Market Day. When the admin starts a Market Day, the Menu auto-populates with every non-archived Item. The admin can remove Items from the Menu or mark them sold out. New catalog Items auto-join the active Menu; archiving an Item drops it from the active Menu. A Closed Market Day's Menu is frozen as a historical snapshot.
_Avoid_: Day catalog, offering list, daily inventory

**Items**:
The read-only list on Home showing each Menu Item's icon, name, and price (sold out Items included with an indicator). Same row styling as checkout, without **− / +** steppers.
_Avoid_: Catalog, inventory list, stickers

**Sold out**:
A Menu Item the admin has marked unavailable for the rest of the day. Still visible on Home so customers can ask, but blocked from checkout. Reversible — the admin can mark it available again. Mutually exclusive with being removed from the Menu.
_Avoid_: Out of stock, unavailable, 86'd

**Sale**:
One checkout: line items, total, and payment method. Each Sale receives a globally unique **Sale number** (#1, #2, #3…). Optional **name** and **notes** (admin-only metadata — e.g. customer label or pickup time). Each line item snapshots the Item's price and cost at checkout time. A normal Sale completes with Cash or Venmo/Zelle and appears in the **Sales tab** immediately. A **Preorder** is a Sale flagged at creation; it stays in the **Preorders tab** until **Mark complete**. After completion, a brief **Celebration** overlay confirms; dismissing it returns the seller to Home.
_Avoid_: Transaction, order, receipt, invoice

**Sale name**:
Optional free-text label on a Sale (e.g. customer name, tab name). Required for **+ Pre-order**; optional for off-day **Make a Sale** (no active Market Day). Can also be set or changed later via admin edit. Shown in the grown-up sales list and CSV export as **Customer Name** when set. Does not replace the Sale number.
_Avoid_: Invoice title, customer ID

**Sale notes**:
Optional free-text note on a Sale (e.g. special requests, running-tab context). Required for **+ Pre-order**; optional for off-day **Make a Sale** (no active Market Day). Can also be set or changed later via admin edit. Stored in the app; not shown on kid-facing screens.

**Complete date**:
The date a **Preorder** should be ready for pickup. Required when placing a **+ Pre-order**; defaults to today but can be changed with a date picker. Shown on the **Preorders tab** under each order's notes. Orders past their complete date appear in the **Overdue** section. Can be edited later via admin edit on the **Preorders tab**.

**Preorder**:
A Sale created via **+ Pre-order**. **Sale name**, **Sale notes**, and **Complete date** are required. Payment at creation is always **Pay on pickup** — no money collected yet. Gets a **Sale number** immediately and appears only in the **Preorders tab**, not the **Sales tab** stats or list. Always saves with no Market Day (`marketDayId` null), even during an Active Market Day. Open preorders are sorted by complete date; overdue orders are grouped at the top. **Mark complete** records Cash or Venmo/Zelle payment and moves the Sale into the **Sales tab**.
_Avoid_: Pending order, reservation, hold

**Pay on pickup**:
A payment method used only when placing a **Preorder**. Means payment is deferred until pickup. Replaced by **Cash** or **Venmo/Zelle** when the preorder is marked complete. Never appears in **Sales tab** totals or Running Tab export — only the final Cash or Venmo/Zelle payment does.
_Avoid_: Unpaid, TBD, invoice open

**Mark complete**:
The admin action that fulfills a **Preorder**: record **Cash** or **Venmo/Zelle** payment (required — blocked until payment is on file), then clear the preorder flag so the Sale moves to the **Sales tab**. Done from **Admin edit** on the **Preorders tab**.
_Avoid_: Close order, fulfill, checkout

**Sale number**:
An auto-incrementing reference assigned to every Sale app-wide — including **Preorders** at creation. Shown to sellers as **Invoice #N** during checkout; shown to admins as **Sale #N** or **#N** in lists. Visible in admin edit and CSV export.
_Avoid_: Receipt number, order ID

**Cart**:
The in-progress list of Items being checked out. Each line shows **Name(qty)** and line subtotal. Quantity is adjusted on the menu rows above (**− / qty box / +**); removing an item sets quantity to zero.
_Avoid_: Basket, order draft, ticket

**Line item**:
One Item within a Sale, with quantity plus the price and cost frozen at checkout time.
_Avoid_: Sale row, cart entry, order line

**Celebration**:
A short full-screen confirmation shown immediately after checkout — item count, total, and delight. Normal sales show "Sold!"; **Preorders** show "Preorder saved!" with the **Invoice #N**. Dismissed by tapping anywhere; returns to Home.
_Avoid_: Success screen, receipt screen, confirmation page

**Fix**:
A seller action on the celebration overlay that reopens the cart with the just-completed Sale loaded for editing. Available until the overlay is dismissed.
_Avoid_: Undo, edit sale, oops

**Admin edit**:
The admin's ability to open and change any Sale from grown-up settings — payment method, optional name and notes, complete date (preorders), or remove the whole mis-logged Sale. If composition needs to change beyond payment or metadata, remove the Sale and re-log from scratch (kid **Fix** on celebration, or admin remove + new checkout). If the Sale's Market Day or Running Tab chunk has already been exported, the bucket is flagged as out of date and re-export is recommended.
_Avoid_: Void, correction, adjustment

**Payment method**:
How the customer paid for a Sale — **Cash**, **Venmo/Zelle**, or **Pay on pickup** (preorders only, until **Mark complete**). Mutually exclusive per Sale. Completed Sales always have Cash or Venmo/Zelle on file.
_Avoid_: Payment type, tender

**Cash received**:
For Cash sales, the amount of money the customer handed the seller. The **Amount Paid** row at the top of the cash-entry card shows **− / +** steppers flanking the running total (gray when $0, red when below **Order Total**, green when enough). Below that, use quick-tap bill chips ($1, $5, $10, $20, $100 — each tap adds), **Exact amount**, or **Clear**. The app displays **Change** (cash received minus Sale total) in a status bar below the chips.
_Avoid_: Amount tendered, paid

**Change**:
Cash received minus the Sale total, shown in the cash-entry card below the bill chips so the seller knows what to hand back (or **Still $X due** when not enough yet).
_Avoid_: Money back, difference

**Keep change**:
Optional seller action at Cash checkout when change is due. A centered **Keep change?** outline control with checkbox appears below the change line (always unchecked by default — including when re-editing a sale). When checked, the status shows **Keeping $X — no change back** instead of **Change: $X**. The full **Cash received** is still recorded; **Change kept** is stored on the Sale for export and reconciliation.
_Avoid_: Tip, overpay, donation

**Change kept**:
The portion of **Change** the customer asked the seller to keep, recorded when **Keep Change?** is checked at checkout. Appears in CSV export (**Change kept** column per row; **Tips total** in the summary footer) and on market summary cards as part of **Cash** — total cash shown up top, with a **$sales + $tips (tips)** breakdown underneath when tips exist. Sale total and profit exclude kept change — tips are tracked separately for end-of-day cash counts.
_Avoid_: Tip, bonus, extra revenue

**Active Market Day**:
The one Market Day currently open for selling. Exactly zero or one may be active at a time. When active, **Make a Sale** attaches new sales to that Market Day and Home shows today's **Menu**. When none is active, **Make a Sale** still works — sales save to the **Running Tab** with optional name/notes. Starting a Market Day is optional for porch sales but recommended for fairs.
_Avoid_: Current session, open event

**Closed Market Day**:
A Market Day that has been ended by the admin. Sales are read-only for the seller; the admin may edit them or export. The admin may undo the close until export; after export, close is permanent but edits flag the bucket for re-export.
_Avoid_: Completed session, archived day

**Export**:
The admin's manual, on-demand action of generating export files for Excel reconciliation or printing. Each Closed Market Day exports as CSV from its past-event screen. Off-day (Running Tab) sales export as CSV from the Sales tab via a date range picker. Open **Preorders** export as a printable text file from the **Preorders tab** — prep summary plus per-order checklist. Export locks undo-close for that Market Day. Edits after export are allowed but flag the bucket as out of date until re-exported.
_Avoid_: Download, sync, report

**Preorders tab**:
The grown-up tab listing open **Preorders** — Sales with the preorder flag still set. **Prepare** summary at top aggregates quantities per item across all open orders. **Overdue** section lists orders past their **Complete date**; **Upcoming** lists the rest. Orders are sorted by complete date within each section. Each row shows name (or **#N**), notes, complete date, and total. **Export preorders for printing** shares a checklist file (prep summary + one block per order with `[ ]` lines). Tap a row to open **Admin edit** and **Mark complete**. Pending preorders do not appear in the **Sales tab** or off-day CSV export.
_Avoid_: Pending orders, open orders, queue

**Sales tab**:
The grown-up tab listing completed Sales across every Market Day and the Running Tab — all-time revenue, profit, payment breakdown, and a scrollable sale list with Market Day name when set. Excludes pending **Preorders**. Off-day sales appear here without a Market Day label. **Running Tab** export lives here.
_Avoid_: All sales view, history tab, ledger

**Seller**:
The child operating the app at the booth during a Market Day.
_Avoid_: User, cashier, vendor

**Admin**:
The adult owner who sets up items and prices before a Market Day and exports sales data afterward. On first launch, completes a setup wizard (parental code, at least one Item). Grown-up settings shows sales totals (item count, total revenue, Cash vs Venmo/Zelle breakdown), Market Day management, item setup, and export — none of which is visible on the seller's Home.
_Avoid_: Parent, grown-up (UI label only), owner

**Grown-up settings**:
The admin-only area behind the gear icon. Protected by a parental gate (numeric code set by the admin). Four tabs: Settings (Active Market Day dashboard, Today's Menu, past events), Inventory (item catalog), **Preorders** (open preorders awaiting pickup), and Sales (completed all-time history and off-day export). Sales totals and history are not on the seller's Home.
_Avoid_: Admin panel, settings, back office

**Parental gate**:
A numeric code the admin enters to access grown-up settings. Set once by the admin; required every time the gear icon is tapped.
_Avoid_: PIN lock, parent lock, math challenge
