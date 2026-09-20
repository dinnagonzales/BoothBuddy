# 012 — Web help site content (features + FAQ)

**Type:** HITL  
**Status:** shipped (content lives in `web/index.html`; deploy via GitHub Pages)  
**Audience:** Web page agent building **Booth Buddy** help / FAQ pages  
**Tone:** Simple words a kid can read. Owner steps clearly labeled.  
**Sync note (Sep 20 2026):** Help site aligned with latest app — **Welcome to Booth Buddy!** onboarding (long wordmark, no circle badge; buddy peeks on success); Home **Get your shop ready** checklist (first item required; payment/logo optional; **Hide** forever); idle Home always **Start Market Day** / **Update Inventory** / **Go to Sales**; Pass Code opt-in via lock-on-exit; Owner / Staff labels; tips vs order totals; Payment collapsed by default; Today’s Menu drag-to-reorder. Prefer Owner / Staff over Seller / Grown-up / Admin in new pages. Domain event name **Market Day** stays.

---

## How to use this doc

Build one page per **Page slug** below. Copy headings/body (light layout edits ok). Short sentences, big friendly headings.

**Two audiences:**

| Who | Label on site | What they need |
|-----|---------------|----------------|
| **Staff (kid)** | “For staff” / “For sellers” | Sell, take payment, fix a sale right after checkout |
| **Owner** | “For owners” / “For grown-ups” | Pass Code, inventory, start/end Market Day, menu, sales |

Kids never see **cost** (what you paid) or **profit**.

---

## Site map

| Page slug | Title | Audience |
|-----------|-------|----------|
| `/` | Welcome to Booth Buddy | Everyone |
| `/sell` | How to sell something | Seller |
| `/payment` | How to take payment | Seller |
| `/invoice-numbers` | What are invoice numbers? | Seller |
| `/see-todays-sales` | See today’s sales | Seller |
| `/fix-a-sale` | Fix a sale | Seller |
| `/preorder` | How to take a preorder | Seller |
| `/preorders` | Preorders tab (prepare & print) | Grown-up |
| `/start-market-day` | How to start a Market Day | Grown-up |
| `/menu` | Today’s menu | Grown-up |
| `/inventory` | How to add inventory | Grown-up |
| `/edit-items` | How to edit items | Grown-up |
| `/end-market-day` | How to end a Market Day | Grown-up |
| `/past-events` | Past Events | Grown-up |
| `/export-sales` | Export sales (CSV) | Grown-up |
| `/sales-dashboard` | Sales & profit | Grown-up |
| `/first-time-setup` | First-time setup | Grown-up |
| `/faq` | FAQ index | Everyone |
| `/faq/cant-sell` | Why can’t I sell? | Seller |
| `/faq/sold-out` | What does “Sold out” mean? | Everyone |
| `/faq/pass-code` | What is the Pass Code? | Everyone |
| `/faq/forgot-pass-code` | I forgot the Pass Code | Grown-up |
| `/faq/gear-icon` | What is the ⚙️ gear? | Everyone |
| `/faq/archive` | What is Archive? | Grown-up |
| `/faq/cash-change` | How does cash change work? | Seller |
| `/faq/venmo-zelle` | Venmo / Zelle payments | Seller |
| `/faq/grown-up-settings` | Grown-up Settings tab | Grown-up |
| `/faq/edit-sale-later` | Change a sale later | Grown-up |
| `/faq/sales-after-update` | Will I lose sales when the app updates? | Grown-up |
| `/faq/one-market-day` | Can I run two Market Days? | Grown-up |
| `/faq/reopen` | I ended the day by mistake | Grown-up |
| `/privacy` | Privacy Policy | Everyone |

**Privacy page:** use [web/privacy.html](../../web/privacy.html) (source: [docs/privacy-policy.md](../../docs/privacy-policy.md)). Replace `CONTACT_EMAIL` before publish.

---

## Words we use (glossary — link from every page footer)

| Word | Simple meaning |
|------|----------------|
| **Market Day** | “The shop is open today!” — one selling day with a name and date |
| **Menu** | What you’re selling today (icon/photo, name, price) — owners can drag to reorder |
| **Inventory** | All the things in your shop (grown-ups manage this) |
| **Cart** | What the customer is buying right now |
| **Invoice #** | The order number for this sale (#1, #2, #3…) |
| **Sale name** | Optional grown-up label for a sale (e.g. customer name) — shown instead of #N in settings when set |
| **Sale notes** | Optional grown-up note on a sale (e.g. special requests) — not shown to sellers |
| **Complete date** | When a preorder should be ready for pickup — required for **+ Pre-order** |
| **Pass Code** | 4-digit grown-up password for ⚙️ settings |
| **Sold out** | Still on the menu, but you can’t add it to a sale |
| **Preorder** | A sale for later pickup — Pay on pickup at creation; Cash/Venmo when marked complete |
| **+ Pre-order** | Button on Home to start a preorder |
| **Cancel sale** | Owner marks a completed sale Cancelled (Return or Error); Invoice # stays; money totals exclude it |
| **Cancelled** | Completed sale kept for history; not counted in revenue or tips |

---

# Feature pages

---

## `/` — Welcome to Booth Buddy

**For staff**

Booth Buddy is your shop on a phone or tablet. A **Market Day** is one fair/booth day.

1. Tap **Make a Sale** to ring up a customer anytime.
2. When a grown-up has started a **Market Day**, you see today's **Menu** and a colorful banner at the top — those sales count for that day.
3. Take **payment**, then celebrate — **Sold!** 🎉
4. For orders to pick up later, tap **+ Pre-order** (top right).

**For grown-ups**

You set up items, start and end Market Days, and check sales behind a **4-digit Pass Code**. Tap **⚙️** on the home screen and enter the code. Starting a Market Day is optional for porch sales but helps organize fair-day totals.

**Quick links**

- Sellers → [How to sell](./sell), [Preorders](./preorder), [Invoice numbers](./invoice-numbers)
- Grown-ups → [Start a Market Day](./start-market-day), [Add inventory](./inventory)

---

## `/sell` — How to sell something

**For sellers**

1. Open Market Day on the home screen.
2. Tap **Make a Sale**
3. At the top you’ll see **CART: Invoice #___**. That’s this order’s number.
4. Use **−** and **+** on each menu row to set quantities (the box in the middle shows the count).
5. Check the cart summary — each line is **Name(qty)** and subtotal; the footer shows **N items** and the total.
6. Tap **Checkout →**.

**When a Market Day is open**

You sell from today's **Menu**. Sold-out items can't be added.

**When no Market Day is open**

**Make a Sale** still works. A grown-up can optionally fill in **Name** and **Notes** above the cart (e.g. porch-sale context). Payment is Cash or Venmo/Zelle as usual.

**If an item is gray**

It might be **Sold out** for today. Pick something else or ask a grown-up.

---

## `/payment` — How to take payment

**For sellers**

1. See **Order Total** — that’s what the customer owes.
2. **Cash** is selected by default. The amount-entry card (above the payment-method cards) also appears for **Venmo / Zelle**:

   - **Amount Paid** — large number between **− / +** (gray when empty, red if too low, green when enough).
   - Tap bill chips ($1, $5, $10, $20, $100), **Exact amount**, or **Clear** below that.
   - Read **Change** (money back / overpaid) or **Still $X due** (not enough yet) in the status bar.
   - If amount paid is more than the total, tap the centered **Keep change?** button (unchecked by default). The checkbox fills when selected; the line switches to **Keeping $X — no change back**.

3. Pick how they paid — tap **💵 Cash** or **📱 Venmo / Zelle** in the cards below. **Venmo / Zelle** starts at **Exact amount** so you can bump it up if the customer adds a tip.

4. When **Venmo / Zelle** is selected and a grown-up has set up payment info, a **Scan or send payment** card shows Zelle name, contact, and QR (if uploaded), plus Venmo handle and QR — so the customer can pay on their phone first.

4. Tap **Complete sale ✓**.
5. You did it! **Sold!** 🎉

---

## `/invoice-numbers` — What are invoice numbers?

**For sellers**

Every sale gets a number: **Invoice #1**, **Invoice #2**, **Invoice #3**, and so on.

- You see it at the top while you’re selling: **CART: Invoice #3**.
- Numbers go up one at a time. They never repeat.
- If you **Edit this sale** right after checkout, you keep the **same** invoice number.

**Why it matters**

Invoice numbers help you and your grown-up talk about an order: “Fix invoice #5!”

**For grown-ups**

In settings, the same number appears as **Sale #N**. You can optionally add a **name** (e.g. customer or tab name) and **notes** (e.g. preorder) when you tap a sale to edit it — the name then shows on the sales list instead of **#N**.

---

## `/see-todays-sales` — See today’s sales

**For sellers**

1. On the home screen, tap the colorful **Market Day** banner at the top.
2. See how many sales you made, plus **Cash** and **Venmo/Zelle** totals.
3. Tap a sale to see what was in it.

This is **look only** — you can’t change sales here. To fix something right after selling, use **Edit this sale** on the celebration screen.

---

## `/fix-a-sale` — Fix a sale

**For sellers (right after checkout)**

1. On the **Sold!** screen, tap **✏️ Edit this sale**.
2. Your cart opens again with the **same invoice number**.
3. Fix the items or amounts.
4. Tap **Checkout →** and complete payment again.
5. The old sale is replaced with the fixed one.

**For grown-ups (later in the day)**

See [Change a sale later](./faq/edit-sale-later).

---

## `/preorder` — How to take a preorder

**For sellers**

Use this when someone wants to order now and pay when they pick up.

1. On the home screen, tap **+ Pre-order** (top right, green button).
2. Fill in **Name**, **Notes**, and **Complete date** — all required (e.g. customer name, special requests, and when they'll pick up).
3. Use **−** and **+** on menu rows to add items.
4. Tap **Checkout →**.
5. Payment is **Pay on pickup** — no money collected yet.
6. **Preorder saved!** 🎉 The grown-up marks it complete when the customer pays.

**Note:** Preorders always save separately from today's **Market Day**, even during a fair.

---

## `/preorders` — Preorders tab (prepare & print)

**For grown-ups**

Open preorders waiting for pickup.

1. **⚙️** → **Pass Code** → tap **📋 Preorders** at the bottom.
2. **Prepare** — at the top, see how many of each item to make across all open orders (e.g. **🐉 Dragon × 3**).
3. **Overdue** — orders past their **Complete date** appear first (highlighted). **Upcoming** lists the rest, sorted by complete date.
4. Each order shows the customer **name** (or **#N**), **notes**, and **Complete date**.
5. **Export preorders for printing** — tap the button to get a checklist file. Print it and cross off each `[ ]` line as you fulfill orders.
6. Tap an order to record how the customer paid and **Mark complete**. It then moves to the **Sales** tab.
7. Paid orders waiting for handoff can use **Mark Delivered** on the list.

Pending preorders do **not** appear in the **Sales** tab or in CSV export until marked complete.

---

## `/start-market-day` — How to start a Market Day

**For grown-ups**

This opens the shop so kids can sell.

1. On the home screen, tap **⚙️**.
2. Enter your **4-digit Pass Code**. Tap **Unlock**.
3. If it says **No market day yet**, fill in:
   - **Market Name** — required; name today’s shop (e.g. Spring Fair 2026)
   - **Date** — tap to pick; defaults to today
4. Tap **▶️ Start Market Day**.
5. The shop is open! All your items are on **Today’s Menu** automatically.
6. (Optional) Open **Today’s Menu** to drag items into booth order, mark things sold out, or remove them for today.
7. Tell the seller: **“You can sell now!”**

**Only one Market Day can be open at a time.**

---

## `/menu` — Today’s menu

**For grown-ups**

The **Menu** is what you’re selling **today**. When you start a Market Day, every non-archived item joins the menu automatically in Inventory A–Z order — no extra step.

Open **⚙️ → Pass Code → Events → Today’s Menu** (only visible while a Market Day is active).

| Action | What happens |
|--------|----------------|
| **⠿ Drag handle** | Reorder the list — Home and Make a Sale show the same order |
| **Sold out** toggle | Item stays on the home screen with “Sold out” — kid can’t add it to a cart (keeps its place) |
| **🗑 Remove** | Item hidden from home and checkout for today only |
| **➕ Add item to today’s menu** | Bring a removed item back (lands at the end) |

**Sold out** and **Remove** are opposites — use one or the other, not both.

New items you add to **Inventory** during an open Market Day join today’s menu at the end. Starting a **new** Market Day resets order to A–Z; **reopening** the same day keeps the order you set.

---

## `/inventory` — How to add inventory

**For grown-ups**

**Inventory** is your master list of everything the shop could ever sell.

### Add a new item

1. Tap **⚙️** → enter **Pass Code**.
2. Tap **📦 Inventory** at the bottom.
3. Tap **➕ Add Item**.
4. Fill in:
   - **Emoji** — pick a fun icon
   - **Name** — what you call it
   - **Cost** — what *you* paid (secret — kids never see this)
   - **Price** — what you charge customers
5. Tap **Save Item**.

If a Market Day is already open, the new item appears on today’s menu right away.

### Hide an item you’re done selling

Tap **📦 Archive Item**. It disappears from the menu, but old sales still show it.

To bring it back: **UnArchive**.

You can’t **Delete** an item that appears in past sales — the app blocks that so history stays intact. Use **Archive** instead.

---

## `/edit-items` — How to edit items

**For grown-ups**

1. **⚙️** → **Pass Code** → **📦 Inventory**.
2. Tap **✏️** on the item you want to change.
3. Update emoji, name, cost, or price.
4. Tap **Save Item**.

Changes show up on the home screen and in checkout right away — no restart needed.

**Archive** if you want to stop selling something without deleting its history. Delete is only allowed when the item has never appeared in a sale.

---

## `/end-market-day` — How to end a Market Day

**For grown-ups**

1. **⚙️** → **Pass Code** → **Settings**.
2. Scroll down. Tap **🔴 End Market Day**.
3. Confirm.

Sales are saved. The kid can’t sell again until you start a new Market Day.

The ended day appears under **Past Events** on Settings (scroll down on the “No market day yet” screen).

**Ended by mistake?** See [Reopen a closed day](./faq/reopen).

---

## `/past-events` — Past Events

**For grown-ups**

After you **End Market Day**, that day moves to **Past Events** on Settings (when no day is active).

Each row shows the **name**, **date**, and **number of sales**. Tap one to open its dashboard:

- Totals and profit (same summary as an active day; **Total with Tips** plus Cash / Zelle–Venmo with tip breakdowns when kept change exists)
- Full **Sales** list — tap to edit payment or **Cancel sale**
- **Export sales as CSV** (or **Re-export** if you already exported)
- **↩ Reopen Market Day** — only on the most recently closed day, and only before export

There is no **Today’s Menu** on past events — the menu was for that day only.

---

## `/export-sales` — Export sales (CSV)

**For grown-ups**

1. **⚙️** → Pass Code → **Settings**.
2. Under **Past Events**, tap the Market Day you want.
3. Tap **⬇ Export sales as CSV** (or **Re-export** if needed).
4. Use the share sheet to save or email the file (Mail, AirDrop, Files, etc.).

The CSV includes sale numbers, times, items, prices, costs, payment method, cash received, change kept, cancel reason when cancelled, and profit — ready for Excel. Cancelled sales stay in the file for Invoice # history but do not add to money totals. After the sale rows, summary blocks: **Zelle total** / Zelle order total / Zelle tips total; **Cash total** / Cash order total / Cash tips total; **Overall total** / Order overall total / Tips overall total / Overall profit.

If you edit a sale after exporting, the app shows **Re-export recommended**.

After export, **Reopen** is no longer available for that day.

---

## `/sales-dashboard` — Sales & profit

**For grown-ups**

While a Market Day is active:

1. **⚙️** → **Pass Code** → **Settings**.
2. See <b>Profit</b>, <b>Total with Tips</b> (order + tips), and **Cash** / **Venmo/Zelle** (with tip breakdowns when applicable).
3. Scroll the **Sales** list — each row shows sale number (or name if you added one), time, amount, payment method.
4. Tap a sale to change payment method, add optional **name** or **notes**, or **Cancel sale** (completed sales stay visible as Cancelled).

Kids see a simpler view (no profit) from the **Market Day banner** on the home screen. Cancelled sales do not count toward revenue or tips.

**Past Events:** When no day is active, open a closed day from **Past Events** to review totals, edit sales, export, or reopen. See [Past Events](./past-events).

---

## `/first-time-setup` — First-time setup

**For owners (first launch only)**

1. Open the app. You’ll see **Welcome to Booth Buddy!** with the Booth Buddy wordmark (same as Home).
2. Enter **business name** and **first name** (last name optional). Tap **Continue**.
3. Set a **4-digit Pass Code**, then confirm it.
4. On the success screen, tap **Go to my shop**.
5. On **Home**, use **Get your shop ready**: add your **first item** (required). Payment method and logo are optional. Tap **Hide** after the first item to dismiss the checklist forever.

The **⚙️ gear** opens owner settings. After setup it is unlocked; lock from the header when you leave if you want the Pass Code next time.

When the checklist is gone and no Market Day is open, Home shows **Start Market Day**, **Update Inventory**, and **Go to Sales**.

---

# FAQ pages

---

## `/faq` — FAQ index

**For sellers**

- [Why can't I add this item?](./faq/cant-sell)
- [What does “Sold out” mean?](./faq/sold-out)
- [What are invoice numbers?](../invoice-numbers)
- [How does cash change work?](./faq/cash-change)
- [Venmo / Zelle payments](./faq/venmo-zelle)
- [Fix a sale](./fix-a-sale)
- [Take a preorder](./preorder)

**For grown-ups**

- [Grown-up Settings tab](./faq/grown-up-settings)
- [What is the Pass Code?](./faq/pass-code)
- [I forgot the Pass Code](./faq/forgot-pass-code)
- [What is Archive?](./faq/archive)
- [Change a sale later](./faq/edit-sale-later)
- [Prepare and print preorders](./preorders)
- [Can I run two Market Days?](./faq/one-market-day)
- [I ended the day by mistake](./faq/undo-close)

**Everyone**

- [What is the ⚙️ gear?](./faq/gear-icon)

---

## `/faq/cant-sell` — Why can't I add this item?

**Make a Sale** is always available. If you can't add something, it's usually **Sold out** for today.

**What to do:** Pick another item, or ask a grown-up to mark it available again in **Today's Menu** (**⚙️** → Pass Code → **Settings**).

If there are no items on the list at all, ask a grown-up to add inventory in **📦 Inventory**.

---

## `/faq/sold-out` — What does “Sold out” mean?

**Sold out** means we’re still showing the item on the menu, but you can’t add it to a sale today.

It might look gray and say **Sold out** next to the name.

A grown-up can turn sold out off in **Today’s Menu** if more stock arrives.

---

## `/faq/pass-code` — What is the Pass Code?

A **4-digit code** only grown-ups know. Owner settings start unlocked after setup. When locked via the header lock exit, it unlocks **Events**, **Inventory**, **Preorders**, **Sales**, and **Settings**.

Kids use the shop without the Pass Code. They never see **cost** or **profit**.

Grown-ups can change the code in **⚙️ → Settings → Passcode**. Lock protection with the header **lock** when leaving owner settings.

---

## `/faq/forgot-pass-code` — I forgot the Pass Code

There is no “email my code” option. On the Pass Code screen, tap **Forgot Pass Code?**

That **erases everything** and lets you set up again from scratch. Only do this if a grown-up says it’s okay — you’ll lose saved sales.

*(Coming later: device unlock / Face ID recovery without resetting.)*

---

## `/faq/gear-icon` — What is the ⚙️ gear?

The **⚙️** on the home screen is for **grown-ups**.

Tap it → enter the **Pass Code** → open settings, inventory, and today’s sales with profit.

If you’re a kid selling things, you usually don’t need the gear — use **Make a Sale** instead.

---

## `/faq/archive` — What is Archive?

**Archive** hides an item from the menu. It does **not** delete old sales that included that item.

Use it when you stop selling something but want to keep history.

**UnArchive** brings the item back.

If an item appears in past sales, **Delete** is blocked — Archive instead.

Only grown-ups can archive items, from **📦 Inventory**.

---

## `/faq/cash-change` — How does cash change work?

1. On the payment screen, **Cash** is selected by default and the cash-entry card is at the top.
2. Set **Amount Paid** with **− / +** or tap bill chips ($1, $5, $10, $20, $100) — each chip tap **adds** to the running total.
3. Or tap **Exact amount** if they paid the perfect total, or **Clear** to start over.
4. The amount turns **red** if it’s below **Order Total**, **green** when it’s enough.

The status bar shows:

- **Change: $X** — give this much back
- **Keeping $X — no change back** — you checked **Keep change?** (customer said keep it)
- **Still $X due** — they didn’t give enough yet

When change is due, a centered **Keep change?** outline button with a checkbox appears below the status bar (always unchecked by default). Tap it only if the customer says you can keep the extra.

Tap **Complete sale ✓** when the payment is right.

---

## `/faq/venmo-zelle` — Venmo / Zelle payments

1. On the payment screen, tap **📱 Venmo / Zelle**.
2. If a grown-up set up payment info in **⚙️ → Settings**, a card shows who to pay — Zelle full name (check it in your bank app), email/phone, optional QR; Venmo `@username`, optional QR or a generated QR with the order amount.
3. **Amount Paid** defaults to the exact order total — same card as cash (chips, **− / +**, **Keep change?**).
4. After the customer pays on their phone, bump **Amount Paid** if they added a tip, then check **Keep change?** when the extra is a tip.
5. Tap **Complete sale ✓** in Market Day to save the sale.

Grown-ups configure Zelle/Venmo under **⚙️ → Pass Code → Settings** (bottom nav).

---

## `/faq/grown-up-settings` — Grown-up Settings tab

1. **⚙️** → **Pass Code** → tap **⚙️ Settings** in the bottom nav (last tab).
2. **Business** — shop name and optional logo.
3. **Passcode** — change the 4-digit code (current code required). To require a code next time, use the header **lock** → **Lock & go to Dashboard** (not a Settings toggle).
4. **Payment** — Zelle full name, email/phone, optional QR screenshot; Venmo username, optional QR upload.
5. Tap **Save changes** at the bottom (payment/business fields). Passcode saves on its own.

---

## `/faq/edit-sale-later` — Change a sale later

**Kids:** Right after checkout, use **✏️ Edit this sale** on the **Sold!** screen.

**Grown-ups:** Later — on an **active** day or from **Past Events**:

1. **⚙️** → Pass Code → **Events** (active day) or **Past Events → tap a day** (also Sales / Preorders tabs).
2. Tap the sale.
3. Change **payment method**, add optional **name** or **notes**, edit **Complete date** (preorders), or **Cancel sale** (Return or Error).
4. Tap **Save changes** for edits. Cancel is permanent — the sale stays listed as **Cancelled**.

**Name** and **notes** are optional for normal sales — leave them blank for a walk-up sale. **+ Pre-order** requires name, notes, and complete date at checkout.

To change items/quantities on a saved sale: **Cancel sale** and ring it up again (or use staff **Edit this sale** right after checkout). Open preorders can be deleted instead of cancelled.

---

## `/faq/sales-after-update` — Will I lose sales when the app updates?

**No.** Past sales stay on the device across app updates. Schema migrations (Pay on pickup, cancel fields, etc.) copy existing rows in place — including cancelled sales and line items linked to each Invoice #.

There is still no cloud backup. Keep CSV exports you care about. Don’t use **Forgot your code?** unless you mean to erase the shop.

---

## `/faq/one-market-day` — Can I run two Market Days at once?

No. Only **one active Market Day** at a time.

To start a new day, **End Market Day** first (or confirm replacing the current one).

---

## `/faq/reopen` — I ended the day by mistake

1. **⚙️** → Pass Code → **Settings**.
2. Under **Past Events**, tap the day you just ended.
3. Tap **↩ Reopen Market Day**.

That makes it the active day again so selling can continue.

This works only for the **most recently** closed day, and only until you **export** it.

---

# Day-of checklist (optional `/checklist` page)

**Grown-up — morning (optional for porch sales; recommended for fairs)**

- [ ] ⚙️ → Pass Code → enter **Market Day** name + **Date** → **Start Market Day**
- [ ] Check **Today’s Menu** (drag to reorder / sold out / remove items)
- [ ] Hand device to seller

**Seller — all day**

- [ ] **Make a Sale** → cart → **Checkout** → pay → **Sold!**

**Grown-up — evening**

- [ ] ⚙️ → **Settings** → review sales & profit
- [ ] **End Market Day**
- [ ] (Optional) **Past Events** → export CSV for Excel

---

## Visual / brand notes for web agent

Friendly, colorful, kid-safe — match **Booth Buddy** logo palette (peach/coral), not old purple mock.

- Fonts (web): **Fredoka** headings, **Nunito** body
- App name: **Booth Buddy**
- Domain event: **Market Day** (still the selling-day concept)
- Icon motifs: logo, 🛒 sell, ⚙️ owner settings, 📦 inventory

---

## Out of scope for help site (don’t document as available)

- Biometric / Face ID Pass Code recovery (v2)
- Edit item quantities on a saved sale (deferred — remove + re-log)

**Now in app (documented in `web/index.html`):** change Pass Code in Settings; optional Item photos; **Mark Delivered** on paid preorders; **Get your shop ready** + fixed idle Home shortcuts; tips vs order totals on banner / dashboards / CSV; **Today’s Menu drag-to-reorder**.
