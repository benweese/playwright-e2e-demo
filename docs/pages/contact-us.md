# Contact us

**URL:** /contact_us
**Last verified:** 2026-11-10

## Default state on load

Title "Automation Exercise - Contact Us". The form is empty and no message is shown. The site adds no URL params. No ad overlay or ad iframe was present in this session (no `iframe`, `ins` or adsbygoogle elements); the console shows failed loads for `pagead2.googlesyndication.com/.../adsbygoogle.js` and Cloudflare insights (certificate errors), which are ad/tracking related, plus mixed-content errors, which are the site's own.

## Layout

- Header (`banner`): logo link, then nav links Home (/), Products (/products), Cart (/view_cart), Signup / Login (/login), Test Cases (/test_cases), API Testing (/api_list), Video Tutorials (external YouTube), Contact us (/contact_us).
- Main: heading level 2 "Contact Us" (text "Contact" + `strong` "Us").
- Left column: text "Note: Below contact form is for testing purpose.", heading "Get In Touch" (h2), the form.
- Right column: heading "Feedback For Us", paragraphs "We really appreciate your response to our website.", "Kindly share your feedback with us at feedback@automationexercise.com." (mailto link), "If you have any suggestion areas or improvements, do let us know. We will definitely work on it.", "Thank you".
- Footer (`contentinfo`): "Subscription" heading with a second form (email box `Your email address` + icon-only submit button with no accessible name, id `subscribe`), "Copyright © 2021 All rights reserved". This subscription form posts to the same URL.

## Controls

Form: `POST /contact_us`, with a hidden `csrfmiddlewaretoken`. The form has no `enctype` attribute and no `novalidate`.

| Control           | Locator                                                                                                   | Notes                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Name              | `getByTestId("name")` or `getByRole("textbox", { name: "Name" })`                                         | text, placeholder "Name", optional                                 |
| Email             | `getByTestId("email")` or `getByRole("textbox", { name: "Email" })`                                       | `type=email`, placeholder "Email", **required** (HTML `required`)  |
| Subject           | `getByTestId("subject")` or `getByRole("textbox", { name: "Subject" })`                                   | text, placeholder "Subject", optional                              |
| Your Message Here | `getByTestId("message")` or `getByRole("textbox", { name: "Your Message Here" })`                         | textarea, id `message`, optional                                   |
| Upload file       | `locator('input[name="upload_file"]')` ; button appears as `getByRole("button", { name: "Choose File" })` | `type=file`, single file, no `accept` limit, no data-qa. Optional. |
| Submit            | `getByTestId("submit-button")` or `getByRole("button", { name: "Submit" })`                               | `input type=submit`; opens the confirm dialog                      |

Upload: clicking Choose File opens a file chooser; attaching a small `.txt` file shows it as selected (`files[0].name` = `upload-sample.txt`). Plain `setInputFiles` on the input works equally.

Confirm dialog (on Submit, after the browser's own validation passes): type `confirm`, message exactly "Press OK to proceed!".

- Accept: the form submits and the page stays at `/contact_us` with the success state below.
- Dismiss: nothing is submitted, the URL stays the same, all entered values (including the email) remain in the form, and no success message appears.

Success state (after accept): the form is replaced; shown are

- `div.status.alert.alert-success`: "Success! Your details have been submitted successfully." (`getByText("Success! Your details have been submitted successfully.")`)
- a Home button, a link `<a class="btn btn-success" href="/">` with text "Home" (`getByRole("link", { name: "Home" })`; the header also has a "Home" link, so scope it, e.g. `locator("#form-section").getByRole("link", { name: "Home" })`).
- Clicking this Home button navigates to `/` (title "Automation Exercise").

## URL parameters

None. The URL is `/contact_us` before and after submitting.

## Validation

| Trigger                             | Message                                                                               | Blocks?                |
| ----------------------------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| Submit with Email empty (all empty) | browser bubble "Please fill out this field." on Email                                 | Yes; no dialog appears |
| Email "abc"                         | browser bubble "Please include an '@' in the email address. 'abc' is missing an '@'." | Yes; no dialog         |
| Email "a@b"                         | passes the browser check (`checkValidity()` true)                                     | No                     |

Only Email is required. Submitting with just a valid email (Name, Subject, Message, file blank) and accepting the dialog succeeded with the same success message. These are native browser messages; the site shows no custom error text.

## Empty and error states

No custom empty or error state was seen. Dismissing the dialog is the only way to remain on the form after a valid submit.

## Notes

- The snapshot refs may carry an `f2e` prefix on a second load of the page; use role/test-id locators, not refs.
- The dialog must be handled (accept/dismiss) or the click's action stays pending in Playwright; register `page.once("dialog", d => d.accept())` before clicking Submit.
- File input, subscription submit button and the icon in the header links have no accessible name; the file input has no data-qa or label.
- Submitted twice during mapping with made-up data (`@example.com` addresses): once email only, once with all fields plus a text file. Both gave the same success message.
- The success message appears in the DOM twice (`.status.alert-success` and a second `.alert-success.alert` element), so a locator by text may match two elements; in the page snapshot only one was visible.
