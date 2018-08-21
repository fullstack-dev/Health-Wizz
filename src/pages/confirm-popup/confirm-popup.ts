import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-confirm-popup',
  templateUrl: 'confirm-popup.html',
})
export class ConfirmPopupPage {
  title: string;
  message: string;
  positive_btn_text: string;
  negative_btn_text: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.title = navParams.get('title');
    this.message = navParams.get('message');
    this.positive_btn_text = navParams.get('pos_text');
    this.negative_btn_text = navParams.get('neg_text');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmPopupPage');
  }

  negativeClick = () => {
    this.viewCtrl.dismiss(false);
  }

  positiveClick = () => {
    this.viewCtrl.dismiss(true);
  }

}
