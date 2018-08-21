import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IndicatorModel } from '../../../models/classes';
import { HistoryProvider } from '../../../providers/history/history';

@IonicPage()
@Component({
  selector: 'page-my-health-index',
  templateUrl: 'my-health-index.html',
})
export class MyHealthIndexPage {

  indexes: Array<IndicatorModel>;
  high_risky_indexes: Array<IndicatorModel>;
  risky_indexes: Array<IndicatorModel>;
  healthy_indexes: Array<IndicatorModel>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private history: HistoryProvider
  ) {
    this.indexes = navParams.get('indexes');
    let filtered_indexes = this.filter_indexes;
    this.high_risky_indexes = filtered_indexes[0];
    this.risky_indexes = filtered_indexes[1];
    this.healthy_indexes = filtered_indexes[2];
  }

  public get filter_indexes(): Array<Array<IndicatorModel>> {
    let indexes: Array<Array<IndicatorModel>> = new Array(3);
    indexes[0] = new Array();
    indexes[1] = new Array();
    indexes[2] = new Array();

    this.indexes.forEach(index => {
      switch (index.data.status) {
        case 'RED':
        case 'red':
          indexes[0].push(index);
          break;
        case 'YELLOW':
        case 'yellow':
          indexes[1].push(index);
          break;
        case 'GREEN':
        case 'green':
          indexes[2].push(index);
          break;
        default:
          break;
      }
    });
    return indexes;
  }

  showScore(value) {
    if (value && value != null && value != "null") {
      return true;
    } else {
      return false;
    }
  }

  formatValue(value) {
    return parseFloat(value).toFixed(2);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyHealthIndexPage');
  }

  goToSubmitReport = (index: IndicatorModel) => {
    this.history.addHistory('HealthIndexPage');
    this.navCtrl.setRoot('SubmitReportPage', { 'card_index': index.info.index, 'custom': false });
  }

  goToSubmitReportInitial = () => {
    this.history.addHistory('HealthIndexPage');
    this.navCtrl.setRoot('SubmitReportPage', { 'card_index': 0, 'custom': false });
  }

  before() {
    this.navCtrl.pop();
  }

  done() {
    this.navCtrl.pop();
  }

}
