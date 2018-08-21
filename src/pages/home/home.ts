import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, AlertController, NavParams, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Rest } from '../../providers/rest';
import { UserService } from '../../providers/user-service';
import { RestDataProvider } from '../../providers/rest-data-service/rest-data-service';
import { FCM } from '@ionic-native/fcm';
import { Helper } from '../../providers/helper-service';
import { LocalDataProvider } from '../../providers/local-data/local-data';
import { MenuData, ChronicDisease, WalletInfo } from '../../models/classes';
import { DomSanitizer } from '@angular/platform-browser';
import { HistoryProvider } from '../../providers/history/history';
import { Subscription } from 'rxjs';
import { LanguageProvider } from '../../providers/language/language';
import { MyWalletProvider } from '../../providers/wallet/my-wallet-provider';
import { ConstProvider } from '../../providers/const/const';
@IonicPage()
@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
})
export class HomePage {
	view = 'HomePage';
	LoggedinUser_Name: string = '';
	health_index_score: string;
	omcoins_score: string;
	circles_score: number;
	campaigns_score: number;

	circles_score_showing: boolean = false;
	campaigns_score_showing: boolean = false;

	campaign_new: boolean;
	circle_new: boolean;

	userProfile: any;
	userProfilePic: any;
	chronicDiseases: Array<ChronicDisease>;
	customCampaigns: Array<any>;
	chronicCampaigns: Array<any>;
	removeNotification: Subscription;
	singleCDInvite: boolean;
	lang_resource: any;
	circles: Array<any>;
	// lock_wallet: boolean = true;
	wallet_password: string;
	wallet_balance: number;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public modalCtrl: ModalController,
		public alertCtrl: AlertController,
		public storage: Storage,
		public rest: Rest,
		public userService: UserService,
		public restService: RestDataProvider,
		private fcm: FCM,
		private events: Events,
		public helper: Helper,
		public local: LocalDataProvider,
		public domSanitizer: DomSanitizer,
		private history: HistoryProvider,
		private language_provider: LanguageProvider,
		public myWallet: MyWalletProvider,
		public constants: ConstProvider
	) {
		this.lang_resource = this.language_provider.getLanguageResource();
		this.local.campaign_slide_index = -1; //prevent sliding the campaign slides when going from home.
		history.clearHistory();
		this.fcm.onNotification()
			.subscribe(data => {
				console.log("FCM notificaition");
				this.local.sendFcmNotification(data);
			}, err => {
				console.log(err);
			});
		fcm.getToken().then(token => {
			this.restService.registerToken(token)
				.subscribe(result => {
					console.log("device registered to receive notifications.")
				}, this.handleError);
		});

		fcm.onNotification().subscribe(data => {
			if (data.wasTapped) {
				console.log("Received in background");
				console.log(data);
				this.updateCampaigns();
			} else {
				console.log(data);
				if (data) {
					if (data.name && data.type) {

						if (data.type == 'circle' || data.type == 'Circle') {
							this.helper.showAlert(data.name + " circle invitation.", "");
							this.updateCircles();
						}
						if (data.type == 'challenge' || data.type == 'Challenge') {
							this.helper.showAlert(data.name + " campaign invitation.", "");
							this.updateCampaigns();
						}
						if ((data.type).indexOf('alert') != -1) {
							this.helper.showAlert(data.name, data.type);
						}
					}
				}
			};
		})

		fcm.onTokenRefresh().subscribe(token => {
			this.restService.registerToken(token).subscribe(result => {
				console.log("device fcm token refreshed")
			}, this.handleError);
		});
	}

	// ionViewWillLoad() {
	// 	let from = this.navParams.get('from');
	// 	if (from == 'login') {
	// 		this.myWallet.updateWalletStatus()
	// 			.then(r => {
	// 				this.myWallet.updateOmpBalance();
	// 			}).catch(e => {
	// 				console.log(e);
	// 			});
	// 	}
	// }

	ionViewDidLoad() {
		try {

			// setTimeout(() => {
			// 	this.myWallet.updateOmpBalance();
			// }, 2000);

			this.language_provider.$lang_observable
				.subscribe(lang_resource => {
					this.lang_resource = lang_resource;
				});

			this.removeNotification = this.local.$removeHomeNotification
				.subscribe(value => {
					if (value == true) {
						this.chronicDiseases = [];
						this.updateMenu();
					}
				});

			this.userProfile = this.userService.getProfile();
			this.LoggedinUser_Name = this.userProfile.firstName + ' ' + this.userProfile.lastName;
			this.userProfilePic = this.userService.getProfilePic();
			this.helper.showLoading();
			this.loadData()
				.then((data: Array<any>) => {
					this.helper.hideLoading();
					let campaigns = data[0];
					this.circles = data[1];
					this.omcoins_score = data[3].balance;

					this.local.setLocalCircles(this.circles); // saving circles in local service

					let filteredCamapaigns = this.local.getChronicCampaigns(campaigns); // filter chronic disease campaigns
					this.chronicDiseases = this.getChronicDiseases(filteredCamapaigns.chronicCampaigns); // these are chf campaigns list
					this.customCampaigns = filteredCamapaigns.customCampaigns; //these are custom campaigns

					this.local.setCampaignLastUpdate(data[2]); // set last update for chf only campaigns
					let indicators = this.local.mapAndGetIndicators(data[2], true); // filter mhi indicators
					this.local.localIndexes = indicators; //saving indexes in local
					this.showCompositeScore(data[2]); //showing composite score

					this.checkSingleInvite();
					this.showCampaignsScore(this.customCampaigns);
					this.showCirclesScore(this.circles);
					this.updateMenu();
				});
		} catch (e) {
			console.log(e);
		}

		this.events.subscribe('wallet:created', (value) => {
			if (value) {
				this.generateCampaignAddresses();
			}
		});

	}

	generateCampaignAddresses() {
		let count = 0;
		if (this.customCampaigns && this.customCampaigns.length > 0) {
			this.customCampaigns.forEach(campaign => {
				if (campaign.campaignInfo.purse.primaryAddress) {
					count += 1;
				}
			});
			if (count && count > 0) {
				this.myWallet.generateCampaignAddresses(count)
					.catch(e => {
						console.error(e);
					});
			}
		}
	}

	showCompositeScore(indicators: Array<any>) {
		indicators.forEach(indicator => {
			if (indicator.indicatorCode == "CompositeScore") {
				this.health_index_score = indicator.calculatedValue;
			}
		});
	}

	takeNotificationAction(data) {
		if (data.wasTapped) {
			this.updateCampaigns();
		} else {
			console.log(data);
			if (data) {
				if (data.name && data.type) {

					if (data.type == 'circle' || data.type == 'Circle') {
						this.helper.showAlert(data.name + " invitation.", "");
						this.updateCircles();
					}
					if (data.type == 'challenge' || data.type == 'Challenge') {
						this.helper.showAlert(data.name + " invitation.", "");
						this.updateCampaigns();
					}
					if ((data.type).indexOf('alert') != -1) {
						this.helper.showAlert(data.name, data.type);
					}
				}
			}
		};
	}

	updateCampaigns() {
		console.clear();
		console.log("updating after invitation");
		this.local.getCampaigns()
			.then((_campaigns: Array<any>) => {
				let filteredCamapaigns = this.local.getChronicCampaigns(_campaigns);
				this.chronicDiseases = this.getChronicDiseases(filteredCamapaigns.chronicCampaigns);
				this.customCampaigns = filteredCamapaigns.customCampaigns;
				this.showCampaignsScore(this.customCampaigns);
				this.checkSingleInvite();
				this.updateMenu();
			});
	}

	updateCircles() {
		this.getCircles()
			.then((_circles: Array<any>) => {
				this.showCirclesScore(_circles);
			});
	}

	checkSingleInvite() {
		if (this.chronicDiseases.length == 1) {
			let allinvite = true;
			this.chronicDiseases[0].campaigns.forEach(campaign => {
				if (campaign.campaignInfo.circleInfo.invitationState == 'accept') {
					allinvite = false;
				}
			});
			this.singleCDInvite = allinvite;
		} else {
			this.singleCDInvite = false;
		}
	}

	loadData() {
		let promises = [];
		// promises.push(this.getTemplates());
		promises.push(this.local.getCampaigns());
		promises.push(this.getCircles());
		promises.push(this.local.getMhiStatus());
		promises.push(this.getPurse());
		// promises.push(this.getUserInfo());
		return Promise.all(promises);
	}

	showCampaignsScore(campaigns) {
		this.campaigns_score = 0;
		this.getCampaignDrafts()
			.then((drafts_count: number) => {
				this.campaigns_score += drafts_count;
				this.campaigns_score += campaigns.length;
				if (campaigns.length > 0) {
					// this.campaigns_score = campaigns.length;
					this.campaigns_score_showing = true;
					this.campaign_new = false;
				} else {
					// has no campaings
					this.campaigns_score_showing = false;
					this.campaign_new = true;
				}
			});
	}

	getCampaignDrafts() {
		return new Promise((resolve) => {
			this.storage.get(this.constants.STORAGE.CAMPAIGN_DRAFTS)
				.then((_drafts: any[]) => {
					if (_drafts && _drafts.length && _drafts.length > 0) {
						resolve(_drafts.length);
					} else {
						resolve(0);
					}
				}).catch(e => {
					resolve(0);
				});
		});
	}

	showCirclesScore(circles: Array<any>) {
		if (circles.length > 0) {
			this.circles_score = circles.length;
			this.circles_score_showing = true;
			this.circle_new = false;
		} else {
			// has no cirlces
			this.circle_new = true;
			this.circles_score_showing = false;
		}
	}

	getChronicDiseases(chronicCampaigns: Array<any>) {
		let chronicDiseases: Array<ChronicDisease> = [];
		let diseases = [];
		chronicCampaigns.forEach(campaign => {
			let found = false;
			if (diseases.length == 0) {
				diseases.push(campaign.challengeTemplateInfo);
			}
			diseases.forEach((disease, i, a) => {
				if (disease.id == campaign.challengeTemplateInfo.id) {
					found = true;
				}
				if (found == false && i == a.length - 1) {
					diseases.push(campaign.challengeTemplateInfo);
				}
			});
		});
		diseases.forEach(disease => {
			let campaigns = [];
			chronicCampaigns.forEach(campaign => {
				if (campaign.challengeTemplateInfo.id == disease.id) {
					campaigns.push(campaign);
				}
			});
			chronicDiseases.push(new ChronicDisease(disease, campaigns));
		});
		return chronicDiseases;
	}

	getTemplates() {
		return new Promise((resolve, reject) => {
			this.restService
				.getTemplates()
				.subscribe(data => {
					resolve(data.info);
				}, error => {
					this.handleError(error);
				});
		});
	}

	getCircles() {
		return new Promise((resolve, reject) => {
			this.restService
				.getCircles()
				.subscribe(data => {
					resolve(data.info);
				}, error => {
					this.handleError(error);
				});
		});
	}

	getPurse() {
		return new Promise((resolve, reject) => {
			this.restService.getPurse()
				.subscribe(data => {
					let primaryAddress = this.myWallet.primaryAddress;
					this.userService.myPurse = data;
					if (primaryAddress && !data.primaryAddress) {
						this.updatePurse(primaryAddress, data.id);
						// update the purse in user service.
						data.primaryAddress = primaryAddress;
						this.userService.myPurse = data;
					}

					resolve(data);
				}, e => {
					resolve(e);
				});
		});
	}

	private updatePurse(primaryAddress: string, purseId: any) {
		let data = new WalletInfo(purseId, primaryAddress, this.myWallet.walletBalance);
		this.restService.updateUserPurse(data).subscribe(r => {
			console.log("primary address updated");
		}, e => {
			console.log(e);
		});
	}

	updateMenu() {
		this.local.updateMenuData(new MenuData(this.chronicDiseases, this.userProfilePic, this.circles, this.customCampaigns, this.health_index_score));
	}

	public goToHealthIndex = () => {
		if (this.health_index_score == null || this.health_index_score == undefined) {
			return;
		}
		this.navCtrl.setRoot('HealthIndexPage');
	}

	public goToOmCoins = () => {
		this.navCtrl.setRoot('MyWalletPage');
	}

	public goToEditProfile = () => {
		this.navCtrl.setRoot('EditProfilePage');
	}

	public goToCD = (campaigns) => {

		if (campaigns.length > 1) {
			this.history.addHistory(this.view);
			this.local.setLocalCampaigns(campaigns);
			this.navCtrl.setRoot('ChfCampaignPage');
		} else if (campaigns.length == 1) {
			let campaign = campaigns[0];
			if (campaign.campaignInfo.circleInfo.invitationState == 'accept') {
				this.history.addHistory(this.view);
				this.local.setLocalCampaign(campaign);
				this.navCtrl.setRoot('ChfPage', { 'campaign': campaign });
			} else {
				let modal = this.modalCtrl.create('ChfNotificationPage', { 'campaign': campaign }, { showBackdrop: true, enableBackdropDismiss: true });
				modal.onDidDismiss(state => {
					if (state == 'accept') {
						this.navCtrl.setRoot('ChfPage');
					}
				})
				modal.present();
			}
		}
	}

	public goToMedRecords = () => {
		this.storage.get("doc_data").then((result) => {
			if (result) {
				if (result.length > 0) {
					this.navCtrl.setRoot('MyMedRecordsPage');
				} else {
					this.navCtrl.setRoot('InitialMedRecordsPage');
				}
			} else {
				this.navCtrl.setRoot('InitialMedRecordsPage');
			}
		});
	}

	public goToCircles = () => {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('MyCirclesPage');
		// if (!this.circle_new) {
		// 	this.navCtrl.setRoot('MyCirclesPage');
		// } else {
		// 	this.navCtrl.setRoot('WelcomeCirclePage');
		// }
	}

	public goToCampaigns() {
		this.history.addHistory(this.view);
		this.local.setLocalCampaigns(this.customCampaigns);
		this.navCtrl.setRoot('CampaignPage');
		// if (!this.campaign_new) {
		// 	this.local.setLocalCampaigns(this.customCampaigns);
		// 	this.navCtrl.setRoot('CampaignPage');
		// } else {
		// 	this.navCtrl.setRoot('CampaignNewPage');
		// }
	}

	goCampaignNoti() {
		this.navCtrl.setRoot('CampaignNotificationPage');
	}

	public goToCircleNotification() {
		this.navCtrl.setRoot('CircleNotificationPage');
	}

	public configureWallet() {
		this.navCtrl.push("WalletConfgPage");
	}

	handleError(error) {
		console.log(error);
	}

}
