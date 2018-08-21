import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, ModalController } from 'ionic-angular';
import { Rest } from '../../../providers/rest';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../../providers/helper-service';
import { LanguageProvider } from '../../../providers/language/language';

@IonicPage()
@Component({
	selector: 'page-my-circles',
	templateUrl: 'my-circles.html',
})
export class MyCirclesPage {
	view: string = "MyCirclesPage";
	invitations_data: any;
	your_circles_data: any;
	available_circles_data: any;
	errorMessage: string;
	circles_data: any;
	invitations_circles: Array<any>;
	active_circles: Array<any>;
	available_cirlces: Array<any>;
	search_bar: boolean;
	search_query: any;
	lang_resource: any;
	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public local: LocalDataProvider,
		private restService: RestDataProvider,
		private helper: Helper,
		private language_provider: LanguageProvider,
		private modalCtrl: ModalController
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
	}

	ionViewWillEnter() {
		this.loadCircles(true);
	}

	loadCircles(loader: boolean) {
		if (loader) {
			this.helper.showLoading();
		}
		this.getCircles()
			.then((circles: Array<any>) => {
				try {
					this.invitations_circles = this.local.getInvitedCircles(circles);
					this.active_circles = this.local.getYourCircles(circles);
					this.available_cirlces = this.local.getAvailableCircles(circles);
					this.helper.hideLoading();
				} catch (e) {
					console.log(e);
				}

			}).catch(e => {
				if (loader) {
					this.helper.hideLoading();
				}
			});
	}

	emptyCircles() {
		if (this.invitations_circles && this.active_circles && this.available_cirlces) {
			if (this.invitations_circles.length < 1 && this.active_circles.length < 1 && this.available_cirlces.length < 1) {
				return true;
			}
		}

		return false;
	}

	public Before = () => {
		this.navCtrl.setRoot('HomePage');
	}

	search() {
		console.log('search');
		this.search_query = null;
		this.search_bar = !this.search_bar;
	}

	public Add = () => {
		// this.history.addHistory(this.view);
		// this.navCtrl.setRoot('CreateCirclePage', { status: "create" });
		let createModal = this.modalCtrl.create('CreateCirclePage', { status: "create" }, { cssClass: "circle-create-modal" });
		createModal.onDidDismiss(data => {
			if (data == true) {
				this.loadCircles(false);
			}
		});
		createModal.present();
	}

	public goToCircle(circle) {
		this.local.setLocalCircle(circle);
		this.navCtrl.setRoot('CirclePage');
	}

	getCircles() {
		return new Promise((resolve, reject) => {
			this.restService
				.getCircles()
				.subscribe(data => {
					resolve(data.info);
				}, error => {
					reject();
					this.handleError(error);
				});
		});
	}

	handleError(err) {
		console.log(err);
	}

}
