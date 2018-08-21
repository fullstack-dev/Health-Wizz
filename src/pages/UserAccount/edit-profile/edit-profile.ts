import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserService } from '../../../providers/user-service';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { LanguageProvider } from '../../../providers/language/language';
import { Helper } from '../../../providers/helper-service';
import { Toast } from '@ionic-native/toast';
import { LocalDataProvider } from '../../../providers/local-data/local-data';

@IonicPage()
@Component({
	selector: 'page-edit-profile',
	templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

	genders: any;
	countries: any;
	// states: any;
	selectedValue: any;
	profile: UserData;
	profilePic: any;
	lang_resource: any;
	primaryPhysician: any;
	// name_validator: NameValidatior;
	phone_pattern: RegExp = /^(?!0+$)[0-9]{10}$/;
	zip_code_pattern: RegExp = /^(?!0+$)[0-9]+$/;
	name_pattern: RegExp = /^[A-Za-z'-]+$/;
	name_maxlength = 20;
	p_name_pattern: RegExp = /^[A-Za-z1-9\s'-]+$/;
	email_pattern: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	p_zip_code: any;
	p_phone_number: any;
	public primaryPhysicianDetail: PrimaryPhysician = new PrimaryPhysician(null, null, null, new AddressDTO(null, null, null, null, null, null));

	states: string[];

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private restData: RestDataProvider,
		private language_provider: LanguageProvider,
		private userService: UserService,
		private helper: Helper,
		private toast: Toast,
		public local: LocalDataProvider
	) {
		try {
			this.states = local.contries[0].states;
			// this.name_validator = this.validator.name_validator;
			this.lang_resource = this.language_provider.getLanguageResource();
			this.selectedValue = 0;
			this.genders = [{ id: 0, property: 'Male' }, { id: 1, property: 'Female' }];
			// this.countries = [{ id: 0, property: 'United States of America' }, { id: 1, property: 'England' }];
			// this.states = [{ id: 0, property: 'VVA' }, { id: 1, property: 'VA' }];
			this.profile = this.userService.getProfile();
			// this.profile.dob = new Date(this.profile.dob).toISOString();

			this.profilePic = this.userService.getProfilePic();
			let primaryPhysicianDetail;
			if (this.profile.primaryPhysicianDetail) {
				primaryPhysicianDetail = JSON.parse(this.profile.primaryPhysicianDetail);
			}
			if (primaryPhysicianDetail) {
				this.primaryPhysicianDetail = primaryPhysicianDetail;
			}
		} catch (e) {
			console.log(e);
		}

	}

	getGenderText(v) {
		if (v == "1") {
			return "Male";
		}
		if (v == "2") {
			return "Female";
		}
	}

	getDobText(v) {
		let date = new Date(v);
		// return date.toISOString();
		let d: any = date.getDate();
		let m: any = date.getMonth() + 1;
		let y: any = date.getFullYear();
		if (d < 10) {
			d = "0" + d;
		}
		if (m < 10) {
			m = "0" + m;
		}
		// return y + "-" + m + "-" + d;
		return m + "/" + d + "/" + y;
	}

	getMaxDob() {
		let date = new Date(new Date().setFullYear(new Date().getFullYear() - 16));
		let d: any = date.getDate();
		let m: any = date.getMonth() + 1;
		let y: any = date.getFullYear();
		if (d < 10) {
			d = "0" + d;
		}
		if (m < 10) {
			m = "0" + m;
		}
		return y + "-" + m + "-" + d;
	}

	getMinDob() {
		let date = new Date(new Date().setFullYear(new Date().getFullYear() - 100));
		let d: any = date.getDate();
		let m: any = date.getMonth() + 1;
		let y: any = date.getFullYear();
		if (d < 10) {
			d = "0" + d;
		}
		if (m < 10) {
			m = "0" + m;
		}
		return y + "-" + m + "-" + d;
	}

	ionViewDidLoad() {

	}

	countryChanged() {
		let country = this.local.contries.find(item => {
			return item.code == this.profile.address.country
		});
		if (country) {
			this.states = country.states;
		} else {
			this.states = null;
			this.profile.address.state = null;
		}
	}

	public goToUpdateAvatar = () => {
		this.navCtrl.setRoot('UpdateAvatarPage');
	}

	public Before = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public Done = () => {
		this.helper.showLoading();
		if (this.primaryPhysicianDetail) {
			this.profile.primaryPhysician = this.primaryPhysicianDetail.name;
			this.profile.primaryPhysicianDetail = JSON.stringify(this.primaryPhysicianDetail);
			this.profile.hasPrimaryPhysician = true;
		} else {
			this.profile.primaryPhysician = null;
			this.profile.primaryPhysicianDetail = null;
		}

		// this.profile.pharmacy = null;
		// this.profile.insurance = null;

		this.restData.updateProfile(this.profile)
			.subscribe(res => {
				this.toast.showShortBottom("Profile updated.").subscribe(r => { });
				this.restData.getProfile()
					.subscribe(profile => {
						this.helper.hideLoading();
						this.userService.setProfile(profile.data);
						this.navCtrl.setRoot('HomePage');
					}, err => {
						this.helper.hideLoading();
						this.userService.setProfile(this.profile);
						this.navCtrl.setRoot('HomePage');
						console.log(err);
					});
			}, err => {
				this.helper.hideLoading();
				this.helper.showAlert("Updating your profile was unsuccessful. Please try again.", "Error!");
			});

	}
}

class UserData {
	public email: string = null;
	public password: string = null;
	public firstName: string = null;
	public lastName: string = null;
	public dob: string = null;
	public gender: string = null;
	public address: AddressDTO = new AddressDTO(null, null, null, null, null, null);
	public cell: string = null;
	public promoCode: string = null;
	public hasPrimaryPhysician: boolean = null;
	public hasInsurance: boolean = null;
	public consents: Array<ConsentDTO> = [];
	public pharmacy: Array<PharmacyDTO> = [];
	public insurance: Array<InsuranceDTO> = [];
	public uid: string = null;
	public providerId: string = null;
	public verified: boolean = null;
	public isFederated: boolean = null;
	public primaryPhysician: string = null;
	public primaryPhysicianDetail: string = null;
	constructor() { }
}

class AddressDTO {
	constructor(
		public addressLine1: string,
		public addressLine2: string,
		public city: string,
		public zipCode: string,
		public state: string,
		public country: string
	) { }
}

class ConsentDTO {
	constructor(
		public code: string,
		public value: boolean
	) { }
}

class PharmacyDTO {
	constructor(
		public code: string,
		public name: string,
		public type: string
	) { }
}

class InsuranceDTO {
	constructor(
		public code: string,
		public providedId: string,
		public type: string
	) { }
}

class PrimaryPhysician {
	constructor(
		public name: string,
		public email: string,
		public cell: string,
		public address: AddressDTO = new AddressDTO(null, null, null, null, null, null)
	) { }
}