import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the DepositFailurePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-deposit-failure',
  templateUrl: 'deposit-failure.html',
})
export class DepositFailurePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DepositFailurePage');
  }

  public Before = () => {
    this.navCtrl.setRoot('DepositPage');
  }

  public TryAgain = () => {
    this.navCtrl.setRoot('DepositPage');
  }

  public Close = () => {
  	this.navCtrl.setRoot('MyWalletPage');
  }

}
