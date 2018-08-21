import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Rest } from '../../../providers/rest';

/**
 * Generated class for the CernerPatientCcdPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cerner-patient-ccd',
  templateUrl: 'cerner-patient-ccd.html',
})
export class CernerPatientCcdPage {
	patientId: any;
	serviceUri: any; 
	accessToken: any;
	loader: any;

	cernerCCDResult: any;

	resource: any;

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private storage: Storage,
  	private loadingCtrl: LoadingController,
  	public rest: Rest) {
  	this.resource = [];
  }

  ionViewDidLoad() {
    this.patientId = this.navParams.get('patientId');
    this.serviceUri = this.navParams.get('serviceUri');
    this.accessToken = this.navParams.get('accessToken'); 
  
    this.getCCDDocURL();
  }

  before() {
    this.navCtrl.setRoot('SandboxListPage');
  }

  getCCDDocURL() {
    let patientCcdUrl = this.serviceUri + "DocumentReference/$docref?patient=" + this.patientId + "&type=" + encodeURIComponent("http://loinc.org|34133-9");
    
    let loadingCtrlOptions = {
      content: "waiting..."
    };
    this.loader = this.loadingCtrl.create(loadingCtrlOptions);
    this.loader.present();

    this.rest.getPatientCCDDocument(patientCcdUrl, this.accessToken)
    .subscribe(
      result => {
      	if(this.loader){ this.loader.dismiss(); this.loader = null; }
        this.cernerCCDResult = result;

        let count = this.cernerCCDResult.total;
        
        if (count === 0) {
          alert("Server Not Available.\nPlease try again.");
        }

        let resourceCreated = [],
          resourceText = [],
          resourceContent = [];
        let resourceDisplay = [];

        for (let i = 0; i < count; i++) {
          let temp = this.cernerCCDResult.entry[i].resource.indexed;
          resourceText[i] = this.cernerCCDResult.entry[i].resource.type.text;

          let year = temp.substring(0, 4);
          let month = temp.substring(5, 7);
          let day = temp.substring(8, 10);

          let res1 = month.concat("/", day);
          let res2 = res1.concat("/", year);
          let date = " ".concat(res2);

          resourceCreated[i] = date;
          resourceDisplay[i] = resourceText[i] + resourceCreated[i];
          resourceContent[i] = this.cernerCCDResult.entry[i].resource.content[0].attachment.url;

          let resourceItem = {
          	display: '',
          	contentURL: ''
          };
          resourceItem.display = resourceDisplay[i];
          resourceItem.contentURL = resourceContent[i];

          this.resource.push(resourceItem);
        }

      }, err => {
      	if(this.loader){ this.loader.dismiss(); this.loader = null; }
      	console.log("error: ", err);
      });
  }

  urlClick(item, $index) {
    this.navCtrl.setRoot('CernerPatientCcdDetailPage', {url: item.contentURL});
  }

}
