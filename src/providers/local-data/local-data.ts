import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IndicatorView, MenuData, CDIndicator, IndicatorModel, HealthIndexIndicator, HealthIndexQuestion, Participant, Contry, CampaignCategory } from '../../models/classes';
import { Subject } from 'rxjs';
import { UpdateMenuData } from '../../models/interfaces';
import { Rest } from '../rest';
import { Helper } from '../helper-service';
import { RestDataProvider } from '../rest-data-service/rest-data-service';
import { UserService } from '../user-service';
import { ConstProvider } from '../const/const';
@Injectable()
export class LocalDataProvider {

  private updataMenuData = new Subject<UpdateMenuData>();
  $menuDataObserver = this.updataMenuData.asObservable();
  removeNotification = new Subject<boolean>();
  $removeHomeNotification = this.removeNotification.asObservable();
  fcmNotification = new Subject<any>();
  $fcmNotification = this.fcmNotification.asObservable();
  campaigns: Array<any>;
  campaign: any;
  indicators: Array<IndicatorView>;
  cancerIndicators: Array<IndicatorModel>;
  indicator: IndicatorView;
  chfLastUpdate: any;
  circles: Array<any>;
  circle: any;
  health_indexes: Array<HealthIndexIndicator>;
  cancer_indexes: Array<HealthIndexIndicator>;
  indexes: Array<IndicatorModel>;
  custom_indexes: Array<IndicatorModel>;
  weight: { 'unit': string, 'value': any } = { 'unit': null, 'value': null };
  participants: Array<Participant>;
  _contries: Contry[];
  campaign_slides_ref: string;
  campaign_slide_index_ref: number;

  constructor(
    public http: HttpClient,
    private rest: Rest,
    private helper: Helper,
    private restService: RestDataProvider,
    private userService: UserService,
    private constants: ConstProvider
  ) {
    this.initialize();
  }

  public initialize() {

    this.rest.getContries()
      .subscribe(data => {
        this._contries = data.contries;
      }, this.handleError);

    this.rest.getIndicators()
      .subscribe(data => {
        this.health_indexes = data.indexes;
      }, this.handleError);

    this.rest.getCancers()
      .subscribe(data => {
        this.cancer_indexes = data.indexes;
      }, this.handleError);
  }

  public clearData() {
    this.campaigns = new Array();
    this.campaign = null;
    this.indicators = new Array();
    this.indicator = null;
    this.chfLastUpdate = null;
    this.circles = new Array();
    this.circle = null;
    this.indexes = new Array();
    this.custom_indexes = new Array();
    this.participants = new Array();
    this.weight = { 'unit': null, 'value': null };
    this.initialize();
    return;
  }

  get contries() {
    return this._contries;
  }

  getLocalHealthIndexes(): Array<HealthIndexIndicator> {
    return this.health_indexes;
  }

  get mhiIndicators() {
    return this.health_indexes;
  }

  updateMenuData(data: MenuData) {
    this.updataMenuData.next(<UpdateMenuData>{ chronicDiseases: data.chronicDiseases, userProfilePic: data.profilePic, circles: data.circles, campaigns: data.campaigns, composite_score: data.composite_score });
  }

  sendFcmNotification(data: any) {
    this.fcmNotification.next(data);
  }

  removeHomeNotification() {
    this.removeNotification.next(true);
  }

  showScore(indicator) {
    if (!indicator.mhiIndex) {
      return false;
    }
    if (!indicator.lastUpdatedDate) {
      return false;
    }
    if (indicator.status == 'RED' || indicator.status == 'GREEN' || indicator.status == 'YELLOW') {
      return true;
    }
    return false;
  }

  public getMhiStatus() {
    return new Promise((resolve, reject) => {
      this.restService.getMhiStatus()
        .subscribe(mhiStatus => {
          this.setWeight(mhiStatus.data);
          resolve(mhiStatus.data);
        }, e => {
          reject(e);
        });
    });
  }

  public refreshMhiData() {
    return new Promise((resolve, reject) => {
      this.getMhiStatus()
        .then((data: any) => {
          let indicators = this.mapAndGetIndicators(data, true);
          // this.setLocalIndexes(indicators);
          this.localIndexes = indicators;
          this.updateCustomIndexes();
          resolve();
        }).catch(e => {
          reject(e);
        });
    });

  }

  public setWeight(indicators: Array<any>) {
    indicators.forEach(indicator => {
      if (indicator.indicatorCode == 'BMI') {
        indicator.questions.forEach(ques => {
          if (ques.code == 'Weight') {
            this.weight.value = ques.value;
            this.weight.unit = ques.unit;
          }
        });
      }
    });
  }

  public getWeight() {
    return this.weight;
  }

  public getAge(dobTimeStamp) {
    let date = new Date(parseInt(dobTimeStamp));
    let dob_year = date.getFullYear();
    let dob_month = date.getMonth();
    let dob_date = date.getDate();
    let d = new Date();
    let today_year = d.getFullYear();
    let today_month = d.getMonth();
    let today_date = d.getDate();
    let age = today_year - dob_year;
    if (dob_month > today_month) {
      return age - 1;
    } else if (dob_month == today_month) {
      if (dob_date > today_date) {
        return age - 1;
      } else {
        return age;
      }
    } else {
      return age;
    }
  }

  getCampaigns() {
    return new Promise((resolve, reject) => {
      this.restService
        .getCampaigns()
        .subscribe(data => {
          resolve(data.info);
        }, error => {
          reject(error);
        });
    });
  }

  getChronicCampaigns(campaigns: Array<any>) {
    let chronicCampaigns = [];
    let customCampaigns = [];
    campaigns.forEach(campaign => {

      if (campaign.challengeTemplateInfo && campaign.challengeTemplateInfo.templateCategory == 'Chronic Disease Management') {
        chronicCampaigns.push(campaign);
      } else {
        customCampaigns.push(campaign);
      }
    });
    return { 'chronicCampaigns': chronicCampaigns, 'customCampaigns': customCampaigns }
  }

  public getChfIndicators(indicatorList: Array<any>, CDIndicators: Array<CDIndicator>, frequencies: Array<any>): Array<IndicatorView> {
    let _newIndicators: Array<IndicatorView> = [];

    indicatorList.forEach(indicator => {
      CDIndicators.forEach(cIndicator => {
        if (indicator.indicatorCode == cIndicator.code) {
          indicator.questions[0].unit = this.getUnit(indicator.indicatorCode, indicator.questions[0].unit);
          let state = this.helper.getTimeDifference(indicator.lastUpdatedDate, indicator.indicatorCode, frequencies);
          if (indicator.questions[0].unit == 'kg') {
            indicator.questions[0].unit = 'lb';
            indicator.questions[0].value = ((indicator.questions[0].value) * (2.20462)).toFixed(2);
          }
          if (cIndicator.code == 'Appointment') {

            let temp_appointment = this.getAppointmentIndicator();
            temp_appointment.questions.forEach(temp_ques => {
              let flag = false;

              indicator.questions.forEach((question, i, a) => {
                if (temp_ques.code == question.code) {
                  flag = true;
                }
                if (flag == false && i == a.length - 1) {
                  indicator.questions.push(temp_ques);
                }
              });
            });

            let ques: Array<any> = new Array(2);
            indicator.questions.forEach((question, i, a) => {
              if (question.code == "DATE_OF_APPOINTMENT") {
                ques[0] = question;
              }
              if (question.code == "FULFILL_APPOINTMENT") {
                ques[1] = question;
              }
            });
            indicator.questions = ques;

          }
          _newIndicators[cIndicator.index] = (new IndicatorView(cIndicator.index, cIndicator.detail, cIndicator.showTitle, cIndicator.inputType, indicator, cIndicator.image, state, indicator.questions[0].value));
        }
        // if (cIndicator.code == 'Appointment') {
        //   _newIndicators[cIndicator.index] = (new IndicatorView(cIndicator.index, cIndicator.detail, cIndicator.showTitle, cIndicator.inputType, this.appointmentIndicator, cIndicator.image, "Please schedule an appointment.", null));
        // }
      });
    });
    if (_newIndicators.length != CDIndicators.length) {
      let temp: Array<IndicatorView> = [];
      _newIndicators.forEach(item => {
        if (item) {
          temp.push(item);
        }
      });
      _newIndicators = temp;
    }
    return _newIndicators;
  }

  getAppointmentIndicator() {
    let appointment_indicator = {
      "indicatorCode": "Appointment",
      "status": "NOTAVAILABLE",
      "questions": [
        {
          "code": "DATE_OF_APPOINTMENT",
          "value": null,
          "unit": null
        },
        {
          "code": "FULFILL_APPOINTMENT",
          "value": null,
          "unit": null
        }
      ],
      "calculatedValue": "null",
      "mhiIndex": "0",
      "lastUpdatedDate": null,
      "nextScreeningDate": null,
      "updateRequire": false
    };
    return appointment_indicator;
  }

  mapAndGetIndicators(indicators: Array<any>, all: boolean): Array<IndicatorModel> {
    let _indicators: Array<IndicatorModel> = new Array();
    let _cancers: Array<IndicatorModel> = new Array();
    // let possibleCancers = this.possibleCancers;
    indicators.forEach(indicator => {
      // this.cancer_indexes.forEach(cancerIndex => {
      this.possibleCancers.forEach(cancerIndex => {
        if (indicator.indicatorCode == cancerIndex.code) {
          indicator.calculatedValue = this.mapCalculatedValue(indicator.calculatedValue);

          cancerIndex.questions.forEach(cancerQuestion => {
            let found = false;
            indicator.questions.forEach((indicatorQuestion, i, a) => {
              if (indicatorQuestion.code == cancerQuestion.code) {
                found = true;
                cancerQuestion = this.mapIndexQuestion(cancerQuestion, indicatorQuestion);
              }
              if (!found && i == a.length - 1) {
                if (cancerQuestion.type == 'toggle_list') {
                  cancerQuestion.value = false;
                  cancerQuestion.unit = "";
                }
              }
            })
          });
          _cancers.push(new IndicatorModel(cancerIndex, indicator));
        }
      });
    });

    let cancer_filled = false;
    indicators.forEach(indicator => {
      this.health_indexes.forEach(healthIndex => {
        if (indicator.indicatorCode == healthIndex.code && healthIndex.code != 'Cancer') {

          indicator.calculatedValue = this.mapCalculatedValue(indicator.calculatedValue);

          healthIndex.questions.forEach(indexQuestion => {
            let found = false;
            indicator.questions.forEach((indicatorQuestion, i, a) => {
              if (indicatorQuestion.code == indexQuestion.code) {
                found = true;
                indexQuestion = this.mapIndexQuestion(indexQuestion, indicatorQuestion);
              }
              if (!found && i == a.length - 1) {
                if (indexQuestion.type == 'toggle_list') {
                  indexQuestion.value = false;
                  indexQuestion.unit = "";
                }
              }
            });
          });
          _indicators.push(new IndicatorModel(healthIndex, indicator));
        } else if (healthIndex.code == 'Cancer' && _cancers.length > 0) {
          if (cancer_filled == false) {
            this.setCancerIndexes(_cancers);
            cancer_filled = true;
            _cancers.sort(this.sortCancerIndicators);
            if (_cancers[0]) {
              healthIndex.lastValue = _cancers[0].data.lastUpdatedDate;
              _indicators.push(new IndicatorModel(healthIndex, _cancers.sort(this.sortIndicatorsByIndex)));
            }

          }
        }
      });
    });
    return _indicators.sort(this.sortIndicatorsByIndex);
  }

  public setCancerIndexes(cancers: IndicatorModel[]) {
    this.cancerIndicators = cancers;
  }

  public get cancers(): IndicatorModel[] {
    return this.cancerIndicators.sort(this.sortIndicatorsByIndex);
  }

  public get possibleCancers(): Array<HealthIndexIndicator> {
    let _cancers: Array<HealthIndexIndicator> = new Array();
    let profile = this.userService.getProfile();
    let age = this.getAge(profile.dob);
    let gender = profile.gender;
    if ((gender == "2" && age <= 20) || (gender == "1" && age <= 39)) {
      return _cancers; // patient have no cancer
    }
    this.cancer_indexes.forEach(cancerIndex => {
      switch (cancerIndex.code) {
        case 'Breast Cancer':
          if (gender == "2" && age > 44) { //female and above 44
            _cancers.push(cancerIndex);
          }
          break;
        case 'Cervical Cancer':
          if (gender == "2" && (age > 20 && age < 66)) { //female and between 20 and 66
            _cancers.push(cancerIndex);
          }
          break;
        case 'Colon Cancer':
          if (age > 49 && age < 76) { //between 49 and 76
            _cancers.push(cancerIndex);
          }
          break;
        case 'Lung Cancer':
          if (age > 54 && age < 81) { //between 54 and 81
            _cancers.push(cancerIndex);
          }
          break;
        case 'Prostate Cancer':
          if (gender == "1" && (age > 39 && age < 66)) { //male and between 39 and 66
            _cancers.push(cancerIndex);
          }
          break;

        default:
          break;
      }
    });
    return _cancers;
  }

  mapIndexQuestion(question: HealthIndexQuestion, quesToMap: any): HealthIndexQuestion {
    if (question.type == 'toggle_list') {
      if (quesToMap.value == 'YES') {
        question.value = true;
      } else {
        question.value = false;
      }
    } else if (question.type == 'date') {
      if (quesToMap.value != null && quesToMap.value != "null") {
        question.value = this.helper.convertDate(parseInt(quesToMap.value));
      } else {
        question.value = this.helper.convertDate(new Date());
      }
    } else {
      question.value = quesToMap.value;
    }
    question.unit = this.getIndicatorUnit(quesToMap.code, quesToMap.unit);
    return question;
  }

  mapCalculatedValue(calculatedValue: any) {
    if (calculatedValue != "null") {
      let value = parseFloat(calculatedValue);
      if (!Number.isNaN(value)) {
        calculatedValue = (value).toFixed(2);
      }
    }
    return calculatedValue;
  }

  getIndicatorUnit(QuestionCode: string, unit: string): string {
    let _unit: string = unit;
    if (_unit == null || _unit == undefined) {
      switch (QuestionCode) {
        case 'Weight':
          _unit = "lb";
          break;
        case 'Height':
        case 'WAIST_CIRCUMFERENCE':
          _unit = "in";
          break;
        case 'TOTAL_CHOLESTEROL':
        case 'HDL_CHOLESTEROL':
        case 'FASTING_GLUCOSE':
          _unit = "mg/dL";
          break;
        case 'HBA1C_LEVEL':
          _unit = "%";
          break;
        case 'SYSTOLIC_BLOOD':
        case 'DIASTOLIC_BLOOD':
          _unit = 'mmHg';
          break;
        default:
          _unit = "";
          break;
      }
    }
    return _unit;
  }

  getInvitedCampaigns(campaignList: Array<any>): Array<any> {
    let _invited_campaigns = [];
    campaignList.forEach(campaign => {
      if (campaign.campaignInfo.circleInfo.invitationState === 'invite') {
        _invited_campaigns.push(campaign);
      }
    });
    return _invited_campaigns;
  }

  getActiveCampaigns(campaignList: Array<any>): Array<any> {
    let _active_campaigns = [];
    campaignList.forEach(campaign => {
      if (campaign.daysLeft >= 0 && campaign.campaignInfo.circleInfo.invitationState === 'accept') {
        _active_campaigns.push(campaign);
      }
    });
    return _active_campaigns;
  }

  getPastCampaigns(campaignList: Array<any>): Array<any> {
    let _past_campaigns = [];
    campaignList.forEach(campaign => {
      if (campaign.daysLeft < 0) {
        _past_campaigns.push(campaign);
      }
    });
    return _past_campaigns;
  }

  getInvitedCircles(circleList: Array<any>): Array<any> {
    let _invited_circles = [];
    circleList.forEach(circle => {
      if (circle.invitationState == 'invite') {
        _invited_circles.push(circle);
      }
    });
    return _invited_circles;
  }

  getYourCircles(circleList: Array<any>): Array<any> {
    let _active_circles = [];
    circleList.forEach(circle => {
      if (circle.invitationState == 'accept' && circle.circleScope == 'private') {
        _active_circles.push(circle);
      }
    });
    return _active_circles;
  }
  // circleScope
  getAvailableCircles(circleList: Array<any>): Array<any> {
    let _active_circles = [];
    circleList.forEach(circle => {
      if (circle.invitationState == 'accept' && circle.circleScope == 'public') {
        _active_circles.push(circle);
      }
    });
    return _active_circles;
  }
  // ==============campaigns==============

  setLocalCampaigns(campaigns: Array<any>) {
    this.campaigns = campaigns;
  }

  getLocalCampaigns(): Array<any> {
    return this.campaigns;
  }

  updateLocalCampaigns(campaign) {
    this.campaign = campaign;
    let i = this.campaigns.findIndex(c => {
      return campaign.id == c.id;
    });
    if (i > -1) {
      this.campaigns[i] = campaign;
    }
  }

  setLocalCampaign(campaign) {
    this.campaign = campaign;
  }

  addCustomCampaign(campaign) {
    try {
      this.campaigns.push(campaign);
    } catch (e) {
      console.log(e);
    }

  }

  getLocalCampaign() {
    return this.campaign;
  }

  set localIndexes(indicators: Array<IndicatorModel>) {
    this.indexes = indicators;
  }

  get localIndexes(): Array<IndicatorModel> {
    return this.indexes;
  }

  refreshMhiIndicator(indicator: IndicatorModel): IndicatorModel {
    let new_indicator = this.indexes.find(item => {
      return item.info.code == indicator.info.code;
    });
    if (new_indicator) {
      return new_indicator;
    } else {
      return indicator;
    }

  }

  updateCustomIndexes() {
    if (this.custom_indexes) {
      this.custom_indexes.forEach(c_i => {
        this.indexes.forEach(h_i => {
          if (c_i.info.code == h_i.info.code) {
            c_i = h_i;
          }
        });
      });
    }
  }

  set localCustomIndexes(indicators: Array<IndicatorModel>) {
    this.custom_indexes = indicators;
  }

  get localCustomIndexes(): Array<IndicatorModel> {
    return this.custom_indexes;
  }

  setLocalIndicators(indicators: Array<IndicatorView>) {
    this.indicators = indicators;
  }

  getLocalIndicators(): Array<IndicatorView> {
    return this.indicators;
  }

  setLocalIndicator(indicator: IndicatorView) {
    this.indicator = indicator;
  }

  getLocalIndicator(): IndicatorView {
    return this.indicator;
  }

  getUnit(indicator_code: string, unit: string): string {
    let _unit = null;
    // if (indicator_code === 'SHORT_OF_BREATH')
    //   _unit = 'bpm';
    if (indicator_code == 'Pulse')
      _unit = 'bpm';
    if (indicator_code == 'Oxygen Saturation')
      _unit = '%';
    if (indicator_code == 'Daily Weight') {
      _unit = 'lb';
      if (unit == 'kg') {
        _unit = 'kg';
      }
    }
    return _unit;
  }

  updateIndicators(indicator: IndicatorView) {
    this.indicator = indicator;
    this.indicator.data.questions[0].value = indicator.newValue;
    this.indicator.data.lastUpdatedDate = new Date();
    this.indicator.data.updateRequire = false;
    this.indicators.forEach(_indicator => {
      if (indicator.data.indicatorCode == _indicator.data.indicatorCode) {
        _indicator.data.questions[0].value = indicator.newValue;
        _indicator.data.lastUpdatedDate = new Date();
        _indicator.data.updateRequire = false;
      }
    });
  }

  updateIndexes(indicator: IndicatorModel, custom: boolean) {
    if (custom == true) {
      if (((indicator.info.code).toLowerCase()).indexOf('cancer') > -1) {
        this.custom_indexes.forEach(index => {
          if (index.info.code == 'Cancer') {
            index.data.forEach(c_index => {
              if (c_index.info.code == indicator.info.code) {
                c_index.data.lastUpdatedDate = new Date();
                c_index.data.updateRequire = false;
                c_index.info.questions.forEach(oldQues => {
                  indicator.info.questions.forEach(newQues => {
                    if (newQues.code == oldQues.code) {
                      oldQues.value = newQues.value;
                      oldQues.unit = newQues.unit;
                    }
                  });
                });
              }
            });
          }
        });
      }
      this.custom_indexes.forEach(index => {
        if (index.info.code == indicator.info.code) {
          index.data.lastUpdatedDate = new Date();
          index.data.updateRequire = false;
          index.info.questions.forEach(oldQues => {
            indicator.info.questions.forEach(newQues => {
              if (newQues.code == oldQues.code) {
                oldQues.value = newQues.value;
                oldQues.unit = newQues.unit;
              }
            });
          });
        }
      });
    } else if (custom == false) {
      if (((indicator.info.code).toLowerCase()).indexOf('cancer') > -1) {
        this.indexes.forEach(index => {
          if (index.info.code == 'Cancer') {
            index.data.forEach(c_index => {
              if (c_index.info.code == indicator.info.code) {
                c_index.data.lastUpdatedDate = new Date();
                c_index.data.updateRequire = false;
                c_index.info.questions.forEach(oldQues => {
                  indicator.info.questions.forEach(newQues => {
                    if (newQues.code == oldQues.code) {
                      oldQues.value = newQues.value;
                      oldQues.unit = newQues.unit;
                    }
                  });
                });
              }
            });
          }
        });
      }
      this.indexes.forEach(index => {
        if (index.info.code == indicator.info.code) {
          index.data.lastUpdatedDate = new Date();
          index.data.updateRequire = false;
          index.info.questions.forEach(oldQues => {
            indicator.info.questions.forEach(newQues => {
              if (newQues.code == oldQues.code) {
                oldQues.value = newQues.value;
                oldQues.unit = newQues.unit;
              }
            });
          });
        }
      });
    }
  }

  updateCampaigns(campaign: any, state: string) {
    try {
      let index = -1;
      this.campaigns.forEach((_campaign, i) => {
        if (_campaign.id == campaign.id) {
          index = i;
        }
      });
      if (index != -1 && state == 'accept') {
        this.campaigns[index].campaignInfo.circleInfo.invitationState = 'accept';
        this.campaigns[index].campaignInfo.circleInfo.members = parseInt(this.campaigns[index].campaignInfo.circleInfo.members) + 1;
        this.campaign.campaignInfo.circleInfo.invitationState = 'accept';
        this.campaign.campaignInfo.circleInfo.members = parseInt(this.campaign.campaignInfo.circleInfo.members) + 1;
      } else if (state == 'deny' || state == "left") {
        this.campaigns.splice(index, 1);
      }
    } catch (e) {
      console.log(e);
    }
  }

  editCampaign(campaign) {
    let i = this.campaigns.findIndex(c => {
      return c.id == campaign.id;
    });
    if (i > -1) {
      this.campaigns[i] = campaign;
    }
  }

  setCampaignLastUpdate(indicators: Array<any>) {
    return new Promise((resolve) => {
      let chfIndicators: Array<any> = [];
      this.rest.getCDs().subscribe((data) => {
        data.diseases.forEach(d => {
          if (d.name = 'CHF') {
            indicators.forEach(indicator => {
              d.indicators.forEach(cIndicator => {
                if (indicator.indicatorCode === cIndicator.code) {
                  chfIndicators.push(indicator);
                }
              });
            });
          }
        });

        chfIndicators.sort(this.sortIndicators);
        this.chfLastUpdate = chfIndicators[0].lastUpdatedDate;
        resolve();
      });
    });
  }

  getCampaignLastUpdate() {
    return this.chfLastUpdate;
  }

  sortIndicatorsByIndex(a: IndicatorModel, b: IndicatorModel) {
    let i_a = a.info.index;
    let i_b = b.info.index;
    if (i_b > i_a) {
      return -1;
    }
    if (i_a > i_b) {
      return 1;
    }
    if (i_b == i_a) {
      return 0;
    }
  }

  sortIndicators(a, b) {
    let last_of_a = a.lastUpdatedDate;
    let last_of_b = b.lastUpdatedDate;
    if (last_of_b > last_of_a) {
      return 1;
    }
    if (last_of_a > last_of_b) {
      return -1;
    }
    if (last_of_b == last_of_a) {
      return 0;
    }
  }

  sortCancerIndicators(a, b) {
    let last_of_a = a.data.lastUpdatedDate;
    let last_of_b = b.data.lastUpdatedDate;
    if (last_of_b > last_of_a) {
      return 1;
    }
    if (last_of_a > last_of_b) {
      return -1;
    }
    if (last_of_b == last_of_a) {
      return 0;
    }
  }

  //============= circles ===============

  setLocalCircles(circles: Array<any>) {
    if (circles) {
      this.circles = circles;
    } else {
      this.circles = [];
    }
  }

  getLocalCircles(): Array<any> {
    return this.circles;
  }

  /**
   * remove campaign from local list after denying or deleting it.
   * @param campaignId 
   */
  deleteCampaign(campaignId): Promise<boolean> {
    return new Promise((resolve) => {
      let index = this.campaigns.findIndex(item => {
        return item.id == campaignId;
      });
      if (index > -1) {
        this.campaigns.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  deleteCircle(circleId) {
    let index = -1;
    this.circles.forEach((circle, i) => {
      if (circle.id == circleId) {
        index = i;
      }
    });
    if (index != -1) {
      this.circles.splice(index, 1);
      this.circle = null;
    }
  }

  addCircle(circle) {
    if (circle) {
      this.circles.push(circle);
    }
  }

  updateCircle(circle) {
    this.circles.forEach((_circle, i) => {
      if (circle.id == _circle.id) {
        _circle = circle;
      }
    });
    this.circle = circle;
  }

  setLocalCircle(circle: any) {
    this.circle = circle;
  }

  getLocalCircle() {
    return this.circle;
  }

  setLocalParticipants(participants: Array<Participant>) {
    this.participants = participants;
  }

  getLocalParticipants(): Array<Participant> {
    return this.participants;
  }

  set campaign_slides(category: string) {
    this.campaign_slides_ref = category;
  }

  get campaign_slides() {
    return this.campaign_slides_ref;
  }

  set campaign_slide_index(slide_index: number) {
    this.campaign_slide_index_ref = slide_index;
  }

  get campaign_slide_index() {
    return this.campaign_slide_index_ref;
  }

  get selectOptions() {
    return { label: " ", title: " " };
  }

  public showQuestion(question) {
    try {
      switch (question.code) {
        case "TREATED_HIGHBLOOD_PRESSURE":
        case "FEMALE_COLLAR":
        case "MALE_COLLAR":
        case "ETHINICITY_BACKGROUND":
          return false;

        default:
          return true;
      }
    } catch (e) {
      return false;
    }

  }

  getDateText(campaign, isDate, category: CampaignCategory) {
    let startDate;
    let endDate;
    let date_text;
    let date_value;
    let today = new Date().getTime();
    if (campaign.startDate) {
      startDate = new Date(campaign.startDate).getTime();
    }
    if (campaign.endDate) {
      endDate = new Date(campaign.endDate).getTime();
    }
    if (startDate) {
      if (startDate > today) {
        date_text = this.constants.CAMPAIGN_DATE_LABELS.START_ON;
        date_value = startDate;
      } else {
        if (endDate) {
          if (endDate > today) {
            date_text = this.constants.CAMPAIGN_DATE_LABELS.END_ON;
            date_value = endDate;
          } else {
            if (category.name == this.constants.CAMPAIGN_CATEGORIES.HISTORY) {
              date_text = this.constants.CAMPAIGN_DATE_LABELS.ENDED;
              date_value = endDate;
            } else {
              date_text = this.constants.CAMPAIGN_DATE_LABELS.END_ON;
              date_value = endDate;
            }
          }

        } else {
          date_text = this.constants.CAMPAIGN_DATE_LABELS.STARTED;
          date_value = startDate;
        }
      }
    }
    if (isDate) {
      return date_value;
    }
    if (!isDate) {
      return date_text;
    }
  }


  handleError(err) {
    console.log(err);
  }
}
