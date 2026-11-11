/**
 * Response bodies of automationexercise.com's API (https://automationexercise.com/api_list).
 * Name them in client methods (`this.get<ProductList>(...)`) so tests get typed bodies.
 */

/** Fields every response has. HTTP is always 200; the real status is `responseCode`. */
export interface ApiEnvelope {
	/** The real status, e.g. 200, 201, 404 or 405. */
	responseCode: number;
	/** Human-readable result, e.g. "User created!". Absent on most successful reads. */
	message?: string;
}

/** One product, as listed by the products endpoints. */
export interface Product {
	id: number;
	name: string;
	/** Price with currency, e.g. "Rs. 500". */
	price: string;
	brand: string;
	category: {
		/** Who the product is for, e.g. "Women", "Men" or "Kids". */
		usertype: { usertype: string };
		/** e.g. "Tops", "Tshirts" or "Dress". */
		category: string;
	};
}

/** Body of GET /productsList and POST /searchProduct. */
export interface ProductList extends ApiEnvelope {
	products: Product[];
}

/** Body of GET /getUserDetailByEmail. */
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
