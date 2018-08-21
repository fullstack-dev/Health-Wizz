import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Rest } from '../../../providers/rest';

/**
 * Generated class for the CernerPatientDataPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cerner-patient-data',
  templateUrl: 'cerner-patient-data.html',
})
export class CernerPatientDataPage {
	patientId: any;
	serviceUri: any; 
	accessToken: any;
	loader: any;

  cernerResult: any;

  name: string = "";
  birthday: string = "";
  gender: string = "";
  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private storage: Storage,
  	private loadingCtrl: LoadingController,
  	public rest: Rest) {
    
  }

  ionViewDidLoad() {
    this.patientId = this.navParams.get('patientId');
    this.serviceUri = this.navParams.get('serviceUri');
    this.accessToken = this.navParams.get('accessToken'); 

    this.cernerPatientData();
  }

  before() {
    this.navCtrl.setRoot('SandboxListPage');
  }

  cernerPatientData() {
  
    let loadingCtrlOptions = {
      content: "waiting..."
    };
    this.loader = this.loadingCtrl.create(loadingCtrlOptions);
    this.loader.present();

    let patientUrl = this.serviceUri + "Patient/" + this.patientId;

    this.rest.getPatientData(patientUrl, this.accessToken)
    .subscribe(
      result => {
      	if(this.loader){ this.loader.dismiss(); this.loader = null; }
        this.cernerResult = result;

        let tempBirthday = this.cernerResult.birthDate;
        let year = tempBirthday.substring(0, 4);
        let month = tempBirthday.substring(5, 7);
        let day = tempBirthday.substring(8, 10);

        let res1 = month.concat("/", day);
        let res2 = res1.concat("/", year);
        let formattedBirthday = " ".concat(res2);

        this.name = this.cernerResult.name[0].given.join(" ") + " " + this.cernerResult.name[0].family.join(" ");
        this.gender = this.cernerResult.gender;
        this.birthday = formattedBirthday;
      }, err => {
        if(this.loader) { 
          this.loader.dismiss(); 
          this.loader = null; 
        }
      });
  }

  goToCernerPatientCCD() {
    if(this.cernerPatientData) {
      this.navCtrl.setRoot('CernerPatientCcdPage', { patientId: this.patientId, serviceUri: this.serviceUri, accessToken: this.accessToken});
    }
  }

}
