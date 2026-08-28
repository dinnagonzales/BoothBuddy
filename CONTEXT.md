# Market Day

A kid-friendly point-of-sale app for in-person craft fairs and markets. Replaces a spreadsheet at the booth with a fast, tappable interface the seller operates solo, while the adult owner handles item setup and data export for Excel reconciliation.

## Language

**Market Day**:
One discrete selling event — one fair, one booth, one stretch of time. The admin creates and closes Market Days, naming each one (with a suggested default like "Market Day – Sep 18, 2026"). Sales during an Active Market Day belong to that Market Day. The name appears in grown-up settings, export filenames, and CSV rows.
_Avoid_: Session, event, day (calendar sense)

**Running Tab**:
The always-open bucket for sales that are not part of an Active Market Day — porch sales, one-offs, anything logged outside a formal event. Never closed; accumulates over time. Sales are logged by the admin from grown-up settings using the same checkout flow as the seller, routed to the Running Tab instead of a Market Day. Export uses a date range picker; exported sales are marked exported and flag re-export if later edited.
_Avoid_: Orphan bucket, misc tab, default session

**Home**:
The seller's landing screen and return point after every Sale. Shows the **Items** list (icon, name, price) for customer questions, plus a **Sell something!** button to start checkout. Does not show sales totals — those are admin-only.
_Avoid_: Dashboard, today view

**Item**:
A sellable product the vendor offers. Has name, price, cost (admin-only), and icon — emoji by default, optional photo. An Item with past Sales can be **archived** (hidden from Home and checkout) but remains in history and exports. The admin can **UnArchive** an Item to restore it to the seller.
_Avoid_: Product, SKU, listing

**Items**:
The read-only list on Home showing every Item's icon, name, and price. Same rows as checkout, without add buttons.
_Avoid_: Catalog, inventory list, product menu, stickers

**Sale**:
One completed checkout: line items, total, and payment method. Each Sale receives a globally unique **Sale number** (#1, #2, #3…). Each line item snapshots the Item's price and cost at checkout time. After completion, a brief celebration overlay confirms the sale; dismissing it returns the seller to Home.
_Avoid_: Transaction, order, receipt, invoice

**Sale number**:
An auto-incrementing reference assigned to every Sale app-wide. Visible in grown-up settings, admin edit, and CSV export — not shown on the seller's celebration overlay.
_Avoid_: Invoice number, receipt number, order ID

**Cart**:
The in-progress list of Items being checked out. Each line shows quantity, name, and subtotal, with **−** and **+** controls to adjust quantity. Removing a line sets quantity to zero.
_Avoid_: Basket, order draft, ticket

**Line item**:
One Item within a Sale, with quantity plus the price and cost frozen at checkout time.
_Avoid_: Sale row, cart entry, order line

**Celebration**:
A short full-screen confirmation shown immediately after a Sale completes — item count, total, and delight (checkmark, "Sold!"). Dismissed by tapping anywhere; returns to Home.
_Avoid_: Success screen, receipt screen, confirmation page

**Fix**:
A seller action on the celebration overlay that reopens the cart with the just-completed Sale loaded for editing. Available until the overlay is dismissed.
_Avoid_: Undo, edit sale, oops

**Admin edit**:
The admin's ability to open and change any Sale from grown-up settings — line items, payment method, cash received. Changed line items re-snapshot the Item's current price and cost at save time. If the Sale's Market Day or Running Tab chunk has already been exported, the bucket is flagged as out of date and re-export is recommended.
_Avoid_: Void, correction, adjustment

**Payment method**:
How the customer paid for a Sale — either **Cash** or **Venmo/Zelle**. Mutually exclusive per Sale.
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
The admin's manual, on-demand action of generating a CSV for Excel reconciliation. Each Closed Market Day exports separately; the Running Tab has its own export. Export locks undo-close for that Market Day. Edits after export are allowed but flag the bucket as out of date until re-exported.
_Avoid_: Download, sync, report

**Seller**:
The child operating the app at the booth during a Market Day.
_Avoid_: User, cashier, vendor

**Admin**:
The adult owner who sets up items and prices before a Market Day and exports sales data afterward. On first launch, completes a setup wizard (parental code, at least one Item). Grown-up settings shows sales totals (item count, total revenue, Cash vs Venmo/Zelle breakdown), Market Day management, item setup, and export — none of which is visible on the seller's Home.
_Avoid_: Parent, grown-up (UI label only), owner

**Grown-up settings**:
The admin-only area behind the gear icon. Protected by a parental gate (numeric code set by the admin). Shows the Active or most recent Market Day dashboard, Running Tab summary, item/cost management, and export actions.
_Avoid_: Admin panel, settings, back office

**Parental gate**:
A numeric code the admin enters to access grown-up settings. Set once by the admin; required every time the gear icon is tapped.
_Avoid_: PIN lock, parent lock, math challenge
