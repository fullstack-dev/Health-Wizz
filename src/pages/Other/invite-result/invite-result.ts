import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-invite-result',
  templateUrl: 'invite-result.html',
})
export class InviteResultPage {
  successes = [];
  fails = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
  }

  ionViewDidLoad() {
    this.successes = this.navParams.get('successes');
    this.fails = this.navParams.get('fails');
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
