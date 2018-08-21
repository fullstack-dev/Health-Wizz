import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { Rest } from '../../../providers/rest';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../../providers/helper-service';
import { Toast } from '@ionic-native/toast';
import { MyWalletProvider } from '../../../providers/wallet/my-wallet-provider';

@IonicPage()
@Component({
	selector: 'page-my-wallet',
	templateUrl: 'my-wallet.html',
})
export class MyWalletPage {

	result: any;
	rewards: any;
	walletList: any;
	errorMessage: any;
	balance: string;

	purse: any;
	ledgers: Array<any>;
	public copyFlag: boolean[] = null;
	public copyClickNum: number[] = [];
	constructor(
		public navCtrl: NavController,
		private alertCtrl: AlertController,
		public navParams: NavParams,
		public rest: Rest,
		private restService: RestDataProvider,
		private helper: Helper,
		private toast: Toast,
		private clipboard: Clipboard,
		public myWallet: MyWalletProvider
	) {
		this.copyFlag = new Array<boolean>();
		this.copyClickNum = [0, 0, 0, 0, 0, 0];
		this.myWallet.updateOmpBalance();
	}

	ionViewDidLoad() {
		// this.getRewards();
		this.helper.showLoading();
		this.getWalletData()
			.then((data: Array<any>) => {
				this.helper.hideLoading();
				this.purse = data[0];
				this.ledgers = data[1];

				// this.ledgers.forEach(item => {
				// 	item.transactionDate = this.helper.UTCtoLocalDate(item.transactionDate);
				// });
			});
	}

	getWalletData() {
		let promises = [];
		promises.push(this.getPurse());
		promises.push(this.getLedger());
		return Promise.all(promises);
	}

	getPurse() {
		return new Promise((resolve, reject) => {
			this.restService.getPurse()
				.subscribe(data => {
					resolve(data);
				}, this.handleError);
		});
	}

	showAddress() {
		let alert = this.alertCtrl.create({
			title: "Wallet Address!",
			message: this.purse.primaryAddress,
			buttons: [
				{ text: "Ok", role: "cancel" },
				{
					text: "Copy",
					handler: () => {
						this.clipboard.copy(this.purse.primaryAddress).then(r => {
							this.toast.showShortBottom("Address copied!").subscribe(r => { });
						}).catch(e => {
							this.toast.showShortBottom("Unable to copy!").subscribe(r => { });
						});
					}
				}
			]
		});
		alert.present();
	}

	getLedger() {
		return new Promise((resolve, reject) => {
			this.restService.getLedger()
				.subscribe(data => {
					resolve(data.info);
				}, this.handleError);
		});
	}

	getRewards() {
		this.rest.getRewards()
			.subscribe(
				rewards => {
					this.result = rewards;
					console.log("scores: ", this.result);

					if (this.result) {
						this.balance = this.result.balance;
						this.rewards = this.result.transaction_history;
					}
				},
				error => {
					this.errorMessage = <any>error;
				});
	}



	public before = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public byOmCoinsClick = () => {
		// this.navCtrl.setRoot('DepositPage', { content: item });

		this.helper.getAmount()
			.then(amount => {
				if (amount) {
					if (amount < 25) {
						this.toast.showShortBottom("Minimum amount is $25.").subscribe((r => { }));
						this.byOmCoinsClick();
						return;
					} else {
						this.helper.sendEmailForShop("buying OmPoints for $" + amount, "Request to buy OmPoints")
							.then(r => {
								console.log(r);
							}).catch(e => {
								console.log(e);
							});
					}
				}
			}).catch(e => {
				console.log(e);
			});


	}

	public shopClick = () => {
		this.navCtrl.setRoot('ShopPage');
	}

	public transactionHistoryItemSelected(item) {
		this.navCtrl.setRoot('OmcTransactionPage', { content: item });
	}

	public transfer(item) {
		this.navCtrl.setRoot('OmcTransferPage', { content: item });
	}

	public addressCopy(index, item) {

		this.copyFlag[index] = true;
		this.copyClickNum[index] += 1;

		if (this.copyFlag[index] && this.copyClickNum[index] == 2) {
			this.navCtrl.setRoot('ShopPage', { content: item });
		}
	}

	public handleError(error) {
		this.helper.hideLoading();
		console.log(error);
	}

}
