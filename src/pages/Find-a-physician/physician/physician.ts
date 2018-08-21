import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../../providers/helper-service';

/**
 * Generated class for the PhysicianPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-physician',
	templateUrl: 'physician.html',
})
export class PhysicianPage {

	speciality: any;
	zip_code: any;
	distance: any;
	currentLat: any;
	currentLng: any;
	physicians: any;
	errorMessage: string;
	physicians_data: any;
	docSpeciality = [];
	filterSpeciality: any;
	UserData: {};

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public restdata: RestDataProvider,
		public helper: Helper
	) {
		// this.physicians_data = undefined;
	}

	public Before = () => {
		this.navCtrl.setRoot('FindPhysicianPage', { 'from': this.navParams.get('backViewParent') });
	}

	ionViewDidLoad() {
		this.speciality = this.navParams.get('speciality');
		this.zip_code = this.navParams.get('zip_code');
		this.distance = this.navParams.get('distance');
		this.docSpeciality = this.navParams.get('docSpeciality');

		console.log("User has to get list of Physician from the backend using speciality, zip code, distance.");
		this.getPhysicians(1);
	}

	getPhysicians(retry: number) {
		if (retry > 3) {
			this.helper.hideLoading();
			this.helper.showToast("Unable to fetch the physicians list. Try again!");
			return;
		}
		if (retry == 1) {
			this.helper.showLoading();
		}

		let speciality = this.docSpeciality.find(item => {
			return item.code == this.speciality;
		});

		if (speciality) {
			this.filterSpeciality = speciality.term;
		} else {
			this.filterSpeciality = "family-practitioner";
		}

		this.restdata.getZipCode(this.zip_code)
			.subscribe(response => {
				if (response.data) {
					this.currentLat = response.data.lat;
					this.currentLng = response.data.lng;
					this.UserData = {
						"lat": this.currentLat,
						"lng": this.currentLng,
						"radius": this.distance,
						"keyword": (this.filterSpeciality).toLowerCase(),
						"limit": 100
					};
					this.getDocList(this.UserData);
				} else {
					this.getPhysicians((retry + 1));
				}
			}, error => {
				this.errorMessage = <any>error;
				this.getPhysicians((retry + 1));
			});
	};

	getDocList(value) {
		this.restdata.findPhyscian(value).subscribe(response => {
			this.helper.hideLoading();
			if (response.data.physicianData) {
				this.physicians_data = response.data.physicianData;
			} else {
				this.helper.showAlert("Unable to fetch physicians, please try after some time.", "");
				// this.helper.showToast("something went wrong");
			}
		}, err => {
			this.helper.hideLoading();
			this.helper.showAlert("Unable to fetch physicians, please try after some time.", "");
			// this.helper.showToast("something went wrong");
		});

	}

	public open(event, item, index) {
		item.openFlag = !item.openFlag;
	}

}
