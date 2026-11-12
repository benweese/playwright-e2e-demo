# Contact us form with file upload — UI test plan

**Source:** https://automationexercise.com/test_cases, Test Case 6 (wording below is the page's own)
**Page reference:** `docs/pages/contact-us.md`
**Spec file:** `tests/ui/specs/contact.spec.ts` (create)
**Files:** create `locators/contactLocators.ts` + `pages/ContactPage.ts` (`open`, `fillForm`, `attachFile`, `submitAccepting`, `submitDismissing`), `data/contactData.ts` (faker name, email from commons' `uniqueEmail(config.testEmail)`, subject, message). The upload file is a small `.txt` written at run time into `testInfo.outputPath(...)`; no fixture file is committed.

Session rule: the form is the same logged in or out and nothing touches the cart, so these use the shared session. The submission creates nothing the test can clean up on the site.

## Acceptance criteria

1. **AC-1** (TC6) — "Click on 'Contact Us' button. Verify 'GET IN TOUCH' is visible."
2. **AC-2** (TC6) — "Enter name, email, subject and message. Upload file. Click 'Submit' button. Click OK button."
3. **AC-3** (TC6) — "Verify success message 'Success! Your details have been submitted successfully.' is visible."
4. **AC-4** (TC6) — "Click 'Home' button and verify that landed to home page successfully."
5. **AC-5** (derived; Approved by repo owner) — The email field is required; with a missing or malformed email the form is not submitted.
6. **AC-6** (derived; Approved by repo owner) — Choosing Cancel in the "Press OK to proceed!" confirmation does not submit the form.

## Already covered

| id   | Description | Skip / Extend |
| ---- | ----------- | ------------- |
| none |             | Create        |

## Scenarios

### Contact form (test.describe)

#### #0044 — The Contact us link opens the Get In Touch form

**Covers:** AC-1
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Steps:**

1. Open `/`
2. Click "Contact us" in the header
   **Expected:**

- URL is `/contact_us`
- "Get In Touch" heading visible
- Name, Email, Subject, Your Message Here, file chooser and Submit are visible, all empty

#### #0045 — Submitting the form with a file shows the success message, and Home returns to the home page

**Covers:** AC-2, AC-3, AC-4
**Tags:** `TAGS.UI`, `TAGS.SMOKE`, `TAGS.REGRESSION`
**Steps:**

1. Open `/contact_us`
2. Enter a name, an email, a subject and a message from `contactData`
3. Attach the run-time `.txt` file to "Upload file"
4. Click "Submit", accepting the confirmation dialog (register `page.once("dialog")` first)
5. In the form area, click "Home"
   **Expected:**

- After step 3: the file input holds one file with the attached name
- The dialog is type `confirm` with message "Press OK to proceed!"
- After step 4: URL is still `/contact_us`; "Success! Your details have been submitted successfully." is visible (the text exists twice in the DOM, so scope it to the status alert)
- After step 5: URL is `/`, title is "Automation Exercise"

#### #0046 — Cancelling the confirmation keeps the form and sends nothing

**Approved by repo owner** (derived scenario).
**Covers:** AC-6
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/contact_us`, fill name, email, subject, message and attach the file
2. Click "Submit", dismissing the confirmation dialog
   **Expected:**

- URL is `/contact_us`
- The success message is not visible
- All entered values are still in the fields

### Email validation (test.describe)

#### #0047 — The form is not submitted without an email or with a malformed one

**Approved by repo owner** (derived scenario).
**Covers:** AC-5
**Tags:** `TAGS.UI`, `TAGS.REGRESSION`
**Steps:**

1. Open `/contact_us`, fill name, subject and message, leave Email empty; click "Submit"
2. Type `abc` in Email; click "Submit"
   **Expected:**

- No confirmation dialog appears in either step (register a dialog listener that fails the test if it fires)
- Email is invalid in both steps (non-empty `validationMessage`; do not assert exact browser wording)
- The success message is not shown; URL is `/contact_us`

## Site changes needed

- **File input** (`input[name=upload_file]`): no label, name or data-qa. `getByRole("button", { name: "Choose File" })` opens the chooser but `setInputFiles` needs the input itself. Needs `data-qa="upload-file"` or a label. Until then the generator writes the best allowed locator and a `// Fixme:`.
- **Success message** appears twice in the DOM (`.status.alert-success` and another `.alert-success`). A single element with `role="status"` and `data-qa` would be stronger.
- **Home button** after success (`a.btn-success`) has the same name as the header Home link. Container: the form section (`#form-section`, no role). Needs a landmark or `data-qa`.
- **Subscription button** in the footer is unnamed (see `ui-subscription.md`).

## Open questions

- **Only Email is required.** A submit with just a valid email succeeds. Is that intended (name, subject and message optional)? No scenario is planned for it, so it is neither blessed nor questioned in the suite.
- **`a@b`** passes the email field's native check and submits. Not planned.
- **File type and size.** The input has no `accept` limit and the site shows nothing about a rejected type. Not planned.
- **Success message, TC6 wording**: "Success! Your details have been submitted successfully." matches the site. No difference.
- **Confirmation dialog.** TC6 says "Click OK button"; the dialog's text "Press OK to proceed!" is asserted as documented by the page reference.
