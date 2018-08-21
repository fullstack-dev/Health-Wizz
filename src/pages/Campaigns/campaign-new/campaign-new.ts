import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { HistoryProvider } from '../../../providers/history/history';

@IonicPage()
@Component({
  selector: 'page-campaign-new',
  templateUrl: 'campaign-new.html',
})
export class CampaignNewPage {
  view: string = 'CampaignNewPage';
  valid_new: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public storage: Storage,
    private history: HistoryProvider
  ) {

  }

  ionViewDidLoad() {
    console.log('load');
  }

  search() {
    console.log('search');
  }

  addCampaign() {

    this.storage.set('pages', true);

    let startModal = this.modalCtrl.create('CampaignStartPage');

    startModal.onDidDismiss(data => {
      console.log(data);
      let id = data.id
      if (id == '0') {
        this.history.addHistory(this.view);
        this.navCtrl.setRoot('CampaignCreatePage');
      } else if (id == '1') {
        this.navCtrl.setRoot('CampaignDuplicatePage');
      } else if (id == '2') {
        this.navCtrl.setRoot('CampaignTemplatePage');
      } else {
        console.log('none');
      }
    });

    startModal.present();
  }

  back() {
    this.navCtrl.setRoot('HomePage');
  }

}
