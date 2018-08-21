import { Component, Renderer } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { LanguageProvider } from '../../../providers/language/language';

/**
 * Generated class for the CircleNotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-circle-notification',
	templateUrl: 'circle-notification.html',
})
export class CircleNotificationPage {

	circle_notification: any;
	errorMessage: any;
	lang_resource: any;
	result: any;

	who: string = '';
	date: string = '';
	circle_name: string = '';

	constructor(
		public renderer: Renderer,
		public viewCtrl: ViewController,
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public language_provider: LanguageProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
	}

	ionViewDidLoad() {

		this.getNotifications();
	}

	getNotifications() {
		this.rest.getNotification()
			.subscribe(
				notification => {
					this.result = notification;

					this.circle_notification = this.result.circle_notification;

					if (this.circle_notification) {
						this.who = this.circle_notification[0].who;
						this.date = this.circle_notification[0].date;
						this.circle_name = this.circle_notification[0].circle_name;

					} else {

					}
				},
				error => {
					this.errorMessage = <any>error;
				});
	}

	public closeModal() {
		this.navCtrl.setRoot('HomePage');
	}

	public goToNotificationDetailPage = () => {
		this.navCtrl.setRoot('CircleNotificationDetailPage', { notification_result: this.circle_notification });
	}

	public denyClick = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public acceptClick = () => {
		this.navCtrl.setRoot('PrivacySettingPage', { notification_result: this.circle_notification });
	}

}
