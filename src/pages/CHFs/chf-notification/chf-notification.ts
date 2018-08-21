import { Component, Renderer } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { LanguageProvider } from '../../../providers/language/language';

/**
 * Generated class for the ChfNotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-chf-notification',
	templateUrl: 'chf-notification.html',
})
export class ChfNotificationPage {

	text: string;
	campaign: any;
	lang_resource: any;

	constructor(
		public renderer: Renderer,
		public viewCtrl: ViewController,
		public navCtrl: NavController,
		public navParams: NavParams,
		public local: LocalDataProvider,
		private restService: RestDataProvider,
		private language_provider: LanguageProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
		this.renderer.setElementClass(viewCtrl.pageRef().nativeElement, 'chf-notification', true);
		this.campaign = navParams.get('campaign');
	}

	public closeModal(state) {
		this.viewCtrl.dismiss(state);
	}

	// public goToDetails = () => {
	// 	this.local.setLocalCampaign(this.campaign);
	// 	this.closeModal('accept');
	// 	// this.navCtrl.setRoot('ChfCampaignDetailPage');
	// }

	accept() {
		if (this.campaign.campaignInfo.circleInfo.invitationState !== 'invite') {
			return;
		}
		this.local.setLocalCampaign(this.campaign);
		this.campaign.campaignInfo.circleInfo.invitationState = 'accept';
		this.restService.acceptDenyCampaign(this.campaign)
			.subscribe(result => {
				this.local.updateCampaigns(this.campaign, 'accept');
				this.closeModal('accept');
				// this.navCtrl.setRoot('ChfPage');
			}, this.handleError);
	}

	public denyClick = () => {
		this.campaign.campaignInfo.circleInfo.invitationState = 'deny'
		this.restService.acceptDenyCampaign(this.campaign)
			.subscribe(r => {
				this.closeModal('deny');
				this.local.removeHomeNotification();
			}, this.handleError);
	}

	handleError(error) {
		console.log(error);
	}
}
