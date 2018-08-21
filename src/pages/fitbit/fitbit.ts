import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LocalDataProvider } from '../../providers/local-data/local-data';

/**
 * Generated class for the FitbitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-fitbit',
  templateUrl: 'fitbit.html',
})
export class FitbitPage {
  actualDistance: any;
  actualCalories: any;
  actualSteps: any;
  goalSteps: any;
  goalCalories: any;
  goalDistance: any;
  updateDate: any;
  actualDistanceValue: any;
  actualCaloriesValue: any;
  actualStepsValue: any;
  fitbitData: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public local: LocalDataProvider) {
    this.local.getMhiStatus().
      then((indicators: any) => {
        indicators.forEach(indicator => {
          if (indicator.indicatorCode == "Fitbit") {
            this.fitbitData = indicator;
          }
        });
        this.fillFitbitData();
      })
  }

  fillFitbitData() {
    if (this.fitbitData) {
      for (let i = 0; i < this.fitbitData.questions.length; i++) {
        switch (this.fitbitData.questions[i].code) {
          case 'DISTANCE_ACTUAL':
            this.actualDistance = this.fitbitData.questions[i].value;
            break;
          case 'CALORIES_ACTUAL':
            this.actualCalories = this.fitbitData.questions[i].value;
            break;
          case 'STEPS_ACTUAL':
            this.actualSteps = this.fitbitData.questions[i].value;
            break;
          case 'DISTANCE_GOAL':
            this.goalDistance = this.fitbitData.questions[i].value;
            break;
          case 'CALORIES_GOAL':
            this.goalCalories = this.fitbitData.questions[i].value;
            break;
          case 'STEPS_GOAL':
            this.goalSteps = this.fitbitData.questions[i].value;
            break;
          default:
        }
      }

      this.actualDistanceValue = parseInt(((parseFloat(this.actualDistance) / parseFloat(this.goalDistance)) * 100).toString());
      this.actualCaloriesValue = parseInt(((parseFloat(this.actualCalories) / parseFloat(this.goalCalories)) * 100).toString());
      this.actualStepsValue = parseInt(((parseFloat(this.actualSteps) / parseFloat(this.goalSteps)) * 100).toString());

      try {
        if (!this.fitbitData.lastUpdatedDate || this.fitbitData.lastUpdatedDate == "") {
          this.updateDate = 'Sever connection problem';
        } else {
          let fitbitDate = new Date(parseInt(this.fitbitData.lastUpdatedDate));
          let fitbitDateString = fitbitDate.toLocaleString();
          let lastIndex = fitbitDateString.lastIndexOf(":");
          let partOne = fitbitDateString.slice(0, lastIndex).trim();
          let partTwo = fitbitDateString.slice(lastIndex + 1, fitbitDateString.length).trim();
          let res = partTwo.split(" ");
          this.updateDate = 'as of ' + partOne;

        }
      } catch (e) {
        console.error(e);
        this.updateDate = 'Sever connection problem';
      }
    } else {
      this.actualDistance = 'NA';
      this.actualCalories = 'NA';
      this.actualSteps = 'NA';
      this.goalSteps = 'NA';
      this.goalCalories = 'NA';
      this.goalDistance = 'NA';
      this.updateDate = 'NA';
      this.actualDistanceValue = 0;
      this.actualCaloriesValue = 0;
      this.actualStepsValue = 0;
    }
  }
  Done() {
    this.navCtrl.pop();
  }
}
