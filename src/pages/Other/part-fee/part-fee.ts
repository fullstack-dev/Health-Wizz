import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, AlertController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PartFeePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-part-fee',
  templateUrl: 'part-fee.html',
})
export class PartFeePage {

  fee: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController
  ) {
    this.fee = this.navParams.get('fee');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PartFeePage');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  getFee() {
    if (!this.fee) {
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: 'Please Fill Amount Box',
        buttons: ['OK']
      });
      alert.present();

    } else {
      this.viewCtrl.dismiss({ value: this.fee, page: true });
    }
  }

}
