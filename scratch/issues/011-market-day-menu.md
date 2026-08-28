# 011 — Market Day Menu (default all Items, remove, sold out)

**Type:** AFK  
**Status:** done  
**Blocked by:** 002, 003

## What to build

Each **Market Day** has a **Menu** — the set of **Items** offered that day. When the **Admin** **starts** a **Market Day**, the **Menu** auto-populates silently with every non-archived **Item** (no review screen). From **Grown-up settings**, a **Today's Menu** section (visible only during an **Active Market Day**) lets the **Admin** **remove** **Items** from the **Menu** or mark them **sold out**.

**Remove** hides the **Item** from **Home** and checkout for that **Market Day**. **Sold out** keeps the **Item** visible on **Home** (with a clear indicator) but blocks adding it in checkout. These states are mutually exclusive. **Sold out** is reversible — the **Admin** can mark an **Item** available again.

New **Items** added to the catalog during an **Active Market Day** auto-join the **Menu**. **Archiving** an **Item** drops it from the active **Menu**. **Undo close** restores the **Menu** snapshot (including **sold out** flags). When a **Market Day** is **Closed**, its **Menu** is frozen as a historical record (no admin UI for closed-day menus in MVP). **Reopen** (from Past Events) restores the **Menu** snapshot.

**Running Tab** sales use the global non-archived catalog — not filtered by the **Menu**.

## Acceptance criteria

- [x] **Start Market Day** auto-populates **Menu** with all non-archived **Items** (no extra review step)
- [x] **Today's Menu** section in **Grown-up settings** during an **Active Market Day**
- [x] **Admin** can **remove** an **Item** from **Menu** — hidden from **Home** and checkout
- [x] **Admin** can mark a **Menu** **Item** **sold out** — visible on **Home** with indicator, blocked in checkout
- [x] **Sold out** is reversible; **remove** and **sold out** are mutually exclusive
- [x] New catalog **Items** auto-join the active **Menu**; **archive** auto-removes from active **Menu**
- [x] **Reopen** restores **Menu** state exactly
- [x] **Closed Market Day** **Menu** persisted as snapshot (no closed-day menu UI in MVP)
- [x] **Running Tab** checkout ignores **Menu** — uses all non-archived **Items**
- [x] **Home** and checkout reflect **Menu** changes without app restart

## Blocked by

- [002 — Market Day lifecycle](./002-market-day-lifecycle.md)
- [003 — Admin Item catalog](./003-admin-item-catalog.md)
