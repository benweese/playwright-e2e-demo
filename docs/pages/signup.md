# Signup, Account Created, Account Deleted

**URL:** /signup (then /account_created, /delete_account)
**Last verified:** 2026-11-10

## Default state on load

Reached by submitting the Signup form on /login with a name and an unused email. Page title `Automation Exercise - Signup`. Form is a POST to /signup (includes a hidden `csrfmiddlewaretoken` and `form_type=create_account`). Name and Email are prefilled from /login; Email is disabled (read-only). Everything else empty; Country defaults to `India`. Visiting /signup directly without that step was not tried.

## Layout

- Same header as /login (logged out).
- h2 "Enter Account Information", then fields, then h2 "Address Information" with the address fields, then the Create Account button, then the footer Subscription block.

## Controls

All have `data-qa` equal to the id unless noted; use `getByTestId("<id>")` where listed. Required means HTML `required`.

| Field (label)                                            | Locator                                                                               | Required | Notes                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| Title: Mr. / Mrs.                                        | `getByRole("radio", { name: "Mr." })`, `{ name: "Mrs." }` (ids id_gender1/id_gender2) | no       | Neither selected by default                                                                                   |
| Name *                                                   | `getByTestId("name")`                                                                 | yes      | prefilled, editable                                                                                           |
| Email *                                                  | `getByTestId("email")`                                                                | yes      | prefilled, disabled                                                                                           |
| Password *                                               | `getByTestId("password")`                                                             | yes      | type=password                                                                                                 |
| Date of Birth: Day                                       | `getByTestId("days")`                                                                 | no       | options `Day`, 1-31                                                                                           |
| Date of Birth: Month                                     | `getByTestId("months")`                                                               | no       | `Month`, January..December                                                                                    |
| Date of Birth: Year                                      | `getByTestId("years")`                                                                | no       | `Year`, 2021 down to 1900                                                                                     |
| Sign up for our newsletter!                              | `getByRole("checkbox", { name: "Sign up for our newsletter!" })`                      | no       | unchecked, id newsletter                                                                                      |
| Receive special offers from our partners!                | `getByRole("checkbox", { name: "Receive special offers from our partners!" })`        | no       | unchecked, id optin                                                                                           |
| First name *                                             | `getByTestId("first_name")`                                                           | yes      |                                                                                                               |
| Last name *                                              | `getByTestId("last_name")`                                                            | yes      |                                                                                                               |
| Company                                                  | `getByTestId("company")`                                                              | no       |                                                                                                               |
| Address * (Street address, P.O. Box, Company name, etc.) | `getByTestId("address")` (id address1)                                                | yes      |                                                                                                               |
| Address 2                                                | `getByTestId("address2")`                                                             | no       |                                                                                                               |
| Country *                                                | `getByTestId("country")`                                                              | yes      | options exactly: India, United States, Canada, Australia, Israel, New Zealand, Singapore; default India       |
| State *                                                  | `getByTestId("state")`                                                                | yes      |                                                                                                               |
| City *                                                   | `getByTestId("city")`                                                                 | yes      |                                                                                                               |
| Zipcode *                                                | `getByTestId("zipcode")`                                                              | yes      | its `<label for>` points to `city` (site bug), so `getByLabel("Zipcode *")` resolves to City; use the test id |
| Mobile Number *                                          | `getByTestId("mobile_number")`                                                        | yes      |                                                                                                               |
| Create Account                                           | `getByTestId("create-account")` / `getByRole("button", { name: "Create Account" })`   |          | submits                                                                                                       |

Date selects are comboboxes with no accessible name (label "Date of Birth" is not associated); use the test ids.

## URL parameters

None. Success redirects to `/account_created`.

## Validation

Only browser-native: an empty required field blocks submit with `Please fill out this field.` and focuses the first empty required field in DOM order (observed: Password, with Name prefilled). No custom messages were seen; password strength, zip and mobile formats were not checked (the values `Passw0rd!x`, `12345`, `5550100` were accepted).

## Empty and error states

- Account Created (`/account_created`, title `Automation Exercise - Account Created`): h2 `Account Created!` (`getByTestId("account-created")`, green), text "Congratulations! Your new account has been successfully created!" and "You can now take advantage of member privileges to enhance your online shopping experience with us." Continue link (`getByTestId("continue-button")`, href `/`). Header on this page still shows the logged-out nav; after clicking Continue (to `/`) the header is logged in: "Logged in as <Name>", Logout, Delete Account.
- Delete Account: click header link `getByRole("link", { name: "Delete Account" })` (href /delete_account) while logged in. Immediately deletes with no confirmation. Lands on `/delete_account` (title oddly still `Automation Exercise - Account Created`): h2 `Account Deleted!` (`getByTestId("account-deleted")`), text "Your account has been permanently deleted!" and "You can create new account to take advantage of member privileges to enhance your online shopping experience with us." Continue link (`getByTestId("continue-button")`, href `/`). Header is logged out. Logging in with the deleted credentials afterwards gives `Your email or password is incorrect!`.
- Already-registered email at the Signup step: see login.md (`Email Address already exist!`).

## Notes

- Logout (header link, /logout) returns to /login.
- No ad overlays appeared in this flow in the CLI session; none of the above is ad-related.
- Zipcode label mis-association and unnamed date selects mean test ids are needed for those.
