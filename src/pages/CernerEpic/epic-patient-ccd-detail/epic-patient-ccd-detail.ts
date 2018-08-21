import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController, ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';

import { Rest } from '../../../providers/rest';

/**
 * Generated class for the EpicPatientCcdDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-epic-patient-ccd-detail',
  templateUrl: 'epic-patient-ccd-detail.html',
})
export class EpicPatientCcdDetailPage {
	url: any;

	ccdDetailResult: any;
  headerAddedXmlString: any;

	loader: any;

	xml: any;

  constructor(
  	public platform: Platform,
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	private storage: Storage,
  	private loadingCtrl: LoadingController,
  	private actionSheetCtrl: ActionSheetController,
  	private file: File,
    private transfer: FileTransfer,
    private filePath: FilePath,
  	public rest: Rest) {
  }

  ionViewDidLoad() {
    this.url = this.navParams.get('url');

    this.getCCDDocDetail();
  }

  before() {
    this.navCtrl.setRoot('SandboxListPage');
  }

  getCCDDocDetail() {
  	let loadingCtrlOptions = {
      content: "waiting..."
    };
    this.loader = this.loadingCtrl.create(loadingCtrlOptions);
    this.loader.present();

    this.rest.getPatientCCDDetail(this.url)
    .subscribe(
      result => {
      	if(this.loader){ this.loader.dismiss(); this.loader = null; }
        this.ccdDetailResult = result;
      	
        this.headerAddedXmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><?xml-stylesheet type='text/xsl' href='assets/data/CDA.xsl'?>" + this.ccdDetailResult._body;
        
        let xmlObject = this.stringToXML(this.headerAddedXmlString);
        
        this.xml = xmlObject;
        let xsl = this.loadXMLDoc("assets/data/CDA.xsl");
        
        if (document.implementation && document.implementation.createDocument) {
          let xsltProcessor = new XSLTProcessor();
          xsltProcessor.importStylesheet(xsl);
          let resultDocument = xsltProcessor.transformToFragment(this.xml, document);
          document.getElementById('container').appendChild(resultDocument);
        }
      }, err => {
      	if(this.loader){ this.loader.dismiss(); this.loader = null; }
      });
  }

  //Change String to XML
  stringToXML(oString) {
    return (new DOMParser()).parseFromString(oString, "text/xml");
  }

  // XML document loading
  loadXMLDoc(filename) {
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", filename, false);
    xhttp.send("");
    return xhttp.responseXML;
  }

  download() {
  	let actionSheet = this.actionSheetCtrl.create({
	    title: 'CCD Document',
	    buttons: [
        {
       		text: 'Download',
         	handler: () => {
         		this.downloadXmlFileToLocalDir(this.headerAddedXmlString, this.createXmlFileName());
         	}
       	},
       	{
         	text: 'Cancel',
         	role: 'cancel',
         	handler: () => {
         	}
       	}
	    ]
		});
		actionSheet.present();
  }

  public downloadXmlFileToLocalDir(fileStream, fileName) {
		let loadingCtrlOptions = {
	      	content: 'Downloading file...'
	    };
    	this.loader = this.loadingCtrl.create(loadingCtrlOptions);
  		this.loader.present();
		if (this.platform.is('android')) {
			this.file.writeFile(this.file.externalDataDirectory, fileName, fileStream).then(success => {
				if(this.loader){ this.loader.dismiss(); this.loader = null; }	
				this.navCtrl.setRoot('AddingMedRecordPage', {med_record_info: {"fileName": fileName, "fileType": "document"}});
			}, error => {
				if(this.loader){ this.loader.dismiss(); this.loader = null; }
			});
		}else {
			this.file.writeFile(this.file.documentsDirectory, fileName, fileStream).then(success => {
				if(this.loader){ this.loader.dismiss(); this.loader = null; }
				this.navCtrl.setRoot('AddingMedRecordPage', {med_record_info: {"fileName": fileName, "fileType": "document"}});
			}, error => {
				if(this.loader){ this.loader.dismiss(); this.loader = null; }
			});
		}
	}

	private createXmlFileName() {
		var e = new Date(),
		m = e.getTime(),
		newFileName = m + ".xml";
		return newFileName;
	}

}
