import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { UserService } from '../../../providers/user-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { Helper } from '../../../providers/helper-service';
import { CampaignSettings } from '../../../models/classes';

@IonicPage()
@Component({
	selector: 'page-campaign-accept',
	templateUrl: 'campaign-accept.html',
})
export class CampaignAcceptPage {

	campaignData: any;
	campaignSettings: CampaignSettings

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public restService: RestDataProvider,
		public userService: UserService,
		public local: LocalDataProvider,
		public helper: Helper
	) {
		this.campaignData = this.navParams.get('campaign');
		this.campaignSettings = new CampaignSettings(null, null, true, false, true, true, true, false, true, true);
		this.getSettings();
	}

	ionViewDidLoad() {

	}

	// public acceptAndSave() {
	// 	if (this.campaignData.campaignInfo.circleInfo.invitationState == 'invite') {
	// 		let campaign = JSON.parse(JSON.stringify(this.campaignData));
	// 		campaign.campaignInfo.circleInfo.invitationState = 'accept';
	// 		this.restService.acceptDenyCampaign(campaign)
	// 			.subscribe(result => {
	// 				this.campaignData.campaignInfo.circleInfo.invitationState = 'accept';
	// 				this.local.updateCampaigns(campaign, 'accept');
	// 				this.save();
	// 			}, err => {
	// 				this.helper.showAlert("There is a problem in processing your request, try again!", "");
	// 			});

	// 	} else {
	// 		this.exit();
	// 	}
	// }

	public getSettings() {
		this.restService.getCampaignSettings(this.campaignData.id)
			.subscribe(r => {
				if (r) {
					this.campaignSettings = r;
				}
			}, e => {
				console.log(e);
			});
	}

	public save() {
		this.restService.saveCampaignSettings(this.campaignData.id, this.campaignSettings)
			.toPromise()
			.then(r => { this.exit(); })
			.catch(e => { this.exit(); });

	}

	public exit() {
		this.navCtrl.pop();
	}

	public handleError(error) {
		console.log(error);
	}

}
