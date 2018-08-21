import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the InitialMedRecordsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-initial-med-records',
  templateUrl: 'initial-med-records.html',
})
export class InitialMedRecordsPage {

	loader: any;

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  public before = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public add = () => {
		this.navCtrl.setRoot('AddMedRecordsPage');
	}
}
