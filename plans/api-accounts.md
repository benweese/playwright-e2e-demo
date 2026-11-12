# Accounts API — API test plan

**Source:** https://automationexercise.com/api_list, APIs 7 to 14 (wording below is the page's own)
**Spec file:** `tests/api/accounts/accounts.spec.ts` (create)
**Clients:** Accounts (`api/AccountsClient.ts`)

## Acceptance criteria

1. **AC-1** (API 7) — POST /verifyLogin with `email` and `password` of an existing account returns Response Code 200 with the message "User exists!"
2. **AC-2** (API 8) — POST /verifyLogin without the `email` parameter (only `password`) returns Response Code 400 with the message "Bad request, email or password parameter is missing in POST request."
3. **AC-3** (API 9) — DELETE /verifyLogin returns Response Code 405 with the message "This request method is not supported."
4. **AC-4** (API 10) — POST /verifyLogin with invalid `email` and `password` values returns Response Code 404 with the message "User not found!"
5. **AC-5** (API 11) — POST /createAccount with name, email, password, title, birth_date, birth_month, birth_year, firstname, lastname, company, address1, address2, country, zipcode, state, city, mobile_number returns Response Code 201 with the message "User created!"
6. **AC-6** (API 12) — DELETE /deleteAccount with `email` and `password` returns Response Code 200 with the message "Account deleted!"
7. **AC-7** (API 13) — PUT /updateAccount with the same parameters as createAccount returns Response Code 200 with the message "User updated!"
8. **AC-8** (API 14) — GET /getUserDetailByEmail with `email` returns Response Code 200 with the JSON "User Detail".

## Clients to add

- `api/AccountsClient.ts` — `verifyLoginWithoutEmail(password)` → `POST /verifyLogin` with only `password`, typed `ApiEnvelope`
- `api/AccountsClient.ts` — `verifyLoginWithDelete()` → `DELETE /verifyLogin` (no body), typed `ApiEnvelope`
- Existing `create`, `verifyLogin`, `remove`, `update`, `getByEmail` cover APIs 7, 10, 11, 12, 13, 14. `UserDetail` in `api/types.ts` may need its fields confirmed against the generated schema (for example `birth_day` versus the `birth_date` request field).

## Helpers

- Reuse: `buildAccount()` (`payloads/accountPayload.ts`), `expectResponseCode`, `validateJsonSchema`, `generateTestDescription`, `TAGS`
- Create: none. Verify-login scenarios share one account from a `beforeAll` (`buildAccount()`, `Accounts.create`, `expectResponseCode(..., 201)`) deleted in `afterAll`; #0017 and #0018 share a second one the same way. #0015 and #0016 build their own.
- Schemas to generate and review: `accounts/apiMessage` (the `{responseCode, message}` body, used by every scenario except #0018), `accounts/userDetail` (also used by #0017's read-back)

## Already covered

| id   | Description                                                            | Skip / Extend |
| ---- | ---------------------------------------------------------------------- | ------------- |
| none | no account tests exist (UI setup in `tests/setup/` is not an API test) | n/a           |

## Scenarios

### Verify login (test.describe)

Uses the shared account from `beforeAll`.

#### #0011 — verifyLogin with valid details finds the user

**Covers:** AC-1
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Accounts.verifyLogin(account.email, account.password)`
**Steps:**

1. Send POST /verifyLogin with the shared account's email and password.
   **Expected:**

- `expectResponseCode(response, 200)`
- `validateJsonSchema("accounts/apiMessage", body)`
- `body.message` is "User exists!"

#### #0012 — verifyLogin without email is a bad request

**Covers:** AC-2
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Accounts.verifyLoginWithoutEmail(account.password)`
**Steps:**

1. Send POST /verifyLogin with only `password`.
   **Expected:**

- `expectResponseCode(response, 400)`
- `validateJsonSchema("accounts/apiMessage", body)`
- `body.message` is "Bad request, email or password parameter is missing in POST request."

#### #0013 — DELETE verifyLogin is not supported

**Covers:** AC-3
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Accounts.verifyLoginWithDelete()`
**Steps:**

1. Send DELETE /verifyLogin with no body.
   **Expected:**

- `expectResponseCode(response, 405)`
- `validateJsonSchema("accounts/apiMessage", body)`
- `body.message` is "This request method is not supported."

#### #0014 — verifyLogin with invalid details finds no user

**Covers:** AC-4
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Accounts.verifyLogin(email, password)` with invalid values
**Steps:**

1. Build a fresh `buildAccount()` that is never created, and take its email and password.
2. Send POST /verifyLogin with them.
   **Expected:**

- `expectResponseCode(response, 404)`
- `validateJsonSchema("accounts/apiMessage", body)`
- `body.message` is "User not found!"

### Account lifecycle (test.describe)

#0015 and #0016 each build their own account. #0017 and #0018 use one account created in this describe's `beforeAll` and deleted in `afterAll`; #0017 keeps the email and password unchanged so #0018 still finds it.

#### #0015 — createAccount registers a new user

**Covers:** AC-5
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Accounts.create(account)`
**Steps:**

1. Build `account = buildAccount()`.
2. Send POST /createAccount with every field.
3. In `finally`, send DELETE /deleteAccount with the account's email and password.
   **Expected:**

- `expectResponseCode(response, 201)`
- `validateJsonSchema("accounts/apiMessage", body)`
- `body.message` is "User created!"

#### #0016 — deleteAccount removes the account

**Covers:** AC-6
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Accounts.remove(account.email, account.password)`
**Steps:**

1. Build `account = buildAccount()` and create it; require 201 on this setup call.
2. Send DELETE /deleteAccount with the email and password.
3. In `finally`, if step 2 did not run or did not return 200, delete the account again so none is left behind.
   **Expected:**

- `expectResponseCode(response, 200)`
- `validateJsonSchema("accounts/apiMessage", body)`
- `body.message` is "Account deleted!"

#### #0017 — updateAccount updates the user

**Covers:** AC-7, AC-8
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Accounts.update({ ...account, city: <new faker city>, company: <new faker company> })`
**Steps:**

1. Build `account = buildAccount()` and create it in `beforeAll` (shared per describe), deleted in `afterAll`.
2. Send PUT /updateAccount with the same email and password and a different `city` and `company`.
3. Send GET /getUserDetailByEmail with `account.email` (`Accounts.getByEmail(account.email)`).
   **Expected (step 2):**

- `expectResponseCode(response, 200)`
- `validateJsonSchema("accounts/apiMessage", body)`
- `body.message` is "User updated!"

**Expected (step 3):**

- `expectResponseCode(response, 200)`
- `validateJsonSchema("accounts/userDetail", body)`
- `body.user.city` equals the new city and `body.user.company` equals the new company

#### #0018 — getUserDetailByEmail returns the user detail

**Covers:** AC-8
**Tags:** `TAGS.API`, `TAGS.REGRESSION`
**Call:** `Accounts.getByEmail(account.email)`
**Steps:**

1. Using the account this describe created in `beforeAll` (deleted in `afterAll`), send GET /getUserDetailByEmail with its email.
   **Expected:**

- `expectResponseCode(response, 200)`
- `validateJsonSchema("accounts/userDetail", body)`
- `body.user.email` equals the account's email, and `body.user.name` equals its name (both values were set by this test)

## Open questions

Not specified by the docs, so no expected code is invented and no scenario is planned. Out of scope (owner decision) unless the item says otherwise:

- Out of scope (owner decision): `getUserDetailByEmail` with an unknown email, with no `email` parameter, or with an empty one.
- Out of scope (owner decision): `createAccount` with an email that already exists, with a missing required parameter, or with an invalid `title`.
- Out of scope (owner decision): `deleteAccount` with a wrong password, an unknown email, or missing parameters; and deleting the same account twice.
- Out of scope (owner decision): `updateAccount` for an unknown account, with a wrong password, or with missing parameters.
- Out of scope (owner decision): `verifyLogin` with `email` but no `password` (API 8's message mentions "email or password", but only the missing-email case is listed), and with a right email but wrong password (API 10 says only "invalid values").
- Out of scope (owner decision): Which HTTP verbs other than the documented ones are rejected on createAccount, deleteAccount, updateAccount and getUserDetailByEmail.
- `UserDetail` field names (`birth_day`, `first_name`) differ from the request names; confirm via the generated schema. The detail body probably does not include the password or mobile number.
- #0016 and #0017 both need an account; if the shared `beforeAll` account is preferred for #0017, the reviewer should say so (#0016 must use its own because it destroys it).
