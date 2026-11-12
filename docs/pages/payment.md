# Payment and order placed

**URL:** /payment, then /payment_done/<amount>
**Last verified:** 2026-11-10

## Default state on load

/payment: breadcrumb "Home > Payment", `h2` "Payment", five empty fields, and "Pay and Confirm Order". The first field is not auto-focused. No URL params. Reached by "Place Order" on /checkout.

## Layout

- /payment: header (logged in), `form#payment-form` (POST to `/payment`) with labels "Name on Card", "Card Number", "CVC", "Expiration"; Pay button; footer Subscription block.
- Order placed (`/payment_done/500` for a Rs. 500 cart; the number is the order total): `h2[data-qa=order-placed]` "Order Placed!" (green), text "Congratulations! Your order has been confirmed!", links "Download Invoice" and "Continue".

## Controls

All fields are plain text inputs with `required` and no maxlength, pattern or type restriction. The labels are NOT associated with the inputs (no `for`), so `getByLabel` will not work; use test ids.

- Name on Card: `getByTestId("name-on-card")`, name `name_on_card`. Example "Test User".
- Card Number: `getByTestId("card-number")`, name `card_number`. Example 4111111111111111.
- CVC: `getByTestId("cvc")`, name `cvc`, placeholder "ex. 311".
- Expiration month: `getByTestId("expiry-month")`, name `expiry_month`, placeholder "MM".
- Expiration year: `getByTestId("expiry-year")`, name `expiry_year`, placeholder "YYYY".
- Pay and Confirm Order: `getByTestId("pay-button")` or `getByRole("button", { name: "Pay and Confirm Order" })`; `#submit`. Submits the form.
- Download Invoice: `getByRole("link", { name: "Download Invoice" })`, href `/download_invoice/<amount>`. Stays on the page and downloads `invoice.txt` containing: `Hi <first> <last>, Your total purchase amount is 500. Thank you` (e.g. "Hi Map Tester, Your total purchase amount is 500. Thank you").
- Continue: `getByTestId("continue-button")`, link to `/` (home). The cart is emptied after the order.

## URL parameters

| Control               | Param                      | Example               |
| --------------------- | -------------------------- | --------------------- |
| Pay and Confirm Order | path segment = order total | /payment_done/500     |
| Download Invoice      | path segment = order total | /download_invoice/500 |

## Validation

- Submitting with all fields empty: browser-native `required` validation, blocks submit, stays on /payment, focus goes to Name on Card. Message on every empty field: "Please fill out this field." (Chromium text; no site-rendered message).
- No format validation at all. Name "Test User", card number "abcd", CVC "1", month "99", year "1999" (invalid and expired) was accepted and the order was placed. Valid-looking fake data (4111111111111111, 123, 12/2030) is not required.
- A hidden alert "Your order has been placed successfully!" exists in the /payment DOM (not visible on success; the confirmation is the page change).

## Empty and error states

- Opening /payment directly with an empty cart (or logged out) still renders the form; no redirect (observed).
- No decline or error message was reachable.

## Notes

- Order placed text, exact: "ORDER PLACED!" (CSS uppercase of "Order Placed!"), "Congratulations! Your order has been confirmed!".
- Footer holds a hidden alert "You have been successfully subscribed!" (subscription block), unrelated to the order.
- Ads: none seen during the survey. Console showed 5 errors per page (third-party, not part of the flow).
- The order is not listed anywhere after placement that was checked; no order id is shown.
