import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the OmcTransferPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-omc-transfer',
  templateUrl: 'omc-transfer.html',
})
export class OmcTransferPage {

	receivedValue: any;
  
  amountOmC: number;
  balance: number;
  balanceLogo: string;
  transferTitle: string;
  walletAddress: string;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams) {
		this.amountOmC = 1376;
	}

	ionViewDidLoad() {

    let temp = this.navParams.get('content');
    if(temp){
      this.balance = temp.balance;
      this.balanceLogo = temp.balance_logo;
      this.transferTitle = temp.wallet_title;
      this.walletAddress = temp.wallet_address;

    } else {
      this.receivedValue = [];
    }
	}

	public before() {
		this.navCtrl.setRoot('MyWalletPage', {status: "none"});
	}

	public transferClick() {
		this.navCtrl.setRoot('MyWalletPage', {status: "result"});
	}

}
