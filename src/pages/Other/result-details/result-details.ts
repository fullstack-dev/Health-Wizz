import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';

import { Rest } from '../../../providers/rest';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { IndicatorData, IndicatorValidate, RewardIndicatorResult, HealthIndexQuestion } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';

@IonicPage()
@Component({
  selector: 'page-result-details',
  templateUrl: 'result-details.html',
})
export class ResultDetailsPage {
  @ViewChild(Slides) slides: Slides;

  page: number;
  campaign: any;
  memberId: any;
  campaignIndicators: IndicatorData[];
  validateIndicators: IndicatorValidate[];
  resultIndicators: RewardIndicatorResult[];
  suveyReports: any[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public rest: Rest,
    public restService: RestDataProvider,
    public local: LocalDataProvider
  ) {

    this.campaignIndicators = new Array();
    this.validateIndicators = new Array();
    this.resultIndicators = new Array();
    this.suveyReports = new Array();

    this.page = 0;
    this.campaign = this.navParams.get('campaign');
    this.memberId = this.navParams.get('memberId');

  }

  ionViewDidLoad() {
    // this.getSurvey();
    // this.getIndicator();
    this.initializeResultsList().then(r => {
      this.getResults();
    });

  }

  /**
   * Get indicators and survey report
   */
  async getResults() {
    let survey_result = await this.restService.getRewardsMemberSurvey(this.campaign.id, this.memberId)
      .toPromise()
      .catch(e => { console.error(e) });
    let indicator_result = await this.restService.getRewardMemberIndexes(this.campaign.id, this.memberId)
      .toPromise()
      .catch(e => { console.error(e) });

    console.log(survey_result);
    console.log(indicator_result);

    if (indicator_result) {
      if ((indicator_result.indicatorValidate).length > 0) {
        this.prepareIndicatorResults(indicator_result);
      }
    }

    if (survey_result) {
      if ((survey_result.info).length > 0) {
        this.prepareSurveyResults(survey_result);
      }
    }
  }

  /**
   * migrate the different date results for each indicator into one list.
   * @param indicators_result 
   */
  prepareIndicatorResults(indicators_result) {
    try {
      this.validateIndicators = indicators_result.indicatorValidate;
      this.validateIndicators.forEach(v_indicator => {
        this.resultIndicators.forEach(result => {
          if (v_indicator.code == result.indicatorInfo.code) {
            v_indicator.value = JSON.parse(v_indicator.value);
            let mapped_ques = [];
            (v_indicator.value.questions).forEach(question => {
              // question = this.mapQuestion(result.indicatorInfo.questions, question);
              mapped_ques.push(this.mapQuestion(result.indicatorInfo.questions, question));
            });
            v_indicator.value.questions = mapped_ques;
            result.indicatorReport.push(v_indicator);
          }
        });
      });
      console.log(this.resultIndicators);
    } catch (e) {
      console.error(e);
    }
  }

  initializeResultsList() {
    return new Promise((resolve, reject) => {
      this.campaignIndicators = this.campaign.challengeTemplateInfo.indicatorLst;
      if (this.campaignIndicators.length > 0) {
        this.campaignIndicators.forEach((c_indicator, i, a) => {
          let result = this.getMhiIndicator(c_indicator);
          if (result) {
            this.resultIndicators.push(new RewardIndicatorResult(result, []));
          }
          if (i == a.length - 1) {
            resolve(true);
          }
        });
      } else {
        resolve(false);
      }
    });
  }

  getMhiIndicator(indicator: IndicatorData) {
    let result = this.local.mhiIndicators.find(item => {
      return indicator.code == item.code;
    });
    return result;
  }

  mapQuestion(questions: Array<HealthIndexQuestion>, ques: any) {
    let _ques = questions.find(item => {
      return item.code == ques.code;
    });
    if (_ques) {
      _ques.value = this.mapQestionValue(_ques, ques);
      _ques.unit = ques.unit;
    }
    return _ques;
  }

  mapQestionValue(h_ques: HealthIndexQuestion, r_ques) {
    if (h_ques.type == "toggle" || h_ques.type == "check") {
      let value = h_ques.values.find(item => {
        return item.code == r_ques.value;
      });
      if (value) {
        return value.label;
      }
    } else {
      return r_ques.value;
    }
  }

  get lastSlide() {
    if (this.slides) {
      return this.slides.isEnd;
    } else {
      return true;
    }
  }

  prepareSurveyResults(survey_result) {
    this.suveyReports = survey_result.info;
  }

  slideChanged() {
    this.page = this.slides.getActiveIndex();
    console.log(this.page);
  }

  next() {
    this.page = this.page + 1;
    this.slides.slideTo(this.page, 500);
  }

  cancel() {
    this.navCtrl.setRoot('RewardPage');
  }

  done() {
    this.cancel();
  }

}
