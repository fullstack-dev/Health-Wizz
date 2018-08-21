import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Participant, CDView, IndicatorView } from '../../../models/classes';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Rest } from '../../../providers/rest';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { HistoryProvider } from '../../../providers/history/history';
import { LanguageProvider } from '../../../providers/language/language';

@IonicPage()
@Component({
  selector: 'page-chf-campaign-detail',
  templateUrl: 'chf-campaign-detail.html',
})

export class ChfCampaignDetailPage {
  view = 'ChfCampaignDetailPage';
  campaign: any;
  participants: Array<Participant>;
  config: Object;
  terms: any;
  omCoins: any;
  measured: any;
  organizers: any;
  indicators: Array<IndicatorView>;
  cdView: CDView;
  lang_resource: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public restService: RestDataProvider,
    public domSanitizer: DomSanitizer,
    public rest: Rest,
    public local: LocalDataProvider,
    private history: HistoryProvider,
    private language_provider: LanguageProvider
  ) {
    this.lang_resource = this.language_provider.getLanguageResource();
    this.campaign = this.local.getLocalCampaign();
    if (this.campaign.campaignInfo.circleInfo.invitationState !== 'accept') {
      navCtrl.setRoot(history.getHistory());
    }
    this.config = {
      scrollbar: '.swiper-scrollbar',
      scrollbarHide: true,
      slidesPerView: 'auto',
      centeredSlides: true,
      observer: true,
      spaceBetween: 1,
      grabCursor: true,
      onSlideChangeEnd: function (swiper) {
        // that.swipe(swiper);
      }
    };
    this.terms = [
      { name: 'Running 3K daily.' },
      { name: 'Submitting a body weight data daily.' },
      { name: 'Fill out a weekly survey, starting from the day of trial acceptans and during the next six months.' }
    ];
    this.measured = [
      { url: "assets/imgs/HealthIndexIcons/Daily-weight@3x.png" },
      { url: "assets/imgs/HealthIndexIcons/Lag-swelling@3x.png" },
      { url: "assets/imgs/HealthIndexIcons/Breath@3x.png" },
      { url: "assets/imgs/HealthIndexIcons/Pulse@3x.png" },
      { url: "assets/imgs/HealthIndexIcons/Oxygen@3x.png" },
      { url: "assets/imgs/HealthIndexIcons/liquid@3x.png" },
      { url: "assets/imgs/CHFImgs/Shape@2x.png" },
      { url: "assets/imgs/HealthIndexIcons/Diet@3x.png" }
    ];
    this.omCoins = [{
      value: 8,
      name: '7 days'
    }];
  }

  ionViewDidLoad() {

    this.loadParticipants(this.campaign)
      .then((participantsList: Array<any>) => {
        this.participants = participantsList;
      });
    this.rest.getCDs().subscribe((data) => {
      data.diseases.forEach(d => {
        if (d.name = this.campaign.challengeTemplateInfo.name) {
          this.cdView = new CDView(this.campaign.challengeTemplateInfo, d);
        }
      });
      let frequencies = [];
      this.rest.getFrequencies()
        .subscribe((_frequencies) => {
          frequencies = _frequencies.frequency;
        });
      this.getMhiStatus()
        .then((indicators: Array<any>) => {
          this.indicators = this.local.getChfIndicators(indicators, this.cdView.info.indicators, frequencies);
        });
    });
    this.getOrganizers(this.campaign.creatorId);
  }

  loadParticipants(campaign: any) {
    return new Promise((resolve) => {
      let _participants = [];
      this.getParticipants(campaign.campaignInfo.circleInfo.id)
        .then((participants: Array<any>) => {
          participants.forEach((member, i, a) => {
            if (member.memberId != campaign.creatorId && member.invitationState == 'accept') {
              this.getParticipantProfilePic(member.memberId)
                .then(avatar => {
                  _participants.push(new Participant(member, avatar));
                  if (i == a.length - 1) {
                    resolve(_participants);
                  }
                });
            } else if (i == a.length - 1) {
              resolve(_participants);
            }

          });
        });
    });
  }

  public getMhiStatus() {
    return new Promise((resolve) => {
      this.restService.getMhiStatus()
        .subscribe(mhiStatus => {
          resolve(mhiStatus.data);
        }, this.handleError);
    });
  }

  getParticipants(circleId: string) {
    return new Promise((resolve) => {
      this.restService.getParticipants(circleId)
        .subscribe((result: any) => {
          resolve(result.info);
        }, this.handleError);
    });
  }

  getParticipantProfilePic(memberID: string) {
    return new Promise((resolve) => {
      this.restService.getProfilePic(memberID)
        .subscribe(pic => {
          let imagePath: SafeResourceUrl;
          imagePath = this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + pic.image);
          resolve(imagePath);
        }, this.handleError);
    });
  }

  getOrganizers(creatorId: string) {
    this.restService.getMemberProfile(creatorId)
      .subscribe(profile => {
        let name = profile.data.firstName + ' ' + profile.data.lastName;
        let organizers = [{ name: name }]
        this.organizers = organizers;
      })
  }

  before() {
    this.navCtrl.setRoot(this.history.getHistory());
  }

  goHistory() {
    this.history.addHistory(this.view);
    this.navCtrl.setRoot('ReportHistoryBPage');
  }

  goUpdate() {
    this.local.setLocalIndicators(this.indicators);
    this.history.addHistory(this.view);
    this.navCtrl.setRoot('SubmitReportBPage', {
      'card_index': 0
    });
  }

  // acceptClick() {
  //   this.restService.acceptDenyCampaign(this.campaign.id, 'accept')
  //     .subscribe(result => {
  //       this.local.updateCampaigns(this.campaign, 'accept');
  //       this.history.addHistory(this.view);
  //       this.navCtrl.setRoot('ChfCampaignAcceptPage');
  //     }, this.handleError);
  // }

  // denyClick() {
  //   this.restService.acceptDenyCampaign(this.campaign.id, 'deny')
  //     .subscribe(result => {
  //       this.local.updateCampaigns(this.campaign, 'deny');
  //       this.navCtrl.setRoot(this.history.getHistory());
  //     }, this.handleError);
  // }

  handleError(error) {
    console.log(error);
  }
}
