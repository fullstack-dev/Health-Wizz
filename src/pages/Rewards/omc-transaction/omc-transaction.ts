import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';

/**
 * Generated class for the OmcTransactionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-omc-transaction',
  templateUrl: 'omc-transaction.html',
})
export class OmcTransactionPage {

  tranHistory: any;

  constructor(
    public navCtrl: NavController,
    private restService: RestDataProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {

    this.getLedger()
      .then(data => {
        this.tranHistory = data;
      });
    // let temp = this.navParams.get('content');
    // if (temp) {
    //   this.tranHistory = temp.transaction_history;
    // } else {
    //   this.tranHistory = [];
    // }
  }

  getLedger() {
    return new Promise((resolve, reject) => {
      this.restService.getLedger()
        .subscribe(data => {
          resolve(data.info);
        }, this.handleError);
    });
  }

  before() {
    this.navCtrl.setRoot('MyWalletPage');
  }

  handleError(e) {
    console.log(e);
  }

}
