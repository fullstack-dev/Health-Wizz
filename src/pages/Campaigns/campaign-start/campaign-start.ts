import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-campaign-start',
  templateUrl: 'campaign-start.html',
})
export class CampaignStartPage {

  menuList = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    if (this.navParams.get('empty')) {
      this.menuList = [
        { id: 0, icon: 'assets/imgs/MenuIcons/Challenge@2x.png', title: 'Create new campaign' },
        { id: 2, icon: 'assets/imgs/MenuIcons/Circles@2x.png', title: 'Create from template' }
      ]
    } else {
      this.menuList = [
        { id: 0, icon: 'assets/imgs/MenuIcons/Challenge@2x.png', title: 'Create new campaign' },
        { id: 1, icon: 'assets/imgs/MenuIcons/OmCoin@2x.png', title: 'Duplicate existing' },
        { id: 2, icon: 'assets/imgs/MenuIcons/Circles@2x.png', title: 'Create from template' }
      ]
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CampaignStartPage');
  }

  onPageClick(id) {
    this.viewCtrl.dismiss({ id: id });
  }
}
