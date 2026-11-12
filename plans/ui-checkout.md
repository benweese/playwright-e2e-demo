# Checkout to order placed — UI test plan

**Source:** https://automationexercise.com/test_cases, Test Cases 14, 16, 23 (wording below is the page's own)
**Page reference:** `docs/pages/view-cart.md`, `docs/pages/checkout.md`, `docs/pages/payment.md`, `docs/pages/login.md`
**Spec file:** `tests/ui/specs/checkout.spec.ts` (create)
**Files:** create `locators/checkoutLocators.ts` + `pages/CheckoutPage.ts`, `locators/paymentLocators.ts` + `pages/PaymentPage.ts`, `data/paymentData.ts` (valid-looking card: name, 16-digit number, 3-digit CVC, future month and year, built from faker); reuse `LoginPage`, `CartPage`, `ProductDetailsPage`, `HeaderComponent`, `Accounts`, `buildAccount`, `Products.list()`.

Session rule: every scenario uses `test.use({ storageState: { cookies: [], origins: [] } })` (own cart) and its own account created with `Accounts.create(buildAccount())`, deleted in `finally`. Logged-in scenarios sign in through `LoginPage` (hard-assert "Logged in as" before moving on). The product is `Products.list()`'s first item at run time. Never use the shared account.

## Acceptance criteria

1. **AC-1** (TC16) — "Add products to cart. Click 'Cart' button. Verify that cart page is displayed. Click Proceed To Checkout."
2. **AC-2** (TC16) — "Verify Address Details and Review Your Order."
3. **AC-3** (TC23) — "Verify that the delivery address is same address filled at the time registration of account. Verify that the billing address is same address filled at the time registration of account."
4. **AC-4** (TC16) — "Enter description in comment text area and click 'Place Order'. Enter payment details: Name on Card, Card Number, CVC, Expiration date. Click 'Pay and Confirm Order' button. Verify success message 'Your order has been placed successfully!'"
5. **AC-5** (TC14) — Logged out, "Click Proceed To Checkout" leads to "Register / Login" (the modal "Register / Login account to proceed on checkout.").
6. **AC-6** (derived; Approved by repo owner) — The payment form cannot be submitted with empty fields.

## Already covered

| id   | Description | Skip / Extend |
| ---- | ----------- | ------------- |
| none |             | Create        |

## Scenarios

### Proceed to checkout (test.describe)

#### #0039 — A logged-out visitor is asked to register or log in before checkout

**Covers:** AC-5, AC-1
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/product_details/<first product id>` and click "Add to cart", then "View Cart"
2. Click "Proceed To Checkout"
3. Check the modal, then click its "Register / Login" link
   **Expected:**

- After step 2: modal heading "Checkout" and text "Register / Login account to proceed on checkout." visible; URL still `/view_cart`
- After step 3: URL is `/login`

#### #0040 — Checkout shows the registered address as delivery and billing address

**Covers:** AC-1, AC-3
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** API account (known address); log in through `LoginPage`; add the first product from its detail page; open `/view_cart`.
**Steps:**

1. Click "Proceed To Checkout"
   **Expected:**

- URL is `/checkout`, heading "Address Details" visible
- "Your delivery address" block contains the account's first and last name, company, address1, address2, city, state, zipcode, country and mobile number
- "Your billing address" block contains the same values
  (Use `expect.soft` per field. Address lines are inside one block, so use `toContainText` per value.)

#### #0041 — Review Your Order lists the product with price, quantity and total

**Covers:** AC-2
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** as #0040, but add the product with quantity 2 (detail page).
**Steps:**

1. Open `/view_cart`, click "Proceed To Checkout"
   **Expected:**

- "Review Your Order" heading visible
- A row for the product with its name, price equal to the API price, quantity 2, total price x 2
- "Total Amount" row equals price x 2

### Place the order (test.describe)

#### #0042 — Log in, check out and place an order

**Covers:** AC-1, AC-2, AC-4
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.SLOW`, `TAGS.REGRESSION`
**Setup:** API account, `finally` delete; log in through `LoginPage`; add the first product.
**Steps:**

1. Open `/view_cart`; check the cart page shows the product
2. Click "Proceed To Checkout"
3. Type a comment (faker sentence) in the order comment box
4. Click "Place Order"
5. On /payment enter Name on Card, a valid-looking Card Number, CVC, Expiration month and year (a future date) from `paymentData`
6. Click "Pay and Confirm Order"
   **Expected:**

- Step 1: the product's row is visible
- Step 2: URL is `/checkout`
- Step 4: URL is `/payment`, heading "Payment"
- Step 6: "Your order has been placed successfully!" is visible (soft assertion, so the rest of the test still runs). This is the documented text from test case 16; no other confirmation text or URL is asserted

### Payment validation (test.describe)

#### #0043 — The payment form is not submitted when its fields are empty

**Approved by repo owner** (derived scenario).
**Covers:** AC-6
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** as #0042 up to step 4.
**Steps:**

1. On /payment click "Pay and Confirm Order" with all fields empty
   **Expected:**

- URL stays `/payment`; no "Order Placed!" heading
- The Name on Card field is invalid (non-empty `validationMessage`; do not assert the browser's wording)

## Site changes needed

- **Proceed To Checkout** (`a.check_out` on the cart): `<a>` with no href and no role. Needs `role="button"` (or a real link) so `getByRole` works; until then `getByText("Proceed To Checkout")` with a `// Fixme:`.
- **Order comment box**: `textarea[name=message]` with no label, placeholder, id or data-qa. Needs a label or `data-qa="comment"`. The plan uses the best allowed locator (`getByRole("textbox")` inside the page's review section) with a `// Fixme:`.
- **Address blocks** `#address_delivery` / `#address_invoice`: headings "YOUR DELIVERY ADDRESS" / "YOUR BILLING ADDRESS" exist but the block is a plain `ul`. Plan: container by the heading text; `data-qa` on each block would be stronger.
- **Payment labels** are not associated with their inputs; the plan uses the existing `data-qa` test ids.
- **Cart modal** `#checkoutModal`: no dialog role or name. Needs `role="dialog"` with an accessible name.
- **Review table rows and Total Amount**: use `getByRole("row").filter({ hasText })`; fine without changes.

## Findings (expected failures)

- **#0042 is expected to fail against the current site.** Test case 16 says "Your order has been placed successfully!"; the site shows "Order Placed!" and "Congratulations! Your order has been confirmed!" and only holds the documented text in a hidden alert on /payment. The documented text wins. The test stays failing: no `test.fail()`. Report the mismatch as a bug.

## Open questions

- **Garbage card details accepted.** The site places an order with card number "abcd", CVC "1", month 99, year 1999. Probably wrong. No scenario sends invalid card data, so nothing blesses it. Should there be a decline path?
- **Empty-cart and logged-out checkout.** `/checkout` and `/payment` render with no redirect and "Rs. 0" total when the cart is empty or the user is logged out. Probably a defect; not planned. Confirm and report.
- **Comment text.** The comment is not shown or sent anywhere after "Place Order" (a plain GET). #0042 types it because TC16 says to, but cannot assert it was kept.
- **Address format.** The page shows a leading ". " before the name. Not asserted; confirm whether it is a defect.
- **TC14/TC15 (register during or before checkout) and TC24 (download invoice)** are in the site's cases but were not requested. Not planned. TC14/TC15 would need an extra UI sign-up per test.
