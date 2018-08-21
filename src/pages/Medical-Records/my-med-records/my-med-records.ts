import { Component, ViewChild, Pipe } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, Slides, LoadingController, ActionSheetController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EmailComposer } from '@ionic-native/email-composer';
import { Zip } from '@ionic-native/zip';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';

/**
 * Generated class for the MyMedRecordsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-my-med-records',
	templateUrl: 'my-med-records.html',
})
@Pipe({ name: 'order-by' })
export class MyMedRecordsPage {

	@ViewChild(Slides) slides: Slides;
	docData: any;//all of documents
	currentCardsData: any;
	public event = { value: false };
	totalNumber: number;
	dataValid: boolean;
	tempConditionNameArray: any = [];
	newConditionNameArray: any = [];
	newConditionNameArrayLength: number;
	newProviderNameArray: any = [];
	newProviderNameArrayLength: number;
	newTagNameArray: any = [];
	newTagNameArrayLength: number;
	searchClick: boolean;
	myInput: string;
	itemsCondition: any = [];
	itemsProvider: any = [];
	itemsTag: any = [];
	// SQLite
	expenses: any = [];
	totalIncome = 0;
	totalExpense = 0;
	balance = 0;
	selectedItem: any;
	// temp modified data
	tempDoc: any;
	items: any;
	loader: any = null;
	conditionSeeAllFlag: boolean;
	providerSeeAllFlag: boolean;
	tagSeeAllFlag: boolean;
	recentDocFlag: boolean;
	tempDocData: any = [];
	platformFlag: boolean;

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
		private document: DocumentViewer,
		private alertCtrl: AlertController
	) {
		this.searchClick = false;

		this.selectedItem = [];

		this.itemsCondition = [];
		this.itemsProvider = [];
		this.itemsTag = [];

		this.conditionSeeAllFlag = true;
		this.providerSeeAllFlag = true;
		this.tagSeeAllFlag = true;

		this.recentDocFlag = false;
		this.tempDocData = [];

		this.platformFlag = true;

		if (this.platform.is('android')) {
			this.platformFlag = false;
		} else {
			this.platformFlag = true;
		}
	}

	ionViewDidLoad() {

		this.totalNumber = 0;
		this.tempDocData = [];
		// this.getData();

		let loadingCtrlOptions = {
			content: ""
		};
		this.loader = this.loadingCtrl.create(loadingCtrlOptions);
		this.loader.present();

		this.storage.ready().then(() => {
			this.storage.get("recent_doc_data").then((result) => {
				if (result) {
					this.currentCardsData = [];
					this.currentCardsData = result.reverse();
				}
			},
				error => {
				});

			this.storage.get("doc_data").then((result) => {
				if (this.loader) { this.loader.dismiss(); this.loader = null; }
				this.docData = result;
				if (this.docData.length > 0) {

					let conditionsData: any = [];
					let providersData: any = [];
					let tagsData: any = [];

					// let tempConditionNameArray : any = [];
					let tempProviderNameArray: any = [];
					let tempTagNameArray: any = [];

					for (let i = 0; i < this.docData.length; i++) {
						// all of conditions array in docData
						conditionsData = this.docData[i].condition;

						let tempConditionName = "";
						for (let j = 0; j < conditionsData.length; j++) {
							// all of conditionName array in each conditions array
							tempConditionName = conditionsData[j].conditionName;

							// total conditionName array
							this.tempConditionNameArray.push(tempConditionName);
							this.tempConditionNameArray.reverse();
						}

						// all of providers array in docData
						providersData = this.docData[i].provider;

						let tempProviderName = "";
						for (let j = 0; j < providersData.length; j++) {
							// all of providerName array in each providers array
							tempProviderName = providersData[j].providerName;

							// total providerName array
							tempProviderNameArray.push(tempProviderName);
							tempProviderNameArray.reverse();
						}

						// all of tags array in docData
						tagsData = this.docData[i].tag;

						let tempTagName = "";
						for (let j = 0; j < tagsData.length; j++) {
							// all of tagName array in each tags array
							tempTagName = tagsData[j].tagName;

							// total tagName array
							tempTagNameArray.push(tempTagName);
							tempTagNameArray.reverse();
						}
					}

					// remake new conditionName array accroding to the duplicated conditionName
					this.newConditionNameArray = this.tempConditionNameArray.reduce((b, c) => ((b[b.findIndex(d => d.el === c)] || b[b.push({ el: c, count: 0 }) - 1]).count++ , b), []);
					this.newConditionNameArrayLength = this.newConditionNameArray.length;
					this.setItemsCondition();
					// remake new providerName array accroding to the duplicated providerName
					this.newProviderNameArray = tempProviderNameArray.reduce((b, c) => ((b[b.findIndex(d => d.el === c)] || b[b.push({ el: c, count: 0 }) - 1]).count++ , b), []);
					this.newProviderNameArrayLength = this.newProviderNameArray.length;
					this.setItemsProvider();
					// remake new tagName array accroding to the duplicated tagName
					this.newTagNameArray = tempTagNameArray.reduce((b, c) => ((b[b.findIndex(d => d.el === c)] || b[b.push({ el: c, count: 0 }) - 1]).count++ , b), []);
					this.newTagNameArrayLength = this.newTagNameArray.length;
					this.setItemsTag();

				} else {
					this.navCtrl.setRoot('InitialMedRecordsPage');
					if (this.loader) { this.loader.dismiss(); this.loader = null; }
				}
			},
				error => {
					if (this.loader) { this.loader.dismiss(); this.loader = null; }
				});
		});
	}

	public before = () => {
		this.navCtrl.setRoot('HomePage');
	}

	public add = () => {
		this.navCtrl.setRoot('AddMedRecordsPage');
	}

	public search = () => {
		this.searchClick = !this.searchClick;
	}

	setItemsCondition() {
		this.conditionSeeAllFlag = true;

		if (this.newConditionNameArrayLength > 3) {
			for (var i = 0; i < 3; i++) {
				this.itemsCondition[i] = this.newConditionNameArray[i];
			}
		} else {
			this.itemsCondition = this.newConditionNameArray;
		}
	}

	setItemsProvider() {
		this.providerSeeAllFlag = true;

		if (this.newProviderNameArrayLength > 3) {
			for (var i = 0; i < 3; i++) {
				this.itemsProvider[i] = this.newProviderNameArray[i];
			}
		} else {
			this.itemsProvider = this.newProviderNameArray;
		}
	}

	setItemsTag() {
		this.tagSeeAllFlag = true;

		if (this.newTagNameArrayLength > 3) {
			for (var i = 0; i < 3; i++) {
				this.itemsTag[i] = this.newTagNameArray[i];
			}
		} else {
			this.itemsTag = this.newTagNameArray;
		}
	}

	public onInput(ev: any) {
		this.setItemsCondition();
		this.setItemsProvider();
		this.setItemsTag();

		let val = ev.target.value;

		if (val && val.trim() !== '') {
			this.itemsCondition = this.itemsCondition.filter(function (item) {
				return (item.el.toLowerCase().indexOf(val.toLowerCase()) > -1);
			});
			this.itemsProvider = this.itemsProvider.filter(function (item) {
				return (item.el.toLowerCase().indexOf(val.toLowerCase()) > -1);
			});
			this.itemsTag = this.itemsTag.filter(function (item) {
				return (item.el.toLowerCase().indexOf(val.toLowerCase()) > -1);
			});
		}
	}

	public onCancel($event) {
		this.searchClick = !this.searchClick;
	}

	slideChanged = () => {
		let currentIndex = this.slides.getActiveIndex();
		// this.event.value = this.currentCardsData[currentIndex].openFlag;

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

	public addRecords() {
		this.navCtrl.setRoot('AddMedRecordsPage');
	}

	clickConditions() {
		this.navCtrl.setRoot('MyGroupRecordsPage', { med_group_info: this.newConditionNameArray, selected: 'condition' });
	}

	clickProviders() {
		this.navCtrl.setRoot('MyGroupRecordsPage', { med_group_info: this.newProviderNameArray, selected: 'provider' });
	}

	clickTags() {
		this.navCtrl.setRoot('MyGroupRecordsPage', { med_group_info: this.newTagNameArray, selected: 'tag' });
	}

	public conditionsItemSelected(item) {
		this.navCtrl.setRoot('MedRecordsListPage', { med_record_info: item, selected: 'condition' });
	}

	public providesItemSelected(item) {
		this.navCtrl.setRoot('MedRecordsListPage', { med_record_info: item, selected: 'provider' });
	}

	public tagsItemSelected(item) {
		this.navCtrl.setRoot('MedRecordsListPage', { med_record_info: item, selected: 'tag' });
	}

	public seeAll = () => {

	}

	public conditionsAll = () => {
		// this.navCtrl.setRoot('MedRecordsListPage', {med_record_info: this.newConditionNameArray, selected: 'condition_all'});
		this.itemsCondition = this.newConditionNameArray;
		this.conditionSeeAllFlag = false;
	}

	public conditionsLess = () => {
		this.itemsCondition = [];
		for (var i = 0; i < 3; i++) {
			this.itemsCondition[i] = this.newConditionNameArray[i];
		}
		this.conditionSeeAllFlag = true;
	}

	public providersAll = () => {
		// this.navCtrl.setRoot('MedRecordsListPage', {med_record_info: this.newProviderNameArray, selected: 'provider_all'});
		this.itemsProvider = this.newProviderNameArray;
		this.providerSeeAllFlag = false;
	}

	public providersLess = () => {
		this.itemsProvider = [];
		for (var i = 0; i < 3; i++) {
			this.itemsProvider[i] = this.newProviderNameArray[i];
		}
		this.providerSeeAllFlag = true;
	}

	public tagsAll = () => {
		// this.navCtrl.setRoot('MedRecordsListPage', {med_record_info: this.newTagNameArray, selected: 'tag_all'});
		this.itemsTag = this.newTagNameArray;
		this.tagSeeAllFlag = false;
	}

	public tagsLess = () => {
		this.itemsTag = [];
		for (var i = 0; i < 3; i++) {
			this.itemsTag[i] = this.newTagNameArray[i];
		}
		this.tagSeeAllFlag = true;
	}

	// About Recently Viewed.
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
								for (let i = 0; i < this.currentCardsData.length; i++) {
									delete this.currentCardsData[i]['openFlag'];
									delete this.currentCardsData[i]['id'];
									if (JSON.stringify(this.currentCardsData[i]) == JSON.stringify(item)) {
										//remove the items in the current selected list 
										this.currentCardsData.splice(i, 1);
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

								this.currentCardsData.push(this.tempDoc);
								this.setItems();

								this.saveDocument();
							},
								error => {
									console.error('Error storing documents data', error);
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
				// {
				//   	text: 'Campaign',
				//   	handler: () => {

				//   	}
				// },
				// {
				//   	text: 'Circle',
				//   	handler: () => {

				//   	}
				// },
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
				// {
				//   	text: 'Specific people',
				//   	handler: () => {

				//   	}
				// },
				// {
				//   	text: 'Clinician in Chronic disease',
				//   	handler: () => {

				//   	}
				// },
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

						// removing from current selected database(view)
						for (let i = 0; i < this.currentCardsData.length; i++) {
							for (let j = 0; j < this.selectedItem.length; j++) {
								if (JSON.stringify(this.currentCardsData[i]) == JSON.stringify(this.selectedItem[j])) {
									// remove the items in the current selected list 
									this.currentCardsData.splice(i, 1);
									this.setItems();
								}
							}
						}

						this.currentCardsData.reverse();

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
					error => {
						console.error('Error storing documents data', error);
					}
				);
		});
		//refresh this page
		this.navCtrl.setRoot(this.navCtrl.getActive().component);
	}

	setItems() {
		this.items = this.currentCardsData.map((item, index) => {
			item.id = index;
			return item;
		});
	}

	public setScrollStyle() {
		let styles = {
			'scroll-content': this.totalNumber == 0 ? '0' : '50px'
		};
		return styles;
	}

	SaveRecentDoc() {
		this.storage.ready().then(() => {

			// this.storage.remove('recent_doc_data');
			this.storage.set('recent_doc_data', this.currentCardsData)
				.then(
					() => {
						console.log('Stored recently viewed document data!');
					},
					error => {
						console.error('Error storing recently viewed documents data', error);
					}
				);
		});
	}

	presentAlert(txt) {
		let alert = this.alertCtrl.create({
			title: 'Error',
			subTitle: txt,
			buttons: ['Ok']
		});
		alert.present();
	}
}
