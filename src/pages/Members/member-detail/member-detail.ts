import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Participant, InviteData, MemberRolesInfo } from '../../../models/classes';
import { HistoryProvider } from '../../../providers/history/history';
import { SMS } from '@ionic-native/sms';
import { Toast } from '@ionic-native/toast';
import { Helper } from '../../../providers/helper-service';

@IonicPage()
@Component({
	selector: 'page-member-detail',
	templateUrl: 'member-detail.html',
})
export class MemberDetailPage {

	circle: any;
	member_item: Participant;
	// where: string = '';
	name: string = '';
	avatar_url: string = '';
	birthday: any = '';
	gender: string = '';
	phone_number: string = '';
	email: string = '';
	country: string = '';
	zip_code: string = '';
	address: string = '';
	city: string = '';
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private restService: RestDataProvider,
		private history: HistoryProvider,
		private sms: SMS,
		private toast: Toast,
		private helper: Helper
	) {
	}

	ionViewDidLoad() {
		this.circle = this.navParams.get('circle');
		this.member_item = this.navParams.get('member_item');
		// this.where = this.navParams.get('from');

		this.restService.getMemberProfile(this.member_item.info.memberId)
			.subscribe((details: any) => {
				let profile = details.data;
				this.name = profile.firstName;
				if (profile.lastName) {
					this.name = this.name + " " + profile.lastName;
				}
				this.birthday = profile.dob;
				if (profile.gender == "1" || profile.gender == 1 || (profile.gender).toString().toLowerCase() == 'male') {
					this.gender = 'Male';
				} else {
					this.gender = 'Female';
				}
				this.phone_number = profile.cell;
				this.email = profile.email;
				this.country = 'Not available';
				this.zip_code = profile.address.zipCode;
				if (profile.address.city) {
					this.city = profile.address.city;
				} else {
					this.city = 'Not available';
				}
				if (profile.address.addressLine1) {
					this.address = profile.address.addressLine1
				} else if (profile.address.addressLine2) {
					this.address = profile.address.addressLine2;
				} else {
					this.address = 'Not available';
				}

			});
	}

	public Before = () => {
		this.navCtrl.setRoot(this.history.getHistory());
		// if (this.where == "members") {
		// 	this.navCtrl.setRoot('MembersPage', { circle: this.circle, from: "member-detail" });
		// } else if (this.where == "circle") {
		// 	this.navCtrl.setRoot('CirclePage', { circle: this.circle, from: "member-detail" });
		// } else {
		// 	this.navCtrl.setRoot('MembersPage', { circle: this.circle, from: "member-detail" });
		// }
	}

	public Done = () => {
		this.navCtrl.setRoot('CirclePage');
		// TODO: Add some functionality here
		// this.navCtrl.setRoot('LeaveDialogPage', { circle: this.circle, from: "member-detail" })
	}

	public goToAllCampaingns = () => {

	}

	public sendInvite() {
		let email;
		let phone;
		if (this.phone_number) {
			phone = this.phone_number;
		}
		if (this.email) {
			email = this.email;
		}

		if (!phone) {
			phone = null;
		}

		if (!email || email == "") {
			email = null;
		}

		if (phone == null && email == null) {
			this.helper.showAlert("Contact information not available!", "");
			return;
		}

		this.helper.showConfirm("", "Send invite to " + this.name, "Yes", "No")
			.then(r => {
				let memberRoles: MemberRolesInfo = new MemberRolesInfo(false, false, true);
				let data = new InviteData(email, phone, memberRoles);
				this.restService.inviteMember(this.circle.id, 'circle', data)
					.subscribe(res => {
						if (res.smsContent) {
							if (this.sms.hasPermission) {
								this.sms.send(phone, res.smsContent, { android: { intent: "INTENT" } })
									.then(r1 => {
										this.toast.show("Invitation has been sent to " + this.name + ".", "1500", "bottom").subscribe(r2 => { });
									})
									.catch(e => {
										this.toast.show("Invite sent failed. ", "1500", "bottom").subscribe(r4 => { });
									});
							} else {
								this.toast.show("Doesn't have permissions.", "1500", "bottom")
									.subscribe(r3 => { });
							}
						} else {
							if (email) {
								this.toast.show("Invite sent to " + email + ".", "1500", "bottom").subscribe(r5 => { });
							} else {
								this.toast.show("Unable to generate the invitation link.", "1500", "bottom").subscribe(r6 => { });
							}
						}
					}, err => {
						if (err.code == 409 || err.code == 403) {
							// Already a member
							this.helper.showAlert("Already invited.", "");
						} else {
							// invite send failed
							this.helper.showAlert("Unable to generate the invitation link.", "");
						}
					});
			}).catch(e => {
				console.log("denied");
			});
	}

}
