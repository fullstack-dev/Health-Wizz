import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController, AlertController, ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';
import { WebIntent } from '@ionic-native/web-intent';
import * as $ from "jquery";

import { Rest } from '../../../providers/rest';

/**
 * Generated class for the AddMedRecordsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-add-med-records',
	templateUrl: 'add-med-records.html',
})
export class AddMedRecordsPage {

	recent_search_data: any;
	upload_image_data: any;
	other_apps_data: any;
	errorMessage: string;
	add_med_records_data: any;
	base64Image: any;
	recent_flag: boolean;
	myInput: string;
	inAppBrowserRef: any;
	loader: any = null;
	// segment selection
	searchDivided: any;
	// getting extras
	extras: any;
	fileExtension: string;
	loadstartTimes: boolean;
	recentSearchFlag: boolean;

	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		private storage: Storage,
		private loadingCtrl: LoadingController,
		private camera: Camera,
		private iab: InAppBrowser,
		public rest: Rest,
		public alertCtrl: AlertController,
		private themeableBrowser: ThemeableBrowser,
		private file: File,
		private transfer: FileTransfer,
		private filePath: FilePath,
		private webIntent: WebIntent,
		private actionSheetCtrl: ActionSheetController
	) {
		this.searchDivided = "search";
		this.loadstartTimes = true;
		this.recentSearchFlag = false;
		platform.ready().then(() => {
			// from another source to healthwizz app
			platform.resume.subscribe((e) => {
				// iOS
				if (this.platform.is('ios')) {
					// This will only print when on iOS
					setTimeout(() => {
						this.fileCheckFunc();
					}, 2000);
				}
			});
			// Android
			if (this.platform.is('android')) {

				this.extras = this.navParams.get('extras');

				this.fileCheckFuncA();
			}
		});
	}

	ionViewDidLoad() {
		this.recentSearchFlag = false;
		this.getAddMedRecords();
		this.storage.get("recent_search_url").then((result) => {
			if (result) {
				this.recent_search_data = [];

				for (var i = result.length - 1; i >= 0; i--) {
					this.recent_search_data.push(result[i]);
				}
			}
		});
	}

	goToSandboxPage() {
		this.navCtrl.setRoot('SandboxListPage');
	}

	getAddMedRecords() {
		this.rest.getAddMedRecords()
			.subscribe(
				add_med_records => {
					this.add_med_records_data = add_med_records;

					this.upload_image_data = this.add_med_records_data.upload_image_data;
					this.other_apps_data = this.add_med_records_data.other_apps_data;
				},
				error => {
					this.errorMessage = <any>error;
				});
	}

	fileCheckFunc() {
		this.file.checkFile(this.file.documentsDirectory, 'fileTitlename.txt')
			.then(_ => {
				// Read the real file name in the documentsDirectory of iPhone
				this.file.readAsText(this.file.documentsDirectory, 'fileTitlename.txt')
					.then(success => {
						this.copyFileToLocalDirPDF(this.file.documentsDirectory, success, this.createPdfFileName());
					})
					.catch(err => {
					});
			})
			.catch(err => {
			});
	}

	fileCheckFuncA() {
		var fileName = this.extras[this.webIntent.EXTRA_SUBJECT];
		var fileStream = this.extras[this.webIntent.EXTRA_STREAM];
		const fileTransfer: FileTransferObject = this.transfer.create();
		fileTransfer.download(fileStream, this.file.externalDataDirectory + fileName).then((entry) => {
			this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": fileName, "fileType": "document" } });
		}, (error) => {
			// handle error
		});
	}

	public Before = () => {
		this.navCtrl.setRoot('MyMedRecordsPage');
	}

	public Done = () => {
		this.navCtrl.setRoot('MyMedRecordsPage');
	}

	public recentSearchItemSelected(item) {
		this.myInput = item;
		this.submitLogin();
	}

	public uploadImageItemSelected(item) {
		// click photo icon
		if (item.name == "Photos") {
			let cameraOptions = {
				sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
				destinationType: this.camera.DestinationType.FILE_URI,
				quality: 100,
				targetWidth: 1000,
				targetHeight: 1000,
				encodingType: this.camera.EncodingType.JPEG,
				correctOrientation: true
			}
			this.camera.getPicture(cameraOptions)
				.then(file_uri => {
					// Special handling for Android library
					if (this.platform.is('android')) {
						this.filePath.resolveNativePath(file_uri)
							.then(filePath => {
								let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
								let currentName = file_uri.substring(file_uri.lastIndexOf('/') + 1, file_uri.lastIndexOf('?'));
								this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
							});
					} else {
						var currentName = file_uri.substr(file_uri.lastIndexOf('/') + 1);
						var correctPath = file_uri.substr(0, file_uri.lastIndexOf('/') + 1);
						this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
					}
				},
					err => {
					});
		}
		// click camera icon
		else if (item.name == "Camera") {
			let options: CameraOptions = {
				quality: 100,
				targetWidth: 900,
				targetHeight: 600,
				destinationType: this.camera.DestinationType.FILE_URI,
				encodingType: this.camera.EncodingType.JPEG,
				mediaType: this.camera.MediaType.PICTURE,
				saveToPhotoAlbum: false,
				allowEdit: true,
				sourceType: 1
			}
			this.camera.getPicture(options).then(file_uri => {
				var currentName = file_uri.substr(file_uri.lastIndexOf('/') + 1);
				var correctPath = file_uri.substr(0, file_uri.lastIndexOf('/') + 1);
				this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
			}, (err) => {
				// Handle error
			});
		} else {
		}
	}

	public otherAppsItemSelected(item) {
		var fileName = "Dentist_Diana_Medina_Addis_oc.doc";//temp file name
		this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": fileName, "fileType": "document" } });

		// if(item.name == "Email"){
		// 	this.navCtrl.setRoot('AddingMedRecordPage', {med_record_info: item});
		// } else if (item.name == "Google Drive") {

		// } else if (item.name ==  "iCloud Drive") {

		// } else if (item.name == "Dropbox") {

		// } else if (item.name == "Apple HealthKit") {

		// } else if (item.name == "Microsoft HealthValut") {

		// }
		// else {
		// 	this.navCtrl.setRoot('AddingMedRecordPage', {med_record_info: item});
		// }
	}

	submitLogin() {
		const options: InAppBrowserOptions = {
			zoom: 'yes',
			location: 'no',
			toolbar: 'yes',
			mediaPlaybackRequiresUserAction: 'yes',
			allowInlineMediaPlayback: 'yes'
		}
		this.loadstartTimes = true;
		this.platform.ready().then(() => {
			// Opening a URL and returning an InAppBrowserObject
			const browser = this.iab.create("https://www.google.com/search?q=" + this.myInput + "&ie=UTF-8", '_blank', options);
			this.saveRecentSearchUrl(this.myInput);
			browser.on('loadstart').subscribe(event => {
				if (this.loadstartTimes) {
					let eventUrl = event.url;
					var n = eventUrl.startsWith("blob:");
					var fileName = eventUrl.substr(eventUrl.lastIndexOf('/') + 1);
					var filePath = eventUrl.substr(0, eventUrl.lastIndexOf('/') + 1);
					// blob file (with download button) patient.labcorp.com
					if (n == true) {
						var myBlob;
						var xhr = new XMLHttpRequest();
						xhr.open('GET', eventUrl, true);
						xhr.responseType = 'blob';
						xhr.onload = function (e) {
							if (xhr.status == 200) {
								myBlob = xhr.response;
								// myBlob is now the blob that the object URL pointed to.
							}
						};
						xhr.send();
						this.loadstartTimes = false;
						browser.close();
						let actionSheet = this.actionSheetCtrl.create({
							title: fileName,
							buttons: [
								{
									text: 'Download',
									handler: () => {
										this.downloadBlobFileToLocalDir(myBlob, this.createPdfFileName());
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
					} else {
						this.fileExtension = fileName.split('.')[1];
						if (this.fileExtension) {
							var temp = this.fileExtension.toLowerCase();
							if (temp == "zip" || temp == 'pdf' || temp == 'png' || temp == 'jpg') {
								this.loadstartTimes = false;
								browser.close();
								let actionSheet = this.actionSheetCtrl.create({
									title: fileName,
									buttons: [
										{
											text: 'Download',
											handler: () => {
												this.downloadFileToLocalDir(eventUrl, this.createPdfFileName());
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
						} else { // INOVA MyChart
							var n = fileName.startsWith("GetDownloadStarted");
							if (n == true) {
								this.loadstartTimes = false;

								browser.close();

								let actionSheet = this.actionSheetCtrl.create({
									title: "zip file",
									buttons: [
										{
											text: 'Download',
											handler: () => {
												this.downloadFileToLocalDir(eventUrl, this.createZipFileName());
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
						}
					}
				}
			});
		});
	}

	public downloadBlobFileToLocalDir(fileStream, fileName) {
		let loadingCtrlOptions = {
			content: 'Downloading file...'
		};
		this.loader = this.loadingCtrl.create(loadingCtrlOptions);
		this.loader.present();
		if (this.platform.is('android')) {
			this.file.writeFile(this.file.externalDataDirectory, fileName, fileStream).then(success => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
				this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": fileName, "fileType": "document" } });
			}, error => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
			});
		} else {
			this.file.writeFile(this.file.documentsDirectory, fileName, fileStream).then(success => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
				this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": fileName, "fileType": "document" } });
			}, error => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
			});
		}
	}

	public downloadFileToLocalDir(fileStream, fileName) {
		const fileTransfer: FileTransferObject = this.transfer.create();
		let loadingCtrlOptions = {
			content: 'Downloading file...'
		};
		this.loader = this.loadingCtrl.create(loadingCtrlOptions);
		this.loader.present();
		if (this.platform.is('android')) {
			fileTransfer.download(fileStream, this.file.externalDataDirectory + fileName).then((entry) => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
				this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": fileName, "fileType": "document" } });
			}, (error) => {
				// handle error
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
			});
		} else {
			fileTransfer.download(fileStream, this.file.documentsDirectory + fileName).then((entry) => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
				this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": fileName, "fileType": "document" } });
			}, (error) => {
				// handle error
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
			});
		}
	}

	// for image of Photo/Camera
	private createFileName() {
		var d = new Date(),
			n = d.getTime(),
			newFileName = n + ".jpg";
		return newFileName;
	}

	private createPdfFileName() {
		var e = new Date(),
			m = e.getTime(),
			newFileName = m + ".pdf";
		return newFileName;
	}

	private createZipFileName() {
		var e = new Date(),
			m = e.getTime(),
			newFileName = m + ".zip";
		return newFileName;
	}

	private copyFileToLocalDirPDF(namePath, currentName, newFileName) {
		let loadingCtrlOptions = {
			content: 'Downloading file...'
		};
		this.loader = this.loadingCtrl.create(loadingCtrlOptions);
		this.loader.present();
		this.file.copyFile(namePath, currentName, this.file.documentsDirectory, newFileName).then(success => {
			if (this.loader) { this.loader.dismiss(); this.loader = null; }
			this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": newFileName, "fileType": "document" } });
			this.file.removeFile(this.file.documentsDirectory, 'fileTitlename.txt')
				.then(success => {
					if (this.loader) { this.loader.dismiss(); this.loader = null; }
				})
				.catch(err => {
					if (this.loader) { this.loader.dismiss(); this.loader = null; }
				})
		}, error => {
			if (this.loader) { this.loader.dismiss(); this.loader = null; }
		});
	}

	private copyFileToLocalDir(namePath, currentName, newFileName) {
		let loadingCtrlOptions = {
			content: 'Downloading file...'
		};
		this.loader = this.loadingCtrl.create(loadingCtrlOptions);
		this.loader.present();
		if (this.platform.is('android')) {
			this.file.copyFile(namePath, currentName, this.file.externalDataDirectory, newFileName).then(success => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
				this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": newFileName, "fileType": "image" } });
			}, error => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
			});
		} else {
			this.file.copyFile(namePath, currentName, this.file.documentsDirectory, newFileName).then(success => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
				this.navCtrl.setRoot('AddingMedRecordPage', { med_record_info: { "fileName": newFileName, "fileType": "image" } });
			}, error => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
			});
		}
	}

	public pathForImage(img) {
		if (img === null) {
			return '';
		} else {
			return this.file.documentsDirectory + img;
		}
	}

	presentAlert(txt) {
		let alert = this.alertCtrl.create({
			title: 'Error',
			subTitle: txt,
			buttons: ['Ok']
		});
		alert.present();
	}

	// saving the recent searched data to the Storage
	saveRecentSearchUrl(recentDocUrl) {
		this.storage.ready().then(() => {
			let recentSearchData = [];
			this.storage.ready().then(() => {
				this.storage.get("recent_search_url").then((result) => {
					recentSearchData = result;
					if (recentSearchData == null) {
						recentSearchData = [];
					}
					for (let i = 0; i < recentSearchData.length; i++) {
						if (recentDocUrl == recentSearchData[i]) {
							this.recentSearchFlag = true;
						}
					}
					if (!this.recentSearchFlag) {
						//adding all of documents to the recentSearchData array
						recentSearchData.push(recentDocUrl);

						this.storage.set('recent_search_url', recentSearchData)
							.then(
								() => {
								},
								error => {
								}
							);
					} else {
						for (let i = 0; i < recentSearchData.length; i++) {
							if (recentSearchData[i] == recentDocUrl) {
								recentSearchData.splice(i, 1);
							}
						}
						recentSearchData.push(recentDocUrl);
						this.storage.set('recent_search_url', recentSearchData)
							.then(
								() => {
								},
								error => {
								}
							);
					}
				});
			});
		});
	}
}
