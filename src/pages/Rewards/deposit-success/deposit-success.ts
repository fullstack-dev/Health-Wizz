import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the DepositSuccessPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-deposit-success',
  templateUrl: 'deposit-success.html',
})
export class DepositSuccessPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DepositSuccessPage');
  }

  public Before = () => {
  	this.navCtrl.setRoot('DepositPage');
  }

  public Close = () => {
  	this.navCtrl.setRoot('MyWalletPage');
  }

}
