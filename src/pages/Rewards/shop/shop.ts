import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { Helper } from '../../../providers/helper-service';

/**
 * Generated class for the ShopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-shop',
	templateUrl: 'shop.html',
})
export class ShopPage {

	medical_services_data: any;
	monthly_passes_data: any;
	errorMessage: any;

	shop_data: any;

	services_length: number;
	passes_length: number;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public modalCtrl: ModalController,
		public helper: Helper
	) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ShopPage');

		this.getShopdata();
	}

	getShopdata() {
		this.rest.getShopdata()
			.subscribe(
				shop_data => {
					this.shop_data = shop_data;
					this.medical_services_data = this.shop_data.medical_services;
					this.monthly_passes_data = this.shop_data.monthly_services;

					this.services_length = this.medical_services_data.length;
					this.passes_length = this.monthly_passes_data.length;
				},
				error => {
					this.errorMessage = <any>error;
				});
	};

	public Before = () => {
		this.navCtrl.setRoot('MyWalletPage');
	}

	MedicalServiceItemSelected(item) {
		console.log("@@: ", item);
		this.navCtrl.setRoot('MedicalServicesPage', { medical_services: item })
	}

	MonthlyPassesItemSelected(item) {
		console.log("##: ", item);
		this.navCtrl.setRoot('MonthlyPassesPage', { monthly_passes: item });
	}

	shopFromAmazon() {
		let msg = "Do you want to redeem 550 OmPoints for $50 Amazon Gift Card?";
		let sent_msg = "An email with your request has been sent to finance@healthwizz.com.";
		let content = "redeeming OmPoints for Amazon Gift Card";
		this.openShopConfirm(msg, sent_msg, content);
	}

	shopFromStarbucks() {
		let msg = "Do you want to redeem 55 OmPoints for $5 Starbucks Gift Card?";
		let sent_msg = "An email with your request has been sent to finance@healthwizz.com.";
		let content = "redeeming OmPoints for Starbucks Gift Card";
		this.openShopConfirm(msg, sent_msg, content);
	}

	openShopConfirm(message, sentMsg, content) {
		let shop_confirm = this.modalCtrl.create('ConfirmPopupPage', { 'title': "Confirm!", 'message': message, 'pos_text': "Yes", 'neg_text': "No" }, { enableBackdropDismiss: true });
		shop_confirm.onDidDismiss(save_res => {
			if (save_res == true) {
				// TODO:send email.
				this.helper.sendEmailForShop(content, "Request to redeem OmPoints").then(r => {
					// this.helper.showAlert(sentMsg, "Success!");
				});

			}
		});
		shop_confirm.present();
	}

}
