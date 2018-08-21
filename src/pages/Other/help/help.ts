import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { HttpService } from '../../../providers/http-service';

/**
 * Generated class for the HelpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})
export class HelpPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private iab: InAppBrowser,
    private http: HttpService,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelpPage');
  }

  public about = () => {
    this.navCtrl.push('AboutPage');
  }

  openLinkHelp() {
    const browser = this.iab.create("https://www.healthwizz.com/help", "_blank", "location=no");
  }

  openLinkWellness(mhi) {
    let url = this.http.getServiceUri();
    let link = url + mhi;
    link = 'https://docs.google.com/viewer?url=' + encodeURIComponent(link);
    const browser = this.iab.create(link, "_blank", "location=no")
  }

}
