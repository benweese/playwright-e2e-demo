# Account (register, delete, login, logout) — UI test plan

**Source:** https://automationexercise.com/test_cases, Test Cases 1, 2, 3, 4, 5 (wording below is the page's own)
**Page reference:** `docs/pages/login.md`, `docs/pages/signup.md`, `docs/pages/home.md`
**Spec file:** `tests/ui/specs/account.spec.ts` (create; `tests/ui/specs/` is empty)
**Files:** reuse `loginLocators` / `LoginPage` (extend with `signup(name, email)`, `expectLoginError`, `expectSignupError`); create `locators/signupLocators.ts` + `pages/SignupPage.ts` (account form, Account Created, Account Deleted), `locators/headerLocators.ts` + `pages/HeaderComponent.ts` (Logged in as, Logout, Delete Account; shared by every plan), `pages/HomePage.ts` (`open`, `expectVisible`, `expectLoggedInAs`), `Accounts` + `buildAccount` (API setup and cleanup)

Session rule: every scenario here uses `test.use({ storageState: { cookies: [], origins: [] } })` and its own account. None touches the shared account from `tests/setup`.

## Acceptance criteria

1. **AC-1** (TC1) — Register User: "Verify 'New User Signup!' is visible"; after "Enter name and email address" and "Signup", "Verify that 'ENTER ACCOUNT INFORMATION' is visible"; after filling the details and "Create Account", "Verify that 'ACCOUNT CREATED!' is visible"; after "Continue", "Verify that 'Logged in as username' is visible".
2. **AC-2** (TC1) — Delete Account: "Click 'Delete Account' button. Verify that 'ACCOUNT DELETED!' is visible and click 'Continue' button".
3. **AC-3** (TC2) — Login User with correct email and password: "Verify 'Login to your account' is visible", then after login "Verify that 'Logged in as username' is visible".
4. **AC-4** (TC3) — Login User with incorrect email and password: "Verify error 'Your email or password is incorrect!' is visible".
5. **AC-5** (TC4) — Logout User: "Click 'Logout' button. Verify that user is navigated to login page".
6. **AC-6** (TC5) — Register User with existing email: "Verify error 'Email Address already exist!' is visible".
7. **AC-7** (derived, not in the site's cases; Approved by repo owner) — The login form does not submit without an email and password (native required validation).

## Already covered

| id   | Description                                                                                                               | Skip / Extend |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | ------------- |
| none | `tests/ui/specs/` has no specs. `tests/setup/auth.setup.ts` logs in through `LoginPage` but is setup, not a test of AC-3. | Create        |

## Scenarios

### Register and delete (test.describe)

#### #0019 — Register a new user through the UI, then delete the account

**Covers:** AC-1, AC-2
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Build an account with `buildAccount()` (unique email, fake data; not created through the API)
2. Open `/`
3. Click "Signup / Login" in the header
4. Enter the account's name and email in the "New User Signup!" form and click "Signup"
5. Fill Title, Password, Date of Birth (day, month, year), tick "Sign up for our newsletter!" and "Receive special offers from our partners!"
6. Fill First name, Last name, Company, Address, Address 2, Country, State, City, Zipcode, Mobile Number from the same account
7. Click "Create Account"
8. Click "Continue" on the Account Created page
9. Click "Delete Account" in the header
10. Click "Continue" on the Account Deleted page
    **Expected:**

- After step 3: the "New User Signup!" heading is visible
- After step 4: the "Enter Account Information" heading is visible
- After step 7: "Account Created!" is visible
- After step 8: header shows "Logged in as <account name>"
- After step 9: "Account Deleted!" is visible
- After step 10: URL is `/` and the header shows "Signup / Login" (logged out)
  **Cleanup:** `Accounts.remove(email, password)` in `finally`, in case the test fails midway. Do not assert its result: after a successful UI delete the API reports "Account not found!" with HTTP 200.

### Login (test.describe)

#### #0020 — Log in with a correct email and password

**Covers:** AC-3
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Setup:** `Accounts.create(buildAccount())`, expect 201. Delete in `finally`.
**Steps:**

1. Open `/login`
2. Check the "Login to your account" heading
3. Enter the account's email and password
4. Click "Login"
   **Expected:**

- "Login to your account" is visible at step 2
- URL is `/`
- Header shows "Logged in as <account name>", "Logout" and "Delete Account"; "Signup / Login" is not shown

#### #0021 — A wrong password for a real account shows an error

**Covers:** AC-4
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** as #0020.
**Steps:**

1. Open `/login`
2. Enter the account's email and a different password (fresh faker value)
3. Click "Login"
   **Expected:**

- "Your email or password is incorrect!" is visible in the login form
- URL is still `/login`; header shows "Signup / Login" and no "Logged in as"

#### #0022 — An email that is not registered shows an error

**Covers:** AC-4
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/login`
2. Enter a unique unregistered email (`buildAccount().email`) and any password
3. Click "Login"
   **Expected:**

- "Your email or password is incorrect!" is visible
- URL is still `/login`; no "Logged in as" in the header
  (No account is created, so nothing to clean up.)

#### #0023 — Login cannot be submitted with empty fields

**Approved by repo owner** (derived scenario).
**Covers:** AC-7
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/login`
2. Click "Login" with both fields empty
   **Expected:**

- URL is still `/login`
- The login email field is invalid (has a non-empty `validationMessage`; do not assert the browser's exact wording)
- "Your email or password is incorrect!" is not shown (no request was sent)

### Logout (test.describe)

#### #0024 — Logging out returns to the login page

**Covers:** AC-5
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Setup:** API account as #0020; log in through `LoginPage` (hard assertion that "Logged in as" shows, since the next step depends on it).
**Steps:**

1. Click "Logout" in the header
   **Expected:**

- URL is `/login`
- "Login to your account" is visible
- Header shows "Signup / Login"; "Logout" and "Logged in as" are gone

### Register with an existing email (test.describe)

#### #0025 — Signing up with an already registered email shows an error

**Covers:** AC-6
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Setup:** API account as #0020.
**Steps:**

1. Open `/login`
2. In "New User Signup!", enter any name and the existing account's email
3. Click "Signup"
   **Expected:**

- "Email Address already exist!" is visible in the signup form
- The "Enter Account Information" heading is not shown

## Site changes needed

- Signup date-of-birth selects and the Zipcode input have wrong or missing label association; the plan uses `getByTestId` (`days`, `months`, `years`, `zipcode`), which exists. No change strictly required.
- "Logged in as <name>" is an `li > a` with no href; use the `listitem` filter from `tests/ui/CLAUDE.md`. No change required.
- Error paragraphs on /login (`Your email or password is incorrect!`, `Email Address already exist!`) have no role or test id. Plan: `getByText` on the exact message inside the form's container (`getByRole("form")` is not available as the forms have no name). Best allowed locator is `getByText(message)`; each message appears once per page, so this is unique. A `role="alert"` on them would help.

## Open questions

- **Account Created / Deleted URLs.** Page ref says `/delete_account` has the title "Automation Exercise - Account Created". The plan does not assert titles. Is that a site bug to report?
- **Password rules.** No password strength or format validation was observed. No scenario is planned; confirm there is no intended rule.
- **Duplicate-email URL.** After "Email Address already exist!" the URL becomes `/signup` but renders the login page. Not asserted; confirm intended.
- **TC2 and TC4 also say "Delete Account" / login on the shared site.** The plan deletes accounts through the API instead; account deletion through the UI is covered only by #0019.
