import { generateTestDescription, TAGS, uniqueEmail } from "@benweese/playwright-test-commons";
import { faker } from "@faker-js/faker";
import { test } from "../../../fixtures/test";
import { Accounts } from "../../../api/AccountsClient";
import { config } from "../../../config";
import { expectResponseCode } from "../../../helpers";
import { buildAccount } from "../../../payloads/accountPayload";
import { HeaderComponent } from "../pages/HeaderComponent";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Register and delete", () => {
	test(
		generateTestDescription({
			id: 19,
			description: "register a new user through the UI, then delete the account",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const account = buildAccount();
			const home = new HomePage(page);
			const header = new HeaderComponent(page);
			const login = new LoginPage(page);
			const signup = new SignupPage(page);

			try {
				await home.open();
				await header.clickSignupLogin();
				await login.expectSignupHeading();

				await login.signup(account.name, account.email);
				await signup.expectAccountInformationHeading();

				await signup.fillAccount(account);
				await signup.createAccount();
				await signup.expectAccountCreated();

				await signup.clickContinue();
				await header.expectLoggedInAs(account.name);

				await header.deleteAccount();
				await signup.expectAccountDeleted();

				await signup.clickContinue();
				await home.expectUrl("/");
				await header.expectLoggedOut();
			} finally {
				// After a successful UI delete the API answers "Account not found!", so the result is not checked.
				await Accounts.remove(account.email, account.password);
			}
		}
	);
});

test.describe("Login", () => {
	test(
		generateTestDescription({
			id: 20,
			description: "log in with a correct email and password",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const account = buildAccount();
			await expectResponseCode(await Accounts.create(account), 201);
			const login = new LoginPage(page);
			const header = new HeaderComponent(page);

			try {
				await login.open();
				await login.expectLoginHeading();

				await login.login(account.email, account.password);
				await login.expectUrl("/");
				await header.expectLoggedInAs(account.name);
				await header.expectLoggedInLinks();
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);

	test(
		generateTestDescription({
			id: 21,
			description: "a wrong password for a real account shows an error",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const account = buildAccount();
			await expectResponseCode(await Accounts.create(account), 201);
			const login = new LoginPage(page);
			const header = new HeaderComponent(page);

			try {
				await login.open();
				await login.login(account.email, buildAccount().password);
				await login.expectLoginError();
				await login.expectUrl("/login");
				await header.expectLoggedOut();
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);

	test(
		generateTestDescription({
			id: 22,
			description: "an email that is not registered shows an error",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const login = new LoginPage(page);
			const header = new HeaderComponent(page);

			await login.open();
			await login.login(uniqueEmail(config.testEmail), faker.internet.password({ length: 14 }));
			await login.expectLoginError();
			await login.expectUrl("/login");
			await header.expectLoggedOut();
		}
	);

	test(
		generateTestDescription({
			id: 23,
			description: "login cannot be submitted with empty fields",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const login = new LoginPage(page);

			await login.open();
			await login.submitLoginForm();
			await login.expectUrl("/login");
			await login.expectLoginEmailInvalid();
			await login.expectNoLoginError();
		}
	);
});

test.describe("Logout", () => {
	test(
		generateTestDescription({
			id: 24,
			description: "logging out returns to the login page",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const account = buildAccount();
			await expectResponseCode(await Accounts.create(account), 201);
			const login = new LoginPage(page);
			const header = new HeaderComponent(page);

			try {
				await login.open();
				await login.login(account.email, account.password);
				await header.expectLoggedInAs(account.name, { soft: false });

				await header.logout();
				await login.expectUrl("/login");
				await login.expectLoginHeading();
				await header.expectLoggedOut();
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);
});

test.describe("Register with an existing email", () => {
	test(
		generateTestDescription({
			id: 25,
			description: "signing up with an already registered email shows an error",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const account = buildAccount();
			await expectResponseCode(await Accounts.create(account), 201);
			const login = new LoginPage(page);
			const signup = new SignupPage(page);

			try {
				await login.open();
				await login.signup(faker.person.fullName(), account.email);
				await login.expectSignupError();
				await signup.expectNoAccountInformationHeading();
			} finally {
				await Accounts.remove(account.email, account.password);
			}
		}
	);
});
