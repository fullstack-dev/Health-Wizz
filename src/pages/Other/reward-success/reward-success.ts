import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-reward-success',
  templateUrl: 'reward-success.html',
})
export class RewardSuccessPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RewardSuccessPage');
  }

  // before() {
  //   // this.navCtrl.setRoot('RewardMedicalPage');
  //   this.navCtrl.pop();
  // }
  close() {
    // this.navCtrl.setRoot('RewardPage');
    // this.navCtrl.push('RewardPage');
    this.navCtrl.pop();
    // this.navCtrl.pop();
  }

}
