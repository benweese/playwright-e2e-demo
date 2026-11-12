# Subscription — UI test plan

**Source:** https://automationexercise.com/test_cases, Test Cases 10 and 11 (wording below is the page's own)
**Page reference:** `docs/pages/home.md`, `docs/pages/view-cart.md`
**Spec file:** `tests/ui/specs/subscription.spec.ts` (create)
**Files:** create `locators/subscriptionLocators.ts` + `pages/SubscriptionFooter.ts` (a component used by `HomePage` and `CartPage`; JSDoc on each method): `scrollToFooter`, `subscribe(email)`, `expectSubscribed()`, `expectEmailInvalid()`. Data: commons' `uniqueEmail(config.testEmail)`; nothing hardcoded.

Session rule: the cart scenario (#0049) runs with `test.use({ storageState: { cookies: [], origins: [] } })` so it does not touch the shared session's cart; it does not add anything to the cart. The others use the shared session. Subscribing creates nothing the test can clean up.

The success message is visible for about one second. Every subscribe step must be `click` immediately followed by `await expect(success).toBeVisible()`, with nothing in between and no waiting before it. The footer is reached by scrolling it into view (not a fixed wait).

## Acceptance criteria

1. **AC-1** (TC10) — "Scroll down to footer. Verify text 'SUBSCRIPTION'."
2. **AC-2** (TC10) — "Enter email address in input and click arrow button. Verify success message 'You have been successfully subscribed!' is visible." (on the home page)
3. **AC-3** (TC11) — Same on the Cart page: "Click 'Cart' button. Scroll down to footer. Verify text 'SUBSCRIPTION'. Enter email address in input and click arrow button. Verify success message 'You have been successfully subscribed!' is visible."
4. **AC-4** (derived; Approved by repo owner) — A missing or malformed email is not submitted (native validation).

## Already covered

| id   | Description | Skip / Extend |
| ---- | ----------- | ------------- |
| none |             | Create        |

## Scenarios

### Subscription on the home page (test.describe)

#### #0048 — Subscribing from the home page footer shows the success message

**Covers:** AC-1, AC-2
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Steps:**

1. Open `/`
2. Scroll the footer into view
3. Check the "Subscription" heading
4. Enter a unique email (on the suite's test domain) in "Your email address"
5. Click the arrow (subscribe) button
   **Expected:**

- "Subscription" heading visible at step 3
- Immediately after step 5: "You have been successfully subscribed!" is visible
- The email input is empty afterwards (assert after the message check)

### Subscription on the cart page (test.describe)

#### #0049 — Subscribing from the cart page footer shows the success message

**Covers:** AC-3
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/`, click "Cart" in the header
2. Scroll the footer into view
3. Check the "Subscription" heading
4. Enter a unique email in "Your email address"
5. Click the arrow button
   **Expected:**

- URL is `/view_cart` after step 1
- "Subscription" heading visible
- Immediately after step 5: "You have been successfully subscribed!" is visible

### Validation (test.describe)

#### #0050 — Subscribing with an empty or malformed email is blocked

**Approved by repo owner** (derived scenario).
**Covers:** AC-4
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/`; scroll the footer into view
2. Click the arrow button with the email empty
3. Type `notanemail` and click the arrow button
   **Expected:**

- After each click the email field is invalid (non-empty `validationMessage`; do not assert exact browser wording)
- "You have been successfully subscribed!" is not visible after either click (given the one-second window, check it straight after the click, not later)
- URL is `/`

## Site changes needed

- **Subscribe button**: icon-only, no accessible name or `data-*` attribute. The repo allows exactly this id: locate it with `#subscribe` (inside the footer). No `// Fixme:` needed. An `aria-label="Subscribe"` would still be better.
- **Email input**: `getByRole("textbox", { name: "Your email address" })` inside `getByRole("contentinfo")` works (the placeholder gives the name). No change needed.
- **Success message** (`#success-subscribe`): no role. `role="status"` would let tests find it without text only. Locate by exact text inside the footer.
- **Misspelled id** `susbscribe_email` (cosmetic).

## Open questions

- **Duplicate subscription** of the same address was not tried: should it be rejected or accepted? No scenario planned.
- **No server-side rejection seen.** The site shows no error text for any address, so only native validation is planned in #0050.
- **Where does the subscription go?** No observable result other than the message; the footer form on the contact page posts to `/contact_us`. Not planned beyond TC10 and TC11.
- **Timing.** A one-second message is flaky by design; confirm that the first-assertion approach is wanted and not a site change to keep it visible longer.
