import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { MyWalletProvider } from '../../../providers/wallet/my-wallet-provider';

@IonicPage()
@Component({
  selector: 'page-campaign-join',
  templateUrl: 'campaign-join.html',
})
export class CampaignJoinPage {

  participation_fee: number;
  have_fund: boolean;

  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public myWallet: MyWalletProvider
  ) {
    this.participation_fee = this.navParams.get('fees');
    if (this.myWallet.walletBalance >= this.participation_fee) {
      this.have_fund = true;
    } else {
      this.have_fund = false;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CampaignJoinPage');
  }

  yesClick() {
    this.viewCtrl.dismiss("yes");
  }

  noClick() {
    this.viewCtrl.dismiss("no");
  }

  close() {
    this.viewCtrl.dismiss("no");
  }

}
