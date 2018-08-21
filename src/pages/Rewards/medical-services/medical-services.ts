import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MedicalServicesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-medical-services',
  templateUrl: 'medical-services.html',
})
export class MedicalServicesPage {

	medical_services: any;
	medical_title: string;
	medical_description: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MedicalServicesPage');

    this.medical_services = this.navParams.get('medical_services'); 
    if(this.medical_services){
    	this.medical_title = this.medical_services.title;
    	this.medical_description = this.medical_services.description;
    }

  }

  public Before =() => {
  	this.navCtrl.setRoot('ShopPage');
  }

  public goToWebsite = () => {

  }

}
