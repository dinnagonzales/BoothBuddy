# Market Day

A kid-friendly point-of-sale app for in-person craft fairs and markets. Replaces a spreadsheet at the booth with a fast, tappable interface the seller operates solo, while the adult owner handles item setup and data export for Excel reconciliation.

## Language

**Market Day**:
One discrete selling event — one fair, one booth, one stretch of time. The admin creates and closes Market Days, naming each one (with a suggested default like "Market Day – Sep 18, 2026"). Sales during an Active Market Day belong to that Market Day. The name appears in grown-up settings, export filenames, and CSV rows.
_Avoid_: Session, event, day (calendar sense)

**Running Tab**:
The always-open bucket for sales that are not part of an Active Market Day — porch sales, one-offs, anything logged via Quick Sale. Never closed; accumulates over time. Running Tab sales have no Market Day and appear in the Sales tab with the rest of all-time history once complete. Pending **Preorders** stay in the **Preorders tab** until **Mark complete**. Checkout uses the global non-archived catalog, not the active Market Day's Menu. Off-day export uses a date range picker on the Sales tab; exported sales are marked exported and flag re-export if later edited. Pending preorders are excluded from export.
_Avoid_: Orphan bucket, misc tab, default session

**Quick Sale**:
Off-day checkout launched from the + button next to the gear on Home. Same cart flow as the seller — **Sale number** shown as **Invoice #N** in the header — with optional **Sale name**, **Sale notes**, and a **Preorder** checkbox above the cart. Saves to the Running Tab (no Market Day), whether or not an Active Market Day is running. A normal Quick Sale uses Cash or Venmo/Zelle payment; a **Preorder** uses **Pay on pickup** only. Dismissing celebration returns to Home.
_Avoid_: Log a sale, porch mode, off-books sale

**Home**:
The seller's landing screen and return point after every Sale. During an **Active Market Day**, shows the **Items** list from today's **Menu** (icon, name, price; **sold out** Items show a clear indicator). Plus a **Sell something!** button to start checkout. The top bar also has a gear icon (grown-up settings) and a + button (**Quick Sale**). Does not show sales totals — those are admin-only.
_Avoid_: Dashboard, today view

**Item**:
A sellable product the vendor offers. Has name, price, cost (admin-only), and icon — emoji by default, optional photo. An Item with past Sales can be **archived** (hidden from Home and checkout) but remains in history and exports. The admin can **UnArchive** an Item to restore it to the seller.
_Avoid_: Product, SKU, listing

**Menu**:
The set of Items offered during one Market Day. When the admin starts a Market Day, the Menu auto-populates with every non-archived Item. The admin can remove Items from the Menu or mark them sold out. New catalog Items auto-join the active Menu; archiving an Item drops it from the active Menu. A Closed Market Day's Menu is frozen as a historical snapshot.
_Avoid_: Day catalog, offering list, daily inventory

**Items**:
The read-only list on Home showing each Menu Item's icon, name, and price (sold out Items included with an indicator). Same rows as checkout, without add buttons.
_Avoid_: Catalog, inventory list, stickers

**Sold out**:
A Menu Item the admin has marked unavailable for the rest of the day. Still visible on Home so customers can ask, but blocked from checkout. Reversible — the admin can mark it available again. Mutually exclusive with being removed from the Menu.
_Avoid_: Out of stock, unavailable, 86'd

**Sale**:
One checkout: line items, total, and payment method. Each Sale receives a globally unique **Sale number** (#1, #2, #3…). Optional **name** and **notes** (admin-only metadata — e.g. customer label or pickup time). Each line item snapshots the Item's price and cost at checkout time. A normal Sale completes with Cash or Venmo/Zelle and appears in the **Sales tab** immediately. A **Preorder** is a Sale flagged at creation; it stays in the **Preorders tab** until **Mark complete**. After completion, a brief **Celebration** overlay confirms; dismissing it returns the seller to Home.
_Avoid_: Transaction, order, receipt, invoice

**Sale name**:
Optional free-text label on a Sale (e.g. customer name, tab name). For Running Tab checkout, the admin can enter it above the cart before completing the sale; it can also be set or changed later via admin edit. Shown in the grown-up sales list and CSV export as **Customer Name** when set. Does not replace the Sale number.
_Avoid_: Invoice title, customer ID

**Sale notes**:
Optional free-text note on a Sale (e.g. pickup time, running-tab context). For Running Tab checkout, the admin can enter it above the cart before completing the sale; it can also be set or changed later via admin edit. Stored in the app; not shown on kid-facing screens.

**Preorder**:
A Sale created via **Quick Sale** with the Preorder checkbox on. **Sale name** and **Sale notes** are required. Payment at creation is always **Pay on pickup** — no money collected yet. Gets a **Sale number** immediately and appears only in the **Preorders tab**, not the **Sales tab** stats or list. **Mark complete** records Cash or Venmo/Zelle payment and moves the Sale into the **Sales tab**.
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
The in-progress list of Items being checked out. Each line shows quantity, name, and subtotal, with **−** and **+** controls to adjust quantity. Removing a line sets quantity to zero.
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
The admin's ability to open and change any Sale from grown-up settings — payment method, optional name and notes, or remove the whole mis-logged Sale. If composition needs to change beyond payment or metadata, remove the Sale and re-log from scratch (kid **Fix** on celebration, or admin remove + new checkout). If the Sale's Market Day or Running Tab chunk has already been exported, the bucket is flagged as out of date and re-export is recommended.
_Avoid_: Void, correction, adjustment

**Payment method**:
How the customer paid for a Sale — **Cash**, **Venmo/Zelle**, or **Pay on pickup** (preorders only, until **Mark complete**). Mutually exclusive per Sale. Completed Sales always have Cash or Venmo/Zelle on file.
_Avoid_: Payment type, tender

**Cash received**:
For Cash sales, the amount of money the customer handed the seller. Set via quick-tap buttons ($1, $5, $10, $20, $100 — each tap replaces the current amount), or adjusted with **−** / **+** steppers (in $1 increments) and numeric input. The app displays **Change** (cash received minus Sale total).
_Avoid_: Amount tendered, paid

**Change**:
Cash received minus the Sale total, shown to the seller during Cash checkout so they know what to hand back.
_Avoid_: Money back, difference

**Active Market Day**:
The one Market Day currently open for selling. Exactly zero or one may be active at a time. The admin must start a Market Day before the seller can log sales — without one, **Sell something!** is disabled.
_Avoid_: Current session, open event

**Closed Market Day**:
A Market Day that has been ended by the admin. Sales are read-only for the seller; the admin may edit them or export. The admin may undo the close until export; after export, close is permanent but edits flag the bucket for re-export.
_Avoid_: Completed session, archived day

**Export**:
The admin's manual, on-demand action of generating a CSV for Excel reconciliation. Each Closed Market Day exports separately from its past-event screen. Off-day (Running Tab) sales export from the Sales tab via a date range picker. Export locks undo-close for that Market Day. Edits after export are allowed but flag the bucket as out of date until re-exported.
_Avoid_: Download, sync, report

**Preorders tab**:
The grown-up tab listing open **Preorders** — Sales with the preorder flag still set. Tap a row (**#N** or **name**) to open **Admin edit** and **Mark complete**. Pending preorders do not appear in the **Sales tab** or off-day export.
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
