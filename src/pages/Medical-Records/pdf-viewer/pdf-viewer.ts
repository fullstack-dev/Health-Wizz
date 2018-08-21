import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PdfViewerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pdf-viewer',
  templateUrl: 'pdf-viewer.html',
})
export class PdfViewerPage {

	pdfSrc: string = '';
	pdfTitle: string = '';

	constructor(public navCtrl: NavController, public navParams: NavParams) {
	}

	ionViewDidLoad() {
		this.pdfSrc = this.navParams.get('fileContent');
		this.pdfTitle = this.navParams.get('fileTitle');
	}

	public before() {
		this.navCtrl.setRoot('MyMedRecordsPage');
	}

}
