import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-campaign-notification',
  templateUrl: 'campaign-notification.html',
})
export class CampaignNotificationPage {

	currentDate: string;

  	constructor(
  		public viewCtrl: ViewController,
		public navCtrl: NavController,
		public navParams: NavParams 
	) {
	    this.currentDate = Date.now().toString();
  	}

  	public closeModal(){
    	this.navCtrl.setRoot('HomePage');
	}

	goNotiDetail(){
    	this.navCtrl.setRoot('CampaignNotificationDetailPage', { status: 'detail' });
	}

	public denyClick = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public acceptClick = () => {
		this.navCtrl.setRoot('CampaignAcceptPage', {status: 'Accept'});
	}

}
