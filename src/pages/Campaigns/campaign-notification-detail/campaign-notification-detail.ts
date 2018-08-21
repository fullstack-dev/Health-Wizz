import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { Rest } from '../../../providers/rest';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Participant, IndicatorModel, HealthIndexIndicator, RewardsData } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { Helper } from '../../../providers/helper-service';
import { HistoryProvider } from '../../../providers/history/history';
import { UserService } from '../../../providers/user-service';
import { Toast } from '@ionic-native/toast';
import { ConstProvider } from '../../../providers/const/const';
import { MyWalletProvider } from '../../../providers/wallet/my-wallet-provider';
@IonicPage()
@Component({
	selector: 'page-campaign-notification-detail',
	templateUrl: 'campaign-notification-detail.html',
})
export class CampaignNotificationDetailPage {
	view: string = 'CampaignNotificationDetailPage';
	campaignData: any;
	terms: any;
	omCoins: any;
	measured: HealthIndexIndicator[];
	// organizers: Array<{ name: string, value: string }> = [];
	organizers: CampaignOrganizers[];
	rewardList: RewardsData[];
	avatars = [];
	avatarsMemebers: number;
	errorMessage: string;
	status: string;
	value: string;
	config: Object;
	participants: Array<Participant>;
	hasSurvey: boolean;
	ended: boolean;
	from_invite: boolean;
	campaign_wallet_address: string;
	campaign_balance: number;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public restService: RestDataProvider,
		public domSanitizer: DomSanitizer,
		public local: LocalDataProvider,
		private helper: Helper,
		private history: HistoryProvider,
		public modalCtrl: ModalController,
		private userService: UserService,
		private toast: Toast,
		private actionSheetCtrl: ActionSheetController,
		private constants: ConstProvider,
		private myWallet: MyWalletProvider
	) {
		try {
			this.status = navParams.get('status');
			this.value = navParams.get('value');
			this.ended = navParams.get('ended');
			this.from_invite = navParams.get('from_invite');
			let campaignData = local.getLocalCampaign();
			this.refreshCampaignData(campaignData.id)
				.then(res => {
					this.getIndicators();
					this.loadCampaignInfo();
					this.getBalance();
				});
			this.organizers = [
				new CampaignOrganizers("Moderators", []),
				new CampaignOrganizers("Validators", [])
			]

			this.config = {
				scrollbar: '.swiper-scrollbar',
				scrollbarHide: true,
				slidesPerView: 'auto',
				centeredSlides: true,
				observer: true,
				spaceBetween: 1,
				grabCursor: true,
				onSlideChangeEnd: function (swiper) {
					// that.swipe(swiper);
				}
			};
		} catch (e) {
			console.log(e);
		};

	}

	refreshCampaignData(campaign_id: string | number) {
		return new Promise<boolean>((resolve) => {
			this.restService.getCampaign(campaign_id)
				.subscribe(res => {
					this.campaignData = res;
					resolve(true);
				}, e => {
					resolve(null);
				});
		})

	}

	loadCampaignInfo() {
		this.helper.showLoading();
		this.getCampaignInfo().then(data => {
			this.helper.hideLoading();
			this.participants = data[0];
			this.getOrganizers();
		}).catch(e => {
			this.helper.hideLoading();
		});
	}

	getBalance() {
		let address = this.campaignData.campaignInfo.purse.primaryAddress;
		if (address) {
			this.myWallet.getBalanceByAddress(address).then(data => {
				this.campaign_balance = data;
			}).catch(e => {
				console.log(e);
			});
		}
	}

	getCampaignInfo() {
		let promises = [];
		promises.push(this.loadParticipants());
		promises.push(this.getCampaignSurvey());
		promises.push(this.getCampaignRewards());
		return Promise.all(promises);
	}

	getOrganizers() {
		let name;
		let value;
		this.participants.forEach(p => {
			name = p.info.firstName;
			if (p.info.lastName) {
				name = name + " " + p.info.lastName;
			}
			if (p.info.memberRoles.moderator && p.info.memberRoles.validator) {
				this.organizers[0].peoples.push(name);
				this.organizers[1].peoples.push(name);
			} else if (p.info.memberRoles.moderator && !p.info.memberRoles.validator) {
				this.organizers[0].peoples.push(name);
			} else if (!p.info.memberRoles.moderator && p.info.memberRoles.validator) {
				this.organizers[1].peoples.push(name);
			}
		});
	}

	getIndicators() {
		this.measured = new Array();
		let indexes = this.local.getLocalHealthIndexes();
		if (this.campaignData.challengeTemplateInfo) {
			this.campaignData.challengeTemplateInfo.indicatorLst.forEach(c_index => {
				indexes.forEach(h_index => {
					if (h_index.code == c_index.code) {
						this.measured.push(h_index);
					}
				});
			});
		}
	}

	getCampaignSurvey() {
		return new Promise((resolve, reject) => {
			if (this.campaignData) {
				// this.helper.showLoading();
				this.restService.getSurvey(this.campaignData.id)
					.subscribe(res => {
						console.log(res);
						// this.helper.hideLoading();
						resolve();
						if (res && res != {}) {
							this.hasSurvey = true;
						} else {
							this.hasSurvey = false;
						}
					}, err => {
						this.hasSurvey = false;
						if (err.code == 409) {
							resolve();
						} else {
							reject();
						}

						// this.helper.hideLoading();
						console.log(err);
					});
			} else {
				reject();
			}
		});
	}

	getCampaignRewards() {
		return new Promise((resolve, reject) => {
			if (this.campaignData) {
				this.restService.getRewards(this.campaignData.id)
					.subscribe(res => {
						console.log(res);
						resolve();
						this.rewardList = res.info;
					}, err => {
						if (err.code == 401 || err.code == 403) {
							resolve();
						} else {
							reject();
						}

						// this.helper.hideLoading();
						console.log(err);
					});
			} else {
				reject();
			}
		});

	}

	showMoreActions() {
		if (!this.campaignData) {
			return false;
		}
		if (this.campaignData.moderator) {
			let moreActions = this.actionSheetCtrl.create({
				title: this.campaignData.name,
				buttons: [
					{
						text: "Change share settings",
						handler: () => {
							this.navCtrl.push("CampaignAcceptPage", { 'campaign': this.campaignData });
						}
					},
					{
						text: "Cancel",
						role: "cancel",
						handler: () => {

						}
					}
				]
			});
			moreActions.present();
		} else {
			let moreActions = this.actionSheetCtrl.create({
				title: this.campaignData.name,
				buttons: [
					{
						text: "Change share settings",
						handler: () => {
							this.navCtrl.push("CampaignAcceptPage", { 'campaign': this.campaignData });
						}
					},
					{
						text: "Leave campaign",
						handler: () => {
							this.leaveCampaign();
						}
					},
					{
						text: "Cancel",
						role: "cancel",
						handler: () => {

						}
					}
				]
			});
			moreActions.present();
		}

	}

	leaveCampaign() {
		let leave_confirm = this.modalCtrl.create('ConfirmPopupPage', { 'title': "Leave!", 'message': "Are you sure to leave this campaign?", 'pos_text': "Yes", 'neg_text': "No" }, { enableBackdropDismiss: true });
		leave_confirm.onDidDismiss(empty_res => {
			if (empty_res == true) {
				if (this.campaignData.campaignInfo.circleInfo.invitationState == 'accept') {
					let campaign = JSON.parse(JSON.stringify(this.campaignData));
					campaign.campaignInfo.circleInfo.invitationState = 'left';
					this.restService.acceptDenyCampaign(campaign)
						.subscribe(result => {
							this.campaignData.campaignInfo.circleInfo.invitationState = 'left';
							this.local.updateCampaigns(campaign, 'left');
							this.navCtrl.setRoot(this.history.getHistory());
						}, err => {
							this.helper.showAlert("There is a problem in processing your request, try again!", "");
						});

				}
			}
		});
		leave_confirm.present();
	}

	get RewardType(): string {
		if (!this.rewardList) {
			return this.constants.REWARD_TYPES.NO_REWARD;
		}
		let type = this.campaignData.campaignInfo.fundedBy[0].sourceType;
		let rewardLength = this.rewardList.length;
		if (type == this.constants.FUND_SOURCE_TYPE.MODERATOR && rewardLength > 0) {
			return this.constants.REWARD_TYPES.FUND_YOURSELF;
		} else if (type == this.constants.FUND_SOURCE_TYPE.PARTICIPANTS && rewardLength > 0) {
			return this.constants.REWARD_TYPES.PARTICIPATION_FEE;
		} else if (type == this.constants.FUND_SOURCE_TYPE.MODERATOR && rewardLength == 0) {
			return this.constants.REWARD_TYPES.NO_REWARD;
		} else {
			return this.constants.REWARD_TYPES.NO_REWARD;
		}
	}

	get haveIndicators(): boolean {
		if (!this.campaignData) {
			return false;
		}
		if (this.campaignData.challengeTemplateInfo && this.campaignData.challengeTemplateInfo.indicatorLst) {
			if ((this.campaignData.challengeTemplateInfo.indicatorLst).length > 0) {
				return true;
			}
		}
		return false;
	}

	get showActions() {
		if (!this.campaignData) {
			return false;
		}
		if (this.ended) {
			return false;
		}
		if (!this.isStarted) {
			return false;
		}
		if (this.campaignData.campaignInfo.circleInfo.invitationState != "invite") {
			return true;
		}
		return false;
	}

	get isPublished() {
		if (!this.campaignData) {
			return false;
		}
		try {
			if (this.campaignData.campaignInfo.isPublish) {
				return true;
			}
			return false;
		} catch (e) {
			return false;
		}

	}

	get isStarted() {
		if (!this.campaignData) {
			return false;
		}
		let today = new Date().getTime();
		let startDate = new Date(this.campaignData.startDate).getTime();
		if (startDate < today) {
			return true;
		}
		return false;
	}

	publishCampaign() {
		try {
			this.helper.showLoading();
			this.refreshCampaignData(this.campaignData.id)
				.then(res => {
					this.helper.hideLoading();
					if (res) {
						let campaign = JSON.parse(JSON.stringify(this.campaignData.campaignInfo));
						try {
							campaign.isPublish = true;
							campaign.publishedBy = this.userService.getUserId();
						} catch (e) {
							this.toast.showShortBottom("Cannot publish this Campaign at this moment. Try again later!").subscribe(r => { });
							return;
						}

						this.helper.showConfirm("Publish Campaign", "Are you sure you want to publish this Campaign?", "YES", "NO")
							.then(r => {
								this.helper.showLoading();
								this.haveEnoughFund().then(res => {
									this.restService.publishCampaign(campaign, campaign.id)
										.subscribe(r1 => {
											this.helper.hideLoading();
											this.toast.showShortBottom("Campaign published!").subscribe(r2 => { });
											this.campaignData.campaignInfo.isPublish = true;
											this.campaignData.campaignInfo.publishedBy = this.userService.getUserId();
											this.local.updateLocalCampaigns(this.campaignData);
										}, err => {
											this.helper.hideLoading();
											this.toast.showShortBottom("Unable to publish this Campaign. Try again!").subscribe(r2 => { });
											console.log(err);
										});
								}).catch(e => {
									console.log(e);
									this.helper.hideLoading();
									this.toast.showShortBottom("Unable to publish this Campaign. Try again!").subscribe(r2 => { });
								});
							}).catch(err => {
								console.log(err);
							});
					} else {
						this.toast.showShortBottom("Unable to publish this Campaign. Try again!").subscribe(r2 => { });
					}
				});
		} catch (e) {
			this.toast.showShortBottom("Unable to publish this Campaign. Try again!").subscribe(r2 => { });
			console.log(e);
		}

	}

	haveEnoughFund() {
		return new Promise((resolve, reject) => {
			if (this.RewardType == this.constants.REWARD_TYPES.NO_REWARD) {
				resolve(true);
				return;
			}

			if (!this.myWallet.configured_wallet) {
				this.helper.showAlert("To publish this campaign, you need to configure your wallet.", "No Wallet!");
				reject(false);
				return;
			}

			if (this.RewardType == this.constants.REWARD_TYPES.PARTICIPATION_FEE) {
				if (!this.haveWallet) {
					this.myWallet.createCampaignWallet(this.campaignData)
						.then(address => {
							resolve(address);
						}).catch(e => {
							reject("no_campaign_wallet");
						})
				} else {
					resolve();
				}
			} else {
				if (!this.haveWallet) {
					// create a campaing wallet address
					this.myWallet.createCampaignWallet(this.campaignData)
						.then(address => {
							if (address) {
								this.transferFundsInCampaign(address)
									.then(r => {
										this.myWallet.updateOmpBalance();
										resolve(r);
									}).catch(e => {
										reject(e);
									});
							} else {
								reject("save_failed");
							}
						});
				} else {
					this.transferFundsInCampaign(this.campaignData.campaignInfo.purse.primaryAddress)
						.then(r => {
							resolve(r);
						}).catch(e => {
							reject(e);
						});
				}
			}
		});
	}

	private transferFundsInCampaign(campaign_address: string, quantity: number = 0) {
		return new Promise((resolve, reject) => {
			if (this.RewardType == this.constants.REWARD_TYPES.FUND_YOURSELF) {
				this.helper.hideLoading();
				let budget_modal = this.modalCtrl.create("CampaignBudgetPage", { 'rewards': this.rewardList });
				budget_modal.onDidDismiss(data => {
					if (data && data.amount) {
						this.myWallet.transferOmp(campaign_address, data.amount)
							.then(txHash => {
								this.myWallet.updateUserLedger("Fund in " + this.campaignData.name + " campaign.", data.amount, this.campaignData.campaignInfo.id, 'campaign', txHash);
								// this.myWallet.updateCampaignLedger(this.campaignData.id, "Fund in " + this.campaignData.name + " campaign.", 0 - data.amount, this.userService.getUserId(), 'user', txHash);
								// this.myWallet.updateMyPurse();
								this.helper.showLoading();
								resolve();
							})
							.catch(e => {
								if (e == "No net") {
									this.helper.showAlert("Can't reach to the server.", "Error!");
								}
								reject(e);
							});
					} else {
						reject("amount_dismissed");
					}
				});
				budget_modal.present();

			} else {
				// reward type = participation fee. // cut the fees from user wallet.
				this.myWallet.transferOmp(campaign_address, quantity)
					.then(txHash => {
						this.myWallet.updateUserLedger("Fee for joining " + this.campaignData.name + " campaign.", quantity, this.campaignData.campaignInfo.id, 'campaign', txHash);
						// this.myWallet.updateCampaignLedger(this.campaignData.id, "Fee for joining " + this.campaignData.name + " campaign.", 0 - quantity, this.userService.getUserId(), 'user', txHash);
						// this.myWallet.updateMyPurse();
						resolve();
					})
					.catch(e => {
						if (e == "No net") {
							this.helper.showAlert("Can't reach to the server.", "Error!");
						}
						reject(e);
					});
				// resolve();
			}
		});
	}

	async updateLedgerEntries(description, amount, txHash) {
		await this.myWallet.updateUserLedger("Fund in " + this.campaignData.name + " campaign.", amount, this.campaignData.campaignInfo.id, 'campaign', txHash)
			// await this.myWallet.updateCampaignLedger(this.campaignData.id, "Fund in " + this.campaignData.name + " campaign.", 0 - amount, this.userService.getUserId(), 'user', txHash)
			.toPromise()
			.catch(e => { });
		// await this.myWallet.updateMyPurse()
		// 	.catch(e => { });
	}

	/**
	 * check if campaign wallet address is present.
	 */
	get haveWallet() {
		if (!this.campaignData) {
			return false;
		}
		if (this.campaignData.campaignInfo.purse.primaryAddress) {
			return true;
		} else {
			return false;
		}
	}

	deleteCampaign() {
		let deleteModal = this.modalCtrl.create('CampaignDeletePage', { 'campaign': this.campaignData });
		deleteModal.onDidDismiss(data => {
			if (data == true) {
				this.navCtrl.setRoot("CampaignPage");
			}
		});
		deleteModal.present();
	}

	loadParticipants() {
		return new Promise((resolve, reject) => {
			this.getParticipants(this.campaignData.campaignInfo.circleInfo.id)
				.then((participants: Array<any>) => {
					this.profilePicResolver(participants)
						.then((final_list) => {
							resolve(final_list);
						});
				}).catch(e => {
					reject(e);
				});
		});
	}

	profilePicResolver(participants: any[]) {
		let promises = [];
		participants.forEach((member, i, a) => {
			promises.push(this.getParticipantProfilePic1(member));
		});
		return Promise.all(promises);
	}

	getParticipants(circleId: string) {
		return new Promise((resolve, reject) => {
			this.restService.getParticipants(circleId)
				.subscribe((result: any) => {
					resolve(result.info);
				}, e => {
					reject(e);
				});
		});
	}

	getParticipantProfilePic1(member: any): Promise<Participant> {
		return new Promise((resolve) => {
			this.restService.getProfilePic(member.memberId)
				.subscribe(pic => {
					let imagePath: SafeResourceUrl;
					imagePath = this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + pic.image);
					resolve(new Participant(member, imagePath));
				}, e => {
					try {
						if (member.gender == "male") {
							resolve(new Participant(member, "assets/imgs/HomeIcons/avatar_male_middle_01.png"));
						} else {
							resolve(new Participant(member, "assets/imgs/HomeIcons/avatar_female_middle_01.png"));
						}
					} catch (e) { }
				});
		});
	}

	before() {
		this.navCtrl.setRoot(this.history.getHistory());
	}

	goHistory() {
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('ReportHistoryPage', { 'campaign': this.campaignData });
	}

	goUpdate() {
		let all_indexes = this.local.localIndexes;
		let custom_indexes: Array<IndicatorModel> = [];
		if (this.campaignData.challengeTemplateInfo) {
			this.campaignData.challengeTemplateInfo.indicatorLst.forEach(indicator => {
				all_indexes.forEach(index => {
					if (indicator.code == index.info.code) {
						custom_indexes.push(index);
					}
				});
			});
		}

		// if (custom_indexes.length == 0) {
		// 	this.helper.showAlert("No indexes are present in this campaign", "");
		// 	return;
		// }
		this.local.localCustomIndexes = custom_indexes;
		this.history.addHistory(this.view);
		this.navCtrl.setRoot('SubmitReportPage', { 'card_index': 0, 'custom': true });
	}

	acceptClick() {
		// FIXME: check campaign wallet exists or not.
		if (this.RewardType != this.constants.REWARD_TYPES.NO_REWARD) {
			if (!this.haveWallet) {
				this.helper.showAlert("You cannot join this campaign for now. Try later!", "Warning!");
				return;
			}

			if (!this.myWallet.configured_wallet || !this.myWallet.have_wallet) {
				this.helper.showAlert("To join this campaign, you first need to configure your wallet!", "No Wallet!");
				return;
			}
		}

		if (this.RewardType == this.constants.REWARD_TYPES.PARTICIPATION_FEE) {
			try {
				let fees = this.campaignData.campaignInfo.fundedBy[0].participantFee;
				if (fees) {
					if (this.myWallet.configured_wallet && this.myWallet.have_wallet) {
						let join_confirm = this.modalCtrl.create('CampaignJoinPage', { 'fees': fees }, { enableBackdropDismiss: false });
						join_confirm.onDidDismiss(res => {
							if (res == "yes") {
								this.transferFundsInCampaign(this.campaignData.campaignInfo.purse.primaryAddress, fees)
									.then(r => {
										this.myWallet.updateOmpBalance();
										this.acceptCampaign();
									}).catch(e => {
										this.helper.showAlert("Unable to process your request. Try later.", "Error!");
									})
							} else {
								return;
							}
						});
						join_confirm.present();
					} else {
						this.helper.showAlert("To join this campaign, you first need to configure your wallet!", "No Wallet!");
					}
				} else {
					this.helper.showAlert("Unable to process your request. Try later.", "Error!");
				}
			} catch (e) {
				console.log(e);
				this.helper.showAlert("Unable to process your request. Try later.", "Error!");
			}
		} else {
			let accept_confirm = this.modalCtrl.create('ConfirmPopupPage', { 'title': "Accept!", 'message': "Are you sure to accept this campaign invitation?", 'pos_text': "Yes", 'neg_text': "No" }, { enableBackdropDismiss: true });
			accept_confirm.onDidDismiss(empty_res => {
				if (empty_res == true) {
					this.acceptCampaign();
				}
			});
			accept_confirm.present();
		}

	}

	acceptCampaign() {
		if (this.campaignData.campaignInfo.circleInfo.invitationState == 'invite') {
			let campaign = JSON.parse(JSON.stringify(this.campaignData));
			campaign.campaignInfo.circleInfo.invitationState = 'accept';
			this.restService.acceptDenyCampaign(campaign)
				.subscribe(result => {
					this.campaignData.campaignInfo.circleInfo.invitationState = 'accept';
					this.local.updateCampaigns(campaign, 'accept');
					this.navCtrl.push('CampaignAcceptPage', { 'campaign': this.campaignData });
				}, err => {
					this.helper.showAlert("There is a problem in processing your request, try again!", "");
				});
		}
	}

	deny() {
		this.helper.showConfirm("Don't want to participate?", "Are you sure you want to delete the invitation for this Campaign?", "Yes", "No")
			.then(y => {
				let campaign = JSON.parse(JSON.stringify(this.campaignData));
				campaign.campaignInfo.circleInfo.invitationState = 'deny';
				this.restService.acceptDenyCampaign(campaign)
					.subscribe(result => {
						this.local.updateCampaigns(campaign, 'deny');
						this.navCtrl.pop();
					}, err => {
						console.log(err);
					});
			}).catch(n => {
				console.log(n);
			});

	}

	handleError(error) {
		console.log(error);
	}
}

class CampaignOrganizers {
	constructor(
		public label: string,
		public peoples: string[]
	) { }
}
