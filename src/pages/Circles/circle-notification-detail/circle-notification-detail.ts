import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { LanguageProvider } from '../../../providers/language/language';

/**
 * Generated class for the CircleNotificationDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-circle-notification-detail',
	templateUrl: 'circle-notification-detail.html',
})
export class CircleNotificationDetailPage {

	circle_notification: any;
	lang_resource: any;

	circle_name: string = '';
	circle_descriptions: string = '';

	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public language_provider: LanguageProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
	}

	ionViewDidLoad() {
		this.circle_notification = this.navParams.get('notification_result');
		if (this.circle_notification) {
			this.circle_name = this.circle_notification[0].circle_name;
			this.circle_descriptions = this.circle_notification[0].circle_descriptions;
		} else {

		}
	}

	public Before = () => {
		this.navCtrl.setRoot('CircleNotificationPage');
	}

	public denyClick = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public acceptClick = () => {
		this.navCtrl.setRoot('PrivacySettingPage', { notification_result: this.circle_notification });
	}

}
