import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SomeTipsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-some-tips',
  templateUrl: 'some-tips.html',
})
export class SomeTipsPage {

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public viewCtrl: ViewController
  	) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SomeTipsPage');
  }

  close() {
  	this.viewCtrl.dismiss();
  }

}
