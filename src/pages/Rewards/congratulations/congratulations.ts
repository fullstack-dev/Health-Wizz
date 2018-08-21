import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-congratulations',
  templateUrl: 'congratulations.html',
})
export class CongratulationsPage {

	received_value: any;
  pageValue: string;
	title: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CongratulationsPage');

    this.received_value = this.navParams.get('monthly_passes'); 
    this.pageValue = this.navParams.get('page'); 
    if(this.received_value) {
    	this.title = this.received_value.title;
    }
  }

  Before() {
    this.navCtrl.setRoot('SpendConfirmPage', {property: this.received_value});  
  }

  close() {
    this.navCtrl.setRoot('SpendConfirmPage', {property: this.received_value});  
  }

  public BackToShop = () => {  
      this.navCtrl.setRoot('ShopPage');
  }

  goOmcoins(){
    console.log('OmCoins');
  }

}
