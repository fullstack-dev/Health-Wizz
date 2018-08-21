import { Component, ViewChild } from '@angular/core';
import {
  IonicPage,
  NavController,
  ModalController,
  NavParams,
  ToastController,
  Slides,
  ViewController
} from 'ionic-angular';
import { Rest } from '../../../providers/rest';
import {
  CampaignData,
  HealthIndexIndicator,
  IndicatorData,
  ChallengeTypeData,
  ChallengeTemplateInfoData,
  CampaignSurvey,
  SurveyQuestionInfo,
  SurveyAnswerInfo,
  Invities,
  InviteScreenInfo,
  MemberRolesInfo,
  InviteData,
  TempInviteData,
  CampaignTemplate,
  TemplateData,
  CampaignDraft,
  RewardsData,
  CampaignInfo,
  FundSourceInfo
} from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../../providers/helper-service';
import { Storage } from '@ionic/storage';
import { SMS } from '@ionic-native/sms';
import { ConstProvider } from '../../../providers/const/const';
import { CampaignCreatePageParams } from '../../../models/nav.params';
import { UserService } from '../../../providers/user-service';
import { MyWalletProvider } from '../../../providers/wallet/my-wallet-provider';
@IonicPage()
@Component({
  selector: 'page-campaign-create',
  templateUrl: 'campaign-create.html'
})
export class CampaignCreatePage {
  @ViewChild(Slides) slides: Slides;
  rewardsData: any;
  scheduals: Schedual[];
  types: QuestionType[];
  participantFee: any;
  balanceAmount: number;
  totalAmount: number;
  totalPercent: number;
  percent: boolean;
  campaign_data: CampaignData;
  navData: CampaignCreatePageParams;
  indexes_views: IndicatorView[];
  campaign_survey: CampaignSurvey;
  terms: Array<{ input: "" }>;
  rewardList: RewardsData[];
  partRewardList: any;
  campaign_id: any;
  campaign_published: boolean;
  invities: Invities;
  // edit: boolean;
  // edit_draft: boolean;
  title: string;
  my_profile;
  my_profile_pic;
  percentReward: boolean = false;
  showReward: boolean = false;
  current_reward: any;

  success_contacts: string[];
  failed_contacts: string[];
  contacts_to_invite: TempInviteData[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public rest: Rest,
    public local: LocalDataProvider,
    private restService: RestDataProvider,
    private userService: UserService,
    private helper: Helper,
    private storage: Storage,
    private sms: SMS,
    public constants: ConstProvider,
    private myWallet: MyWalletProvider
  ) {
    this.terms = [{ input: "" }];
    let challengeTypeData = new ChallengeTypeData(this.constants.CHALLENGE_TYPE.INDICATOR_BASED, "challenge type");
    let challengeTemplateInfoData = new ChallengeTemplateInfoData(null, null, this.constants.CHALLENGE_TEMPLATE_TYPE.CUSTOM, []);
    let campaignInfo = new CampaignInfo([new FundSourceInfo(this.constants.FUND_SOURCE_TYPE.MODERATOR, null, null)]);
    this.campaign_data = new CampaignData(null, null, null, null, this.constants.CHALLENGE_SCOPE.NO_INVITE, challengeTypeData, challengeTemplateInfoData, [], campaignInfo);
    this.invities = new Invities(new Array(), new Array());
    this.my_profile = this.userService.getProfile();
    this.my_profile_pic = this.userService.getProfilePic();
    this.campaign_survey = new CampaignSurvey(null, null, null, [], null, null, null);
    let indexes = local.getLocalHealthIndexes();
    this.indexes_views = new Array();
    this.rewardList = [];
    indexes.forEach(index => {
      this.indexes_views.push(new IndicatorView(false, index, this.constants.SCHEDUALS.DAILY, false));
    });

    this.navData = this.navParams.data;

    if (this.navData.edit) {
      this.title = 'Edit Campaign';
    } else {
      this.title = 'Create Campaign';
    }

    if (this.navData.template) {
      this.fillTemplate(this.navData.template);
    }

    if (this.navData.campaign) {
      this.fillCampaign(this.navData.campaign);
    }

    if (this.navData.draft_edit) {
      this.terms = this.navData.campaign_draft.terms;
      this.fillCampaign(this.navData.campaign_draft.campaign);
      this.invities = this.navData.campaign_draft.invities;
      this.campaign_survey = this.navData.campaign_draft.survey;
    }

    this.scheduals = [
      new Schedual(0, this.constants.SCHEDUALS.DAILY),
      new Schedual(1, this.constants.SCHEDUALS.WEEKLY),
      new Schedual(2, this.constants.SCHEDUALS.TWO_WEEKS),
      new Schedual(3, this.constants.SCHEDUALS.MONTHLY),
      new Schedual(4, this.constants.SCHEDUALS.LIFETIME),
    ]

    this.types = [
      new QuestionType(0, this.constants.SURVEY.YES_NO),
      new QuestionType(1, this.constants.SURVEY.TEXT_FIELD),
      new QuestionType(3, this.constants.SURVEY.MULTIPLE_CHOICE)
    ]

    this.balanceAmount = 120;
    this.totalAmount = 0;
    this.totalPercent = 0;
    this.percent = false;
  }

  ionViewDidLoad() {
    // FIXME: Put these strings in language resource to change with language.
    this.rewardsData = [{
      "id": 0,
      "title": "No Rewards",
      "description": "Create a campaign with no participation fee."
    },
    {
      "id": 1,
      "title": "Fund Yourself",
      "description": "Become a proud funder from your own OmPoints budget."
    },
    {
      "id": 2,
      "title": "Participation Fee",
      "description": "Participants will pay a fee with OmPoints."
    },
    {
      "id": 3,
      "title": "Find a Sponsor",
      "description": "Choose a sponsor for your Campaign"
    }
    ];
    this.current_reward = this.rewardsData[0];
  }

  /**
   * enable indicator when duplicating campaign or template.
   * @param template 
   */
  fillTemplate(template) {
    template.data.forEach(t_index => {
      this.indexes_views.forEach(h_index => {
        if (h_index.index.code == t_index.code) {
          h_index.selected = true; //select
          let indicatorData = new IndicatorData(h_index.index.code, false, h_index.freq);
          this.campaign_data.challengeTemplateInfo.indicatorLst.push(indicatorData);
        }
      });
    });
  }

  /**
   * Fill the campaign information when editing campaign or draft.
   * @param campaign 
   */
  fillCampaign(campaign) {
    // let campaign = this.navData.campaign;
    if (this.navData.edit || this.navData.draft_edit) {
      this.campaign_data.name = campaign.name;
    }

    if (this.navData.duplicate) {
      // let c_name:string = ;
      this.makeNameForCampaign(campaign.name);
    }

    if (this.navData.edit) {
      this.campaign_published = campaign.campaignInfo.isPublish;
    }

    if (this.navData.edit || this.navData.duplicate) {
      this.campaign_id = campaign.id;
    }

    if (campaign.startDate && campaign.startDate != "") {
      this.campaign_data.startDate = this.deFormatDate(campaign.startDate);
    }
    if (campaign.endDate && campaign.endDate != "") {
      this.campaign_data.endDate = this.deFormatDate(campaign.endDate);
    }
    if (campaign.description) {
      this.campaign_data.description = campaign.description;
    }

    if (campaign.campaignInfo) {
      this.participantFee = campaign.campaignInfo.fundedBy[0].participantFee;
    }

    if (!this.navData.draft_edit && campaign.termsInfo && campaign.termsInfo.length > 0) {
      if (this.terms.length > 0) {
        this.terms = [];
      }
      if (campaign.termsInfo.length < 1) {
        this.terms = [{ input: "" }];
      }
      campaign.termsInfo.forEach(term => {
        this.terms.push({ input: term });
      });
    } else if (this.navData.draft_edit) {
      if (this.terms && this.terms.length < 1) {
        this.terms = [{ input: "" }];
      } else if (!this.terms) {
        this.terms = [{ input: "" }];
      }
    }
    let template = new CampaignTemplate("campaign", []);
    let indicatorList;
    if (campaign.challengeTemplateInfo) {
      indicatorList = campaign.challengeTemplateInfo.indicatorLst;
    } else {
      indicatorList = [];
    }
    if (indicatorList && (indicatorList).length > 0) {
      indicatorList.forEach(index => {
        template.data.push(new TemplateData(index.code, ""));
      });
      this.fillTemplate(template);
    }
    this.getCampaignSurvey();
    if (!this.navData.duplicate) {
      this.getCampaignRewards(campaign);
    }
  }

  /**
   * appened a count at end of campaign name or increase previous.
   * @param old_name 
   */
  makeNameForCampaign(old_name: string) {
    let a = old_name.split(" ");
    if (a.length > 1) {
      let last = a[a.length - 1];
      let a_c = a.splice(a.length - 1, 1);
      let start = "";
      a.forEach(item => {
        start = start + " " + item;
      });
      let last_int = parseInt(last);
      if (last_int) {
        this.campaign_data.name = start + " " + (last_int + 1);
      } else {
        this.campaign_data.name = start + " " + last + " 1";
      }
    } else {
      this.campaign_data.name = old_name + " 1";
    }
  }

  // FIXME: put this function in a service for reuse at time of campaign publish.
  /**
   * Enable or disable the reward slide and its component when editing campaign
   * @param campaign 
   * @param rewardList 
   */
  checkRewardEdit(campaign, rewardList) {
    let type = campaign.campaignInfo.fundedBy[0].sourceType;
    let rewardLength = rewardList.length;
    if (type == this.constants.FUND_SOURCE_TYPE.MODERATOR && rewardLength > 0) {
      this.current_reward = this.rewardsData[1];
      this.showReward = true;
      this.percentReward = false;
    } else if (type == this.constants.FUND_SOURCE_TYPE.PARTICIPANTS && rewardLength > 0) {
      this.current_reward = this.rewardsData[2];
      this.showReward = true;
      this.percentReward = true;
    } else if (type == this.constants.FUND_SOURCE_TYPE.MODERATOR && rewardLength == 0) {
      this.current_reward = this.rewardsData[0];
      this.showReward = false;
    }

  }

  // FIXME: loader only for survey not for rewards and other.
  getCampaignSurvey() {
    if (this.campaign_data) {
      this.helper.showLoading();
      this.restService.getSurvey(this.campaign_id)
        .subscribe(res => {
          this.helper.hideLoading();
          if (res && res != {}) {
            this.campaign_survey = res;
            this.mapSurveyAnswers();
          }
        }, err => {
          console.error(err);
          this.helper.hideLoading();
        });
    }
  }

  getCampaignRewards(campaign) {
    if (this.campaign_data) {
      this.restService.getRewards(this.campaign_id)
        .subscribe(res => {
          if (res.info) {
            this.rewardList = res.info;
            this.partRewardList = this.rewardList;
            this.checkRewardEdit(campaign, this.rewardList);
          }
        }, err => {
          this.helper.hideLoading();
          console.error(err);
        });
    }
  }

  mapSurveyAnswers() {
    try {
      this.campaign_survey.surveyQuestionInfo.forEach(ques => {
        switch (ques.answerType) {
          case this.constants.SURVEY.YES_NO:
          case this.constants.SURVEY.TEXT_FIELD:
            ques.surveyAnswerInfo = null;
            break;
          default:
            break;
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  removeTerm(i) {
    this.terms.splice(i, 1);
  }

  addTerms() {
    this.terms.push({ input: "" });
  }

  addSurveyQuestion() {
    let question = new SurveyQuestionInfo(null, "", this.constants.SCHEDUALS.DAILY, this.constants.SURVEY.YES_NO, null, null);
    this.campaign_survey.surveyQuestionInfo.push(question);
  }

  removeSurveyQuestion(ques_i) {
    this.campaign_survey.surveyQuestionInfo.splice(ques_i, 1);
  }

  addDefaultAnswer(ques_i) {
    switch (this.campaign_survey.surveyQuestionInfo[ques_i].answerType) {
      case this.constants.SURVEY.YES_NO:
      case this.constants.SURVEY.TEXT_FIELD:
        this.campaign_survey.surveyQuestionInfo[ques_i].surveyAnswerInfo = null;
        break;
      case this.constants.SURVEY.MULTIPLE_CHOICE:
        if (!this.campaign_survey.surveyQuestionInfo[ques_i].surveyAnswerInfo) {
          this.campaign_survey.surveyQuestionInfo[ques_i].surveyAnswerInfo = new Array();
        }
        this.campaign_survey.surveyQuestionInfo[ques_i].surveyAnswerInfo = new Array();
        this.addAnswer(ques_i, 2);
        break;
      default:
        break;
    }
  }

  showAddAnswerBtn(ques_i) {
    let questionInfo = this.campaign_survey.surveyQuestionInfo[ques_i];
    if (questionInfo.surveyAnswerInfo == null) {
      return false;
    }
    if (questionInfo.surveyAnswerInfo != null && questionInfo.answerType == this.constants.SURVEY.MULTIPLE_CHOICE) {
      return true;
    }

  }

  addAnswer(ques_i, count) {
    for (let i = 1; i <= count; i++) {
      let answer = new SurveyAnswerInfo(null, "");
      this.campaign_survey.surveyQuestionInfo[ques_i].surveyAnswerInfo.push(answer);
    }
  }

  canRemoveAnswer(questionInfo: SurveyQuestionInfo) {
    if (questionInfo.answerType == this.constants.SURVEY.MULTIPLE_CHOICE && questionInfo.surveyAnswerInfo.length > 2) {
      return true;
    } else {
      return false;
    }
  }

  removeAnswerInfo(ques_i, ans_i) {
    this.campaign_survey.surveyQuestionInfo[ques_i].surveyAnswerInfo.splice(ans_i, 1);
  }

  getDate(date) {
    let today;
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    console.log(today);
    return today = yyyy + '-' + mm + '-' + dd;

  }

  startDateUpdated() {
    this.updateEndDate();
  }

  updateEndDate() {
    let start_date = new Date(this.campaign_data.startDate);
    if (this.campaign_data.endDate) {
      let end_date = new Date(this.campaign_data.endDate);
      if (end_date < start_date) {
        this.campaign_data.endDate = start_date.toISOString();
      }
    }
  }

  getMinEndDate() {
    let date = new Date();
    if (this.campaign_data.startDate) {
      date = new Date(this.campaign_data.startDate);
    }
    // let date = new Date();
    let d: any = date.getDate();
    let m: any = date.getMonth() + 1;
    let y: any = date.getFullYear();
    if (d < 10) {
      d = "0" + d;
    }
    if (m < 10) {
      m = "0" + m;
    }
    return y + "-" + m + "-" + d;
  }

  getMinStartDate() {
    let date = new Date();
    let d: any = date.getDate();
    let m: any = date.getMonth() + 1;
    let y: any = date.getFullYear();
    if (d < 10) {
      d = "0" + d;
    }
    if (m < 10) {
      m = "0" + m;
    }
    return y + "-" + m + "-" + d;
  }

  skipIndexes() {
    this.campaign_data.challengeTemplateInfo.indicatorLst = [];
    this.indexes_views.forEach(item => {
      item.selected = false;
    });
    this.nextSlide();
  }

  skipSurvey() {
    this.campaign_survey = new CampaignSurvey(null, null, null, [], null, null, null);
    this.nextSlide();
  }

  nextSlide() {
    this.slides.slideNext();
  }

  disableFundSource(item) {
    return this.navData.edit && this.campaign_published && this.current_reward.id != item.id;
  }

  goSelectPage(reward: RewardsData) {
    if (this.disableFundSource(reward)) {
      return;
    }
    if (this.navData.edit) {
      if (this.rewardList.length == 0) {
        // prev is "No reward"
        this.startNewRewards(reward);
      } else {
        if (this.current_reward.id != reward.id) {
          this.helper.showConfirm("Change funding source?", "You are going to change the funding source for this Campaign. This action will remove all previous rewards. Do you want to proceed?", "Yes", "No")
            .then(y => {
              this.removePrevRewards().then(r => {
                // NEW Reward
                this.rewardList = [];
                this.startNewRewards(reward);
              });
            }).catch(n => { });
        }
      }
    } else {
      this.startNewRewards(reward);
    }
  }

  startNewRewards(reward) {
    this.current_reward = reward;
    if (reward.id == 0) {
      if (this.navData.edit) {
        this.showReward = false;
      } else {
        this.rewardList = [];
        this.showReward = false;
        this.slides.slideNext();
      }

    } else if (reward.id == 1) {
      this.showReward = true;
      this.percentReward = false;
      setTimeout(() => {
        this.slides.update();
        this.slides.slideNext();
      }, 300);
    } else if (reward.id == 2) {
      this.showReward = false;
      this.partFeeModal(this.participantFee);
    } else {
      // this.showReward = true;
      // this.percentReward = true;
      this.findSponsor();
    }
  }

  partFeeModal(participantFee) {

    let partFeeModal = this.modalCtrl.create('PartFeePage', { fee: participantFee });
    partFeeModal.onDidDismiss(data => {
      if (data) {
        if (data.value) {
          this.showReward = true;
          this.percentReward = true;
          this.rewardList = [{ id: null, name: '', amount: null, percentage: 100, state: this.constants.REWARD_STATE.CREATED, quantity: 1, recipient: null }];
          this.campaign_data.campaignInfo.fundedBy[0].participantFee = data.value;
          this.campaign_data.campaignInfo.fundedBy[0].sourceType = this.constants.FUND_SOURCE_TYPE.PARTICIPANTS;
          // this.slides.slideNext();
          setTimeout(() => {
            this.slides.update();
            this.slides.slideNext();
          }, 300);
        }
      }
    });
    partFeeModal.present();

  }

  findSponsor() {

    let findModal = this.modalCtrl.create('SponsorFindPage');
    findModal.onDidDismiss(data => {
      // if (data) {
      //   if (data.value) {
      //     this.showReward = true;
      //     this.percentReward = true;
      //   }
      // }
      // this.slides.slideNext();
      // this.goSlide(1);
      // this.selectCampaign();
    });
    findModal.present();

  }

  duplicateReward() {
    this.rewardList.push(new RewardsData(null, '', null, null, this.constants.REWARD_STATE.CREATED, 1, null));
  }

  // RemovePercentReward(index, rewardId) {
  //   this.rewardList.splice(index, 1);
  // }
  confirmRemoveReward(index, rewardId) {
    if (this.navData.edit && rewardId) {
      this.helper.showConfirm("Delete Rewards?", "Are you sure you want to delete this Reward?", "Yes", "No")
        .then(r => {
          this.removeRewards(index, rewardId)
        }).catch(e => {
          // this.navCtrl.pop();
        });
    } else {
      this.rewardList.splice(index, 1);
    }

  }

  removePrevRewards() {
    let promises = [];
    let delete_indexes = [];
    this.rewardList.forEach((reward, i) => {
      if (reward.id) {
        promises.push(
          new Promise((resolve, reject) => {
            this.restService.deleteRewards(this.campaign_id, reward.id)
              .subscribe(res => {
                delete_indexes.push(i);
                resolve();
              }, e => {
                // FIXME: don't just reject, handle the failed request of delete reward retry of something.
                reject();
              })
          })
        );
      } else {
        promises.push(new Promise((resolve) => {
          delete_indexes.push(i);
          resolve();
        }));
      }
    });
    if (delete_indexes.length > 0) {
      delete_indexes.forEach(i => {
        this.rewardList.splice(i, 1);
      });
    }
    return Promise.all(promises);
  }

  deleteReward(reward: RewardsData) {
    return new Promise((resolve, reject) => {
      this.restService.deleteRewards(this.campaign_id, reward.id)
        .toPromise()
        .then(r => {
          resolve();
        }).catch(e => {
          reject();
        });
    });
  }

  removeRewards(index, rewardId) {
    if (rewardId) {
      this.restService.deleteRewards(this.campaign_id, rewardId).
        subscribe(res => {
          this.rewardList.splice(index, 1);
        });
    } else {
      this.rewardList.splice(index, 1);
    }
  }

  getAmounts(list) {
    this.totalAmount = 0;
    for (let i = 0; i < list.length; i++) {
      this.totalAmount = this.totalAmount + Number(list[i].amount);
      console.log(this.totalAmount);
    }
    console.log(this.totalAmount);
    return this.totalAmount;
  }
  getPercentSum() {
    let value = 0;
    this.rewardList.forEach(e => {
      console.log(e.percentage);
      // this.lastPercentValue= e.percentage;
      value = value + parseInt(e.percentage);
    });
    if (value > 100) {
      this.helper.showAlert("Percentage can not be greater than 100%", "");
    }
    if (value < 100) {
      this.rewardList.push(new RewardsData(null, '', null, 100 - value, 'created', 1, null));
    }

    if (value == 100) {
      this.helper.showAlert("Percentage value has been equal to 100%", "");
    }

  }

  showIndexItem(event, index) {
    let _index: HealthIndexIndicator = index.index;

    if (_index.code == this.constants.INDICATORS.CANCER) {
      if (index.selected) {
        // add cancers
        let breastCancer = new IndicatorData(this.constants.CANCERS.BREAST, false, index.freq);
        let cervicalCancer = new IndicatorData(this.constants.CANCERS.CERVICAL, false, index.freq);
        let colonCancer = new IndicatorData(this.constants.CANCERS.COLON, false, index.freq);
        let lungCancer = new IndicatorData(this.constants.CANCERS.LUNG, false, index.freq);
        let prostateCancer = new IndicatorData(this.constants.CANCERS.PROSTATE, false, index.freq);
        this.campaign_data.challengeTemplateInfo.indicatorLst.push(breastCancer, cervicalCancer, colonCancer, lungCancer, prostateCancer);
      } else {
        //remove cancers
        // Find the breast cancer then remove 5 item from that index
        let i = this.campaign_data.challengeTemplateInfo.indicatorLst.findIndex(item => {
          return item.code == this.constants.CANCERS.BREAST;
        });
        this.campaign_data.challengeTemplateInfo.indicatorLst.splice(i, 5);
      }
      return;
    }

    let indicatorData = new IndicatorData(_index.code, false, index.freq);

    if (this.campaign_data.challengeTemplateInfo.indicatorLst.length == 0) {
      this.campaign_data.challengeTemplateInfo.indicatorLst.push(indicatorData);
    } else {
      let _indicator_index;
      let found = false;
      this.campaign_data.challengeTemplateInfo.indicatorLst.forEach((indicator, i, a) => {
        if (indicator.code == _index.code) {
          found = true;
          _indicator_index = i;
        }
      });

      if (found == false) {
        this.campaign_data.challengeTemplateInfo.indicatorLst.push(indicatorData);
      } else {
        this.campaign_data.challengeTemplateInfo.indicatorLst.splice(_indicator_index, 1);
      }

    }
  }

  changeIndexFrequency(index) {
    let _index: HealthIndexIndicator = index.index;
    this.campaign_data.challengeTemplateInfo.indicatorLst.forEach(_indicator => {
      if (_indicator.code == _index.code) {
        _indicator.frequency = index.freq;
      }
    });
  }

  goSomeTips() {
    let moderatorModal = this.modalCtrl.create('SomeTipsPage');
    moderatorModal.present();
  }

  canAddModerator(): boolean {
    if (this.campaign_data) {
      if (this.campaign_data.name && this.campaign_data.startDate) {
        return true;
      }
      return false;
    }
    return false;
  }

  canAddValidator() {
    if (this.canAddModerator()) {
      if (this.campaign_data.challengeTemplateInfo && this.campaign_data.challengeTemplateInfo.indicatorLst.length > 0 || this.campaign_survey.surveyQuestionInfo.length > 0) {
        return true;
      }
      return false;
    }
    return false;
  }

  addModerator() {
    let memberRoles: MemberRolesInfo = new MemberRolesInfo(true, false, true);
    let invities = JSON.parse(JSON.stringify(this.invities));
    let screen_info: InviteScreenInfo = new InviteScreenInfo(this.constants.INVITE_INFO.CHALLENGE, null, memberRoles, this.constants.INVITE_INFO.ADD, invities, false);
    let moderatorModal = this.modalCtrl.create('InvitePeoplePage', { 'invite_screen_info': screen_info });
    moderatorModal.onDidDismiss((data: InviteScreenInfo) => {
      if (data) {
        this.invities.moderators = data.invities.moderators;
      }
      console.log(data);
    });
    moderatorModal.present();

  }

  addValidator() {
    let memberRoles: MemberRolesInfo = new MemberRolesInfo(false, true, true);
    let invities = JSON.parse(JSON.stringify(this.invities));
    let screen_info: InviteScreenInfo = new InviteScreenInfo(this.constants.INVITE_INFO.CHALLENGE, null, memberRoles, this.constants.INVITE_INFO.ADD, invities, false);
    let validatorModal = this.modalCtrl.create('InvitePeoplePage', { 'invite_screen_info': screen_info });
    validatorModal.onDidDismiss((data: InviteScreenInfo) => {
      if (data) {
        this.invities.validators = data.invities.validators;
      }

      console.log(data);
    });
    validatorModal.present();

  }

  deleteModItem(item, index) {
    // this.campData.moderators = this.campData.moderators.filter((invitor) => item.id != invitor.id);
    this.invities.moderators.splice(index, 1);
  }

  deleteValItem(item, index) {
    // this.campData.validators = this.campData.validators.filter((invitor) => item.id != invitor.id);
    this.invities.validators.splice(index, 1);
  }

  goCampaignSuccess(value) {

    let msg = this.checkRequirements();
    if (msg != null) {
      this.helper.showAlert(msg, "");
      return;
    }

    let validatorMsg = this.checkAddValidatorRequirements();
    if (validatorMsg != null) {
      this.helper.showAlert(validatorMsg, "");
      return;
    }

    // TODO: Fill the terms
    this.terms.forEach(term => {
      if (term.input && term.input != "") {
        this.campaign_data.termsInfo.push(term.input);
      }
    });
    // deformat
    this.campaign_data.startDate = this.deFormatDate(this.campaign_data.startDate);
    if (this.campaign_data.endDate && this.campaign_data.endDate != null && this.campaign_data.endDate != "null") {
      this.campaign_data.endDate = this.deFormatDate(this.campaign_data.endDate);
    }
    // format again
    this.campaign_data.startDate = this.formateDate(this.campaign_data.startDate);
    if (this.campaign_data.endDate && this.campaign_data.endDate != null && this.campaign_data.endDate != "null") {
      this.campaign_data.endDate = this.formateDate(this.campaign_data.endDate);
    }

    if (!this.campaign_data.challengeTemplateInfo) {
      this.campaign_data.challengeTemplateInfo = new ChallengeTemplateInfoData(this.campaign_data.name, this.campaign_data.name, this.constants.CHALLENGE_TEMPLATE_TYPE.CUSTOM, []);
    }

    // if (this.campaign_data.challengeTemplateInfo.indicatorLst.length < 1) {
    //   this.campaign_data.challengeTemplateInfo = null;
    //   this.campaign_data.challengeType.name = "APP_USE";
    // } else {
    //   this.campaign_data.challengeTemplateInfo.name = this.campaign_data.name;
    //   this.campaign_data.challengeTemplateInfo.description = this.campaign_data.description;
    // }

    this.campaign_data.challengeTemplateInfo.name = this.campaign_data.name + " template.";
    this.campaign_data.challengeTemplateInfo.description = this.campaign_data.name + " template desctription.";

    this.helper.showLoading();

    if (this.navData.edit) {
      this.updateCampaign();
      return;
    }

    // FIXME: apply async-await instead of nested promises.
    this.restService.createCampaign(this.campaign_data)
      .subscribe(res => {
        if (this.navData.draft_edit) {
          this.deleteCampaignDrafts();
        }
        this.createSurvey(res).then(r => {
          this.createRewards(res.id)
            .then(r1 => {
              this.helper.hideLoading();
              if (this.current_reward.id != 0) { //Don't create wallet for no-reward campaign.
                this.myWallet.createCampaignWallet(res)
                  .then(r => {
                    this.inviteOrganizers(res, false);
                  }).catch(e => {
                    console.error(e);
                    this.inviteOrganizers(res, false);
                  });
              } else {
                this.inviteOrganizers(res, false);
              }
            }).catch(e => {
              this.helper.hideLoading();
              this.helper.showErrorConfirm("", "Campaign created but unable to specify Rewards, please try again!", "Ok")
                .then(r2 => {
                  this.inviteOrganizers(res, true);
                }).catch(err => {
                  this.inviteOrganizers(res, true);
                });
            });
        }).catch(e => {
          this.helper.hideLoading();
          this.helper.showErrorConfirm("", "Campaign created but unable to create a survey, please try again!", "Ok")
            .then(r => {
              this.inviteOrganizers(res, true);
            }).catch(err => {
              this.inviteOrganizers(res, true);
            });
        });
      }, err => {
        this.helper.hideLoading();
        if (err && err.code == 409) {
          this.helper.showAlert("Campaign with this name already exists.", "");
        } else {
          this.helper.showAlert("Unable to create this Campaign.", "");

        }
      });
  }

  private inviteOrganizers(campaign, loader) {
    this.local.addCustomCampaign(campaign);
    // if (loader) {
    //   this.helper.showLoading();
    // }
    // this.helper.showLoading();
    this.startSendingInvites(campaign.id, campaign)
      .then((data: any) => {
        // this.helper.hideLoading();
        this.showInviteResult(data.successes, data.fails, campaign);
      }).catch(e => {
        // this.helper.hideLoading();
        this.showInviteResult([], [], campaign);
      });
  }

  updateCampaign() {
    if (!this.campaign_id) {
      this.helper.hideLoading();
      this.helper.showAlert("Failed to update Campaign.", "Error!");
      return;
    }

    if (!this.canUpdateSurvey) {
      this.helper.hideLoading();
      this.helper.showAlert("Please fill survey questions or remove them!", "Invalid!");
      return;
    }
    let campaign = this.navParams.get('campaign');
    campaign.name = this.campaign_data.name;
    campaign.startDate = this.campaign_data.startDate;
    campaign.endDate = this.campaign_data.endDate;
    campaign.description = this.campaign_data.description;
    campaign.challengeTemplateInfo.indicatorLst = this.campaign_data.challengeTemplateInfo.indicatorLst;
    campaign.termsInfo = this.campaign_data.termsInfo;

    this.restService.updateCampaign(campaign, this.campaign_id)
      .subscribe(res => {
        this.updateSurvey(campaign)
          .then(r => {
            this.updateRewards().then(r1 => {
              this.helper.hideLoading();
              this.local.editCampaign(res);

              try {
                if (!res.campaignInfo.purse.primaryAddress && this.current_reward.id != 0) {
                  this.myWallet.createCampaignWallet(res)
                    .then(r => {
                      this.viewCtrl.dismiss(true);
                    }).catch(e => {
                      this.viewCtrl.dismiss(true);
                    })
                } else {
                  this.viewCtrl.dismiss(true);
                }
              } catch (e) {
                this.viewCtrl.dismiss(true);
              }

            }).catch(e => {
              this.helper.hideLoading();
              this.local.editCampaign(res);
              this.viewCtrl.dismiss(true);
              this.helper.showAlert("Campaign updated but failed to update its rewards. Please try again!", "");
            });

          }).catch(e => {
            this.helper.hideLoading();
            this.local.editCampaign(res);
            this.viewCtrl.dismiss(true);
            this.helper.showAlert("Campaign updated but failed to update its survey and rewards. Please try again!", "");
          });
      }, err => {
        this.helper.hideLoading();
        this.helper.showAlert("Failed to update campaign.", "Error!");
      });
  }

  startSendingInvites(campaignId, campaign) {
    return new Promise((resolve, reject) => {
      try {

        let invite_list: Array<TempInviteData> = new Array();
        if (!this.invities.validators || (this.invities.validators && (this.invities.validators).length == 0)) {
          // no validators
          this.invities.moderators.forEach(m_contact => {
            let m_roles = new MemberRolesInfo(true, false, true);
            let m_invite_data = new InviteData(m_contact.email, m_contact.phone, m_roles);
            let m_temp_data = new TempInviteData(m_contact.name, m_invite_data);
            invite_list.push(m_temp_data);
          });
        } else if (!this.invities.moderators || (this.invities.moderators && (this.invities.moderators).length == 0)) {
          this.invities.validators.forEach((v_contact, i, a) => {
            let v_roles = new MemberRolesInfo(false, true, true);
            let v_invite_data = new InviteData(v_contact.email, v_contact.phone, v_roles);
            let v_temp_data = new TempInviteData(v_contact.name, v_invite_data);
            invite_list.push(v_temp_data);
          });
        } else {
          this.invities.moderators.forEach(m_contact => {
            this.invities.validators.forEach((v_contact, i, a) => {
              let flag = false;
              if (m_contact == v_contact) {
                flag = true;
                // both moderator and validator
                let roles = new MemberRolesInfo(true, true, true);
                let invite_data = new InviteData(m_contact.email, m_contact.phone, roles);
                let temp_data = new TempInviteData(m_contact.name, invite_data);
                invite_list.push(temp_data);
              } else if (flag == false && i == a.length - 1) {
                // validator
                let v_roles = new MemberRolesInfo(false, true, true);
                let v_invite_data = new InviteData(v_contact.email, v_contact.phone, v_roles);
                let v_temp_data = new TempInviteData(v_contact.name, v_invite_data);
                invite_list.push(v_temp_data);
                // moderator
                let m_roles = new MemberRolesInfo(true, false, true);
                let m_invite_data = new InviteData(m_contact.email, m_contact.phone, m_roles);
                let m_temp_data = new TempInviteData(m_contact.name, m_invite_data);
                invite_list.push(m_temp_data);
              }
            });
          });
        }

        if (invite_list && invite_list.length > 0) {
          this.contacts_to_invite = invite_list.slice();
          // this.helper.hideLoading();
          this.sendInvitesToContacts(campaignId, campaign).then(r => {
            resolve(new InviteResults(this.success_contacts, this.failed_contacts))
          });
          // let successes = [];
          // let fails = [];
          // invite_list.forEach((contact, i, a) => {
          //   this.sendInvite(contact, campaignId)
          //     .then(name => {
          //       successes.push(name);
          //       if (i == a.length - 1) {
          //         resolve(new InviteResults(successes, fails));
          //       }
          //     })
          //     .catch(name => {
          //       fails.push(name);
          //       if (i == a.length - 1) {
          //         resolve(new InviteResults(successes, fails));
          //       }
          //     });
          // });
        } else {
          resolve(new InviteResults([], []));
        }
      } catch (e) {
        reject('Unkown error!');
      }
    });

  }

  getContactsList(): ContactsList {
    let contacts_list = new ContactsList([], []);
    this.contacts_to_invite.forEach(contact => {
      if (contact.invite_data.email && contact.invite_data.email != "") {
        contacts_list.email_contacts.push(contact);
      } else if (contact.invite_data.phone && contact.invite_data.phone != "") {
        contacts_list.phone_contacts.push(contact);
      }
    });
    return contacts_list;
  }


  sendInvitesToContacts(campaign_id: string | number, campaign) {
    return new Promise((resolve) => {
      if (this.contacts_to_invite && this.contacts_to_invite.length > 0) {
        this.success_contacts = [];
        this.failed_contacts = [];
        this.helper.showLoading();
        this.sendInvitesToEmailContacts(campaign_id)
          .then(r => {
            this.getLinksForPhoneContacts(campaign_id)
              .then((contacts_for_sms: any[]) => {
                this.helper.hideLoading();
                if (contacts_for_sms.length > 0) {
                  this.sendInvitesToPhoneContacts(0, contacts_for_sms, campaign)
                    .then(r => {
                      resolve();
                    });
                } else {
                  resolve();
                  // this.showInviteResult(this.success_contacts, this.failed_contacts, campaign);
                }
              }).catch(e => {
                this.helper.hideLoading();
              });
          }).catch(e => {
            this.helper.hideLoading();
          });
      } else {
        // this.showInviteResult([], [], campaign);
        resolve();
      }
    });
  }

  sendInvitesToEmailContacts(campaign_id: string | number) {
    let contacts = this.getContactsList().email_contacts;
    return new Promise((resolve) => {
      if (contacts.length < 1) {
        resolve();
      } else {
        contacts.forEach((contact, i, a) => {
          this.getInviteLink(contact, true, campaign_id)
            .then(res => {
              this.success_contacts.push(contact.name);
              if (i == a.length - 1) {
                resolve();
              }
            })
            .catch(name => {
              this.failed_contacts.push(name);
              if (i == a.length - 1) {
                resolve();
              }
            });
        });
      }
    });
  }

  /**
   * @returns list for contacts:{phone:string, msg:string}[] for sending sms through native app.
   */
  getLinksForPhoneContacts(campaing_id: string | number) {
    let contacts = this.getContactsList().phone_contacts;
    let contacts_for_sms = [];
    return new Promise((resolve) => {
      if (contacts.length < 1) {
        resolve(contacts_for_sms);
      } else {
        contacts.forEach((contact, i) => {
          this.getInviteLink(contact, false, campaing_id)
            .then(res => {
              if (res) {
                this.success_contacts.push(contact.name);
                contacts_for_sms.push({ phone: contact.invite_data.phone, msg: res });
                if (i == contacts.length - 1) {
                  resolve(contacts_for_sms);
                }
              } else {
                if (i == contacts.length - 1) {
                  resolve(contacts_for_sms);
                }
              }
            })
            .catch(name => {
              this.failed_contacts.push(name);
              if (i == contacts.length - 1) {
                resolve(contacts_for_sms);
              }
            });
        });
      }
    });
  }

  sendInvitesToPhoneContacts(index: number, contacts: any[], campaign) {
    return new Promise((resolve) => {
      let i = index;
      if (i < contacts.length) {
        this.sendMessage(contacts[i])
          .then(r => {
            let i2 = i + 1;
            this.sendInvitesToPhoneContacts(i2, contacts, campaign);
          }).catch(e => {
            this.failed_contacts.push(contacts[i].phone);
            let i2 = i + 1;
            this.sendInvitesToPhoneContacts(i2, contacts, campaign);
          });
      } else {
        // FIXME: resolve the promise to show the invite result
        this.showInviteResult(this.success_contacts, this.failed_contacts, campaign);
        resolve(); //resolve not works for func call withing func.
        return;
      }
    })
  }

  sendMessage(data) {
    return this.sms.send(data.phone, data.msg, { android: { intent: "INTENT" } });
  }

  /**
 * get sms link for phone contacts and send mail to email contacts
 * @param contact 
 * @param isEmailContact 
 * @returns resolve null for email success and smsContent for phone success
 */
  getInviteLink(contact: TempInviteData, isEmailContact: boolean, campaign_id: string | number) {
    let data;
    if (isEmailContact) {
      data = new InviteData((contact.invite_data.email).toLowerCase(), null, contact.invite_data.memberRoles);
    } else {
      data = new InviteData(null, contact.invite_data.phone, contact.invite_data.memberRoles);
    }
    return new Promise((resolve, reject) => {
      this.restService.inviteMember(campaign_id, this.constants.INVITE_INFO.CHALLENGE, data)
        .subscribe(res => {
          if (isEmailContact) {
            resolve(null)
          } else if (res.smsContent) {
            resolve(res.smsContent);
          } else {
            reject(contact.name);
          }
        }, err => {
          if (err.code == 409 || err.code == 403) {
            resolve(null);
          } else {
            reject(contact.name);
          }
        });
    });
  }

  showInviteResult(successes: any[], fails: any[], campaign) {
    if ((successes && successes.length > 0) || (fails && fails.length > 0)) {
      let result_modal = this.modalCtrl.create('InviteResultPage', new InviteResults(successes, fails));
      result_modal.onDidDismiss(r => {
        this.openCampaignSuccessPage(campaign);
      });
      result_modal.present();
    } else {
      this.openCampaignSuccessPage(campaign);
    }
  }

  openCampaignSuccessPage(campaign) {
    let successModal = this.modalCtrl.create('CampaignSuccessPage', { 'campaign': campaign });
    successModal.present().then(r => {
      this.viewCtrl.dismiss(true);
    });
  }

  sendInvite(temp_contact: TempInviteData, campaignId) {
    return new Promise((resolve, reject) => {
      let contact = temp_contact.invite_data;
      let name;
      if (contact.phone && contact.phone != null) {
        name = contact.phone;
      } else if (contact.email && contact.email != null) {
        name = contact.email;
      }
      if (!name) {
        reject(temp_contact.name);
      }

      if (contact.email == "") {
        contact.email = null;
      }

      this.restService.inviteMember(campaignId, this.constants.INVITE_INFO.CHALLENGE, contact)
        .subscribe(res => {
          if (res.smsContent) {
            if (this.sms.hasPermission) {
              this.sms.send(contact.phone, res.smsContent, { android: { intent: "" } })
                .then(r1 => {
                  resolve(temp_contact.name);
                })
                .catch(e => {
                  reject(temp_contact.name);
                });
            } else {
              reject(temp_contact.name);
            }
          } else {
            if (contact.email) {
              resolve(temp_contact.name);
            } else {
              reject(temp_contact.name);
            }
          }
        }, err => {
          if (err.code == 409 || err.code == 403) {
            resolve(temp_contact.name);
          } else {
            reject(temp_contact.name);
            this.helper.showAlert("Unable to generate invitation link.", "");
          }
        });
    });
  }

  createRewards(campaignId) {
    let promises = [];
    this.rewardList.forEach(item => {
      promises.push(this.createReward(campaignId, item));
    });
    return Promise.all(promises);
  }

  createReward(campaignId, reward) {
    return new Promise((resolve, reject) => {
      this.restService.createReward(campaignId, reward).
        subscribe(res => {
          console.log(res);
          resolve();
        }, err => {
          reject(err);
        });
    });
  }

  updateRewards() {
    let promises = [];
    this.rewardList.forEach(item => {
      promises.push(this.updateReward(item))
    });
    return Promise.all(promises);
  }

  updateReward(reward) {
    return new Promise((resolve, reject) => {
      if (reward.id) {
        this.restService.updateReward(this.campaign_id, reward).
          subscribe(res => {
            console.log(res);
            resolve();
          }, err => {
            reject(err);
          });
      } else {
        this.restService.createReward(this.campaign_id, reward).
          subscribe(res => {
            console.log(res);
            resolve();
          }, err => {
            reject(err);
          });
      }

    });
  }

  createSurvey(campaign) {
    return new Promise((resolve, reject) => {
      if (!this.campaign_survey.surveyQuestionInfo || this.campaign_survey.surveyQuestionInfo.length < 1) {
        resolve();
        return;
      }
      if (this.campaign_survey.surveyQuestionInfo.length == 1) {
        this.campaign_survey.surveyQuestionInfo.forEach(ques => {
          if (!ques.question || ques.question == "") {
            resolve();
            return;
          }
        });
      }
      this.restService.createSurvey(campaign.id, this.campaign_survey)
        .subscribe(r => {
          resolve();
        }, err => {
          console.error(err);
          reject();
        });
    });
  }

  updateSurvey(campaign) {
    return new Promise((resolve, reject) => {
      if (this.campaign_published) {
        resolve();
      }
      if (!this.campaign_survey || (this.campaign_survey && !this.campaign_survey.id)) {
        resolve();
      }
      this.restService.updateCampaignSurvey(campaign.id, this.campaign_survey)
        .subscribe(r => {
          resolve();
        }, err => {
          console.error(err);
          reject();
        });
    });
  }

  deleteCampaignDrafts() {
    let draft_to_delete: CampaignDraft = this.navParams.get("campaign_draft");
    this.storage.get(this.constants.STORAGE.CAMPAIGN_DRAFTS).then((_drafts: CampaignDraft[]) => {
      if (_drafts && _drafts.length && _drafts.length >= 1) {
        let index = _drafts.findIndex(item => {
          return item.id == draft_to_delete.id;
        });
        if (index != -1) {
          _drafts.splice(index, 1);
        }
        this.storage.set(this.constants.STORAGE.CAMPAIGN_DRAFTS, _drafts)
          .then(r => {
            // FIXME: no views to dismiss, see what is this do?
            this.viewCtrl.dismiss(true);
          }).catch(e => {
            console.error(e);
          });
      }
    }).catch(e => {
      console.error(e);
    });
  }

  checkRequirements() {
    let msg = null;
    if (!this.campaign_data.name) {
      msg = "Please provide a Campaign name.";
      return msg;
    }
    // if (!this.name_pattern.test(this.campaign_data.name)) {
    //   msg = "Campaign name only accept characters, hyphens, apostropes and numbers.";
    //   return msg;
    // }
    if (!this.campaign_data.startDate) {
      msg = "Please select start date for Campaign.";
      return msg;
    }

    if (this.rewardList && this.rewardList.length > 0) {
      let flag = false;
      this.rewardList.forEach(reward => {
        if ((!reward.amount && !reward.percentage) || !reward.name || reward.name == "") {
          msg = "One or more rewards are missing data, either correct or remove them.";
          flag = true;
        }
        if (reward.amount == 0 || reward.percentage == 0) {
          msg = "Value can not be zero";
          flag = true;
        }
      });
      if (flag) {
        return msg;
      }
    }

    // if (this.terms && this.terms.length > 0) {
    //   this.terms.forEach(term => {
    //     if (!term.input || term.input == "") {
    //       msg = "Please fill all the term for campaign.";
    //     }
    //   });
    //   return msg;
    // }
    // if (!this.campaign_data.endDate) {
    //   msg = "Please select end date for campaign. In future it will be optional.";
    //   return msg;
    // }
    // if (!this.campaign_data.description) {
    //   msg = "Please enter some description about campaign.";
    //   return msg;
    // }

    //** Validation for selecting some indicators */
    // if ((this.campaign_data.challengeTemplateInfo.indicatorLst).length == 0) {
    //   msg = "Please select at least one index for this campaign.";
    //   return msg;
    // }

    if (this.campaign_survey.surveyQuestionInfo.length > 0) {
      let flag = false;
      this.campaign_survey.surveyQuestionInfo.forEach(ques => {
        if (!ques.question || ques.question == "") {
          flag = true;
          msg = "Please fill all survey questions!";
        } else if (ques.surveyAnswerInfo) {
          ques.surveyAnswerInfo.forEach(ans => {
            if (!ans.answer || ans.answer == "") {
              flag = true;
              msg = "Either remove or provide valid answers for survey questions.";
            }
          });
        }
      });
      if (flag) {
        if (!msg) {
          msg = "All fields in the survey need to be filled";
        }
        return msg;
      }

    } else {
      return msg;
    }
  }

  get canUpdateSurvey() {
    let flag = true;
    this.campaign_survey.surveyQuestionInfo.forEach(ques => {
      if (!ques.question || ques.question == "") {
        flag = false;
      }
    });
    return flag;
  }

  checkAddValidatorRequirements() {
    let msg = null;
    if (this.invities.validators.length > 0) {
      if (!this.hasSurvey && !this.hasIndicators) {
        msg = "Either select indicators or add survey questions for Validators. You can also remove Validators.";
      }
    }
    return msg;
  }

  get hasIndicators(): boolean {
    if (this.campaign_data.challengeTemplateInfo) {
      if (this.campaign_data.challengeTemplateInfo.indicatorLst.length > 0) {
        return true;
      }
      return false;
    }
    return false;
  }

  get hasSurvey(): boolean {
    if (this.campaign_survey.surveyQuestionInfo) {
      if (this.campaign_survey.surveyQuestionInfo.length > 0) {
        return true;
      }
      return false;
    }
    return false;
  }

  formateDate(dateString: string) {
    let date = dateString.split('-');
    let y = date[0];
    let m = date[1];
    let d = date[2];
    return m + '/' + d + '/' + y;
  }

  deFormatDate(dateString: string) {
    if (dateString.indexOf('/') != -1) {
      let date = dateString.split('/');
      let m = date[0];
      let d = date[1];
      let y = date[2];
      return y + '-' + m + '-' + d;
    }
    return dateString;

  }

  enableDoneBtn() {
    if (!this.campaign_data.name || this.campaign_data.name == "") {
      return false;
    }
    return true;
  }

  cancel() {
    if (this.navData.edit) {
      this.helper.showConfirm("Cancel?", "Any changes you made will be lost!", "YES", "NO")
        .then(y => {
          this.viewCtrl.dismiss(false);
          return;
        }).catch(n => {
          console.log(n);
          return;
        });
      return;
    }
    if (this.navData.draft_edit) {
      this.helper.showConfirm("Save draft changes!", "Do you want to keep changes made in draft?", "YES", "NO")
        .then(r => {
          if (!this.campaign_data.name || this.campaign_data.name == "") {
            this.helper.showAlert("Please provide a Campaign name to save your changes.", "No name!");
            return;
          } else {
            this.saveCampaignDraftCopy();
            return;
          }
        }).catch(e => {
          this.viewCtrl.dismiss(false);
        });
      return;
    }
    if (!this.navData.edit && !this.navData.draft_edit && this.campaign_data) {
      if (!this.campaign_data.name || this.campaign_data.name == "") {
        this.helper.showConfirm("Save draft!", "Canceling Campaign creation! You can save the draft if you provide a name for it.", "Ok", "Cancel")
          .then(y => {
            return;
          }).catch(n => {
            this.viewCtrl.dismiss();
            return;
          });
      } else {

        this.helper.showConfirm("Save draft?", "You are going to cancel Campaign creation. Do you want to keep this as a draft?", "YES", "NO")
          .then(r => {
            this.saveCampaignDraftCopy();
            return;
          }).catch(e => {
            this.viewCtrl.dismiss();
          });
      }
      return;
    }
  }

  saveCampaignDraftCopy() {
    if (this.navData.edit) {
      this.goCampaignSuccess('submit');
      return;
    }
    if (this.campaign_data) {
      let drafts: CampaignDraft[] = new Array();
      this.storage.get(this.constants.STORAGE.CAMPAIGN_DRAFTS).then((_drafts: Array<CampaignDraft>) => {
        if (_drafts && _drafts.length && _drafts.length >= 1) {
          drafts = _drafts;
          if (this.navData.draft_edit) {
            let draft_index = this.navParams.get('draft_index');
            let old_draft = drafts[draft_index];
            let new_draft = new CampaignDraft(old_draft.id, this.campaign_data, this.invities, this.terms, "", this.campaign_survey);
            drafts[draft_index] = new_draft;
            this.saveDraftsToStorage(drafts);
          } else {
            let index = _drafts.findIndex(item => {
              return (item.campaign.name).toLowerCase() == (this.campaign_data.name).toLowerCase();
            });

            if (index > -1) {
              this.helper.showAlert('A Campaign with the same name already exists in drafts!', "");
              return;
            } else {
              let new_draft = new CampaignDraft(new Date().getTime(), this.campaign_data, this.invities, this.terms, "", this.campaign_survey);
              drafts.push(new_draft);
              this.saveDraftsToStorage(drafts);
            }
          }
        } else {
          let new_draft = new CampaignDraft(new Date().getTime(), this.campaign_data, this.invities, this.terms, "", this.campaign_survey);
          drafts.push(new_draft);
          this.saveDraftsToStorage(drafts);
        }
      }).catch(e => {
        console.error(e);
      });
    }
  }

  saveDraftsToStorage(drafts: Array<CampaignDraft>) {
    return new Promise((resolve, reject) => {
      this.storage.set(this.constants.STORAGE.CAMPAIGN_DRAFTS, drafts)
        .then(r => {
          this.viewCtrl.dismiss(true);
          resolve(r);
        }).catch(e => {
          reject(e);
        });
    });
  }

  handleError(err) {
    this.helper.hideLoading();
    this.helper.showAlert('Failed to create the campaign ' + this.campaign_data.name, '');
    console.error(err);
  }
}

class Schedual {
  constructor(
    public id: number,
    public name: string
  ) { }
}

class QuestionType {
  constructor(
    public id: number,
    public type: string
  ) { }
}

class IndicatorView {
  constructor(
    public selected: boolean,
    public index: HealthIndexIndicator,
    public freq: string,
    public only_device: boolean
  ) { }
}

class RewardSource {
  constructor(
    public id: number,
    public title: string,
    public description: string
  ) { }
}

class InviteResults {
  constructor(
    public successes: any[],
    public fails: any[]
  ) { }
}

class ContactsList {
  constructor(
    public email_contacts: TempInviteData[],
    public phone_contacts: TempInviteData[]
  ) { }
}