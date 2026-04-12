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