# 002 — Market Day lifecycle (start, end, undo close)

**Type:** AFK  
**Status:** done  
**Blocked by:** 001

## What to build

From **Grown-up settings**, the **Admin** can **start** a named **Market Day** (suggested default editable in one tap), which becomes the sole **Active Market Day**. While active, the **Seller**'s **Sell something!** enables and new **Sales** attach to that **Market Day**. The **Admin** can **end** the **Market Day**, making it a **Closed Market Day**. **Undo close** is available until that **Market Day** is exported.

Only one **Active Market Day** at a time. Starting a new one requires closing the current one first (or explicit replace flow with confirmation).

## Acceptance criteria

- [x] Admin starts a **Market Day** with a name (smart default provided)
- [x] **Sell something!** enables only during an **Active Market Day**
- [x] Admin ends **Market Day** → becomes **Closed Market Day**
- [x] **Undo close** works on the most recently closed **Market Day** until export
- [x] **Sales** logged during active session belong to that **Market Day** (not **Running Tab**)

## Blocked by

- [001 — First-run setup: parental gate + first Item](./001-first-run-setup.md)
