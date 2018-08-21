import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';

/**
 * Generated class for the ZipDirectoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-zip-directory',
  templateUrl: 'zip-directory.html',
})
export class ZipDirectoryPage {

	zipFolder: any = [];

	fileList: any = [];

	tempFile: any;

	loader: any = null;

  	constructor(
  		public navCtrl: NavController, 
  		public navParams: NavParams,
  		public platform: Platform,
  		private loadingCtrl: LoadingController,
		private iab: InAppBrowser,
        public alertCtrl: AlertController,
        private file: File,
        private transfer: FileTransfer,
        private filePath: FilePath,
        private document: DocumentViewer) {
  		this.zipFolder = this.navParams.get('zipFolder');
  		console.log("zip folder: ", this.zipFolder);
  	}

  	ionViewDidLoad() {
		this.initialZipOpen();

  		for (let i = 0;i < this.zipFolder.length; i ++) {
  			var name = this.zipFolder[i].name;
  			var nativeURL = this.zipFolder[i].nativeURL;
  			console.log("name: ", name);
  			console.log("native url: ", nativeURL);

  			this.tempFile = {
				name: "",
				nativeURL: ""
			};

			this.tempFile.name = name;
	 		this.tempFile.nativeURL = nativeURL;

	 		let extension = this.tempFile.name.split('.')[1];
			console.log("file extension: ", extension);

			if(extension == 'pdf' || extension == 'PDF'){
		 		this.fileList.push(this.tempFile);
		 	}
  		}
  	}

  	public before() {
		this.navCtrl.setRoot('MyMedRecordsPage');
	}

	fileItemSelected(item) {
		console.log("selected file name: ", item.name);
		console.log("selected file native url: ", item.nativeURL);

		this.downloadFileToLocalDir(item.nativeURL);
	}

	public downloadFileToLocalDir(fileStream) {
		const fileTransfer: FileTransferObject = this.transfer.create();

		let loadingCtrlOptions = {
	      	content: "Opening for unzipped file..."
	    };
    	this.loader = this.loadingCtrl.create(loadingCtrlOptions);
  		this.loader.present();

	  	if (this.platform.is('android')) {
			fileTransfer.download(fileStream, this.file.externalDataDirectory + "zipIn.pdf").then((entry) => {

			    const options: DocumentViewerOptions = {
					print: {enabled: true}, 
					bookmarks: {enabled: true}, 
					email: {enabled: true}, 
					title: document.title
				}
				this.document.viewDocument(this.file.documentsDirectory + "zipIn.pdf", 'application/pdf', options);

				if(this.loader){ this.loader.dismiss(); this.loader = null; }

		  	}, (error) => {
			    // handle error
			    console.log('file downloaded error: ', error);
			    if(this.loader){ this.loader.dismiss(); this.loader = null; }
			    this.presentAlert("File download error!");
		  	});
		} else {
			fileTransfer.download(fileStream, this.file.documentsDirectory + "zipIn.pdf").then((entry) => {

			    const options: DocumentViewerOptions = {
					print: {enabled: true}, 
					bookmarks: {enabled: true}, 
					email: {enabled: true}, 
					title: document.title
				}
				this.document.viewDocument(this.file.documentsDirectory + "zipIn.pdf", 'application/pdf', options);

				if(this.loader){ this.loader.dismiss(); this.loader = null; }

		  	}, (error) => {
			    // handle error
			    console.log('file downloaded error: ', error);
			    if(this.loader){ this.loader.dismiss(); this.loader = null; }
			    this.presentAlert("File opening error!");
		  	});
		}
	}

	// for image of Pdf
	private createPdfFileName() {
		var e = new Date(),
		m = e.getTime(),
		newFileName = m + ".pdf";
		return newFileName;
	}

	presentAlert(txt) {
	  let alert = this.alertCtrl.create({
	    title: 'Error',
	    subTitle: txt,
	    buttons: ['Dismiss']
	  });
	  alert.present();
	}

	public initialZipOpen() {
		let loadingCtrlOptions = {
	      	content: "initializatioin..."
	    };
    	this.loader = this.loadingCtrl.create(loadingCtrlOptions);
  		this.loader.present();

  		// removing zipIn.pdf file from documentsDirectory and externalDataDirectory
  		if (this.platform.is('android')) {
  			this.file.checkFile(this.file.externalDataDirectory, "zipIn.pdf")
				.then(_ => {
					this.file.removeFile(this.file.externalDataDirectory, "zipIn.pdf")
					.then (success => {
						if(this.loader){ this.loader.dismiss(); this.loader = null; }
					})
					.catch(err => {
						if(this.loader){ this.loader.dismiss(); this.loader = null; }
					});
				})
				.catch(err => {
					if(this.loader){ this.loader.dismiss(); this.loader = null; }
				});

			
		} else {
			this.file.checkFile(this.file.documentsDirectory, "zipIn.pdf")
				.then(_ => {
					this.file.removeFile(this.file.documentsDirectory, "zipIn.pdf")
						.then (success => {
							if(this.loader){ this.loader.dismiss(); this.loader = null; }
						})
						.catch(err => {
							if(this.loader){ this.loader.dismiss(); this.loader = null; }
						});
				})
				.catch(err => {
					if(this.loader){ this.loader.dismiss(); this.loader = null; }
				});
			
		}
	}

}
