# 002 — Market Day lifecycle (start, end, undo close)

**Type:** AFK  
**Status:** done  
**Blocked by:** 001

## What to build

From **Grown-up settings**, the **Admin** can **start** a **Market Day** with a **name** and **date** (date defaults to today), which becomes the sole **Active Market Day**. While active, **Make a Sale** attaches new **Sales** to that **Market Day** and Home shows today's **Menu**. **Make a Sale** remains available when no day is active — those sales save to the **Running Tab** (`marketDayId` null). The **Admin** can **end** the **Market Day**, making it a **Closed Market Day** listed under **Past Events**. **Reopen** is available on the most recently closed day (from its past-event detail view) until that **Market Day** is exported.

Only one **Active Market Day** at a time. Starting a new one requires closing the current one first (or explicit replace flow with confirmation).

## Acceptance criteria

- [x] Admin starts a **Market Day** with a **name** (required) and **date** (defaults to today)
- [x] **Make a Sale** always available; attaches to **Active Market Day** when one is open
- [x] Admin ends **Market Day** → becomes **Closed Market Day** in **Past Events**
- [x] **Reopen** works on the most recently closed **Market Day** (past-event detail) until export
- [x] **Sales** logged during active session belong to that **Market Day** (not **Running Tab**)

## Blocked by

- [001 — First-run setup: parental gate + first Item](./001-first-run-setup.md)
