import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { MemberRolesInfo, InviteScreenInfo, Invities } from '../../../models/classes';

@IonicPage()
@Component({
  selector: 'page-campaign-success',
  templateUrl: 'campaign-success.html',
})
export class CampaignSuccessPage {

  campaign: any;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public modalCtrl: ModalController
  ) {
    this.campaign = navParams.get('campaign');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CampaignSuccessPage');
  }

  invite() {
    let memberRoles: MemberRolesInfo = new MemberRolesInfo(false, false, true);
    let screen_info: InviteScreenInfo = new InviteScreenInfo('challenge', this.campaign.id, memberRoles, 'send', new Invities([], []), this.campaign.campaignInfo.isPublish);
    // this.navCtrl.push('InvitePeoplePage', { 'invite_screen_info': screen_info })
    //   .then(r => {
    //     this.navCtrl.remove(this.navCtrl.getActive().index - 1, 1);
    //   });
    let inviteModal = this.modalCtrl.create('InvitePeoplePage', { 'invite_screen_info': screen_info, 'show_back': true });
    inviteModal.present().then(r => {
      this.viewCtrl.dismiss();
    });
  }

  before() {
    // this.navCtrl.setRoot('CampaignPage');
    this.viewCtrl.dismiss();
  }
  close() {
    // this.navCtrl.setRoot('CampaignPage');
    this.viewCtrl.dismiss();
  }

}
