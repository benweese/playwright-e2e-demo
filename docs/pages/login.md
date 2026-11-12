# Login / Signup

**URL:** /login
**Last verified:** 2026-11-10

## Default state on load

Two side-by-side forms, both empty: "Login to your account" and "New User Signup!", separated by an "OR" heading. No URL params are added. Page title: `Automation Exercise - Signup / Login`. Nav shows "Signup / Login" (logged out).

## Layout

- Header nav (links, in order): Home (/), Products (/products), Cart (/view_cart), Signup / Login (/login), Test Cases (/test_cases), API Testing (/api_list), Video Tutorials (external YouTube), Contact us (/contact_us). Link text has a leading icon glyph; match with `getByRole("link", { name: "Signup / Login" })` (substring) or by href.
- Main: h2 "Login to your account", h2 "OR", h2 "New User Signup!".
- Footer: h2 "Subscription" with an email box (placeholder "Your email address", no accessible name beyond that; `data-qa`-less id `susbscribe_email`, sic) and an icon-only submit button (id `subscribe`, accessible name is just an icon glyph), text "Copyright © 2021 All rights reserved".

## Controls

Login form:

- Email: `getByTestId("login-email")` (data-qa; also `getByRole("textbox", { name: "Email Address" })` but that name is shared with the signup email, so prefer the test id). type=email, required.
- Password: `getByTestId("login-password")` (role textbox name "Password"). type=password, required.
- Login button: `getByTestId("login-button")` / `getByRole("button", { name: "Login" })`. Submits to /login; on success redirects to `/` (logged in).

Signup form:

- Name: `getByTestId("signup-name")` (role textbox name "Name"). type=text, required.
- Email: `getByTestId("signup-email")`. type=email, required.
- Signup button: `getByTestId("signup-button")` / `getByRole("button", { name: "Signup" })`. Goes to /signup (see signup.md).

Note: the Playwright test-id attribute for this repo is `data-qa`. The playwright-cli `getByTestId(...)` locator did not match in the CLI (it uses data-testid); use `[data-qa=...]` CSS there.

## URL parameters

None. Form posts to /login (login) and /signup (signup).

## Validation

Browser-native (HTML5) validation blocks submit before any request, with the form staying on /login:

| Trigger                                    | Message (Chromium)                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| Empty required field (any of the 4 inputs) | `Please fill out this field.`                                          |
| Email without "@", e.g. `abc`              | `Please include an '@' in the email address. 'abc' is missing an '@'.` |

Server-side messages (red `<p style="color: red">` inside the relevant form, page stays on /login for login):

- Valid-format email, unknown email or wrong password: `Your email or password is incorrect!` (same text for both cases; shown in `.login-form p` under the Login button).
- Signup with an already-registered email: `Email Address already exist!` (sic). Appears in `.signup-form p`. The URL becomes `/signup` but the page rendered is the login/signup page again (title `Automation Exercise - Signup / Login`).
- Successful login: redirect to `/`, header shows Logout, Delete Account and "Logged in as <name>".

## Empty and error states

See Validation. No other states.

## Notes

- Logged-in header (after login, on any page): Home, Products, Cart, Logout (/logout), Delete Account (/delete_account), Test Cases, API Testing, Video Tutorials, Contact us, then `Logged in as <b>Name</b>` (a `li > a` with no href, so it is not a link role; use `getByRole("listitem").filter({ hasText: "Logged in as Name" })`). Signup / Login is gone.
- Logout link goes to /logout and lands on /login; header returns to the logged-out state.
- Ads: no ad iframes or overlays were present in the DOM in the CLI session on /login (checked after load). Console shows ~5 errors on load (third-party/ad scripts, not examined further). Everything above is site UI, not ad content.
- Refs from `snapshot` change after navigation (prefix like `f2e`); re-snapshot rather than reusing old refs.
