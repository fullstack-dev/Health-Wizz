import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ToastController, NavParams } from 'ionic-angular';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { Toast } from '@ionic-native/toast';
import { Storage } from '@ionic/storage';
import { CampaignDraft } from '../../../models/classes';
import { ConstProvider } from '../../../providers/const/const';
@IonicPage()
@Component({
  selector: 'page-campaign-delete',
  templateUrl: 'campaign-delete.html',
})
export class CampaignDeletePage {

  is_draft: boolean;
  reasonsList: any;
  reason: any;
  campaign: any;
  optional: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public restService: RestDataProvider,
    public local: LocalDataProvider,
    public toast: Toast,
    private storage: Storage,
    private constants: ConstProvider
  ) {
    this.is_draft = this.navParams.get('is_draft');
    this.campaign = this.navParams.get('campaign');

    this.reasonsList = [{ id: 0, reason: "I am not longer interested in moderating" },
    { id: 1, reason: "I run out of fundings for the campaign" },
    { id: 2, reason: "I don't understand how to use campaigns" },
    { id: 3, reason: 'Other reason' }
    ];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CampaignDeletePage');
  }

  done() {
    this.close();
  }

  delete() {
    if (this.campaign && !this.is_draft) {
      this.restService.deleteCampaign(this.campaign.id)
        .subscribe(res => {
          this.local.deleteCampaign(this.campaign.id).then(r => {
            this.toast.showShortBottom("Campaign: " + this.campaign.name + " is deleted.").subscribe(r => { });
            this.viewCtrl.dismiss(true);
          });

        }, err => {
          console.log(err);
          this.toast.showLongBottom("Error! Try again.").subscribe(r => { });
        });
    } else if (this.is_draft) {
      this.deleteCampaignDrafts();
    }
  }

  deleteCampaignDrafts() {
    let draft_to_delete: CampaignDraft = this.navParams.get("campaign_draft");
    this.storage.get(this.constants.STORAGE.CAMPAIGN_DRAFTS).then((_drafts: Array<CampaignDraft>) => {
      console.log("old Campaing drafts => ", _drafts);
      if (_drafts && _drafts.length && _drafts.length >= 1) {
        let index = _drafts.findIndex(item => {
          return item.id == draft_to_delete.id;
        });
        if (index != -1) {
          _drafts.splice(index, 1);
        }
        this.storage.set(this.constants.STORAGE.CAMPAIGN_DRAFTS, _drafts)
          .then(r => {
            this.viewCtrl.dismiss(true);
            console.log("new Campaing drafts => ", r);
          }).catch(e => {
            console.log("Campaing drafts save fail => ", e);
            this.toast.showLongBottom("Error! Try again.").subscribe(r => { });
          });
      }
    }).catch(e => {
      console.log("Campaing drafts err => ", e);
    });
  }

  close() {
    this.viewCtrl.dismiss(false);
  }

}
