import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the SearchRecordsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */



@IonicPage()
@Component({
  selector: 'page-search-records',
  templateUrl: 'search-records.html',
})
export class SearchRecordsPage {

	keyword: string;
	trustedUrl: SafeResourceUrl;

  	constructor(
  		public navCtrl: NavController, 
  		public navParams: NavParams,
  		private domSanitizer: DomSanitizer,
  		private actionSheetCtrl: ActionSheetController
  		) {
  	}

  	ionViewDidLoad() {
  		
  		this.keyword = this.navParams.get('keyword');
  		console.log("keyword: ", this.keyword);
  		// "https://www.google.com/search?q="+this.keyword+"&ie=UTF-8"
  		// "https://www.youtube.com/embed/MLleDRkSuvk"

  		var url = "https://www.google.com/search?q="+this.keyword+"&ie=UTF-8";
		// window.location.replace(url);

  		this.trustedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);

  		// this.trustedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/MLleDRkSuvk");

  		let actionSheet = this.actionSheetCtrl.create({
	      title: 'Modify your album',
	      buttons: [
	        {
	          text: 'Download',
	          handler: () => {
	            console.log('Download clicked');
	          }
	        },{
	          text: 'Cancel',
	          role: 'cancel',
	          handler: () => {
	            console.log('Cancel clicked');
	          }
	        }
	      ]
	    });
	    actionSheet.present();
  	}

  	before() {
  		this.navCtrl.setRoot('AddMedRecordsPage');
  	}

  	handleIFrameLoadEvent() {
  		// console.log("trusted url: ", this.trustedUrl.changingThisBreaksApplicationSecurity);
  	}

}
