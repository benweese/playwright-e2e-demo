# Product details

**URL:** /product_details/:id (e.g. /product_details/1)
**Last verified:** 2026-11-10

## Default state on load

- Page title: `Automation Exercise - Product Details`. The site adds no URL parameters.
- `/product_details/1` shows Blue Top: Women > Tops, Rs. 500, In Stock, New, brand Polo. Quantity is `1`. The review form is empty and the success message is hidden.
- The page has no login requirement. A guest can add to cart and write a review.

## Layout

- Header nav: Home (/), Products (/products), Cart (/view_cart), Signup / Login (/login), Test Cases, API Testing, Video Tutorials (external, YouTube), Contact us.
- Left sidebar: `Category` (Women, Men, Kids) and `Brands` (Polo, H&M, Madame, Mast & Harbour, Babyhug, Allen Solly Junior, Kookie Kids, Biba), each with a count.
- Main: `.product-details` block with the picture (`/get_product_picture/1`, alt "ecommerce website products") and `.product-information`:
    - "new" arrival badge image
    - `h2` product name (`Blue Top`)
    - `Category: Women > Tops`
    - rating image (static, not interactive)
    - price `Rs. 500` (a plain `span`, no heading or test id)
    - `Quantity:` label, number input, `Add to cart` button
    - `Availability: In Stock`
    - `Condition: New`
    - `Brand: Polo`
- Tab area titled `Write Your Review` (the only tab) with the review form.
- Footer: `Subscription` email form (also posts to /contact_us).

## Controls

Product fields have no test ids; the label text and value share one `p` element.

- Name: `getByRole("heading", { level: 2, name: "Blue Top" })`. Narrow it with `.product-information` if the id may vary, because other `h2` elements (Category, Brands, Subscription) are on the page.
- Category, Availability, Condition, Brand: `locator(".product-information").getByText("Category: Women > Tops")`, `getByText("Availability: In Stock")`, `getByText("Condition: New")`, `getByText("Brand: Polo")`. The label is in a `<b>`, so use a partial or regex text match.
- Price: `locator(".product-information span span")` with text `Rs. 500`. It has no accessible role; use `getByText("Rs. 500")` inside `.product-information`.
- Quantity: `getByRole("spinbutton")` or `locator("#quantity")` (`<input type="number" name="quantity" id="quantity" value="1" min="1">`). The `Quantity:` label is not tied to the input with `for`, so `getByLabel("Quantity:")` will not work. A hidden `#product_id` holds the id.
- Add to cart: `getByRole("button", { name: "Add to cart" })`. It is a `type="button"` (not a form submit) with class `cart`. It sends `GET /add_to_cart/:id?quantity=<value>` and opens the cart modal.
- Cart modal `#cartModal` (Bootstrap fade modal):
    - Title `Added!`
    - Body `Your product has been added to cart.`
    - Link `View Cart` (`getByRole("link", { name: "View Cart" })`, goes to /view_cart)
    - Button `Continue Shopping` (`getByRole("button", { name: "Continue Shopping" })`, closes the modal)
    - The modal is in the DOM on load, hidden. Use `locator("#cartModal")` for the dialog; it has no `role="dialog"` name.
- Review form `#review-form`:
    - Name: `getByPlaceholder("Your Name")` (`#name`, required, type text)
    - Email: `getByPlaceholder("Email Address")` (`#email`, required, type email)
    - Review: `getByPlaceholder("Add Review Here!")` (`#review`, required textarea)
    - Submit: `getByRole("button", { name: "Submit" })` (`#button-review`)
    - None of these has an accessible name other than the placeholder.
    - The tab heading `Write Your Review` is a link: `getByRole("link", { name: "Write Your Review" })`.

## Quantity behaviour

The input is not inside a `<form>`, so the browser does not enforce `min="1"`. The page does not validate it. `Add to cart` always sends whatever is in the box.

| Input | Input value                                                                                                                                          | `validity.valid` | Request sent                  | Modal                                                                       |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------- | --------------------------------------------------------------------------- |
| `0`   | `0`                                                                                                                                                  | false            | `/add_to_cart/1?quantity=0`   | "Added!" shown                                                              |
| `-1`  | `-1`                                                                                                                                                 | false            | `/add_to_cart/1?quantity=-1`  | "Added!" shown                                                              |
| `2.5` | `2.5`                                                                                                                                                | false            | `/add_to_cart/1?quantity=2.5` | request sent; modal text is in the DOM but `display` was `none` after 1.5 s |
| empty | empty                                                                                                                                                | true             | `/add_to_cart/1?quantity=`    | request sent; modal `display` was `none` after 1.5 s                        |
| `3`   | `3`                                                                                                                                                  | true             | `/add_to_cart/1?quantity=3`   | "Added!" shown                                                              |
| `abc` | `fill` is refused by Playwright ("Cannot type text into input[type=number]"); a real keyboard cannot enter letters either, except `e`, `+`, `-`, `.` | n/a              | n/a                           | n/a                                                                         |

I did not verify what the cart ends up holding for 0, -1, 2.5 or empty. The cart is shared by every session on this browser, so its contents were not trustworthy. Check `/view_cart` in a spec that owns the cart.

## URL parameters

| Control    | Param                            | Example              |
| ---------- | -------------------------------- | -------------------- |
| Product id | path segment `:id` (integer)     | `/product_details/1` |
| (none)     | no query string is added or read |                      |

## Validation

Review form uses native browser validation (HTML `required`, `type=email`). No custom text. It blocks submit and no request is sent.

- All three empty: Chromium shows `Please fill out this field.` on the first empty field (Name). `validationMessage` is the same on Name, Email and Review.
- Email without `@`, e.g. `notanemail`: `Please include an '@' in the email address. 'notanemail' is missing an '@'.`
- Quantity: no validation message (see above).

## Success message

Submit with a name, a valid `@example.com` address and a review: no page reload (URL unchanged). `#review-section` loses its `hide` class and shows a green alert, `Thank you for your review.` (`getByText("Thank you for your review.")`). The form fields stay on the page. It was not checked whether the fields are cleared.

## Empty and error states

- Id that does not exist but is an integer, e.g. `/product_details/9999` or `/product_details/0`: HTTP 200, title `Automation Exercise - Product Details`, page renders with blanks: empty `<h2></h2>`, `Category: `, `Quantity:`, `Add to cart`, `Availability: In Stock`, `Condition: New`, `Brand: ` and picture `src="/get_product_picture/"`. The review form is still there. There is no "not found" text.
- Non-numeric id, e.g. `/product_details/abc`: HTTP 404, title `Page not found at /product_details/abc`, Django debug page: `Page not found (404)`, with the URL patterns list (`product_details/<int:product_id>`).
- Negative id `/product_details/-1`: HTTP 404 (no `<int>` match). Once during mapping it returned a 503 page, `This website is under heavy load (queue full)`; that is the site being overloaded, not the route.

## Notes

- Ads: the page did not show a visible ad overlay while mapping in Chromium without the ad-blocking fixture. Console showed 5 errors on load (likely blocked ad/tracking requests). Ad-related, not part of the site: any `iframe`, `ins` or `adsbygoogle` elements (none found) and the 5 console errors. Part of the site: `#cartModal`, nav, sidebar, subscription form.
- My own session was navigated away from the page several times (to /products and /view_cart) by something other than my commands. Other mappers shared the same browser cookies and probably some state; I could not tell whether an ad script or another session caused it. Specs should assert the URL after each action.
- The cart is cookie-based and shared across the session. Do not assert cart contents you did not create.
- Product data (name, price) can be changed by the site owners; ids 1 to about 43 exist.
- The modal fades in; `Added!` is visible only after the request returns. Use `expect(...).toBeVisible()` rather than a fixed wait.
- Elements with no accessible name or test id: the price span, `Quantity:` label (not linked to the input), the category/availability/condition/brand `p` elements, and the review inputs (placeholder only). Adding `data-qa` attributes to the site would help.
