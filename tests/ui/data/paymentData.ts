import { faker } from "@faker-js/faker";

/** Card details for the payment form, all as the text typed into its fields. */
export interface PaymentDetails {
	nameOnCard: string;
	cardNumber: string;
	cvc: string;
	/** Two digits, "01" to "12". */
	expiryMonth: string;
	/** Four digits, a year after the current one. */
	expiryYear: string;
}

/**
 * Builds valid-looking card details with fake data. The site accepts any text, so these are not
 * real card numbers.
 *
 * @returns card details with a future expiry date
 *
 * @example
 * await payment.fillPayment(buildPayment());
 */
export function buildPayment(): PaymentDetails {
	return {
		nameOnCard: faker.person.fullName(),
		cardNumber: faker.string.numeric({ length: 16, allowLeadingZeros: false }),
		cvc: faker.string.numeric({ length: 3, allowLeadingZeros: false }),
		expiryMonth: String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0"),
		expiryYear: String(new Date().getFullYear() + faker.number.int({ min: 1, max: 5 }))
	};
}
