# Case 1 

![Error Screenshot](/tests/dialog-box/images/image.png)

## This issue comes when the waitForTimeout was not added. [page.on( ) case]

This is a classic Playwright **race condition** with dialog handling. The error "Test ended" at `dialog.accept()` means the test runner finished before the async dialog handler could complete — it works in debug mode only because the slower execution masks the timing issue.

**Root cause:** `page.on('dialog', async callback)` — Playwright does **not** await async callbacks inside event listeners. The test ends before `dialog.accept()` resolves.

---

**The fix — use `page.waitForEvent('dialog')`:**

```typescript
test('alert dialog test', async ({ page }) => {
  // Set up the listener BEFORE triggering the action
  const dialogPromise = page.waitForEvent('dialog');

  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Now await and handle the dialog
  const dialog = await dialogPromise;
  console.log('ALERT:', dialog.message());
  expect(dialog.message()).toContain('User is not valid');
  await dialog.accept();
});
```

**Why this works:**
- `page.waitForEvent('dialog')` returns a real `Promise` that Playwright can track and await properly
- The listener is registered *before* the click (preventing any miss), but the `await` happens *after* — so there's no race
- The test runner stays alive until `dialog.accept()` fully resolves

---

**Why your original approach fails (but passes in debug):**

```typescript
// ❌ Problematic pattern
page.on('dialog', async (dialog) => {
  await dialog.accept(); // This Promise is "fire and forget" — not tracked by Playwright
});
await page.click(...); // Test ends here without waiting for the handler above
```

In debug mode, the breakpoints slow execution down enough that the dialog handler completes before the test ends — which is why the race condition disappears.


---
---


`page.on('dialog', async callback)` registers the handler correctly, but the problem is **two-fold**:

**1. Event listeners are "fire and forget"**
Playwright's test runner has no way to know that your `async` callback inside `page.on` is still doing work. So when the last `await` in the main test body finishes (the button click), the test considers itself done and tears down — killing any in-progress handler mid-execution.

**2. The `await` inside the callback is invisible to the test runner**
Even though you wrote `await dialog.accept()`, that promise is floating — nothing is holding onto it or tracking it at the test level. It's essentially the same as writing:

```typescript
// These are equivalent from the test runner's perspective:
page.on('dialog', async (dialog) => { await dialog.accept(); });
page.on('dialog', (dialog) => { dialog.accept(); }); // "fire and forget"
```

---

**Why debug mode hides this:**

Debug mode introduces real-world delay (breakpoints, stepping), which gives the floating async handler just enough time to complete before the test teardown kicks in. It's a timing coincidence, not correct behavior.

---

**The mental model to remember:**

> Anything you want the test runner to **wait for** must be connected to the main `async` execution chain via `await`. Event callbacks are disconnected from that chain by design.

`page.waitForEvent('dialog')` solves this because it puts the dialog resolution *back into* the main chain — making it a proper promise the test runner tracks and waits on before exiting.

---

# Case 2

# Playwright Dialog Handling — The Deadlock Problem

## Table of Contents

- [What is the Problem?](#what-is-the-problem)
- [Why Does `await click()` Cause a Deadlock?](#why-does-await-click-cause-a-deadlock)
- [The Three Broken Patterns](#the-three-broken-patterns)
- [The Two Correct Patterns](#the-two-correct-patterns)
- [Decision Guide](#decision-guide)
- [Pattern Comparison Table](#pattern-comparison-table)
- [The One Rule to Remember](#the-one-rule-to-remember)

---

## What is the Problem?

When a browser dialog (`alert`, `confirm`, `prompt`) is triggered by a click, Playwright enters a **deadlock** if you `await` the click before handling the dialog.

Playwright's `click()` action does **not** just click — it waits for the page to stabilize after the click. A page with an open dialog is never considered stable. So if nothing dismisses the dialog first, `click()` waits forever.

```
await click()  →  dialog opens  →  page blocked  →  click() waits for stability
                                                          ↑
                                             can never happen while dialog is open
                                                          ↓
                                                  TIMEOUT 💥
```

---

## Why Does `await click()` Cause a Deadlock?

Playwright's `click()` action performs these steps internally:

```
1. Find element          ✅
2. Scroll into view       ✅
3. Dispatch click event   ✅
4. Dialog opens           ✅
5. Wait for page stable   ⏳  ← BLOCKS HERE FOREVER
```

The page cannot stabilize while a dialog is open.  
The dialog can only be dismissed by calling `dialog.accept()` or `dialog.dismiss()`.  
But those lines come **after** `await click()` in your code.  
So they are **never reached**.

---

## The Three Broken Patterns

### ❌ Pattern 1 — `await click()` before `waitForEvent`

```typescript
// BROKEN — sequential, creates deadlock
const dialogPromise = page.waitForEvent('dialog');
await page.locator('#js-prompt').click();   // ← stuck here forever
const dialog = await dialogPromise;         // ← never reached
await dialog.accept();                      // ← never reached
```

**Why it fails:**  
`click()` blocks waiting for page stability. The page can't stabilize until the dialog is dismissed. The dismiss never happens. Timeout.

---

### ❌ Pattern 2 — `waitForEvent` before `click()` (no concurrent trigger)

```typescript
// BROKEN — same deadlock, different order
await page.waitForEvent('dialog');           // ← waiting for event
await page.locator('#js-prompt').click();   // ← click is never fired
```

**Why it fails:**  
`waitForEvent` blocks waiting for the event to fire. The event never fires because the click never runs. They block each other.

---

### ❌ Pattern 3 — `Promise.all` with `await click()` inside

```typescript
// BROKEN — looks concurrent but still deadlocks
const [dialog] = await Promise.all([
    page.waitForEvent('dialog'),
    page.locator('#js-prompt').click()   // ← click() blocks Promise.all
]);
await dialog.accept();   // ← only runs after Promise.all, but click() never resolves
```

**Why it fails:**  
`Promise.all` waits for **both** promises to resolve. `waitForEvent` resolves when the dialog fires ✅ — but `click()` **never resolves** because it's waiting for page stability, which requires the dialog to be dismissed, which requires `dialog.accept()`, which is after `Promise.all`. Circular deadlock.

---

## The Two Correct Patterns

### ✅ Pattern A — `waitForEvent` + unawaited click (Recommended)

```typescript
test('handling prompt', async ({ page }) => {
    await page.goto('https://practice.expandtesting.com/js-dialogs');

    // 1. Arm the listener BEFORE clicking
    const dialogPromise = page.waitForEvent('dialog');

    // 2. Fire the click WITHOUT await — doesn't block the thread
    page.locator('#js-prompt').click();

    // 3. Await the dialog event — resolves as soon as dialog opens
    const dialog = await dialogPromise;

    // 4. Accept/dismiss — this unblocks the click() in the background
    await dialog.accept('Hello from Playwright!');
});
```

**Why it works:**

```
dialogPromise registered      ← listener armed
click() fires (no await)      ← starts in background, doesn't block
dialog opens                  ← CDP fires event
dialogPromise resolves        ✅
dialog.accept() called        ← dismisses dialog
page stabilizes               ← click() settles in the background ✅
```

**Pros:**
- Returns the `dialog` object for full assertions
- Most readable and expressive
- Recommended by Playwright docs

---

### ✅ Pattern B — `page.once('dialog')` before click

```typescript
test('handling prompt', async ({ page }) => {
    await page.goto('https://practice.expandtesting.com/js-dialogs');

    // 1. Register a one-time handler before clicking
    page.once('dialog', async (dialog) => {
        console.log(dialog.message());
        console.log(dialog.defaultValue());
        await dialog.accept('Hello from Playwright!');
    });

    // 2. Click — handler fires mid-click, dismisses dialog, click settles ✅
    await page.locator('#js-prompt').click();
});
```

**Why it works:**  
The handler is registered in Playwright's event queue before the click. When the dialog fires at the CDP level during the click, Playwright calls the handler mid-flight — before `click()` tries to stabilize.

**Pros:**
- Works safely in `--debug` mode
- Simple and clean

**Cons:**
- Dialog object is only accessible inside the callback
- Assertions on the dialog are harder to express

---

## Decision Guide

```
Do you need to assert on the dialog object? (type, message, defaultValue)
│
├─ YES → Use Pattern A (waitForEvent + unawaited click)
│
│        const dialogPromise = page.waitForEvent('dialog');
│        page.locator('#btn').click();          // no await
│        const dialog = await dialogPromise;
│        expect(dialog.type()).toBe('prompt');
│        expect(dialog.message()).toBe('Enter your name');
│        await dialog.accept('John');
│
└─ NO, just dismiss it → Use Pattern B (page.once)
│
│        page.once('dialog', d => d.accept('John'));
│        await page.locator('#btn').click();
│
└─ Multiple dialogs in one test → Use page.on (persistent listener)

         page.on('dialog', d => d.accept());
         await page.locator('#btn1').click();
         await page.locator('#btn2').click();
```

---

## Pattern Comparison Table

| Pattern | Returns dialog object | Works in `--debug` | Handles multiple dialogs | Recommended |
|---|---|---|---|---|
| `waitForEvent` + unawaited click | ✅ Yes | ⚠️ Careful | ❌ One-shot | ✅ Yes |
| `page.once('dialog')` | ⚠️ Only in callback | ✅ Yes | ❌ One-shot | ✅ Yes |
| `page.on('dialog')` | ⚠️ Only in callback | ✅ Yes | ✅ Yes | ✅ For multiple |
| `Promise.all` + `await click()` | ✅ Yes | ❌ No | ❌ No | ❌ Deadlocks |
| `await click()` then `waitForEvent` | ✅ Yes | ❌ No | ❌ No | ❌ Deadlocks |

---

## The One Rule to Remember

> **The action that opens a dialog must never be `await`-ed before the dialog is handled.**

Playwright's `click()` waits for page stability.  
Page stability requires the dialog to be dismissed.  
The dialog can only be dismissed after it's been captured.  
Capturing it requires code that runs after the click.  

That circular dependency is the deadlock. Break it by either:

1. **Not awaiting the click** — so your code continues to the `waitForEvent` await
2. **Pre-registering a handler** — so the dialog is handled *during* the click, not after

```typescript
// ✅ The pattern that always works
const dialogPromise = page.waitForEvent('dialog');
page.locator('#trigger').click();          // 🔑 no await
const dialog = await dialogPromise;
await dialog.accept();
```
