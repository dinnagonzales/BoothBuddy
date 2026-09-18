# 002 — Market Day lifecycle (start, end, reopen)

**Type:** AFK  
**Status:** done  
**Blocked by:** 001

## What shipped

From **Owner settings → Events**, owner **starts** a **Market Day** (name + date, date defaults today) — sole **Active Market Day**. While active, **Make a Sale** attaches to that day; Home shows today's **Menu**. With no active day, **Make a Sale** still works → **Running Tab**. Owner **ends** day → **Closed Market Day** under **Past Events**. **Reopen** on most recently closed day until export.

Only one active day at a time.

## Acceptance criteria

- [x] Owner starts **Market Day** with name (required) + date (defaults today)
- [x] **Make a Sale** always available; attaches to **Active Market Day** when open
- [x] Owner ends day → **Closed Market Day** in **Past Events**
- [x] **Reopen** on most recently closed day (past-event detail) until export
- [x] **Sales** during active session belong to that **Market Day** (not Running Tab)

## Blocked by

- [001 — First-run setup](./001-first-run-setup.md)
