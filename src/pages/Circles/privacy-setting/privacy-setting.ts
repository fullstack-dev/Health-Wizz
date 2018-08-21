import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PrivacySettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-privacy-setting',
  templateUrl: 'privacy-setting.html',
})
export class PrivacySettingPage {

	ageVisible: boolean;
	locationVisible: boolean;
	circleVisible: boolean;
	challengesVisible: boolean;
	indexVisible: boolean;
	notificationVisible: boolean;

	circle_notification: any;

	circle_name: string = '';
	circle_descriptions: string = '';

  	constructor(public navCtrl: NavController, public navParams: NavParams) {
  	}

  	ionViewDidLoad() {
    	console.log('ionViewDidLoad PrivacySettingPage');

    	this.ageVisible = true;
		this.locationVisible = false;
		this.circleVisible = true;
		this.challengesVisible = false;
		this.indexVisible = true;
		this.notificationVisible = false;

		this.circle_notification = this.navParams.get('notification_result'); 
		if(this.circle_notification){
			this.circle_name = this.circle_notification[0].circle_name;
			this.circle_descriptions = this.circle_notification[0].circle_descriptions;
		} else {

		}
  	}

  	public Before = () => {
  		this.navCtrl.setRoot('HomePage');
  	}

  	public Done = () => {
  		this.navCtrl.setRoot('MyCirclesPage');
  	}

}
