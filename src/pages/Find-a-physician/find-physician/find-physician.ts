import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Helper } from '../../../providers/helper-service';
import { Rest } from '../../../providers/rest';
import { LanguageProvider } from '../../../providers/language/language';
import { HistoryProvider } from '../../../providers/history/history';
import { UserService } from '../../../providers/user-service';
import { LocalDataProvider } from '../../../providers/local-data/local-data';

@IonicPage()
@Component({
  selector: 'page-find-physician',
  templateUrl: 'find-physician.html',
})
export class FindPhysicianPage {

  zip_code: number;
  distance: number;
  docSpeciality = [];
  speciality: any;
  lang_resource: any;
  previousview_data: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public helper: Helper,
    public rest: Rest,
    private userService: UserService,
    private history: HistoryProvider,
    private language_provider: LanguageProvider,
    public local: LocalDataProvider
  ) {
    let profile = this.userService.getProfile();
    this.zip_code = profile.address.zipCode;
    this.lang_resource = this.language_provider.getLanguageResource();
    this.previousview_data = this.navParams.get('from');
    if (this.previousview_data != null) {
      if (this.previousview_data == 'BMI') {
        this.speciality = '13';
      } else if (this.previousview_data == 'Waist Circumference') {
        this.speciality = '27';
      } else if (this.previousview_data == 'Exercise') {
        this.speciality = '11';
      } else if (this.previousview_data == 'Nutrition') {
        this.speciality = '11';
      } else if (this.previousview_data == 'Smoking') {
        this.speciality = '37';
      } else if (this.previousview_data == 'Alcohol') {
        this.speciality = '42';
      } else if (this.previousview_data == 'Sleep') {
        this.speciality = '43';
      } else if (this.previousview_data == 'Hypertension') {
        this.speciality = '19';
      } else if (this.previousview_data == 'Depression') {
        this.speciality = '41';
      } else if (this.previousview_data == 'Diabetes') {
        this.speciality = '11';
      } else if (this.previousview_data == 'Cardio') {
        this.speciality = '5';
      } else {
        this.speciality = '13';
      }
    } else {
      this.speciality = '13';
    }
  }

  ionViewDidLoad() {
    // this.speciality = "1";
    // this.zip_code = 20130;
    // this.distance = 10;
    this.rest.getSpeciality()
      .subscribe((res: any) => {
        console.log("get speciality", res);

        this.docSpeciality = res.speciality;
        this.docSpeciality.sort(this.sortSpeciality);
      });
  }

  sortSpeciality(a, b) {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    if (a.name == b.name) {
      return 0;
    }
  }



  public Before = () => {
    this.navCtrl.setRoot(this.history.getHistory());
    // if (this.navParams.get('from') == 'chf') {
    //   this.navCtrl.setRoot('SubmitReportBPage', { 'card_index': 8 });
    // } else if (this.navParams.get('from') == 'health-index') {
    //   this.navCtrl.setRoot('SubmitReportPage');
    // } else if (this.navParams.get('from') == 'welness') {
    //   this.navCtrl.setRoot('WellnessExamPage');
    // } else {
    //   this.navCtrl.setRoot('WellnessExamPage');
    // }

  }

  public Submit = () => {
    if (this.speciality == null) {
      this.helper.showToast("Please select speciality");
    } else if (!this.zip_code) {
      this.helper.showToast("Please enter zip code.");
    } else if (this.distance == null) {
      this.helper.showToast("Please input within of Physician");
    } else {
      this.navCtrl.push('PhysicianPage', { speciality: this.speciality, zip_code: this.zip_code, distance: this.distance, docSpeciality: this.docSpeciality, 'backViewParent': 'chf' });
    }
  }

}
