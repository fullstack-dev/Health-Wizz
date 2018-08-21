import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ModalController, ViewController, Slides } from 'ionic-angular';
import { CampaignCategory } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Rest } from '../../../providers/rest';
import { HistoryProvider } from '../../../providers/history/history';
import { LanguageProvider } from '../../../providers/language/language';
import { Helper } from '../../../providers/helper-service';

@IonicPage()
@Component({
  selector: 'page-chf-campaign',
  templateUrl: 'chf-campaign.html',
})

export class ChfCampaignPage {
  view = 'ChfCampaignPage';

  @ViewChild('chfInvitesSlides') invite_slides: Slides;
  @ViewChild('chfActiveSlides') active_slides: Slides;
  @ViewChild('chfHistorySlides') history_slides: Slides;

  pageValue: string;
  search_bar: boolean;
  search_query: any;
  // campaignData: any;
  currentCampaigns = [];
  campaigns: Array<CampaignCategory>;
  currentLength: number;
  historyData = [];
  historyLength: number;
  errorMessage: string;
  moderatorName: string;
  chfLastUpdate: any;
  lang_resource: any;

  active_campaigns: CampaignCategory;
  invited_campaigns: CampaignCategory;
  history_campaigns: CampaignCategory;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    public rest: Rest,
    public restService: RestDataProvider,
    public local: LocalDataProvider,
    private history: HistoryProvider,
    private language_provider: LanguageProvider,
    private helper: Helper
  ) {
    this.lang_resource = this.language_provider.getLanguageResource();
    this.chfLastUpdate = this.local.getCampaignLastUpdate();

    let initialCampaigns = this.local.getLocalCampaigns();

    let _campaigns = [];
    // _campaigns.push(new CampaignCategory('Invitations', this.local.getInvitedCampaigns(initialCampaigns)));
    // _campaigns.push(new CampaignCategory('Current Campaigns', this.local.getActiveCampaigns(initialCampaigns)));
    // _campaigns.push(new CampaignCategory('History', this.local.getPastCampaigns(initialCampaigns)));

    let invitations = this.local.getInvitedCampaigns(initialCampaigns);
    let actives = this.local.getActiveCampaigns(initialCampaigns);
    let pasts = this.local.getPastCampaigns(initialCampaigns);
    if (invitations && invitations.length != 0) {
      _campaigns.push(new CampaignCategory('Invitations', invitations));
      this.invited_campaigns = new CampaignCategory('Invitations', invitations);
    }
    if (actives && actives.length != 0) {
      _campaigns.push(new CampaignCategory('Current Campaigns', actives));
      this.active_campaigns = new CampaignCategory('Current Campaigns', actives);

    }
    if (pasts && pasts.length != 0) {
      _campaigns.push(new CampaignCategory('History', pasts));
      this.history_campaigns = new CampaignCategory('History', pasts);

    }

    this.campaigns = _campaigns;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChfCampaignPage');
  }

  // scrollToZero() {
  //   this.slides.slideTo(0);
  // }

  searchCampaign() {
    console.log('search');
  }

  addCampaign() {
    let startModal = this.modalCtrl.create('CampaignStartPage');

    startModal.onDidDismiss(data => {
      console.log(data);
      let id = data.id
      if (id == '0') {
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

  before() {
    this.navCtrl.setRoot('HomePage');
  }

  search() {
    this.search_query = null;
    setTimeout(() => {
      this.active_slides.slideTo(0);
      this.invite_slides.slideTo(0);
      this.history_slides.slideTo(0);
    }, 100);
    this.search_bar = !this.search_bar;
  }

  onSearchInput() {
    try {
      setTimeout(() => {
        if (this.active_slides.getActiveIndex() > 0) {
          this.active_slides.slideTo(0);
        }
      }, 100);
      setTimeout(() => {
        if (this.invite_slides.getActiveIndex() > 0) {
          this.invite_slides.slideTo(0);
        }
      }, 100);
      setTimeout(() => {
        if (this.history_slides.getActiveIndex() > 0) {
          this.history_slides.slideTo(0);
        }
      }, 100);
    } catch (e) {
      console.log(e);
    }

  }

  Share() {
    console.log('share');
  }

  goDetail(campaign) {
    if (campaign.campaignInfo.circleInfo.invitationState === 'invite') {
      return;
    }
    this.history.addHistory(this.view);
    this.local.setLocalCampaign(campaign);
    this.navCtrl.setRoot('ChfPage');
  }

  goToCampaignDetails(campaign) {
    this.local.setLocalCampaign(campaign);
    this.history.addHistory(this.view);
    this.navCtrl.setRoot('ChfCampaignDetailPage');
  }

  close() {
    this.viewCtrl.dismiss();
  }

  deny(_campaign, i2) {
    this.helper.showConfirm("Deny Campaign?", "Are you sure to delete the invitation for this campaign?", "Yes", "No")
      .then(y => {
        let campaign = JSON.parse(JSON.stringify(_campaign));
        campaign.campaignInfo.circleInfo.invitationState = 'deny';
        this.restService.acceptDenyCampaign(campaign)
          .subscribe(result => {
            this.local.updateCampaigns(campaign, 'deny');
            this.invited_campaigns.data.splice(i2, 1);
          }, err => {
            console.log(err);
          });
      }).catch(n => { });

  }

  accept(_campaign) {
    if (_campaign.campaignInfo.circleInfo.invitationState != 'invite') {
      return;
    }
    let campaign = JSON.parse(JSON.stringify(_campaign));
    this.local.setLocalCampaign(campaign);
    campaign.campaignInfo.circleInfo.invitationState = 'accept';
    this.restService.acceptDenyCampaign(campaign)
      .subscribe(result => {
        this.local.updateCampaigns(campaign, 'accept');
        this.history.addHistory(this.view);
        this.navCtrl.setRoot('ChfPage');
      }, err => {
        console.log(err);
      });
  }

  selectOptions(event, page, item) {
    console.log(item);
    let popover = this.popoverCtrl.create('PopoverContentPage', { value: item });

    popover.onDidDismiss((data) => {
      if (!data) {
        console.log('null');
      } else if (data.value == 0) {
        this.navCtrl.push('InvitePeoplePage');
      } else if (data.value == 1) {
        this.navCtrl.setRoot('ManageRolesPage');
      } else if (data.value == 2) {
        this.navCtrl.setRoot('CampaignEditPage');
      } else if (data.value == 3) {
        this.navCtrl.setRoot('ValidatePage');
      } else if (data.value == 4) {
        this.navCtrl.setRoot('RewardPage', { choice: item.choice });
      } else if (data.value == 5) {
        this.navCtrl.setRoot('CampaignDeletePage', { page: page });
      } else {
        console.log('other');
      }
    })
    popover.present();
  }

  fineSponser() {
    this.close();
  }

  handleError(error) {
    console.log(error);
  }

}
