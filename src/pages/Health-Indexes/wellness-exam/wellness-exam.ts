import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Helper } from '../../../providers/helper-service';
import { RestDataProvider } from '../../../providers/rest-data-service/rest-data-service';
import { Question, MhiUpdate } from '../../../models/classes';
import { UserService } from '../../../providers/user-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';
import { LanguageProvider } from '../../../providers/language/language';
@IonicPage()
@Component({
  selector: 'page-wellness-exam',
  templateUrl: 'wellness-exam.html',
})
export class WellnessExamPage {
  view: string = 'WellnessExamPage';
  received_lastDate: any;
  updated_lastDate: any;
  lang_resource: any;
  status: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public helper: Helper,
    public rest: RestDataProvider,
    public userService: UserService,
    public local: LocalDataProvider,
    private language_provider: LanguageProvider
  ) {
    this.lang_resource = this.language_provider.getLanguageResource();
    this.local.getMhiStatus().then((data: Array<any>) => {
      data.forEach(indicator => {
        if (indicator.indicatorCode == "Last Health Checkup") {
          this.status = indicator.status;
          if (indicator.questions[0].value != null && indicator.questions[0].value != "null") {
            let updated_lastDate = new Date(parseInt(indicator.questions[0].value));
            this.received_lastDate = updated_lastDate;
            this.convertDate(updated_lastDate);
          } else {
            this.received_lastDate = null;
          }

        }
      });
    });
  }

  ionViewDidLoad() {

  }

  public before = () => {
    this.navCtrl.setRoot('HealthIndexPage');
  }

  convertDate(updated_lastDate) {
    let d = new Date(updated_lastDate);
    let y = d.getFullYear();
    let m: any = d.getMonth() + 1;
    if (m < 10) {
      m = "0" + m;
    }
    let date: any = d.getDate();
    if (date < 10) {
      date = "0" + date;
    }
    this.updated_lastDate = y + "-" + m + "-" + date;
    console.log(this.updated_lastDate);

  }

  public done = () => {
    if (this.updated_lastDate == null) {
      this.helper.showToast("Please input last date");
    } else {
      let userId = this.userService.getUserId();
      this.updated_lastDate = Date.parse(this.updated_lastDate);
      let question = new Question('HEALTH_CHECKUP', this.updated_lastDate, '')
      let data = new MhiUpdate(userId, { code: 'Last Health Checkup' }, [question]);
      this.rest.saveMhi(data).subscribe(res => {
        console.log(res);
        this.navCtrl.setRoot('HealthIndexPage');
      })
    }

  }

  public goToFindPhysician = () => {
    // this.history.addHistory(this.view);
    this.navCtrl.push('FindPhysicianPage');
  }

  dateChanged() {
    console.log("@: ", this.updated_lastDate);
  }

}
