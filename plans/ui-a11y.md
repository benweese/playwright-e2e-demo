# Accessibility (axe-core) — UI test plan

**Source:** requirement given in the request: "axe-core accessibility checks on key pages", expecting no WCAG 2 A/AA violations. There is no matching test case on https://automationexercise.com/test_cases.
**Page reference:** `docs/pages/home.md`, `login.md`, `products.md`, `product-details.md`, `view-cart.md`, `contact-us.md`
**Spec file:** `tests/ui/specs/a11y.spec.ts` (create)
**Files:** scans with commons' `expectNoA11yViolations(page)` (axe-core, WCAG 2.0–2.2 A/AA, no exclusions; generated as a local helper, since moved to commons v0.7.0). It reuses `HomePage`, `LoginPage`, `ProductsPage`, `ProductDetailsPage`, `CartPage`, `ContactPage` for navigation. Product comes from `Products.list()` at run time.
**Dependency:** `@axe-core/playwright` (approved as a dev dependency; it is **not yet in `package.json`**, so the generator must install it before writing the spec).

Rules for every scenario: scan with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`. Assert `violations` is empty, with the violation ids, impacts and offending targets in the failure message (`expect(violations, summary).toEqual([])`). **No `exclude`, `disableRules` or per-rule filtering.** The `fixtures/test` ad blocking already applies. A failing page is a finding to report, not a reason to adjust the scan.

Session: the login page scenario and the cart scenario use `test.use({ storageState: { cookies: [], origins: [] } })` (login page as a visitor; cart in its own session). The rest use the shared session, which only reads pages.

## Acceptance criteria

1. **AC-1** — The home page (`/`) has no WCAG 2 A or AA axe violations.
2. **AC-2** — The login / sign-up page (`/login`) has none.
3. **AC-3** — The products page (`/products`) has none.
4. **AC-4** — A product detail page (`/product_details/<id>`) has none.
5. **AC-5** — The cart page (`/view_cart`), with a product in the cart, has none.
6. **AC-6** — The contact us page (`/contact_us`) has none.

## Already covered

| id   | Description | Skip / Extend |
| ---- | ----------- | ------------- |
| none |             | Create        |

## Scenarios

### Axe scans (test.describe)

#### #0051 — Home page has no WCAG 2 A/AA violations

**Covers:** AC-1
**Tags:** `TAGS.UI`, `TAGS.A11Y`
**Steps:**

1. Open `/`; wait for the "Features Items" heading (web-first, not `networkidle`)
2. Run the axe scan
   **Expected:**

- Zero violations
  (The hero slider auto-rotates; it is neither paused nor excluded.)

#### #0052 — Login page has no WCAG 2 A/AA violations

**Covers:** AC-2
**Tags:** `TAGS.UI`, `TAGS.A11Y`
**Steps:**

1. Open `/login` logged out; wait for the "Login to your account" heading
2. Run the axe scan
   **Expected:**

- Zero violations

#### #0053 — Products page has no WCAG 2 A/AA violations

**Covers:** AC-3
**Tags:** `TAGS.UI`, `TAGS.A11Y`
**Steps:**

1. Open `/products`; wait for the "All Products" heading and a product card
2. Run the axe scan
   **Expected:**

- Zero violations

#### #0054 — A product detail page has no WCAG 2 A/AA violations

**Covers:** AC-4
**Tags:** `TAGS.UI`, `TAGS.A11Y`
**Setup:** `Products.list()`; first product's id.
**Steps:**

1. Open `/product_details/<id>`; wait for the product's name heading
2. Run the axe scan
   **Expected:**

- Zero violations

#### #0055 — Cart page with a product has no WCAG 2 A/AA violations

**Covers:** AC-5
**Tags:** `TAGS.UI`, `TAGS.A11Y`
**Setup:** fresh session; `Products.list()` first product.
**Steps:**

1. Add the product from its detail page; wait for the "Added!" modal; click "View Cart"
2. Wait for the product's row to be visible
3. Run the axe scan
   **Expected:**

- Zero violations

#### #0056 — Contact us page has no WCAG 2 A/AA violations

**Covers:** AC-6
**Tags:** `TAGS.UI`, `TAGS.A11Y`
**Steps:**

1. Open `/contact_us`; wait for the "Get In Touch" heading
2. Run the axe scan
   **Expected:**

- Zero violations

## Site changes needed

The scans may report these known problems from the page references. They are not changes to the plan; they are things the site would need if the scans fail:

- Icon-only controls with no name: footer subscribe button (every page), search button on /products, remove "X" in the cart, hero and recommended-items carousel arrows and the slide indicators on /.
- Labels not associated with inputs: Zipcode, payment fields, detail-page "Quantity:", the date-of-birth selects, and review inputs (placeholder only).
- Add to cart anchors with no role; the cart's "Proceed To Checkout" has no href or role.
- Contact file input has no accessible name; the cart modal has no `role="dialog"`.
- Header link names start with an icon glyph (decorative; should be `aria-hidden`).

## Findings (expected failures)

- A page that fails its axe scan stays failing: no `test.fail()`, no `exclude`, no `disableRules`, no pausing of the slider. Each failing page and its violations go on the Findings list as a site bug. Expect some of #0051 to #0056 to fail (see "Site changes needed" for the likely causes).
- The scans keep the WCAG 2.0, 2.1 and 2.2 A/AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`).

## Open questions

- **Logged-in vs logged-out header.** Pages differ by session. The plan scans the login page logged out and the rest as the shared logged-in user (cart: logged out); confirm.
- **Dependency not installed.** `@axe-core/playwright` must be added to `package.json` (devDependencies, latest version) before generation.
