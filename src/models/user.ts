interface Referral {
	code: String;
	expiration_date: String;
	possible_number: number;
	usage_counter: number;
}

export class HwUser {
	id: number;
	email: String;
	emailConfirmation: String;
	firstName: String;
	lastName: String;
	street: String;
	company: String;
	is_company: Boolean;
	companyName: String;
	zipcode: String;
	city: String;
	phone: String;

	password: String;
	passwordConfirmation: String;
	locale: String;
	registrationState: String;
	canCompleteSignup: Boolean;
	pendingEmailConfirmation: Boolean;

	token: String;
	method: String;

	constructor(data: any = null) {
		if (data) {
			this.id = data.id;
			this.email = data.email;
			this.emailConfirmation = data.emailConfirmation;
			this.firstName = data.firstName;
			this.lastName = data.lastName;
			this.street = data.street;
			this.company = data.company;
			this.is_company = data.is_company;
			this.companyName = data.companyName;
			this.zipcode = data.zipcode;
			this.city = data.city;
			this.phone = data.phone;
			this.password = data.password;
			this.passwordConfirmation = data.passwordConfirmation;
			this.locale = data.locale;
			this.registrationState = data.registrationState;
			this.canCompleteSignup = data.canCompleteSignup;
			this.pendingEmailConfirmation = data.pendingEmailConfirmation;
			if (data.token) {
				this.token = data.token;
				if (data.method) {
					this.method = data.method;
				}
			}

		}
	}

	public toJson() {
		return {
			"user": {
				"id": this.id,
				"email": this.email,
				"email_confirmation": this.emailConfirmation,
				"password": this.password,
				"password_Confirmation": this.passwordConfirmation,
				"locale": this.locale,
				"phone": this.phone,
				"company": this.companyName
			}
		};
	}

}