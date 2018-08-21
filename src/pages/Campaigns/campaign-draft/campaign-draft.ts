import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Rest } from '../../../providers/rest';

@IonicPage()
@Component({
  selector: 'page-campaign-draft',
  templateUrl: 'campaign-draft.html',
})
export class CampaignDraftPage {

	campaignData: any;
	terms:any;
	omCoins:any;
	measured:any;
	organizers: any;
	avatars = [];
	avatarsMemebers: number;
	errorMessage: string;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public rest: Rest 
		) {
	  }

	ionViewDidLoad() {
		this.getCampaigns();
    }

	 getCampaigns() {
        this.rest.getCampaigns()
           .subscribe(
               data => {
                this.campaignData  = data;
                this.terms = this.campaignData.terms;
                this.measured = this.campaignData.measured;
                this.omCoins = this.campaignData.omCoins;
                this.organizers = this.campaignData.organizers;
                this.avatars = this.campaignData.avatars;
                if(this.avatars.length){
                	this.avatarsMemebers = this.avatars.length
                }
            },
            error =>  {
                this.errorMessage = <any>error;
            });
    }

    before() {
    	this.navCtrl.setRoot('CampaignPage');
    }

    delete() {
    	this.navCtrl.setRoot('CampaignDeletePage', { page: 'draft'});
    }

    publish() {
    	console.log('publish');
    }

}
