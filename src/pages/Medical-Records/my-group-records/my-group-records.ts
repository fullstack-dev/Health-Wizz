import { Component } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController, ActionSheetController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EmailComposer } from '@ionic-native/email-composer';
import { Zip } from '@ionic-native/zip';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';

/**
 * Generated class for the MyGroupRecordsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-my-group-records',
	templateUrl: 'my-group-records.html',
})
export class MyGroupRecordsPage {

	parameter: any;
	// total storage database 
	docData: any = [];
	dataValid: boolean = false;
	titleName: string;
	//selected storage database according to the category(condition, provider, tag)
	newDocData: any = [];
	tempDocData: any = [];
	recent_title: string;
	title: string;
	selectedItem: any;
	// temp modified data
	tempDoc: any;
	// updated tag
	public event = { value: false };
	totalNumber: number;
	searchClick: boolean;
	myInput: string;
	// items: Array<string>;
	items: any;
	loader: any = null;
	recentDocFlag: boolean = false;
	platformFlag: boolean;

	bottomFlag: boolean;

	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		private loadingCtrl: LoadingController,
		private storage: Storage,
		public actionSheetCtrl: ActionSheetController,
		private iab: InAppBrowser,
		private themeableBrowser: ThemeableBrowser,
		private file: File,
		private socialSharing: SocialSharing,
		private emailComposer: EmailComposer,
		private zip: Zip,
		private document: DocumentViewer
	) {
		this.totalNumber = 0;
		this.selectedItem = [];
		this.recentDocFlag = false;

		this.platformFlag = true;

		if (this.platform.is('android')) {
			this.platformFlag = false;
		} else {
			this.platformFlag = true;
		}

		this.bottomFlag = false;
	}

	ionViewDidLoad() {
		this.parameter = this.navParams.get('med_group_info');
		let selected_channel = this.navParams.get('selected');
		this.recent_title = selected_channel;

		if (this.parameter) {
			this.newDocData = [];

			this.storage.ready().then(() => {
				this.storage.get("doc_data").then((result) => {
					this.docData = result;
					console.log("totla doc data: ", this.docData);

					if (this.docData) {
						this.dataValid = true;

						let conditions_data: any = [];
						let providers_data: any = [];
						let tags_data: any = [];

						for (let k = 0; k < this.parameter.length; k++) {
							this.tempDocData = [];
							for (let i = 0; i < this.docData.length; i++) {

								if (selected_channel == 'condition') {
									conditions_data = this.docData[i].condition;
									for (let j = 0; j < conditions_data.length; j++) {
										if (this.parameter[k].el == conditions_data[j].conditionName) {
											this.tempDocData.push(this.docData[i]);
										}
									}
								}
								else if (selected_channel == 'provider') {
									providers_data = this.docData[i].provider;
									for (let j = 0; j < providers_data.length; j++) {
										if (this.parameter[k].el == providers_data[j].providerName) {
											this.tempDocData.push(this.docData[i]);
										}
									}
								} else if (selected_channel == 'tag') {
									tags_data = this.docData[i].tag;
									for (let j = 0; j < tags_data.length; j++) {
										if (this.parameter[k].el == tags_data[j].tagName) {
											this.tempDocData.push(this.docData[i]);
										}
									}
								}
							}
							this.newDocData.push(this.tempDocData);
							this.setItems();
						}

					}
				});

				// recently viewed 
				this.storage.get("recent_doc_data").then((result) => {
					this.tempDocData = result;

					// checking null case
					if (this.tempDocData == null) {
						this.tempDocData = [];
					}

					if (this.tempDocData.length == 0) {
						for (let i = 0; i < this.newDocData.length; i++) {
							for (let k = 0; k < this.newDocData[i].length; k++) {
								this.tempDocData.push(this.newDocData[i][k]);
							}
						}
					} else {
						for (let i = 0; i < this.newDocData.length; i++) {
							delete this.newDocData[i]['id'];
							for (let k = 0; k < this.newDocData[i].length; k++) {
								for (let j = 0; j < this.tempDocData.length; j++) {
									delete this.tempDocData[j]['id'];
									if (JSON.stringify(this.newDocData[i][k]) == JSON.stringify(this.tempDocData[j])) {
										this.recentDocFlag = true;
										this.tempDocData.splice(j, 1);
										break;
									} else {
										this.recentDocFlag = false;
									}
								}
								this.tempDocData.push(this.newDocData[i][k]);
							}
						}
					}

					this.SaveRecentDoc();

					console.log("tempDocData: ", this.tempDocData);
				});
			});
		} else {

		}
	}

	public before = () => {
		this.navCtrl.setRoot('MyMedRecordsPage');
	}

	public add = () => {
		this.navCtrl.setRoot('AddMedRecordsPage');
	}

	public search = () => {
		this.searchClick = !this.searchClick;
	}

	// for search
	setItems() {
		this.items = this.newDocData.map((item, index) => {
			item.id = index;
			return item;
		});
		this.items.reverse();

		if (this.items.length == 0) {
			this.bottomFlag = true;
		} else {
			this.bottomFlag = false;
		}
	}

	// for search	
	public onInput(ev: any) {
		this.setItems();
		let val = ev.target.value;
		let temp = this.recent_title;

		if (val && val.trim() !== '') {
			this.items = this.items.filter(function (item) {
				if (temp == 'condition') {
					return (item[0].condition[0].conditionName.toLowerCase().indexOf(val.toLowerCase()) > -1);
				} else if (temp == 'provider') {
					return (item[0].provider[0].providerName.toLowerCase().indexOf(val.toLowerCase()) > -1);
				} else if (temp == 'tag') {
					return (item[0].tag[0].tagName.toLowerCase().indexOf(val.toLowerCase()) > -1);
				} else {
					return (item[0].condition[0].conditionName.toLowerCase().indexOf(val.toLowerCase()) > -1);
				}
			});
		}

		if (this.items.length == 0) {
			this.bottomFlag = true;
		} else {
			this.bottomFlag = false;
		}
	}

	// for search
	public onCancel($event) {
		this.searchClick = !this.searchClick;
	}

	public cardItemSelected(ev, item) {
		if (item.openFlag) {
			this.totalNumber += 1;
			this.selectedItem.push(item);
		} else {
			this.totalNumber -= 1;
			this.selectedItem = this.selectedItem.filter((selItem) => selItem.id != item.id);
		}
	}

	public conditionsAll() {

	}

	public providersAll() {

	}

	public tagsAll() {

	}

	public addRecords() {
		this.navCtrl.setRoot('AddMedRecordsPage');
	}

	// for rename, delete tag
	public tagClick(tag_item, item) {

		let itemId = item.id;

		let actionSheet = this.actionSheetCtrl.create({
			title: 'Edit ' + tag_item.tagName,
			buttons: [
				{
					text: 'Rename',
					handler: () => {
						this.navCtrl.setRoot('RenameTagPage', { selectedTag: tag_item, selectedItem: item });
					}
				},
				{
					text: 'Delete',
					role: 'destructive',
					handler: () => {
						this.storage.ready().then(() => {
							this.storage.get("doc_data").then((result) => {
								this.docData = result;

								let updatedTags = [{ tagName: "", isChecked: true }];

								for (let j = 0; j < item.tag.length; j++) {
									if (item.tag[j] != tag_item) {
										updatedTags.push(item.tag[j]);
									}
								}

								delete item['openFlag'];
								delete item['id'];

								// removing from total Storage databse
								for (let k = 0; k < this.docData.length; k++) {
									delete this.docData[k]['openFlag'];
									delete this.docData[k]['id'];
									if (JSON.stringify(this.docData[k]) == JSON.stringify(item)) {
										//remove the items in the total storage 
										this.docData.splice(k, 1);
									}
								}

								// removing from current selected item(view)
								for (let i = 0; i < this.newDocData.length; i++) {
									delete this.newDocData[i]['openFlag'];
									delete this.newDocData[i]['id'];
									if (JSON.stringify(this.newDocData[i]) == JSON.stringify(item)) {
										//remove the items in the current selected list 
										this.newDocData.splice(i, 1);
										this.setItems();
									}
								}

								this.tempDoc = {
									docTitle: "",
									addedDate: "",
									condition: "",
									provider: "",
									tag: "",
									id: ""
								};

								this.tempDoc.docTitle = item.docTitle;
								this.tempDoc.addedDate = item.addedDate;
								this.tempDoc.condition = item.condition;
								this.tempDoc.provider = item.provider;
								this.tempDoc.tag = updatedTags;
								this.tempDoc.id = itemId;

								item = this.tempDoc;

								this.docData.push(this.tempDoc);

								this.newDocData.push(this.tempDoc);
								this.setItems();

								this.saveDocument();
							});
						});
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

	// first bottom icon( for sharing functionality )
	public shareEvent($event) {

		let docTitles = [];
		let fileURLs = [];

		for (let i = 0; i < this.selectedItem.length; i++) {
			docTitles.push(this.selectedItem[i].docTitle);
		}

		for (let i = 0; i < this.selectedItem.length; i++) {
			if (this.platform.is('android')) {
				this.file.checkFile(this.file.externalDataDirectory, docTitles[i])
					.then(_ => {
						fileURLs.push(this.file.externalDataDirectory + docTitles[i]);
					})
					.catch(err => {

					});
			} else {
				this.file.checkFile(this.file.documentsDirectory, docTitles[i])
					.then(_ => {
						fileURLs.push(this.file.documentsDirectory + docTitles[i]);
					})
					.catch(err => {

					});
			}
		}

		let actionSheet = this.actionSheetCtrl.create({
			title: 'Share with: ',
			buttons: [
				{
					text: 'Campaign',
					handler: () => {

					}
				},
				{
					text: 'Circle',
					handler: () => {

					}
				},
				{
					text: 'Share via email',
					handler: () => {
						let email = {
							attachments: fileURLs,
							subject: 'Share via email',
							isHtml: true
						};

						this.emailComposer.open(email);
					}
				},
				{
					text: 'Specific people',
					handler: () => {

					}
				},
				{
					text: 'Clinician in Chronic disease',
					handler: () => {

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

	// third bottom icon ( for read a selected one item )
	public bookEvent($event) {
		let docTitle = this.selectedItem[0].docTitle;

		let loadingCtrlOptions = {
			content: "Opening for downloaded file..."
		};
		this.loader = this.loadingCtrl.create(loadingCtrlOptions);
		this.loader.present();

		if (this.platform.is('android')) {
			this.file.checkFile(this.file.externalDataDirectory, docTitle)
				.then(_ => {
					console.log('----- file exists');

					// Read the real file content in the externalDataDirectory of Android

					this.file.readAsDataURL(this.file.externalDataDirectory, docTitle)
						.then(result => {

							console.log("read data url result: ", result);

							let extension = docTitle.split('.')[1];
							console.log("file extension: ", extension);

							if (extension == 'pdf' || extension == 'PDF') {
								this.navCtrl.setRoot('PdfViewerPage', { fileTitle: docTitle, fileContent: result });
							} else if (extension == 'zip' || extension == 'ZIP') {
								var pathToFileInString = this.file.externalDataDirectory + docTitle;
								var zipFolder = "zipFolder";
								var pathToResultZip = this.file.externalDataDirectory + zipFolder;

								this.zip.unzip(pathToFileInString, pathToResultZip, (progress) => console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%'))
									.then((result) => {
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
										if (result === 0) {
											console.log('SUCCESS');

											this.file.checkDir(this.file.externalDataDirectory, zipFolder)
												.then((result) => {
													this.file.listDir(this.file.externalDataDirectory, zipFolder)
														.then((entries) => {
															// this.items = entries;
															console.log("files: ", entries);
															this.navCtrl.setRoot('ZipDirectoryPage', { zipFolder: entries });

														})
														.catch((err) => {
															console.log("error: ", err);
														});
												})
												.catch((err) => {

												});
										}
										else if (result === -1) {
											console.log('FAILED');
										}
									});
							} else if (extension == 'xml' || extension == 'XML') {
								this.file.readAsText(this.file.externalDataDirectory, docTitle)
									.then(result => {
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
										console.log("xml string: ", result);
										this.navCtrl.setRoot('XmlViewerPage', { headerAddedXmlString: result });
									})
									.catch(err => {
										console.log("err1: ", err);
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									});
							} else {
								const options: InAppBrowserOptions = {
									zoom: 'yes',
									location: 'no',
									toolbar: 'yes',
									enableviewportscale: 'yes'
								}

								// Opening a URL and returning an InAppBrowserObject
								const browser = this.iab.create(result, '_blank', options);
							}

							if (this.loader) { this.loader.dismiss(); this.loader = null; }
						})
						.catch(err => {
							if (this.loader) { this.loader.dismiss(); this.loader = null; }
						});
				})
				.catch(err => {
					if (this.loader) { this.loader.dismiss(); this.loader = null; }
				});
		} else {
			this.file.checkFile(this.file.documentsDirectory, docTitle)
				.then(_ => {
					console.log('----- file exists');

					// Read the real file content in the documentsDirectory of iPhone

					this.file.readAsDataURL(this.file.documentsDirectory, docTitle)
						.then(result => {

							let extension = docTitle.split('.')[1];
							console.log("file extension: ", extension);

							if (extension == 'pdf' || extension == 'PDF') {

								// this.navCtrl.setRoot('PdfViewerPage', {fileTitle: docTitle, fileContent: result});
								const options: DocumentViewerOptions = {
									print: { enabled: true },
									bookmarks: { enabled: true },
									email: { enabled: true },
									title: document.title
								}

								this.document.viewDocument(this.file.documentsDirectory + docTitle, 'application/pdf', options);

							} else if (extension == 'zip' || extension == 'ZIP') {
								var pathToFileInString = this.file.documentsDirectory + docTitle;
								var zipFolder = "zipFolder";
								var pathToResultZip = this.file.documentsDirectory + zipFolder;

								this.zip.unzip(pathToFileInString, pathToResultZip, (progress) => console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%'))
									.then((result) => {
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
										if (result === 0) {
											console.log('SUCCESS');

											this.file.checkDir(this.file.documentsDirectory, zipFolder)
												.then((result) => {
													this.file.listDir(this.file.documentsDirectory, zipFolder)
														.then((entries) => {
															// this.items = entries;
															console.log("files: ", entries);
															this.navCtrl.setRoot('ZipDirectoryPage', { zipFolder: entries });

														})
														.catch((err) => {
															console.log("error: ", err);
														});
												})
												.catch((err) => {

												});
										}
										else if (result === -1) {
											console.log('FAILED');
										}
									});
							} else if (extension == 'xml' || extension == 'XML') {
								this.file.readAsText(this.file.documentsDirectory, docTitle)
									.then(result => {
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
										console.log("xml string: ", result);
										this.navCtrl.setRoot('XmlViewerPage', { headerAddedXmlString: result });
									})
									.catch(err => {
										console.log("err1: ", err);
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									});
							} else {
								const options: InAppBrowserOptions = {
									zoom: 'yes',
									location: 'no',
									toolbar: 'yes',
									enableviewportscale: 'yes'
								}

								// Opening a URL and returning an InAppBrowserObject
								const browser = this.iab.create(result, '_blank', options);
							}

							if (this.loader) { this.loader.dismiss(); this.loader = null; }
						})
						.catch(err => {
							if (this.loader) { this.loader.dismiss(); this.loader = null; }
						});
				})
				.catch(err => {
					if (this.loader) { this.loader.dismiss(); this.loader = null; }
				});
		}

	}

	// fourth bottom icon (for add tags to the selected items )
	public signEvent($event) {
		this.navCtrl.setRoot('AddTagPage', { selectedItem: this.selectedItem });
	}

	// fifth bottom icon ( for delete selected items )
	public recycleEvent($event) {
		let actionSheet = this.actionSheetCtrl.create({
			title: 'Are you sure you want to delete this record?',
			buttons: [
				{
					text: 'Delete',
					role: 'destructive',
					handler: () => {
						let loadingCtrlOptions = {
							content: "Deleting for selected file..."
						};
						this.loader = this.loadingCtrl.create(loadingCtrlOptions);
						this.loader.present();

						// removing real file from documentsDirectory and externalDataDirectory
						for (let ii = 0; ii < this.selectedItem.length; ii++) {
							if (this.platform.is('android')) {
								this.file.removeFile(this.file.externalDataDirectory, this.selectedItem[ii].docTitle)
									.then(success => {
										console.log('successful remove selected files');
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									})
									.catch(err => {
										console.log('can not remove selected files');
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									});
							} else {
								this.file.removeFile(this.file.documentsDirectory, this.selectedItem[ii].docTitle)
									.then(success => {
										console.log('successful remove selected files');
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									})
									.catch(err => {
										console.log('can not remove selected files');
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									});
							}
						}

						// removing from current selected database(view)
						for (let i = 0; i < this.newDocData.length; i++) {
							for (let k = 0; k < this.newDocData[i].length; k++) {
								for (let j = 0; j < this.selectedItem.length; j++) {
									if (JSON.stringify(this.newDocData[i][k]) == JSON.stringify(this.selectedItem[j])) {
										//remove the items in the current selected list 
										this.newDocData[i].splice(k, 1);
									}
								}
							}
						}

						for (let i = 0; i < this.newDocData.length; i++) {
							if (this.newDocData[i].length == 0) {
								this.newDocData.splice(i, 1);
							}
						}

						this.setItems();

						// removing from total Storage databse
						for (let k = 0; k < this.docData.length; k++) {
							for (let j = 0; j < this.selectedItem.length; j++) {
								if (JSON.stringify(this.docData[k]) == JSON.stringify(this.selectedItem[j])) {
									//remove the items in the total storage 
									this.docData.splice(k, 1);
								}
							}
						}

						this.saveDocument();

						// removing from recently viewed database
						for (let i = 0; i < this.tempDocData.length; i++) {
							for (let j = 0; j < this.selectedItem.length; j++) {
								if (JSON.stringify(this.tempDocData[i]) == JSON.stringify(this.selectedItem[j])) {
									this.tempDocData.splice(i, 1);
								}
							}
						}

						this.SaveRecentDoc();

						this.totalNumber = 0;
					}
				}, {
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

	// saving the updated data to the Storage
	saveDocument() {
		this.storage.ready().then(() => {
			// this.storage.remove('doc_data');
			this.storage.set('doc_data', this.docData)
				.then(
					() => {
						console.log('Stored documents data!');
					},
					error => console.error('Error storing documents data', error)
				);
		});
	}

	SaveRecentDoc() {
		this.storage.ready().then(() => {
			// this.storage.remove('recent_doc_data');
			this.storage.set('recent_doc_data', this.tempDocData)
				.then(
					() => {
						console.log('Stored recently viewed document data!');
					},
					error => console.error('Error storing recently viewed documents data', error)
				);
		});
	}
}
