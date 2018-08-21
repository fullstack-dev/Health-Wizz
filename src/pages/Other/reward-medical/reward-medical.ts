import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Rest } from '../../../providers/rest';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { UserService } from '../../../providers/user-service';
import { Helper } from '../../../providers/helper-service';
import { ConstProvider } from '../../../providers/const/const';
import { MyWalletProvider } from '../../../providers/wallet/my-wallet-provider';

@IonicPage()
@Component({
	selector: 'page-reward-medical',
	templateUrl: 'reward-medical.html',
})
export class RewardMedicalPage {
	rewardsList = [];
	campaign: any;
	memberInfo: any;
	rewardsList1: Array<RewardInfo>;
	selectedTrue = [];
	checkReward: boolean = false;
	campaign_balance: number;
	memberPurse: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public rest: Rest,
		public local: LocalDataProvider,
		private restService: RestDataProvider,
		private constants: ConstProvider,
		private helper: Helper,
		private myWallet: MyWalletProvider,
		private userService: UserService
	) {
		this.rewardsList1 = [];
		this.campaign = this.navParams.get('campaign');
		this.memberInfo = this.navParams.get('memberInfo');
		this.getMemberPurse();
		this.getBalance();
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad RewardMedicalPage');
		this.restService.getRewards(this.campaign.id).
			subscribe(res => {
				console.log(res);
				this.rewardsList = res.info;
				this.rewardsList.forEach(e => {
					this.rewardsList1.push(new RewardInfo(e, false));
				});
			});
	}

	getMemberPurse() {
		this.restService.getMemberPurse(this.campaign.campaignInfo.circleInfo.id, this.memberInfo.memberId)
			.subscribe(data => {
				console.log("member purse => ", data);
				this.memberPurse = data;
			}, e => {
				console.log(e);
			})
	}

	disableReward(reward) {
		let flag = false;
		if (reward && reward.recipient) {
			reward.recipient.forEach(recipient => {
				if (recipient.memberId == this.memberInfo.memberId) {
					flag = true;
				}
			});
		}
		return flag;
	}

	get campaignAddress() {
		return this.campaign.campaignInfo.purse.primaryAddress;
	}

	get memberAddress() {
		if (this.memberPurse) {
			return this.memberPurse.primaryAddress;
		}
		return null;
	}

	getBalance() {
		try {
			let address = this.campaignAddress;
			if (address) {
				this.myWallet.getBalanceByAddress(address)
					.then(data => {
						this.campaign_balance = data;
					}).catch(e => {
						console.log(e);
					});
			} else {
				this.campaign_balance = 0;
			}
		} catch (e) {
			console.log(e);
		}
	}

	get RewardType(): string {
		if (!this.rewardsList) {
			return this.constants.REWARD_TYPES.NO_REWARD;
		}
		let type = this.campaign.campaignInfo.fundedBy[0].sourceType;
		let rewardLength = this.rewardsList.length;
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

	goCampaign() {
		this.navCtrl.pop();
	}

	done() {
		this.navCtrl.setRoot('CampaignPage');
	}

	checkValidation() {
		let flag = false;
		this.rewardsList1.forEach(item => {
			if (item.selected) {
				flag = true;
			}
		});

		return flag;
	}

	get rewardTotal(): number {
		let amount: number = 0;
		if (this.RewardType == this.constants.REWARD_TYPES.FUND_YOURSELF) {
			// amount
			amount = 0;
			this.rewardsList1.forEach((item, i, a) => {
				if (item.selected && typeof (item.reward.amount) == 'number') {
					amount += item.reward.amount;
				}
			});
			return amount;
		} else if (this.RewardType == this.constants.REWARD_TYPES.PARTICIPATION_FEE) {
			// percentage
			amount = 0;
			let total_percent = 0;
			this.rewardsList1.forEach((item, i, a) => {
				if (item.selected && typeof (item.reward.percentage) == 'number') {
					total_percent += item.reward.percentage;
				}
				else if (item.selected && typeof (item.reward.percentage) == 'string') {
					total_percent += parseInt(item.reward.percentage);
				}

			});
			if (total_percent > 0) {
				amount = ((this.campaign_balance) * (total_percent / 100));
				if (amount > 0) {
					return amount;
				} else {
					return 0;
				}
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}

	goToSuccess() {
		if (this.userService.getUserId() != this.campaign.campaignInfo.circleInfo.ownerId) {
			this.helper.showAlert("You are not owner of this campaign.", "Permission error!");
			return;
		}
		if (!this.myWallet.have_wallet || !this.myWallet.configured_wallet) {
			this.helper.showAlert("Please configure your wallet!", "Error!");
			return;
		}
		if (!this.campaign_balance || this.campaign_balance == 0) {
			this.helper.showAlert("No fund available for the campaign.", "Insufficiant fund!");
			return;
		}
		let isValid = this.checkValidation();
		if (isValid) {
			if (this.campaignAddress && this.memberAddress) {
				const amount = this.rewardTotal;
				if (amount > 0) {
					this.helper.showLoading();

					this.haveEnoughFund(amount)
						.then(res => {
							if (res) {
								this.myWallet.transferOmp(this.memberAddress, amount, this.campaignAddress)
									.then(txHash => {
										this.giveReward1()
											.then(r => {
												this.myWallet.updateCampaignLedger(this.campaign.id, "For " + this.campaign.name + " campaign rewards.", amount, this.memberInfo.memberId, 'user', txHash)
													.subscribe(r => {
														this.goToRewardSuccess();
													}, e => {
														// fail to update campaing ledger
														console.error(e);
														this.goToRewardSuccess();
													});
											}).catch(e => {
												// transection sucess but fail to update on server.
												console.error(e);
												this.goToRewardSuccess();
											});
									}).catch(e => {
										console.log(e);
										this.helper.hideLoading();
										this.helper.showAlert("Unable to process your request.", "Error!");
									});
							} else {
								this.helper.hideLoading();
								this.helper.showAlert("Unable to process your request.", "Error!");
							}

						}).catch(e => {
							if (e) {
								this.helper.hideLoading();
								this.helper.showAlert("This campaign doesn't have enough fund. Available OmPoints are " + e, "Out of fund!");
							} else {
								this.helper.hideLoading();
								this.helper.showAlert("Unable to process your request.", "Error!");
							}
						});
				}
			} else {
				this.helper.showAlert("Unable to process your request.", "Error!");
			}
		} else {
			this.helper.showAlert("Please choose any one rewards!", "Error");
			return;
		}
	}

	goToRewardSuccess() {
		this.helper.hideLoading();
		setTimeout(() => {
			this.navCtrl.push("RewardSuccessPage")
				.then(r => {
					this.navCtrl.remove(this.navCtrl.getActive().index - 1, 1);
				});
		}, 100);
	}

	haveEnoughFund(rewardAmount: number) {
		return new Promise((resolve, reject) => {
			if (this.campaignAddress) {
				this.myWallet.getBalanceByAddress(this.campaignAddress)
					.then(balance => {
						if (balance > 0) {
							if (balance >= rewardAmount) {
								resolve(true);
							} else {
								reject(balance);
							}
						} else {
							reject(0);
						}
					}).catch(e => {
						resolve(null);
					});
			} else {
				resolve(null);
			}
		});

	}

	giveReward1() {
		let promises = [];
		this.rewardsList1.forEach((item, i, a) => {
			if (item.selected) {
				promises.push(this.giveReward2(item));
			}
		});
		return Promise.all(promises);
	}

	giveReward2(item) {
		return new Promise((resolve, reject) => {
			item.reward.state = "PARTIAL";
			item.reward.recipient = [this.memberInfo];
			this.restService.updateReward(this.campaign.id, item.reward).
				subscribe(res => {
					if (res) {
						resolve();
					}
				}, e => {
					reject();
				});
		});
	}
}

export class RewardInfo {
	constructor(
		public reward: any,
		public selected: boolean
	) { }
}
