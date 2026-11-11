/** Response bodies of automationexercise.com's API (https://automationexercise.com/api_list). */

/** Every response carries the real status here; HTTP is always 200. */
export interface ApiEnvelope {
	responseCode: number;
	message?: string;
}

export interface Product {
	id: number;
	name: string;
	price: string;
	brand: string;
	category: {
		usertype: { usertype: string };
		category: string;
	};
}

export interface ProductList extends ApiEnvelope {
	products: Product[];
}

export interface UserDetail extends ApiEnvelope {
	user: {
		id: number;
		name: string;
		email: string;
		title: string;
		birth_day: string;
		birth_month: string;
		birth_year: string;
		first_name: string;
		last_name: string;
		company: string;
		address1: string;
		address2: string;
		country: string;
		state: string;
		city: string;
		zipcode: string;
	};
}
