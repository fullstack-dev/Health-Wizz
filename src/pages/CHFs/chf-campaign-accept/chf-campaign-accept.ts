import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { HistoryProvider } from '../../../providers/history/history';
import { LanguageProvider } from '../../../providers/language/language';

@IonicPage()
@Component({
  selector: 'page-chf-campaign-accept',
  templateUrl: 'chf-campaign-accept.html',
})

//params => 1.campaign
export class ChfCampaignAcceptPage {
  view = 'ChfCampaignAcceptPage';
  campaign: any;
  ageVisible: boolean;
  locationVisible: boolean;
  circleVisible: boolean;
  challengesVisible: boolean;
  lang_resource: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public restService: RestDataProvider,
    public local: LocalDataProvider,
    private history: HistoryProvider,
    private language_provider: LanguageProvider
  ) {
    this.lang_resource = this.language_provider.getLanguageResource();

  }

  ionViewDidLoad() {
    this.campaign = this.local.getLocalCampaign();
    this.ageVisible = true;
    this.locationVisible = false;
    this.circleVisible = true;
    this.challengesVisible = true;
  }

  public goCamapign() {
    this.navCtrl.setRoot('HomePage');
  }

  before() {
    this.navCtrl.setRoot('HomePage');
  }

  goToLeave() {
    this.navCtrl.setRoot(this.history.getHistory());
  }

  public handleError(error) {
    console.log(error);
  }

}
