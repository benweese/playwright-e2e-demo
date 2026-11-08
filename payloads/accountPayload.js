import { faker } from "@faker-js/faker";

/**
 * A complete, valid body for POST /api/createAccount. Every field is required by the API.
 * The email is unique per call, so parallel workers never collide.
 *
 * @param {Partial<Record<string, string>>} [overrides]
 */
export function buildAccount(overrides = {}) {
	const firstname = faker.person.firstName();
	const lastname = faker.person.lastName();
	const birth = faker.date.birthdate({ mode: "age", min: 18, max: 80 });
	return {
		name: `${firstname} ${lastname}`,
		email: `qa.${Date.now()}.${faker.string.alphanumeric(6).toLowerCase()}@example.com`,
		password: faker.internet.password({ length: 14 }),
		title: faker.helpers.arrayElement(["Mr", "Mrs"]),
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
