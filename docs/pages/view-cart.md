# Cart

**URL:** /view_cart
**Last verified:** 2026-11-10

## Default state on load

- Page title: `Automation Exercise - Checkout` (not "Cart").
- No URL params are added. The cart belongs to the browser session (cookie); no login needed. It survives a reload and re-navigation.
- Empty cart (fresh session): breadcrumb `Home > Shopping Cart`, then the text `Cart is empty! Click here to buy products.` and nothing else (no table, no Proceed To Checkout in the accessibility tree). `here` is a link to `/products`.
- Cart with items: breadcrumb, `Proceed To Checkout`, then the table.

## Layout

- Header nav (links): Home `/`, Products `/products`, Cart `/view_cart`, Signup / Login `/login`, Test Cases, API Testing, Video Tutorials (external YouTube), Contact us. Link accessible names include a leading icon glyph, e.g. ` Cart`; use `getByRole("link", { name: "Cart" })` (substring match).
- Main: breadcrumb (`Home` link, `Shopping Cart` plain text), `Proceed To Checkout`, `table#cart_info_table`, hidden `#empty_cart` block, hidden `#checkoutModal`.
- Footer: heading `Subscription`, textbox `Your email address`, an unnamed submit button (icon only), `Copyright © 2021 All rights reserved`.
- No h1 on the page.

## Controls

### Empty-state link

- `getByRole("link", { name: "here" })` -> `/products`. Lives in `#empty_cart`; text is `Cart is empty! Click here to buy products.` (`Cart is empty!` is bold).

### Cart table (`#cart_info_table`)

Header row (cells, not `th`): `Item`, `Description`, `Price`, `Quantity`, `Total`, and an unnamed last column.
Each body row is `tr#product-<id>` (id = product id). Examples seen: Blue Top is `product-1`, Men Tshirt is `product-2`.

| Column      | Content                                                                                                  | Locator hint                                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Item        | 80x80 image (`alt="Product Image"`, src `get_product_picture/<id>`) wrapped in a link with an empty href | `row.getByRole("img", { name: "Product Image" })`                              |
| Description | h4 link with product name -> `/product_details/<id>`, then a category paragraph                          | `row.getByRole("link", { name: "Blue Top" })`; `Women > Tops`, `Men > Tshirts` |
| Price       | `Rs. 500` (unit price)                                                                                   | `td.cart_price`                                                                |
| Quantity    | a `button` whose label is the number, class `disabled`; display only, not an editor                      | `row.getByRole("button")`; `td.cart_quantity`                                  |
| Total       | unit price x quantity, `Rs. 1000` for 2 x Rs. 500                                                        | `p.cart_total_price`                                                           |
| (last)      | remove control, see below                                                                                | `a.cart_quantity_delete`                                                       |

Observed rows:

- One product: Blue Top, `Women > Tops`, `Rs. 500`, qty `1`, total `Rs. 500`.
- Several: Blue Top qty `2` total `Rs. 1000`, plus Men Tshirt, `Men > Tshirts`, `Rs. 400`, qty `1`, total `Rs. 400`.
- Adding the same product again increases its quantity on one row (no duplicate row).
- No grand total row is shown.

### Remove (`a.cart_quantity_delete`)

- Cell has no accessible name (an icon `fa-times` inside an anchor with no href, `data-product-id="<id>"`). Locator: `page.locator("#product-1 .cart_quantity_delete")`. A test id or aria-label should be added to the site.
- Click removes the row immediately, no confirmation, no reload, URL unchanged. Removal persists after reload. Removing one product leaves the others.
- Removing the last item: the table hides (`display: none`), `#empty_cart` appears with `Cart is empty! Click here to buy products.`. `Proceed To Checkout` stays visible until the page is reloaded; after a reload it is gone (same as a fresh empty cart).

### Proceed To Checkout (`a.check_out`)

- Text `Proceed To Checkout`. It is an `<a>` with no href and no role, so it does not appear as a link or button in the accessibility tree (snapshot shows a generic). Use `getByText("Proceed To Checkout")` or `locator("a.check_out")`.
- Logged out: opens modal `#checkoutModal` (bootstrap, `modal fade` -> `modal show`). No navigation.
    - Heading `Checkout` (h4, `.modal-title`)
    - Text `Register / Login account to proceed on checkout.`
    - Link `Register / Login` -> `/login`
    - Button `Continue On Cart` (`.close-checkout-modal`): closes the modal, stays on `/view_cart`.
- Logged in behaviour not mapped (no account registered, per run rules).

## URL parameters

None. Cart state is server/session side.

| Control | Param  | Example    |
| ------- | ------ | ---------- |
| (none)  | (none) | /view_cart |

## Validation

None on this page. Quantity cannot be edited here.

## Empty and error states

- Empty: `Cart is empty! Click here to buy products.` Reached by a fresh session, or by removing every row.
- Visiting /view_cart never errors for an empty cart.

## Notes

- Adding from `/products`: clicking `Add to cart` opens a modal with heading `Added!`, text `Your product has been added to cart.`, link `View Cart` (-> `/view_cart`) and button `Continue Shopping`. Each product card exists twice in the DOM (card plus hover overlay), so `getByText("Add to cart").first()` hits the first card (Blue Top). Selector `.productinfo a.add-to-cart[data-product-id="N"]` also works, but clicking it by playwright selector timed out for me; a DOM `.click()` worked. Rapid consecutive adds can race (one quantity came out 3 then 2 after reload), so wait for the `Added!` modal between adds.
- Checkout modal: the first click on `Proceed To Checkout` via a snapshot ref did not open the modal once; a click by `a.check_out` did. Possibly the click landed before page scripts were ready. Assert the modal with a web-first expect.
- Cart is shared by session only; each browser context starts empty, so tests that add products own their cart.
- Ads: on the open page (without the test fixture) the console shows errors for blocked ad/analytics scripts (`pagead2.googlesyndication.com/adsbygoogle.js`, Cloudflare insights beacon, ERR_CERT_AUTHORITY_INVALID) and mixed-content Google Fonts stylesheets. No ad overlay appeared over the cart in this session, but a product-details page opened unexpectedly once after clicking on /products (probably an ad/overlay or mis-click; it showed the real `Added!` modal for Blue Top). The fixture blocks ads; the checkout modal, `Added!` modal and cart table are part of the site.
- Product details link in the cart goes to `/product_details/<id>`; the item image link has an empty href (reloads the cart page).
