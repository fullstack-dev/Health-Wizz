import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MonthlyPassesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-monthly-passes',
  templateUrl: 'monthly-passes.html',
})
export class MonthlyPassesPage {

	monthly_passes: any;
	monthly_title: string;
	monthly_description: string;
	monthly_price: string;
	monthly_image: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MonthlyPassesPage');

    this.monthly_passes = this.navParams.get('monthly_passes'); 
    if(this.monthly_passes){
    	this.monthly_title = this.monthly_passes.title;
    	this.monthly_description = this.monthly_passes.description;
    	this.monthly_price = this.monthly_passes.price;
    	this.monthly_image = this.monthly_passes.image;
    }
  }

  public Before =() => {
  	this.navCtrl.setRoot('ShopPage');
  }

  public Buy = () => {
  	this.navCtrl.setRoot('SpendConfirmPage', {property: this.monthly_passes});
  }

}
