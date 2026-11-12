# Products

**URL:** /products
**Last verified:** 2026-11-10

## Default state on load

- Title: "Automation Exercise - All Products". Heading `All Products` (level 2; displayed uppercase as ALL PRODUCTS).
- 34 products in the grid, no pagination. The search box is empty. The URL gets no params.
- The cart modal (`#cartModal`) is in the DOM but hidden (`display: none`).
- Console shows 5 errors on load (mixed-content Google Fonts stylesheets; cloudflareinsights and adsbygoogle scripts fail with ERR_CERT_AUTHORITY_INVALID). They come from fonts and ad/analytics scripts, not from the site's own logic.

## Layout

- Header nav links: Home (/), Products (/products), Cart (/view_cart), Signup / Login (/login), Test Cases (/test_cases), API Testing (/api_list), Video Tutorials (youtube), Contact us (/contact_us).
- Search bar under the header: image, textbox, search button.
- Left sidebar: `Category` (Women, Men, Kids; in-page collapsible links `#Women`, `#Men`, `#Kids`) and `Brands` (links `/brand_products/<name>` with counts, e.g. "(6) Polo", "(5) H&M", "(5) Madame", "(3) Mast & Harbour", "(4) Babyhug", "(3) Allen Solly Junior", "(3) Kookie Kids", "(5) Biba").
- Main: heading, then a grid of product cards. Footer starts with a `SUBSCRIPTION` section.

## Controls

### Search box

- `getByRole("textbox", { name: "Search Product" })` (also `#search_product`, `name="search"`, placeholder "Search Product").
- Free text, empty by default. After searching, the box keeps the typed value.

### Search button

- No accessible name: it is `<button type="button" id="submit_search">` containing only a search icon. Snapshot shows `button ""`. Locate with `locator("#submit_search")`; recommend the site add a `data-qa` or aria-label.
- Searching is done by this click; it is not a form submit (button type is "button"). Enter-key behaviour was not tested.

### Product card (each product appears twice in the DOM)

- `.product-image-wrapper` per product. Inside: a visible `.productinfo` block (image alt "ecommerce website products", price heading `Rs. 500`, name paragraph, "Add to cart") and a hover overlay (`.overlay-content`) repeating price, name and another "Add to cart". Because of the duplicate, `getByText("Blue Top")` and `getByRole("link", { name: "Add to cart" })` style locators match two elements per product; scope to `.productinfo` or use `.first()`.
- Add to cart: `<a class="btn add-to-cart" data-product-id="1">`, no href, role is not link/button (snapshot shows a generic element with text "Add to cart"). Locate with `locator('a.add-to-cart[data-product-id="1"]')` or `getByText("Add to cart")` scoped. Click opens the modal below. Stays on /products.
- View Product: `getByRole("link", { name: "View Product" })`, href `/product_details/<id>` (id 1 = Blue Top). One per card, outside the overlay.
- Product image src: `/get_product_picture/<id>`.
- Sample first cards: Blue Top Rs. 500, Men Tshirt Rs. 400. Last prices seen: Rs. 1389, Rs. 1400.

### "Added!" modal (`#cartModal`)

- Appears after Add to cart. Heading `Added!` (level 4), text `Your product has been added to cart.`
- `getByRole("link", { name: "View Cart" })` goes to `/view_cart`.
- `getByRole("button", { name: "Continue Shopping" })` closes the modal (display none), URL unchanged.
- Add to cart works without logging in.

## URL parameters

| Control            | Param                  | Example                       |
| ------------------ | ---------------------- | ----------------------------- |
| Search button      | `search`               | `/products?search=top`        |
| Search, multi-word | `search` (URL-encoded) | `/products?search=blue%20top` |
| Search, empty      | `search=` (empty)      | `/products?search=`           |

## Validation

- No validation message exists. An empty or whitespace-only search is accepted and not blocked: the URL becomes `/products?search=` and the page shows the full list (heading `All Products`, 34 products). Whitespace is trimmed (typing two spaces gave `search=`).

## Empty and error states

- Search results heading: `Searched Products` (level 2; displayed SEARCHED PRODUCTS).
- Searches seen: `top` and `TOP` both gave 14 products (case-insensitive; names matched: Blue Top, Winter Top, Summer White Top, Madame Top For Women, Fancy Green Top, Sleeves Printed Top - White, ... Lace Top For Women); `blue top` gave 1.
- No matches (e.g. `zzzxqj`, `<b>x`): URL `/products?search=zzzxqj`, heading `Searched Products` and no cards, 0 products. There is no "no results" text at all.

## Notes

- Ads: no ad iframes or `ins` elements were present in the DOM in this session (the adsbygoogle script failed to load). Ad overlays were not met. Anything from Google ads is third-party; the fixture blocks those. The cart modal, overlays and sidebar are site features.
- Refs in `playwright-cli` snapshots change after the search navigates (e.g. `e40` becomes `f1e40`); re-snapshot after each search.
- The search results page is the same `/products` path, with a full page reload.
- Product names are not unique in the DOM because of the overlay duplicate; counts of `.product-image-wrapper` are the reliable product count.
