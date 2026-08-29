# 007 — Running Tab: off-day sales + preorders + date-range export

**Type:** AFK  
**Status:** open (partial — checkout shipped)  
**Blocked by:** 001, 003

## What to build

**Running Tab** is the bucket for misc **Sales** outside an **Active Market Day** (porch sales, one-offs). **Sales** save with no **Market Day** (`marketDayId` null). There is no separate **Running Tab** section on **Settings** — off-day **Sales** appear in the **Sales** tab alongside **Market Day** **Sales** (all-time totals and list). **Export** for off-day **Sales** uses a date-range picker on the **Sales** tab; exported **Sales** are marked exported.

### Off-day Make a Sale

When no **Active Market Day** is open, **Make a Sale** still works. Checkout uses the global non-archived catalog (not today's **Menu**). Optional **Sale name** and **Sale notes** appear above the cart. Sale saves to **Running Tab** (`marketDayId` null) with Cash or Venmo/Zelle payment.

### + Pre-order

The **+ Pre-order** button next to ⚙️ on **Home** launches preorder checkout — always **Running Tab** (`marketDayId` null), whether or not an **Active Market Day** is running. Required **Sale name**, **Sale notes**, and **Complete date** above the cart; payment at creation is **Pay on pickup** only. Pending preorders appear in the **Preorders tab** until **Mark complete**. The **Preorders tab** shows a **Prepare** summary (total quantity per item), **Overdue** and **Upcoming** sections (sorted by complete date), and **Export preorders for printing** (checklist with prep summary + per-order `[ ]` lines). Uses the global non-archived catalog (not today's **Menu**). After **Celebration**, dismiss returns to **Home**.

## Acceptance criteria

- [x] **Make a Sale** with no **Active Market Day** → **Running Tab** (`marketDayId` null) with optional name/notes
- [x] **+ Pre-order** on **Home** → preorder checkout → **Running Tab** (`marketDayId` null); name/notes/complete date required
- [x] **+ Pre-order** during an **Active Market Day** still saves to **Running Tab**, not today's day
- [x] **Preorders tab** shows **Prepare** summary (quantities per item), **Overdue**/**Upcoming** sections, and printable export
- [ ] Off-day **Sales** appear in the **Sales** tab (all-time stats and list; no **Market Day** name on row)
- [ ] Date-range picker on **Sales** tab before off-day export
- [ ] Export marks included **Sales** as exported
- [ ] No **Running Tab** summary on **Settings**
- [x] Dismissing **Celebration** after off-day sale or preorder returns to **Home**

## Blocked by

- [001 — First-run setup](./001-first-run-setup.md)
- [003 — Admin Item catalog](./003-admin-item-catalog.md)
