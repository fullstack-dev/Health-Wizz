import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController } from 'ionic-angular';
import { Device } from '../../models/classes';
import { RestDataProvider } from '../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../providers/helper-service';
import { LanguageProvider } from '../../providers/language/language';
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import { Toast } from '@ionic-native/toast';
@IonicPage()
@Component({
	selector: 'page-connected-device',
	templateUrl: 'connected-device.html',
})
export class ConnectedDevicePage {

	device_fitbit: Device;
	device_withings: Device;
	device_fatsecret: Device;
	device_jawbone: Device;
	device_misfit: Device;
	device_runkeeper: Device;
	device_healthvault: Device;
	device_googlefit: Device;
	fitbitMode: boolean = false;
	withingsMode: boolean = false;
	jawboneMode: boolean = false;
	lang_resource: any;
	devices: Array<DeviceList>;
	incoming_devices: Array<DeviceList>;
	fitbit: any;
	withings: any;
	fatsecret: any;
	jawbone: any;
	misfit: any;
	runkeeper: any;
	healthvault: any;
	googlefit: any;
	connected: boolean = false;
	Withconnected: boolean = false;
	browser: InAppBrowserObject;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private restService: RestDataProvider,
		private helper: Helper,
		private toast: Toast,
		private language_provider: LanguageProvider,
		private iab: InAppBrowser,
		private modalCtrl: ModalController,
		private platform: Platform
	) {
		this.browser = null;
		this.lang_resource = this.language_provider.getLanguageResource();
		this.fitbit = new DeviceList("fitbit", false, "assets/imgs/fitbit.png", "Fitbit", false);
		this.withings = new DeviceList("withings", false, "assets/imgs/withings.png", "Withings", false);
		this.fatsecret = new DeviceList("fatsecret", false, "assets/imgs/fatsecret.jpg", "Fatsecret", false);
		this.jawbone = new DeviceList("jawbone", false, "assets/imgs/jawbone.jpg", "Jawbone", false);
		this.misfit = new DeviceList("misfit", false, "assets/imgs/misfit.png", "Misfit", false);
		this.runkeeper = new DeviceList("runkeeper", false, "assets/imgs/runkeeper.png", "Runkeeper", false);
		this.healthvault = new DeviceList("healthvault", false, "assets/imgs/logo.png", "Healthvault", false);
		this.googlefit = new DeviceList("googlefit", false, "assets/imgs/googlefit.png", "Googlefit", false);
		this.devices = [];
		this.incoming_devices = [];
		this.devices.push(this.fitbit, this.withings);
		this.incoming_devices.push(this.jawbone, this.fatsecret, this.misfit, this.runkeeper, this.healthvault, this.googlefit);
		this.getConnectedDevices();
	}

	ionViewDidEnter() {
		this.device_fitbit = new Device('fitbit', false);
		this.device_withings = new Device('withings', false);
	}

	goToBmi() {
	}
	goToHypertension() {

	}

	getConnectedDevices() {
		this.restService.getConnectedDevices()
			.subscribe((res: any) => {
				res.data.forEach(device => {
					this.devices.forEach(myDevice => {
						if (device.name == myDevice.name) {
							myDevice.connected = true;
						}
					});
				});
			}, err => {
				console.log(err);
			});
	}

	disableDevice(name) {
		let disable = false;
		switch (name) {
			case "fatsecret":
			case "misfit":
			case "runkeeper":
			case "healthvault":
			case "googlefit":
				disable = true;
				break;

			default:
				break;
		}
		return disable;
	}

	connectToDevice(device, index) {
		let command = device.connected;
		let type: string = device.name;
		if (command == false) {
			this.restService.connectToFitbit('CONNECT', type)
				.subscribe((res) => {

					let browserOptions: InAppBrowserOptions = {
						location: 'no',
						enableViewportScale: 'yes'
					}

					// setTimeout(() => {
					this.platform.ready().then(() => {
						var browser = this.iab.create(res.data, "_blank", browserOptions);
						browser.on('loadstart')
							.subscribe((event: InAppBrowserEvent) => {
								let res = event.url.match(/callback.html/g);
								console.log(res);
								if (res && res.length > 0) {
									browser.close();
									device.connected = true;
									// this.helper.showAlert(device.toUpperCase() + " is now connected with Health Wizz.", "Success!");
									this.toast.showShortBottom(device.toUpperCase() + " is now connected with Health Wizz.").subscribe(r => { });
								} else {
									device.tempConnect = false;
								}
							});
					});

					// }, 500);

					// this.openWindow(res.data, device);
					// let alert = this.alert.create({
					// 	title: "Connect device",
					// 	message: "Please keep your credentials ready to log on the device portal, your session will expire in 90 seconds. Connecting to a device may take some time, please do not close or refresh the next screen. ",
					// 	buttons: [{
					// 		text: "Ok",
					// 		role: 'cancel',
					// 		handler: () => {
					// 			this.openWindow(res.data, device);
					// 		}
					// 	}]
					// })
					// alert.present();
				}, err => {
					console.log(err);
				});
		} else {

			let disconnect_confirm = this.modalCtrl.create('ConfirmPopupPage', { 'title': "Disconnect device?", 'message': "Are you sure you want to disconnect " + type + " from Health Wizz?", 'pos_text': "Yes", 'neg_text': "No" }, { enableBackdropDismiss: false });
			disconnect_confirm.onDidDismiss(res => {
				if (res == true) {
					this.restService.connectToFitbit('DISCONNECT', type)
						.subscribe((res) => {
							if (res.success === true) {
								this.restService.disconnectToFitbit(res.data)
									.subscribe(response => {
										if (response.RESULT === 'SUCCESS') {
											device.connected = false;
											this.toast.showShortBottom(type.toUpperCase() + " is now disconnected with Health Wizz.").subscribe(r => { });
											// this.helper.showAlert(type.toUpperCase() + " is now disconnected with Health Wizz.", "Success!");
										}
									}, err => {
										console.log(err);
									});
							}

						});
				}
			});
			disconnect_confirm.present();
		}
	}
	openWindow(url: string, device) {
		let browserOptions: InAppBrowserOptions = {
			location: 'no',
			enableViewportScale: 'yes'
		}
		this.browser = this.iab.create(url, "_blank", browserOptions);
		this.browser.on('loadstop').subscribe((event: any) => {
			let res = event.url.match(/callback.html/g);
			if (res && res.length > 0) {
				this.browser.close();
				device.connected = true;
				this.helper.showAlert(device.toUpperCase() + " is now connected with Health Wizz.", "Success!");
			} else {
				device.tempConnect = false;
			}
		});
	}

	public Before = () => {
		if (this.navParams.get('from') == 'health-index') {
			this.navCtrl.setRoot('SubmitReportPage');
		} else if (this.navParams.get('from') == 'chf') {
			this.navCtrl.setRoot('SubmitReportBPage');
		} else {
			this.navCtrl.setRoot('HomePage');
		}
	}

	public Done = () => {
		this.navCtrl.pop();
	}

	public Select = () => {
		if (this.navParams.get('from') == 'health-index') {
			this.navCtrl.setRoot('HealthIndexPage');
		} else if (this.navParams.get('from') == 'chf') {
			this.navCtrl.setRoot('ChfPage');
		} else {
			this.navCtrl.setRoot('HealthIndexPage');
		}
	}
	goToFitbit() {
		this.navCtrl.push('FitbitPage');
	}

}

class DeviceList {
	constructor(
		public name: string,
		public connected: boolean,
		public image: string,
		public label: string,
		public tempConnect: boolean
	) { }
}
