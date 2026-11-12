# Cart (add, remove, quantity) — UI test plan

**Source:** https://automationexercise.com/test_cases, Test Cases 12, 13, 17 (wording below is the page's own)
**Page reference:** `docs/pages/view-cart.md`, `docs/pages/products.md`, `docs/pages/product-details.md`
**Spec file:** `tests/ui/specs/cart.spec.ts` (create)
**Files:** create `locators/cartLocators.ts` + `pages/CartPage.ts`; reuse `ProductsPage` and `ProductDetailsPage` from `ui-products.md` (add `addToCart(productId)`, `continueShopping()`, `viewCart()` and `setQuantity(n)` / `addToCartFromDetail()` there); `Products.list()` for the products and their prices.

Session rule: the cart is keyed to the session cookie, so the whole file uses `test.use({ storageState: { cookies: [], origins: [] } })` (a fresh, logged-out, empty-cart session per test). No account is needed. Pick products from `Products.list()` at run time; parse `Rs. N` prices to numbers in a helper in `tests/ui/data/`.

## Acceptance criteria

1. **AC-1** (TC12) — "Hover over first product and click 'Add to cart'. Click 'Continue Shopping' button. Hover over second product and click 'Add to cart'. Click 'View Cart' button. Verify both products are added to Cart."
2. **AC-2** (TC12) — "Verify their prices, quantity and total price."
3. **AC-3** (TC13) — "Click 'View Product' for any product ... Increase quantity to 4. Click 'Add to cart' button. Click 'View Cart' button. Verify that product is displayed in cart page with exact quantity."
4. **AC-4** (TC17) — "Click 'X' button corresponding to particular product. Verify that product is removed from the cart."
5. **AC-5** (derived; Approved by repo owner) — A cart with nothing in it says "Cart is empty!" and links to the products page.

## Already covered

| id   | Description | Skip / Extend |
| ---- | ----------- | ------------- |
| none |             | Create        |

## Scenarios

### Add products (test.describe)

#### #0032 — Two products added from the Products page both appear in the cart with price, quantity and total

**Covers:** AC-1, AC-2
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Setup:** `Products.list()`; use the first two products (`name`, `price`).
**Steps:**

1. Open `/products`
2. Add the first product to the cart ("Add to cart" on its card)
3. Click "Continue Shopping" in the "Added!" modal
4. Add the second product the same way
5. Click "View Cart" in the modal
   **Expected:**

- After steps 2 and 4: the modal shows "Added!" and "Your product has been added to cart." (assert before the next click; no fixed waits)
- URL is `/view_cart`
- The cart has exactly two rows, one per product, each with the product's name
- Each row: price equals the API price, quantity is 1, total equals price x 1 (soft assertions)

#### #0033 — Adding a product from its detail page puts it in the cart with quantity 1

**Covers:** AC-1, AC-2
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** `Products.list()`; take the third product (or the last if shorter, by index math, not a guard).
**Steps:**

1. Open `/product_details/<id>`
2. Click "Add to cart" without changing the quantity
3. Click "View Cart"
   **Expected:**

- Modal shows "Added!" after step 2
- One row with the product's name, price equal to the API price, quantity 1, total equal to the price

### Quantity (test.describe)

#### #0034 — A quantity of 4 chosen on the detail page appears in the cart

**Covers:** AC-3, AC-2
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Setup:** `Products.list()`; take the first product.
**Steps:**

1. Open `/`
2. Click "View Product" on that product's card
3. Set the quantity to 4
4. Click "Add to cart"
5. Click "View Cart"
   **Expected:**

- After step 2: URL is `/product_details/<id>`
- After step 4: "Added!" modal visible
- Cart has one row for the product, quantity 4, total equals price x 4

#### #0035 — Adding the same product twice from two pages shows one row with the summed quantity

**Approved by repo owner** (derived scenario).
**Covers:** AC-3
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** `Products.list()`; first product.
**Steps:**

1. Open `/product_details/<id>`, set quantity 2, click "Add to cart", click "Continue Shopping"
2. Set quantity 3, click "Add to cart", click "View Cart"
   **Expected:**

- One row for the product, quantity 5, total equals price x 5
  (Each add waits for its "Added!" modal; the page ref warns rapid adds race.)

### Remove (test.describe)

#### #0036 — Removing one of two products leaves the other in the cart

**Covers:** AC-4
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Setup:** first two products from `Products.list()`.
**Steps:**

1. Add both products to the cart as in #0032 and open `/view_cart`
2. Click the remove ("X") control on the first product's row
   **Expected:**

- The first product's row is no longer visible; the second product's row is still visible with its quantity
- After reloading `/view_cart`, still only the second product is listed (removal persists)

#### #0037 — Removing the only product shows the empty-cart message

**Covers:** AC-4, AC-5
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** first product from `Products.list()`.
**Steps:**

1. Add the product and open `/view_cart`
2. Click the remove control on its row
   **Expected:**

- The product's row is gone
- "Cart is empty!" is visible with the link "here" to the products page

### Empty cart (test.describe)

#### #0038 — A new session's cart is empty and the link leads to Products

**Approved by repo owner** (derived scenario).
**Covers:** AC-5
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/view_cart` in the fresh session
2. Click the "here" link
   **Expected:**

- "Cart is empty! Click here to buy products." is visible at step 1; no product rows
- After step 2: URL is `/products` and "All Products" is visible

## Site changes needed

- **Add to cart** on product-grid cards: no href, no role, no name (a generic). Solved without a site change by the repo's `data-*` rule: `page.locator('[data-product-id="<id>"]')`, with the id from `Products.list()`. The attribute is on both the visible link and its hover overlay copy, so the generator must make it unique without `.first()`/`.nth()`. (A visibility filter doesn't work: the overlay copy also counts as visible. The generated locator scopes to the copy next to the product picture, `img ~ [data-product-id]`, with a `// Fixme:`.) Optional improvement: `role="button"` plus an `aria-label` naming the product. On the detail page "Add to cart" is a button and needs no change.
- **Remove control** in the cart: icon-only anchor, no href, no name, but it carries `data-product-id="<id>"`. Solved by the `data-*` rule: locate the row with `getByRole("row").filter({ hasText: name })`, then `row.locator('[data-product-id="<id>"]')` inside it (unique within the row). No `// Fixme:` needed. An `aria-label="Remove <product>"` would still be better.
- **Cart quantity** is a `button` (disabled-looking) in the row: findable with `row.getByRole("button")`; price, total cells are `td` with classes only: use `row.getByRole("cell").filter({ hasText })`. Test ids on price, quantity and total cells would remove the guesswork.
- **"Added!" modal** (`#cartModal`) has no `role="dialog"` or accessible name. Needs `role="dialog"` and `aria-labelledby`; until then locate it by the "Added!" heading text.
- **Detail-page quantity input**: no label association (see products plan).

## Open questions

- **Invalid quantities.** The detail page sends `quantity=0`, `-1`, `2.5` and empty to `/add_to_cart` and shows the "Added!" modal for 0 and -1 (the input is outside a form so `min=1` is not enforced). What should the cart hold, or should it reject them? No scenario is planned, so nothing is blessed. Needs a decision.
- **Cart shared across the session.** "Added to cart works without logging in" is observed; the requirement is silent. Fine for #0032 onward.
- **Same product twice (#0035):** the sum (5) is the plausible expectation; the page ref only shows qty 2 from two single adds. Confirm.
- **No grand total row** on the cart page. TC12 says "total price" per product only; confirm no overall total is wanted.
- **Cart after login (TC20)**, **recommended items (TC22)** were not requested. Not planned.
