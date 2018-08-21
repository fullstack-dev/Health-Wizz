import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as HighCharts from 'highcharts';
import { IndicatorModel, Report, HealthIndexQuestion } from '../../../models/classes';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { UserService } from '../../../providers/user-service';
import { HistoryProvider } from '../../../providers/history/history';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Helper } from '../../../providers/helper-service';
import { Toast } from '@ionic-native/toast';
import { ValidatorProvider } from '../../../providers/validator/validator';

@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  validator = new ValidatorProvider();
  view = 'DetailPage';
  received_item: IndicatorModel;

  name: string;
  number: string;
  updated_date: string;
  updated_value: string;
  status: string;
  imge: string;
  detail: string;

  // for the button read more
  flag: boolean = true;

  moreText: string;

  //Nutritions
  nutritions: any;

  // Sleep Apneas
  apneas: any;

  //Alchol
  alcholOftenResult: string;
  alcholOftenFlag: boolean;

  alcholTypicalResult: string;
  alcholTypicalFlag: boolean;

  alcholMoreResult: string;
  alcholMoreFlag: boolean;

  alchols: any;

  //Depression
  depressions: any;

  // Exercise
  firstSignValue: boolean;
  secondSignValue: boolean;
  thirdSignValue: boolean;

  //Smoking
  yesValue: boolean;
  noValue: boolean;

  clickedItemValue: string;

  //for calendar
  date: any;
  daysInThisMonth: any;
  daysInLastMonth: any;
  daysInNextMonth: any;
  monthNames: string[];
  currentMonth: any;
  currentYear: any;
  currentDate: any;
  graph_value: any;
  temp_date: any;
  temp_value: any;
  report: Array<Report>;
  graph_serieses: Array<{ 'name': string, 'data': Array<Array<any>> }>;
  data_days: Array<{ 'day': number, 'haveValue': boolean }>;
  indicatorIndex: any;
  custom_index: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private restService: RestDataProvider,
    private history: HistoryProvider,
    private userService: UserService,
    public local: LocalDataProvider,
    private helper: Helper,
    private alertCtrl: AlertController,
    private toast: Toast
  ) {
    this.moreText = "Read more";
    this.received_item = navParams.get('item');
    this.indicatorIndex = navParams.get('index');
    this.custom_index = navParams.get('custom');
    this.moreText = "Read more";
  }

  ionViewDidEnter() {
    this.flag = true;
    this.temp_date = [];
    this.temp_value = [];

    //for event graph
    // var myChart = HighCharts.chart('container', this.drawChart());

    this.date = new Date();
    this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.getDaysOfMonth();
    // this.loadEventThisMonth();
  }

  drawChart() {
    if (this.graphType == 'value') {
      let temp_chart = {
        chart: {
          type: 'spline'
        },
        tooltip: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        xAxis: {
          tickInterval: 24 * 3600 * 1000,
          opposite: true,
          type: 'datetime',
          gridLineWidth: 1
        },
        yAxis: {
          title: {
            text: ''
          }
        },
        plotOptions: {
          series: {
            shadow: true,
            connectNulls: true,
            lineWidth: 2,
            marker: {
              fillColor: '#FFFFFF',
              lineWidth: 2,
              lineColor: null // inherit from series
            }
          }
        },
        series: []
      };

      this.graph_serieses.forEach(series => {
        temp_chart.series.push(series);
      });

      return temp_chart;
    }

    if (this.graphType == 'status') {
      let ylabels = {
        0: "NA",
        1: "Healthy",
        2: "Risky",
        3: "High risky"
      };
      let temp_chart = {

        chart: {
          type: 'spline'
        },
        tooltip: {
          enabled: false
        },
        title: {
          text: ''
        },
        subtitle: {
          text: ''
        },
        plotOptions: {
          series: {
            shadow: true,
            connectNulls: true,
            lineWidth: 2,
            marker: {
              fillColor: '#FFFFFF',
              lineWidth: 2,
              lineColor: null
            }
          }
        },
        legend: {
          enabled: false
        },

        series: [],

        xAxis: {
          tickInterval: 24 * 3600 * 1000,
          opposite: true,
          type: 'datetime',
          gridLineWidth: 1,

        },
        yAxis: {
          title: {
            text: ''
          },
          visible: true,
          tickInterval: 1,
          plotLines: [{
            color: '#FB4F84',
            width: 2,
            value: 3,
            dashStyle: 'dash'
          },
          {
            color: '#FFBC00',
            width: 2,
            value: 2,
            dashStyle: 'dash'
          },
          {
            color: '#4BCB99',
            width: 2,
            value: 1,
            dashStyle: 'dash'
          }
          ],

          labels: {
            formatter: function () {
              return ylabels[this.value]
            }
          }
        },

        responsive: {
          rules: [{
            condition: {
              maxWidth: 100
            },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
              }
            }
          }]
        }
      }

      this.graph_serieses.forEach(series => {
        temp_chart.series.push(series);
      });

      return temp_chart;
    }

  }

  unitChange(unit) {
    if (unit == "kg") {
      this.goToKg(unit);
    } else {
      this.goToLb(unit);
    }
  }
  goToLb(unit) {
    this.received_item.info.questions[0].value = (this.received_item.info.questions[0].value * 2.20462).toFixed(2);
  }

  goToKg(unit) {
    this.received_item.info.questions[0].value = (this.received_item.info.questions[0].value / 2.20462).toFixed(2);
  }
  heightChange(unit) {
    if (unit == "in") {
      this.goToInch(unit);
    } else {
      this.goToCm(unit);
    }
  }
  goToInch(unit) {
    this.received_item.info.questions[1].value = (this.received_item.info.questions[1].value / 2.54).toFixed(2);
  }
  goToCm(unit) {
    this.received_item.info.questions[1].value = (this.received_item.info.questions[1].value * 2.54).toFixed(2);
  }

  public Before = () => {
    this.navCtrl.setRoot(this.history.getHistory(), { 'card_index': this.indicatorIndex, 'custom': this.custom_index });
  }

  public Done = () => {
    this.history.getHistory();
    this.navCtrl.setRoot(this.history.getHistory());
  }

  public goToFind = () => {
    this.navCtrl.push('FindPhysicianPage', { 'from': this.received_item.info.code });
    // this.navCtrl.setRoot('FindPhysicianPage', { 'from': this.received_item.info.code });
  }

  public getDetailText = (item: IndicatorModel) => {
    let text = item.info.detail;
    switch (item.data.status) {
      case 'RED':
        text = item.info.detail_red;
        break;
      case 'YELLOW':
        text = item.info.detail_yellow;
        break;
      case 'GREEN':
        text = item.info.detail;
        break;
      default:
        text = item.info.detail;
        break;
    }
    return text;
  }

  public setDetailStyle() {
    let styles = {
      'overflow': this.flag ? 'hidden' : 'visible',
      'height': this.flag ? '12vh' : 'auto'
    };
    return styles;
  }

  public setDetailTextStyle(status) {
    let color = '#73736F';
    switch (status) {
      case 'RED':
        color = '#EA6288';
        break;
      case 'YELLOW':
        color = '#FDBA45';
        break;
      case 'GREEN':
        color = '#6EC59A';
        break;
      default:
        color = '#73736F';
        break;
    }
    return { 'color': color };
  }

  getUnit(unit) {
    if (unit == 'lb') {
      return 'lbs';
    }
    return unit;
  }

  public learnMore = () => {
    let href = window.open(this.received_item.info.href, '_blank', 'location=yes');
  }

  public readMore = () => {
    this.flag = !this.flag;
    if (this.flag)
      this.moreText = "Read more";
    else
      this.moreText = "Read less";
  }

  public goToConnectedDeviceFromBMI() {
    this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
  }

  public goToConnectedDeviceFromWaist() {
    this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
  }

  public goToConnectedDeviceFromHypertension() {
    this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
  }

  public goToConnectedDeviceFromDiabetes() {
    this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
  }

  public goToConnectedDeviceFromCardio() {
    this.navCtrl.setRoot('ConnectedDevicePage', { from: 'health-index' });
  }

  // function for calendar
  getDaysOfMonth() {
    this.daysInThisMonth = new Array();
    this.daysInLastMonth = new Array();
    this.daysInNextMonth = new Array();
    this.currentMonth = this.monthNames[this.date.getMonth()];
    this.currentYear = this.date.getFullYear();
    if (this.date.getMonth() === new Date().getMonth()) {
      this.currentDate = new Date().getDate();
    } else {
      this.currentDate = 999;
    }

    let firstDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
    let prevNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth(), 0).getDate();
    for (let i = prevNumOfDays - (firstDayThisMonth - 1); i <= prevNumOfDays; i++) {
      this.daysInLastMonth.push(i);
    }

    let thisNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    for (let i = 0; i < thisNumOfDays; i++) {
      this.daysInThisMonth.push(i + 1);
    }

    let lastDayThisMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDay();
    // let nextNumOfDays = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0).getDate();
    for (let i = 0; i < (6 - lastDayThisMonth); i++) {
      this.daysInNextMonth.push(i + 1);
    }
    let totalDays = this.daysInLastMonth.length + this.daysInThisMonth.length + this.daysInNextMonth.length;
    if (totalDays < 36) {
      for (let i = (7 - lastDayThisMonth); i < ((7 - lastDayThisMonth) + 7); i++) {
        this.daysInNextMonth.push(i);
      }
    }

    this.getMhiReport()
      .then((report: Array<Report>) => {
        this.report = report;
        this.getDaysWithData();
        this.graph_serieses = this.getIndicatorReport(report);
        let myChart = HighCharts.chart('container', this.drawChart());
      });
  }

  getDaysWithData() {
    this.data_days = [];
    this.daysInThisMonth.forEach(day => {
      this.data_days.push({ 'day': day, 'haveValue': false });
    });
    this.report.forEach(item => {
      let date = parseInt((item.date).split('-')[2]);
      this.data_days.forEach(data_day => {
        if (data_day.day == date) {
          data_day.haveValue = true;
        }
      });
    });
  }

  selectDate(day) {
    this.currentDate = day;
    this.report.forEach(item => {
      let date = parseInt((item.date).split('-')[2]);
      if (date == day) {
        item.report.forEach(indicator => {
          if (indicator.indicatorCode == this.received_item.data.indicatorCode) {
            indicator.questions.forEach(quesData => {
              this.received_item.info.questions.forEach(quesView => {
                if (quesView.code == quesData.code) {
                  quesView = this.local.mapIndexQuestion(quesView, quesData);
                  // quesView.value = quesData.value;
                  // quesView.unit = this.local.getIndicatorUnit(quesData.code, quesData.unit);
                }
              });
            });
          }
        });
      }
    });
  }

  getMhiReport() {
    return new Promise((resolve) => {
      let month;
      let firstDate;
      let lastDate;
      let m = (this.date.getMonth()) + 1;
      let y = this.date.getFullYear();
      if (m < 10)
        month = '0' + m;
      else
        month = m;

      let fd = this.daysInThisMonth[0];
      if (fd < 10)
        firstDate = '0' + fd;
      else
        firstDate = fd;

      let ld = this.daysInThisMonth[this.daysInThisMonth.length - 1];
      if (ld < 10)
        lastDate = '0' + ld;
      else
        lastDate = ld;

      let fromDate = y + '-' + month + '-' + firstDate;
      let toDate = y + '-' + month + '-' + lastDate;
      this.restService.getMhiReport(fromDate, toDate)
        .subscribe(data => {
          console.log(data);
          let obj = data.data;
          if (data.success == true) {
            let keys = Object.keys(obj);
            let values = Object.keys(obj).map(key => obj[key]);
            let report = [];
            keys.forEach((key, i) => {
              report.push(new Report(key, values[i]));
            });
            resolve(report);
          }
        }, this.handleError);
    });
  }

  getIndicatorReport(report: Array<Report>) {
    try {
      let serieses: Array<Series> = this.serieses;
      // this.received_item.info.questions.forEach(ques => {
      //   if (ques.type == 'value') {
      //     serieses.push(new Series(ques.code, []));
      //     // serieses.push({ 'name': ques.code, 'data': [] });
      //   }
      // });
      report.forEach(item => {
        item.report.forEach(indicator => {
          if (indicator.indicatorCode == this.received_item.data.indicatorCode) {
            let date = (item.date).split('-');
            let y = parseInt(date[0]);
            let m = parseInt(date[1]);
            let d = parseInt(date[2]);

            if (this.graphType == 'status') {
              serieses.forEach(series => {
                if (series.name == 'status') {
                  let data = [Date.UTC(y, (m - 1), d), this.mapStatus(indicator.status)];
                  series.data.push(data);
                }
              });
            } else {
              indicator.questions.forEach((ques, i) => {
                serieses.forEach(series => {
                  if (series.name == ques.code) {
                    let data = [Date.UTC(y, (m - 1), d), parseInt(ques.value)];
                    series.data.push(data);
                  }
                });
              });
            }
          }
        });
      });
      serieses.forEach(series => {
        series.data.sort(this.sortGraphData);
      });
      return serieses;
    } catch (e) {
      console.log(e);
    }
  }

  public mapStatus(status): number {
    if (status == 'RED') {
      return 3;
    }
    if (status == 'YELLOW') {
      return 2;
    }
    if (status == 'GREEN') {
      return 1;
    }
    return 0;
  }

  public get serieses(): Array<Series> {
    let serieses: Array<Series> = new Array();
    if (this.graphType == 'status') {
      serieses.push(new Series('status', []));  //single series for above cases
    } else {
      this.received_item.info.questions.forEach(ques => {
        if (ques.type == 'value') {
          serieses.push(new Series(ques.code, [])); //series equal to int type questions of index
        }
      });
    }
    return serieses;
  }

  public get graphType(): string {
    let type;
    switch (this.received_item.info.code) {
      case 'Exercise':
      case 'Nutrition':
      case 'Smoking':
      case 'Alcohol':
      case 'Sleep':
      case 'Depression':
        type = 'status';
        break;

      default:
        type = 'value';
        break;
    }
    return type;
  }

  sortGraphData(a, b) {
    if (a[0] > b[0]) {
      return 1;
    }
    if (a[0] < b[0]) {
      return -1;
    }
    if (a[0] == b[0]) {
      return 0;
    }
  }

  showCheckboxes(question: HealthIndexQuestion, questionIndex: number) {
    let alert = this.alertCtrl.create();
    alert.setTitle(question.label);

    question.values.forEach(item => {
      let checked = false;
      if (question.value == item.code) {
        checked = true;
      }
      alert.addInput({
        type: 'radio',
        label: item.label,
        value: item.code,
        checked: checked
      });
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        this.received_item.info.questions[questionIndex].value = data;
      }
    });
    alert.present();
  }

  canIndicatorPresentGraph(indicator) {
    let ans = false;
    let graph_indicators = ["BMI", "Cardio", "Diabetes", "Hypertension", "Waist"];
    graph_indicators.forEach(i => {
      if (i == indicator.indicatorCode) {
        ans = true;
      }
    });
    return ans;
  }

  canQuestionPresentGraph(question) {
    let ans = false;
    let graph_questions = ["WAIST_CIRCUMFERENCE", "SYSTOLIC_BLOOD", "DIASTOLIC_BLOOD", "HBA1C_LEVEL", "FASTING_GLUCOSE", "TOTAL_CHOLESTEROL", "HDL_CHOLESTEROL", "Weight", "Height"];
    graph_questions.forEach(q => {
      if (q == question.code) {
        ans = true;
      }
    });
    return ans;
  }

  showSleepQuestion(code) {
    let show = true;
    switch (code) {
      case "TREATED_HIGHBLOOD_PRESSURE":
      case "FEMALE_COLLAR":
      case "MALE_COLLAR":
        show = false;
        break;
      default:
        break;
    }
    return show;
  }

  goToLastMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
    this.getDaysOfMonth();
  }

  goToNextMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0);
    this.getDaysOfMonth();
  }

  handleError(err) {
    console.log(err);
  }

  // Depression
  doConfirm(item) {
    let reportAlertList = [
      {
        type: 'radio',
        label: 'Not at all',
        value: 'Not at all'
      },
      {
        type: 'radio',
        label: 'Several days',
        value: 'Several days'
      },
      {
        type: 'radio',
        label: 'More than half a day',
        value: 'More than half a day'
      },
      {
        type: 'radio',
        label: 'Nearly day',
        value: 'Nearly day'
      }
    ]
    let alert = this.alertCtrl.create({
      title: item.title,
      inputs: reportAlertList
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        item.select = data;
      }
    });
    alert.present();
  }

  //Alchol
  showAlcholCheckbox(item) {
    if (item.id == 1) {
      let alert = this.alertCtrl.create();
      alert.setTitle(item.content);

      alert.addInput({
        type: 'radio',
        label: 'Never',
        value: 'Never',
        checked: false
      });

      alert.addInput({
        type: 'radio',
        label: 'Monthly or less',
        value: 'Monthly or less'
      });

      alert.addInput({
        type: 'radio',
        label: '2 to 4 times a month',
        value: '2 to 4 times a month'
      });

      alert.addInput({
        type: 'radio',
        label: '2 to 3 times a week',
        value: '2 to 3 times a week'
      });

      alert.addInput({
        type: 'radio',
        label: '4 or more times a week',
        value: '4 or more times a week'
      });

      alert.addButton('Cancel');
      alert.addButton({
        text: 'Okay',
        handler: data => {
          console.log('Checkbox data:', data);
          this.alcholOftenFlag = true;
          this.alcholOftenResult = data;
        }
      });
      alert.present();
    } else if (item.id == 2) {
      let alert = this.alertCtrl.create();
      alert.setTitle(item.content);

      alert.addInput({
        type: 'radio',
        label: '1 or 2',
        value: '1 or 2',
        checked: false
      });

      alert.addInput({
        type: 'radio',
        label: '3 or 4',
        value: '3 or 4'
      });

      alert.addInput({
        type: 'radio',
        label: '5 or 6',
        value: '5 or 6'
      });

      alert.addInput({
        type: 'radio',
        label: '7 or 9',
        value: '7 or 9'
      });

      alert.addInput({
        type: 'radio',
        label: '10 or more',
        value: '10 or more'
      });

      alert.addButton('Cancel');
      alert.addButton({
        text: 'Okay',
        handler: data => {
          console.log('Checkbox data:', data);
          this.alcholTypicalFlag = true;
          this.alcholTypicalResult = data;
        }
      });
      alert.present();
    } else {
      let alert = this.alertCtrl.create();
      alert.setTitle(item.content);

      alert.addInput({
        type: 'radio',
        label: 'Never',
        value: 'Never',
        checked: false
      });

      alert.addInput({
        type: 'radio',
        label: 'Less than monthly',
        value: 'Less than monthly'
      });

      alert.addInput({
        type: 'radio',
        label: 'Monthly',
        value: 'Monthly'
      });

      alert.addInput({
        type: 'radio',
        label: 'Weekly',
        value: 'Weekly'
      });

      alert.addInput({
        type: 'radio',
        label: 'Daily or almost daily',
        value: 'Daily or almost daily'
      });

      alert.addButton('Cancel');
      alert.addButton({
        text: 'Okay',
        handler: data => {
          console.log('Checkbox data:', data);
          this.alcholMoreFlag = true;
          this.alcholMoreResult = data;
        }
      });
      alert.present();
    }
  }

  // setting detail info value color
  public setColorStyle(clickedItem) {
    switch (clickedItem) {
      case "+":
        return { 'color': 'red' };

      case "++":
        return { 'color': '#FFBB45' };

      case "+++":
        return { 'color': 'green' };

      case "Yes":
        return { 'color': 'red' };

      case "No":
        return { 'color': 'green' };

      default:
        return { 'color': '#EA6288' };
    }
  }

  public firstSignClick() {
    this.firstSignValue = true;
    this.secondSignValue = false;
    this.thirdSignValue = false;
  }

  public secondSignClick() {
    this.firstSignValue = false;
    this.secondSignValue = true;
    this.thirdSignValue = false;
  }

  public thirdSignClick() {
    this.firstSignValue = false;
    this.secondSignValue = false;
    this.thirdSignValue = true;
  }

  public yesClick() {
    this.yesValue = true;
    this.noValue = false;
  }

  public noClick() {
    this.yesValue = false;
    this.noValue = true;
  }

  // setting active button's bottom color in Exercise and Smoking 

  public setZeroActiveStyle(value) {
    let styles = {
      'border-bottom': value == 'NO EXERCISE' ? '1px solid #FB4F84' : 'none',
      'color': '#FB4F84'
    };
    return styles;
  }

  public setFirstActiveStyle(value) {
    let styles = {
      'border-bottom': value == 'MODERATE' ? '1px solid #FFBC00' : 'none',
      'color': '#FFBC00'
    };
    return styles;
  }

  public setSecondActiveStyle(value) {
    let styles = {
      'border-bottom': value == 'EQUAL MIX' ? '1px solid #4BCB99' : 'none',
      'color': '#4BCB99'
    };
    return styles;
  }

  public setThirdActiveStyle(value) {
    let styles = {
      'border-bottom': value == 'VIGOROUS' ? '1px solid #FFBC00' : 'none',
      'color': '#FFBC00'
    };
    return styles;
  }

  public setYesActiveStyle(value) {
    let styles = {
      'border-bottom': value == 'YES' ? '1px solid #FB4F84' : 'none',
      'color': '#FB4F84'
    };
    return styles;
  }

  public setNoActiveStyle(value) {
    let styles = {
      'border-bottom': value == 'NO' ? '1px solid #4BCB99' : 'none',
      'color': '#4BCB99'
    };
    return styles;
  }
}

class Series {
  constructor(
    public name: string,
    public data: Array<Array<any>>
  ) { }
}