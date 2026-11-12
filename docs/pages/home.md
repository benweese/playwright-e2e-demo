# Home

**URL:** /
**Last verified:** 2026-11-10

Mapped logged out, in an unauthenticated headless chromium session, no ad blocking applied.

## Default state on load

- Title: `Automation Exercise`. No URL params or redirects are added.
- Hero slider shows slide 1 of 3; Category accordion is fully collapsed; Subscription input is empty.
- Console shows 5 errors on load (mixed-content Google Fonts stylesheets blocked, and `cloudflareinsights` and `pagead2.googlesyndication.com` (AdSense) scripts failing with ERR_CERT_AUTHORITY_INVALID). They are site/ad noise, not test failures.

## Layout

- **banner (header):** logo link (img alt `Website for automation practice`, to `/`) and the nav list.
- **Hero slider** (`#slider-carousel`, 3 slides, each with the same content): h1 `AutomationExercise`, h2 `Full-Fledged practice website for Automation Engineers`, paragraph `All QA engineers can use this website for automation practice and API testing either they are at beginner or advance level. This is for everybody to help them brush up their automation skills.`, buttons `Test Cases` (link to `/test_cases`) and `APIs list for practice` (link to `/api_list`). Prev/next arrows are links to `#slider-carousel` with no accessible name; 3 indicator `listitem`s with no name.
- **Left sidebar:** h2 `Category` (accordion), h2 `Brands` (list).
- **Main column:** h2 `Features Items` (34 product cards), then h2 `recommended items` (carousel).
- **contentinfo (footer):** h2 `Subscription`, email form, `Copyright © 2021 All rights reserved`.

## Controls

### Header nav

All are links in the banner. The accessible name includes a leading icon glyph (private-use character), so match with a regex or `exact: false`, e.g. `getByRole("link", { name: /Products/ })`, or scope to `getByRole("banner")`.

| Link text       | href                                                      |
| --------------- | --------------------------------------------------------- |
| Home            | `/`                                                       |
| Products        | `/products`                                               |
| Cart            | `/view_cart`                                              |
| Signup / Login  | `/login`                                                  |
| Test Cases      | `/test_cases`                                             |
| API Testing     | `/api_list`                                               |
| Video Tutorials | `https://www.youtube.com/c/AutomationExercise` (external) |
| Contact us      | `/contact_us`                                             |

Logged-in nav (Logout, Delete Account, "Logged in as") was not mapped here.

### Category sidebar

- Three accordion headings, each a link: `Women` (`#Women`), `Men` (`#Men`), `Kids` (`#Kids`). Rendered uppercase by CSS (`innerText` is `WOMEN`); the DOM text is `Women`. Locator: `getByRole("link", { name: /Women/ })`.
- All start collapsed (`panel-collapse collapse`). Clicking one expands it (`panel-collapse in`). It is a real accordion: opening Kids collapses Women.
- Sub-links (hidden until expanded; link text has a trailing space):
    - Women: `Dress` `/category_products/1`, `Tops` `/category_products/2`, `Saree` `/category_products/7`
    - Men: `Tshirts` `/category_products/3`, `Jeans` `/category_products/6`
    - Kids: `Dress` `/category_products/4`, `Tops & Shirts` `/category_products/5`
- "Dress" appears under both Women and Kids, so scope by panel: `locator("#Women").getByRole("link", { name: "Dress" })`.
- Following Women > Dress goes to `/category_products/1`; heading `WOMEN - DRESS PRODUCTS` (h2.title), breadcrumb `Products Women > Dress`.

### Brands sidebar

Links `(count) Name` to `/brand_products/<Name>`; the count is in a span before the name, so the accessible name is e.g. `(6) Polo`. Counts at mapping time (will drift):
Polo (6), H&M (5), Madame (5), Mast & Harbour (3), Babyhug (4), Allen Solly Junior (3), Kookie Kids (3), Biba (5).
`/brand_products/Polo` has title `Automation Exercise - Polo Products` and heading `BRAND - POLO PRODUCTS`.

### Features Items

- 34 cards (`.features_items .product-image-wrapper`), ids 1-8, 11-14, ... up to 43 (not contiguous). First: `Blue Top` Rs. 500 (id 1), `Men Tshirt` Rs. 400 (2), `Sleeveless Dress` Rs. 1000 (3), `Stylish Dress` Rs. 1500 (4), `Winter Top` Rs. 600 (5), `Summer White Top` Rs. 400 (6), `Madame Top For Women` Rs. 1000 (7), `Fancy Green Top` Rs. 700 (8); last: `GRAPHIC DESIGN MEN T SHIRT - BLUE` Rs. 1389 (43).
- Each card contains the image (alt `ecommerce website products`), h2 price `Rs. N`, name paragraph, and `Add to cart`, plus a duplicate hover overlay with the same price, name and `Add to cart`. So each name/price/Add to cart text appears twice in the DOM; the overlay copy is only visible on hover. Duplicate text breaks strict locators: use `.first()` or scope to a card.
- `Add to cart` is an `<a class="btn btn-default add-to-cart" data-product-id="N">` with no href; the snapshot shows it as a generic, not a link or button. Locator: `locator('a.add-to-cart[data-product-id="1"]').first()`. Its behaviour (modal, cart) was not exercised here.
- `View Product` link per card: `/product_details/<id>`, name `View Product` (with icon glyph).

### Recommended items

h2 `recommended items`; carousel of 6 cards (3 per slide) such as `Stylish Dress` Rs. 1500, `Winter Top` Rs. 600, `Summer White Top` Rs. 400. They have `Add to cart` but no View Product link. Prev/next links point to `#recommended-item-carousel` and have no accessible name.

### Subscription (footer)

- Heading: `Subscription` (h2).
- Email input: `getByRole("textbox", { name: "Your email address" })` (id `susbscribe_email` (sic), `type=email`, `required`, placeholder `Your email address`).
- Submit button: icon-only `<button type="submit" id="subscribe">` with no accessible name. Use `locator("#subscribe")` (needs a test id or aria-label added to the site for a proper role locator).
- Helper text: `Get the most recent updates from our site and be updated your self...`
- Success message: `You have been successfully subscribed!` in `#success-subscribe` (`.alert-success`).

## URL parameters

| Control           | Param                                   | Example                |
| ----------------- | --------------------------------------- | ---------------------- |
| Category sub-link | path id                                 | `/category_products/1` |
| Brand link        | path name                               | `/brand_products/Polo` |
| View Product      | path id                                 | `/product_details/1`   |
| Subscription      | none (submitted by AJAX; URL stays `/`) |                        |

## Validation

Subscription uses native browser validation only (no custom text on the page). Messages are Chromium's, from `validationMessage`; they appear as a browser bubble, not in the DOM:

| Input                                                                                                                    | Message                                                                       | Blocks?                         |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------- |
| empty                                                                                                                    | `Please fill out this field.`                                                 | Yes; no request, success hidden |
| `notanemail`                                                                                                             | `Please include an '@' in the email address. 'notanemail' is missing an '@'.` | Yes                             |
| `abc@`                                                                                                                   | `Please enter a part following '@'. 'abc@' is incomplete.`                    | Yes                             |
| Assert with `toHaveJSProperty("validationMessage", ...)` or check the field is invalid; the text may differ per browser. |

## Empty and error states

- Subscribe with a valid email (tested with a made-up `@example.com` address): the input clears and `You have been successfully subscribed!` appears. **It is visible for only about 1 second**: sampled at 0 and 500 ms it was displayed (`#success-subscribe` has no `hide` class); by 1000 ms it was hidden again (`hide` class back, display none) and stays hidden. Assert it with a web-first `toBeVisible()` immediately after the click; do not do other waits first. Duplicate subscription of the same address was not tried.
- No error text was seen for a rejected address; the server was not asked to reject any.

## Notes

- Ads: no ad overlay or iframe blocked clicks in this session. The AdSense and Cloudflare scripts fail to load here (certificate errors), and `fixtures/test` also blocks them. The ad-related items are those two scripts only; everything above is part of the site.
- Snapshot refs for the footer showed an `f3` frame prefix after a second `goto`; it still clicked fine. Prefer CSS/role locators over refs.
- Hero slider auto-rotates, all 3 slides have identical text, so asserting on the heading can match three elements; scope to the `.item.active` slide.
- Elements with no accessible name (need a test id or label): subscribe button, slider and recommended-carousel prev/next links, slider indicators, `Add to cart` anchors (no role).
- Copyright text is `Copyright © 2021 All rights reserved`.
