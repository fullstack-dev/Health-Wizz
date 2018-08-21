import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SpendConfirmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-spend-confirm',
  templateUrl: 'spend-confirm.html',
})
export class SpendConfirmPage {

	confirm_value: any;
	price: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SpendConfirmPage');

    this.confirm_value = this.navParams.get('property'); 
    if(this.confirm_value) {
    	this.price = this.confirm_value.price;
    }
  }

  public Before = () => {
  	this.navCtrl.setRoot('ShopPage');
  }

  public noBtnClick = () => {
  	this.navCtrl.setRoot('MonthlyPassesPage', {monthly_passes: this.confirm_value});
  }

  public yesBtnClick = () => {
  	this.navCtrl.setRoot('CongratulationsPage', {monthly_passes: this.confirm_value});
  }

}
