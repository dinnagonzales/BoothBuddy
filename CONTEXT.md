# Booth Buddy

A booth-friendly point-of-sale app for in-person craft fairs and markets. Replaces a spreadsheet at the booth with a fast, tappable interface staff operate solo, while the owner handles item setup and data export for Excel reconciliation.

## Language

**Market Day**:
One discrete selling event — one fair, one booth, one stretch of time. The owner creates and closes Market Days, naming each one (with a suggested default like "Market Day – Sep 18, 2026"). Sales during an Active Market Day belong to that Market Day. The name appears in owner settings, export filenames, and CSV rows.
_Avoid_: Session, event, day (calendar sense)

**Running Tab**:
The always-open bucket for sales that are not part of an Active Market Day — porch sales, one-offs, and completed off-day **Make a Sale** checkouts. Never closed; accumulates over time. Running Tab sales have no Market Day and appear in the Sales tab with the rest of all-time history once complete. Pending **Preorders** stay in the **Preorders tab** until **Mark complete**. Off-day **Make a Sale** uses the global non-archived catalog; **+ Pre-order** always uses the global catalog (not the active Market Day's Menu). Off-day export uses a date range picker on the Sales tab; exported sales are marked exported and flag re-export if later edited. Pending preorders are excluded from export.
_Avoid_: Orphan bucket, misc tab, default session

**+ Pre-order**:
Preorder checkout launched from the **+ Pre-order** button next to the gear on Home (hidden when inventory is empty). Same cart flow as staff — **Sale number** shown as **Invoice #N** in the header — with required **Sale name**, **Sale notes**, and **Complete date** above the cart (no checkbox; entering via this button is always a preorder). Saves to the Running Tab (`marketDayId` null), whether or not an Active Market Day is running. Payment at creation defaults to **Pay on pickup**; Cash or Venmo/Zelle is allowed if they pay now. Dismissing celebration returns to Home.
_Avoid_: Quick Sale, log a sale, porch mode

**Home**:
Staff's landing screen and return point after every Sale. Shows the **Items** list (from today's **Menu** when an **Active Market Day** is open; otherwise the full non-archived catalog) under **Available Items** — tap an item to start a sale. **Make a Sale** and **+ Pre-order** are available when inventory is non-empty. When a day is active, a **Market Day** ticket banner appears at the top (optional business logo/name, market name, order total without tips, sale count). When no day is active, an idle banner can show business branding plus owner shortcuts (**Start Market Day**, inventory, payment/logo setup, **Go to Sales**) behind the Pass Code. The top bar has a gear icon (owner settings) and **+ Pre-order** (when inventory exists). Does not show profit — those are owner-only.
_Avoid_: Dashboard, today view

**Item**:
A sellable product the vendor offers. Has name, price, cost (owner-only), and icon — emoji by default, optional photo. An Item with past Sales can be **archived** (hidden from Home and checkout) but remains in history and exports. The owner can **UnArchive** an Item to restore it for staff.
_Avoid_: Product, SKU, listing

**Menu**:
The set of Items offered during one Market Day, in owner-chosen display order. When the owner starts a Market Day, the Menu auto-populates with every non-archived Item in Inventory A–Z order. From **Events → Today's Menu**, the owner can **drag to reorder** (Home and Make a Sale follow that order), remove Items, or mark them sold out. New catalog Items and restored Items append at the end of the Menu; sold-out Items keep their place. Reopening a day restores its Menu including order; starting a brand-new Market Day resets order to Inventory A–Z. Archiving an Item drops it from the active Menu. A Closed Market Day's Menu is frozen as a historical snapshot. Running Tab and **+ Pre-order** ignore Menu order and use the catalog.
_Avoid_: Day catalog, offering list, daily inventory

**Items**:
The read-only list on Home showing each Menu Item's icon, name, and price (sold out Items included with an indicator). Same row styling as checkout, without **− / +** steppers.
_Avoid_: Catalog, inventory list, stickers

**Sold out**:
A Menu Item the owner has marked unavailable for the rest of the day. Still visible on Home so customers can ask, but blocked from checkout. Reversible — the owner can mark it available again. Mutually exclusive with being removed from the Menu.
_Avoid_: Out of stock, unavailable, 86'd

**Sale**:
One checkout: line items, total, and payment method. Each Sale receives a globally unique **Sale number** (#1, #2, #3…). Optional **name** and **notes** (owner-only metadata — e.g. customer label or pickup time). Each line item snapshots the Item's price and cost at checkout time. A normal Sale completes with Cash or Venmo/Zelle and appears in the **Sales tab** immediately. A **Preorder** is a Sale flagged at creation; it stays in the **Preorders tab** until **Mark complete**. After completion, a brief **Celebration** overlay confirms; dismissing it returns staff to Home.
_Avoid_: Transaction, order, receipt, invoice

**Sale name**:
Optional free-text label on a Sale (e.g. customer name, tab name). Required for **+ Pre-order**; optional for off-day **Make a Sale** (no active Market Day). Can also be set or changed later via owner edit. Shown in the owner sales list and CSV export as **Customer Name** when set. Does not replace the Sale number.
_Avoid_: Invoice title, customer ID

**Sale notes**:
Optional free-text note on a Sale (e.g. special requests, running-tab context). Required for **+ Pre-order**; optional for off-day **Make a Sale** (no active Market Day). Can also be set or changed later via owner edit. Stored in the app; not shown on staff-facing screens.

**Complete date**:
The date a **Preorder** should be ready for pickup. Required when placing a **+ Pre-order**; defaults to today but can be changed with a date picker. Shown on the **Preorders tab** under each order's notes. Orders past their complete date appear in the **Overdue** section. Can be edited later via owner edit on the **Preorders tab**.

**Preorder**:
A Sale created via **+ Pre-order**. **Sale name**, **Sale notes**, and **Complete date** are required. Payment at creation defaults to **Pay on pickup**; staff may also choose **Cash** or **Venmo/Zelle** if the customer pays now. Gets a **Sale number** immediately and appears only in the **Preorders tab**, not the **Sales tab** stats or list, until fulfilled. Always saves with no Market Day (`marketDayId` null), even during an Active Market Day. Open preorders are sorted by complete date; overdue orders are grouped at the top. **Mark complete** records Cash or Venmo/Zelle when still unpaid; **Mark Delivered** moves already-paid orders into the **Sales tab**.
_Avoid_: Pending order, reservation, hold

**Pay on pickup**:
A payment method used only when placing a **Preorder**. Means payment is deferred until pickup. Replaced by **Cash** or **Venmo/Zelle** when the preorder is marked complete. Never appears in **Sales tab** totals or Running Tab export — only the final Cash or Venmo/Zelle payment does.
_Avoid_: Unpaid, TBD, invoice open

**Mark complete**:
The owner action that fulfills a **Preorder**: if still unpaid, record **Cash** or **Venmo/Zelle** payment (required — blocked until payment is on file), then clear the preorder flag so the Sale moves to the **Sales tab**. Already-paid preorders use **Mark Delivered** instead. Done from **Owner edit** on the **Preorders tab**.
_Avoid_: Close order, fulfill, checkout

**Sale number**:
An auto-incrementing reference assigned to every Sale app-wide — including **Preorders** at creation. Shown to staff as **Invoice #N** during checkout; shown to owners as **Sale #N** or **#N** in lists. Visible in owner edit and CSV export.
_Avoid_: Receipt number, order ID

**Cart**:
The in-progress list of Items being checked out. Each line shows **Name(qty)** and line subtotal. Quantity is adjusted on the menu rows above (**− / qty box / +**); the qty box shows **0** when the item isn't in the cart yet; removing an item sets quantity to zero.
_Avoid_: Basket, order draft, ticket

**Line item**:
One Item within a Sale, with quantity plus the price and cost frozen at checkout time.
_Avoid_: Sale row, cart entry, order line

**Celebration**:
A short full-screen confirmation shown immediately after checkout — item count, total, and delight. Normal sales show "Sold!"; **Preorders** show "Preorder saved!" with the **Invoice #N**. Dismissed by tapping anywhere; returns to Home.
_Avoid_: Success screen, receipt screen, confirmation page

**Fix**:
A staff action on the celebration overlay that reopens the cart with the just-completed Sale loaded for editing. Available until the overlay is dismissed.
_Avoid_: Undo, edit sale, oops

**Owner edit** (code: Admin edit):
The owner's ability to open and change any Sale from owner settings — payment method, optional name and notes, complete date (preorders), or **Cancel sale** on a completed Sale. Cancelling requires a reason (**Return** or **Error** with a short note). The Sale stays visible with its **Sale number** / Invoice #, becomes read-only, and is excluded from money totals and CSV money columns (still exported as a marked Cancelled row). Cancellation is permanent — no restore. Open **Preorders** are hard-deleted with a simple confirm (no Cancelled stub). If composition needs to change beyond payment or metadata, cancel the Sale and re-log from scratch (staff **Fix** on celebration, or owner cancel + new checkout). Wrong payment method is an edit, not a cancel. If the Sale's Market Day or Running Tab chunk has already been exported, the bucket is flagged as out of date and re-export is recommended.
_Avoid_: Void, remove sale, correction, adjustment

**Cancelled**:
A completed Sale the owner has cancelled with a reason. Remains in Sales lists and exports for Invoice # history; does not count toward revenue, profit, tips, or payment totals. Detail is read-only.
_Avoid_: Voided, deleted sale, removed

**Payment method**:
How the customer paid for a Sale — **Cash**, **Venmo/Zelle**, or **Pay on pickup** (preorders only, until **Mark complete**). Mutually exclusive per Sale. Completed Sales always have Cash or Venmo/Zelle on file.
_Avoid_: Payment type, tender

**Cash received**:
For **Cash** and **Venmo/Zelle** sales, the amount the customer paid (including any tip). The **Amount Paid** row at the top of the amount-entry card shows **− / +** steppers flanking the running total (gray when $0, red when below **Order Total**, green when enough). Below that, use quick-tap bill chips ($1, $5, $10, $20, $100 — each tap adds), **Exact amount**, or **Clear**. **Venmo/Zelle** selects **Exact amount** by default. When **Venmo/Zelle** is selected, a payment-info card shows Zelle name/contact/QR and Venmo handle/QR (configured in owner **Settings**) so the customer can pay before staff record **Amount Paid**. The app displays **Change** (amount paid minus Sale total) in a status bar below the chips.
_Avoid_: Amount tendered, paid

**Change**:
Cash received minus the Sale total, shown in the cash-entry card below the bill chips so staff know what to hand back (or **Still $X due** when not enough yet).
_Avoid_: Money back, difference

**Keep change**:
Optional staff action at **Cash** or **Venmo/Zelle** checkout when amount paid exceeds the total. A centered **Keep change?** outline control with checkbox appears below the change line (unchecked by default on a new sale). When re-editing a sale that already had change kept, payment restores **Keep change?** checked so Completing again does not wipe the tip. When checked, the status shows **Keeping $X — no change back** instead of **Change: $X**. The full amount paid is still recorded; **Change kept** is stored on the Sale for export and reconciliation.
_Avoid_: Tip, overpay, donation

**Change kept**:
The portion of **Change** the customer asked staff to keep, recorded when **Keep Change?** is checked at checkout. Appears in CSV export (**Change kept** column per row; summary footer splits **order totals** from **tips** — Zelle/Cash/Overall blocks with order, tips, and combined totals, plus **Overall profit**) and on market summary cards as **Total with Tips** (order total + tips) with matching payment tiles — Cash tips roll into the **Cash** tile and Venmo/Zelle tips into **Zelle / Venmo**, each showing an order/tips breakdown when tips exist. The Home Market Day banner shows order totals only (**Total Sales (does not include tips)**). Switching payment method between Cash and Venmo/Zelle preserves tender and change kept. Sale total and profit exclude kept change — tips are tracked separately for reconciliation.
_Avoid_: Tip, bonus, extra revenue

**Active Market Day**:
The one Market Day currently open for selling. Exactly zero or one may be active at a time. When active, **Make a Sale** attaches new sales to that Market Day and Home shows today's **Menu**. When none is active, **Make a Sale** still works — sales save to the **Running Tab** with optional name/notes. Starting a Market Day is optional for porch sales but recommended for fairs.
_Avoid_: Current session, open event

**Closed Market Day**:
A Market Day that has been ended by the owner. Sales are read-only for staff; the owner may edit them or export. The owner may undo the close until export; after export, close is permanent but edits flag the bucket for re-export.
_Avoid_: Completed session, archived day

**Export**:
The owner's manual, on-demand action of generating export files for Excel reconciliation or printing. Each Closed Market Day exports as CSV from its past-event screen. Off-day (Running Tab) sales export as CSV from the Sales tab via a date range picker. Open **Preorders** export as a printable text file from the **Preorders tab** — prep summary plus per-order checklist. Export locks undo-close for that Market Day. Edits after export are allowed but flag the bucket as out of date until re-exported.
_Avoid_: Download, sync, report

**Preorders tab**:
The owner tab listing open **Preorders** — Sales with the preorder flag still set. **Prepare** summary at top aggregates quantities per item across all open orders. **Overdue** section lists orders past their **Complete date**; **Upcoming** lists the rest. Orders are sorted by complete date within each section. Each row shows name (or **#N**), notes, complete date, and total. **Export preorders for printing** shares a checklist file (prep summary + one block per order with `[ ]` lines). Tap a row to open **Owner edit** and **Mark complete**. Pending preorders do not appear in the **Sales tab** or off-day CSV export.
_Avoid_: Pending orders, open orders, queue

**Sales tab**:
The owner tab listing completed Sales across every Market Day and the Running Tab — all-time revenue, profit, payment breakdown, and a scrollable sale list with Market Day name when set. Excludes pending **Preorders**. Off-day sales appear here without a Market Day label. **Running Tab** export lives here.
_Avoid_: All sales view, history tab, ledger

**Staff** (code: Seller):
The person operating the app at the booth during a Market Day — rings up sales, handles checkout, and uses **Fix** on celebration. Does not see cost, profit, or sales dashboards.
_Avoid_: User, cashier, vendor, kid

**Owner** (code: Admin):
The shop owner who sets up items and prices before a Market Day and exports sales data afterward. On first launch, completes a setup wizard (Pass Code, at least one Item). Owner settings shows sales totals (item count, total revenue, Cash vs Venmo/Zelle breakdown), Market Day management, item setup, and export — none of which is visible on staff's Home.
_Avoid_: Parent, grown-up, admin (UI label only)

**Owner settings** (code: grown-up settings):
The owner-only area behind the gear icon. Protected by a Pass Code when **Require Pass Code for Settings** is on (default). Five tabs: **Events** (Active Market Day dashboard, Today's Menu, past events), **Inventory** (item catalog), **Preorders** (open preorders awaiting pickup), **Sales** (completed all-time history and off-day export), and **Settings** (business name/logo, passcode change, optional gate bypass, Zelle/Venmo payment info for checkout). Sales totals and history are not on staff's Home.
_Avoid_: Admin panel, grown-up settings, back office

**Pass Code** (code: parental gate):
A numeric code the owner enters to access owner settings when **Require Pass Code for Settings** is enabled. Set once during setup (or changed in **Settings**); required each time the gear icon is tapped unless the gate is turned off. Changing the gate toggle itself requires the current code.
_Avoid_: PIN lock, parent lock, math challenge
