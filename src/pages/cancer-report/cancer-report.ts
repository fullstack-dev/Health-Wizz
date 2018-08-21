import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { HistoryProvider } from '../../providers/history/history';
import { IndicatorModel, Question, MhiUpdate } from '../../models/classes';
import { Helper } from '../../providers/helper-service';
import { UserService } from '../../providers/user-service';
import { RestDataProvider } from '../../providers/rest-data-service/rest-data-service';
import { LocalDataProvider } from '../../providers/local-data/local-data';

@IonicPage()
@Component({
  selector: 'page-cancer-report',
  templateUrl: 'cancer-report.html',
})
export class CancerReportPage {
  @ViewChild(Slides) slides: Slides;
  view: string = 'CancerReportPage';
  indicators: Array<IndicatorModel>;
  indicatorIndex: any;
  today = new Date();
  card_index: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private history: HistoryProvider,
    private userService: UserService,
    private restService: RestDataProvider,
    public local: LocalDataProvider

  ) {
    this.indicatorIndex = this.navParams.get('index');
  }

  ionViewDidEnter() {
    // this.indicators = this.navParams.get('indicators');
    this.indicators = this.local.cancers;
    if (this.card_index) {
      setTimeout(() => {
        this.slides.slideTo(this.card_index, 300);
      }, 300);
    }
  }

  ionViewDidLoad() {
    let index = this.navParams.get('card_index');
    if (index) {
      setTimeout(() => {
        this.slides.slideTo(index, 300);
      }, 300);
    }
  }

  public Before = () => {
    this.navCtrl.setRoot(this.history.getHistory(), { 'card_index': this.indicatorIndex });
  }

  // public Done = () => {
  //   let haveEmpty: boolean = false;
  //   this.indicators.forEach(indicator => {
  //     indicator.info.questions.forEach(question => {
  //       if (question.value == null || question.value == undefined) {
  //         haveEmpty = true;
  //       }
  //     });
  //   });

  //   if (haveEmpty) {
  //     this.helper.showAlert("Please provide data for all indexes.", "Missing data!");
  //     return;
  //   }

  //   this.helper.showLoading();
  //   this.updateAll()
  //     .then(r => {
  //       this.helper.hideLoading();
  //       this.navCtrl.setRoot(this.history.getHistory());
  //       this.helper.showAlert('Status updated', 'Success!');
  //     }).catch(e => {
  //       this.helper.hideLoading();
  //       this.helper.showAlert('Failed to update data. Try again.', 'Failed!');
  //     });
  // }

  public done() {
    this.navCtrl.setRoot(this.history.getHistory(), { 'card_index': this.indicatorIndex });
  }

  public updateAll() {
    let promises = [];
    this.indicators.forEach(indicator => {
      promises.push(this.updateMhi(indicator));
    });
    return Promise.all(promises);
  }

  public updateMhi(indicator: IndicatorModel) {
    return new Promise((resolve, reject) => {
      let userId = this.userService.getUserId();
      let questions = [];
      let value;
      indicator.info.questions.forEach(question => {
        if (question.value == true) {
          value = "YES";
        } else if (question.value == false) {
          value = "NO";
        } else if (question.type == 'date') {
          value = Date.parse(question.value);
        } else {
          value = question.value;
        }
        questions.push(new Question(question.code, value, question.unit));
      });

      let data = new MhiUpdate(userId, { code: indicator.data.indicatorCode }, questions);
      this.restService.saveMhi(data)
        .subscribe(result => {
          this.local.updateIndexes(indicator, false);
          resolve(result);
        }, error => {
          console.log(error);
          console.log(data);
          reject(error);
        });
    });
  }

  public goToDetail(item, card_index) {
    // this.history.addHistory(this.view);
    this.card_index = card_index;
    this.navCtrl.push('CancerDetailPage', { 'indicator': item });
  }

  public setYesActiveStyle(value) {
    let styles = {
      'border-bottom': value == 'YES' ? '1px solid red' : 'none'
    };
    return styles;
  }

  public setNoActiveStyle(value) {
    let styles = {
      'border-bottom': value == 'NO' ? '1px solid green' : 'none'
    };
    return styles;
  }

}
