/**
 * `test` and `expect` for every spec in this repo. Import them from here, not from @playwright/test.
 *
 * automationexercise.com serves Google ads, including full-page "vignette" ads that cover the
 * page after a navigation and swallow clicks. They are not part of the site under test, so
 * every browser context blocks ad and tracking requests before any page loads. Some of these
 * scripts (Cloudflare's analytics beacon among them) can hang, which would stall the page's load event.
 */
// eslint-disable-next-line no-restricted-syntax -- this is the one file that extends the base test
import { test as base, expect } from "@playwright/test";

const BLOCKED_HOSTS =
	/(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|adservice\.google\.com|googletagservices\.com|googletagmanager\.com|google-analytics\.com|fundingchoicesmessages\.google\.com|adtrafficquality\.google|cloudflareinsights\.com)$/;

export const test = base.extend({
	context: async ({ context }, use) => {
		await context.route(
			(url) => BLOCKED_HOSTS.test(url.hostname),
			(route) => route.abort("blockedbyclient")
		);
		await use(context);
	}
});

export { expect };
