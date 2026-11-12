# Checkout

**URL:** /checkout
**Last verified:** 2026-11-10

## Default state on load

Reached from the cart's "Proceed To Checkout" link (`a.check_out` on /view_cart) while logged in. No URL params are added. Breadcrumb "Home > Checkout". Page order: Address Details, Review Your Order, comment box, Place Order, then the footer Subscription block.

The page is not guarded: with an empty cart, or logged out, /checkout still renders (see Empty and error states). Always put a product in the cart first.

## Layout

- Header nav (logged in): Home, Products, Cart, Logout, Delete Account, Test Cases, API Testing, Video Tutorials, Contact us, plus "Logged in as <name>".
- `h2` "Address Details" with two blocks:
    - `#address_delivery`, heading "YOUR DELIVERY ADDRESS"
    - `#address_invoice`, heading "YOUR BILLING ADDRESS"
      Each lists, in order: ". <first> <last>" (note the leading ". "), company, address line 1, address line 2, "<city> <state> <zip>", country, mobile number. Both show the account's registered address.
- `h2` "Review Your Order": table with columns Item, Description, Price, Quantity, Total. Row example: image (alt "Product Image"), link "Blue Top" (`/product_details/1`), category "Women > Tops", "Rs. 500", quantity "1", total "Rs. 500". Final row "Total Amount" "Rs. 500".
- Text: "If you would like to add a comment about your order, please write it in the field below."
- Comment textarea, then "Place Order" link.

## Controls

- Delivery / billing address blocks: read-only text. Locators: `locator("#address_delivery")`, `locator("#address_invoice")`.
- Product name link: `getByRole("link", { name: "Blue Top" })`, goes to `/product_details/<id>`.
- Comment box: `locator("textarea[name=message]")`. Has NO accessible name, label, placeholder, id or data-qa; needs a test id or label added to the site. Optional, not required, no max length, 6 rows. Default empty.
- Place Order: `getByRole("link", { name: "Place Order" })`. It is an `<a href="/payment" class="btn btn-default check_out">`, a link not a button, no data-qa. Navigates to /payment. The comment text is not sent with the link (plain GET); the comment is not shown anywhere afterwards.

## URL parameters

None.

## Validation

None. Place Order always navigates, with or without a comment.

## Empty and error states

- Empty cart (e.g. after finishing an order, or logged out): page still renders, address blocks show only "." under each heading (logged out) or the account address (logged in), the order table has no item rows, "Total Amount" shows "Rs. 0", and Place Order still goes to /payment.
- Logged out: no redirect to /login; header shows "Signup / Login".

## Notes

- No ad overlays appeared on this page during the survey (the browser session did not use the test fixture's ad blocking, so ads are not ruled out on other runs). The console shows 5 errors on every page of the site; they are third-party/ad related, not part of the flow.
- Prices are in "Rs.".
- Address data comes from the registration; to assert it, use the values you registered with.
