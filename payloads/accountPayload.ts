import { faker } from "@faker-js/faker";

/** Body of POST /createAccount and PUT /updateAccount. The API requires every field. */
export interface Account {
	name: string;
	email: string;
	password: string;
	title: "Mr" | "Mrs";
	birth_date: string;
	birth_month: string;
	birth_year: string;
	firstname: string;
	lastname: string;
	company: string;
	address1: string;
	address2: string;
	country: string;
	zipcode: string;
	state: string;
	city: string;
	mobile_number: string;
}

/**
 * Builds a complete, valid account with fake data. The email is unique on every call, so
 * parallel workers never collide.
 *
 * @param overrides - fields to set instead of the generated ones
 * @returns an account ready for `Accounts.create`
 *
 * @example
 * const account = buildAccount({ country: "Canada" });
 * await expectResponseCode(await Accounts.create(account), 201);
 */
export function buildAccount(overrides: Partial<Account> = {}): Account {
	const firstname = faker.person.firstName();
	const lastname = faker.person.lastName();
	const birth = faker.date.birthdate({ mode: "age", min: 18, max: 80 });
	return {
		name: `${firstname} ${lastname}`,
		email: `qa.${Date.now()}.${faker.string.alphanumeric(6).toLowerCase()}@example.com`,
		password: faker.internet.password({ length: 14 }),
		title: faker.helpers.arrayElement(["Mr", "Mrs"] as const),
		birth_date: String(birth.getDate()),
		birth_month: String(birth.getMonth() + 1),
		birth_year: String(birth.getFullYear()),
		firstname,
		lastname,
		company: faker.company.name(),
		address1: faker.location.streetAddress(),
		address2: faker.location.secondaryAddress(),
		country: faker.helpers.arrayElement(["India", "United States", "Canada", "Australia"]),
		zipcode: faker.location.zipCode(),
		state: faker.location.state(),
		city: faker.location.city(),
		mobile_number: faker.string.numeric(10),
		...overrides
	};
}
