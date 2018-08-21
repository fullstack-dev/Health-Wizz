import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IndicatorModel, Question, MhiUpdate } from '../../models/classes';
import { LocalDataProvider } from '../../providers/local-data/local-data';
import { RestDataProvider } from '../../providers/rest-data-service/rest-data-service';
import { UserService } from '../../providers/user-service';
import { Helper } from '../../providers/helper-service';
import { Toast } from '@ionic-native/toast';

/**
 * Generated class for the CancerDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cancer-detail',
  templateUrl: 'cancer-detail.html',
})
export class CancerDetailPage {
  title: any = "Page title";
  ques_label: any = "Question label";
  cancer_guideline_text: any;
  guide_lines: any = "Cancer guide line link";
  indicator: IndicatorModel;
  americanCancerSocietyText: string;
  USPSTFText: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private helper: Helper,
    private userService: UserService,
    private restService: RestDataProvider,
    public local: LocalDataProvider,
    private toast: Toast
  ) {
    this.indicator = this.navParams.get('indicator');
    this.cancer_guideline_text = "These are screening guidelines.Cancer screening is a personal decision. Please review education material and discuss with your physician If you have a history of an abnormal screening test or established cancer diagnostic, it is not applicable to you.";
    this.americanCancerSocietyText = "American Cancer Society Screening Guidelines" //breast, prostate
    this.USPSTFText = "USPSTF Screening Guidelines"; //cervical, colon, lung
  }

  ionViewDidLoad() {
    console.log(this.indicator);
  }

  openLink() {
    let href = window.open(this.indicator.info.href, '_blank', 'location=yes');
  }

  updateCancer(indicator) {
    let haveEmpty: boolean = false;
    indicator.info.questions.forEach(question => {
      if (question.value == null || question.value == undefined) {
        haveEmpty = true;
      }
    });

    if (haveEmpty) {
      this.helper.showAlert("Please provide valid answers!", "Missing data!");
      return;
    }
    this.helper.showLoading();
    this.updateMhi(indicator).then(r => {
      this.helper.hideLoading();
      this.navCtrl.pop();
    }).catch(e => {
      this.helper.hideLoading();
      this.toast.showShortBottom("Error! Try again.").subscribe(t => { });
    });
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
          // this.local.updateIndexes(indicator, false);
          this.local.refreshMhiData().then(r => {
            resolve(result);
          }).catch(e => {
            reject(e);
          });
        }, error => {
          console.log(error);
          console.log(data);
          reject(error);
        });
    });
  }

}
