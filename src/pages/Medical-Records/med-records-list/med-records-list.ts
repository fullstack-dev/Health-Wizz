import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, LoadingController, ActionSheetController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { EmailComposer } from '@ionic-native/email-composer';
import { Zip } from '@ionic-native/zip';
import { FileOpener } from '@ionic-native/file-opener';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer';

/**
 * Generated class for the MedRecordsListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-med-records-list',
	templateUrl: 'med-records-list.html',
})
export class MedRecordsListPage {

	parameter: any;
	currentCardsData: any;
	// total storage database 
	docData: any = [];
	dataValid: boolean = false;
	titleName: string;
	//selected storage database according to the category(condition, provider, tag)
	newDocData: any = [];
	title: string;
	selectedItem: any;
	// temp modified data
	tempDoc: any;
	public event = { value: false };
	totalNumber: number;
	searchClick: boolean;
	myInput: string;
	items: any;
	loader: any = null;
	listAllFlag: boolean;
	recentDocFlag: boolean;
	// recently viewed doc data
	tempDocData: any = [];
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
		private fileOpener: FileOpener,
		private document: DocumentViewer,
		private ref: ChangeDetectorRef,
		private alertCtrl: AlertController
	) {
		this.searchClick = false;
		this.selectedItem = [];
		// this.recentDocFlag = false;
		this.listAllFlag = false;
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
		this.totalNumber = 0;

		this.parameter = this.navParams.get('med_record_info');
		let selected_channel = this.navParams.get('selected');

		if (this.parameter) {
			this.newDocData = [];
			this.tempDocData = [];

			this.storage.ready().then(() => {

				this.storage.get("doc_data").then((result) => {
					this.docData = result;

					if (this.docData) {
						this.dataValid = true;

						let conditions_data: any = [];
						let providers_data: any = [];
						let tags_data: any = [];

						for (let i = 0; i < this.docData.length; i++) {

							if (selected_channel == 'condition') {
								// all of conditions array in doc_data
								conditions_data = this.docData[i].condition;

								let temp_conditionName = "";
								for (let j = 0; j < conditions_data.length; j++) {
									// all of conditionName array in each conditions array
									temp_conditionName = conditions_data[j].conditionName;

									this.titleName = this.parameter.el;
									if (temp_conditionName == this.parameter.el) {
										this.newDocData.push(this.docData[i]);
										this.setItems();
									}
								}
							} else if (selected_channel == 'provider') {
								// all of providers array in doc_data
								providers_data = this.docData[i].provider;

								let temp_providerName = "";
								for (let j = 0; j < providers_data.length; j++) {
									// all of providerName array in each providers array
									temp_providerName = providers_data[j].providerName;

									this.titleName = this.parameter.el;
									if (temp_providerName == this.parameter.el) {
										this.newDocData.push(this.docData[i]);
										this.setItems();
									}
								}
							} else {
								// all of tags array in doc_data
								tags_data = this.docData[i].tag;

								let temp_tagName = "";
								for (let j = 0; j < tags_data.length; j++) {
									// all of tagName array in each tags array
									temp_tagName = tags_data[j].tagName;

									this.titleName = this.parameter.el;
									if (temp_tagName == this.parameter.el) {
										this.newDocData.push(this.docData[i]);
										this.setItems();
									}
								}
							}
						}
					}
				},
					error => {
						console.error('Error storing documents data', error);
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
							this.tempDocData.push(this.newDocData[i]);
						}
					} else {
						for (let i = 0; i < this.newDocData.length; i++) {
							delete this.newDocData[i]['id'];
							for (let j = 0; j < this.tempDocData.length; j++) {
								delete this.tempDocData[j]['id'];
								if (JSON.stringify(this.newDocData[i]) == JSON.stringify(this.tempDocData[j])) {
									this.recentDocFlag = true;
									this.tempDocData.splice(j, 1);
									break;
								} else {
									this.recentDocFlag = false;
								}
							}
							this.tempDocData.push(this.newDocData[i]);
						}
					}

					this.SaveRecentDoc();
				},
					error => {
						console.error('Error storing documents data', error);
					});
			});
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

		if (val && val.trim() !== '') {
			this.items = this.items.filter(function (item) {
				return (item.condition[0].conditionName.toLowerCase().indexOf(val.toLowerCase()) > -1);
			});
			if (this.items.length == 0) {
				this.bottomFlag = true;
			} else {
				this.bottomFlag = false;
			}
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

	public addRecords() {
		this.navCtrl.setRoot('AddMedRecordsPage');
	}

	public titleClick() {
		let selected_channel = this.navParams.get('selected');
		console.log("items: ", this.items);
		let actionSheet = this.actionSheetCtrl.create({
			title: 'Edit ' + this.titleName,
			buttons: [
				{
					text: 'Rename',
					handler: () => {
						if (selected_channel == 'condition') {
							this.navCtrl.setRoot('RenameConditionPage', { selectedCondition: { conditionName: this.titleName }, selectedItem: this.items });
						} else if (selected_channel == 'provider') {
							this.navCtrl.setRoot('RenameProviderPage', { selectedProvider: { providerName: this.titleName }, selectedItem: this.items });
						} else {
							this.navCtrl.setRoot('RenameTagPage', { selectedTag: { tagName: this.titleName }, selectedItem: this.items });
						}
					}
				},
				{
					text: 'Delete',
					role: 'destructive',
					handler: () => {

						for (let i = 0; i < this.items.length; i++) {

							let itemId = this.items[i].id;
							let updatedConditions = [];
							let updatedProviders = [];
							let updatedTags = [];

							if (selected_channel == 'condition') {
								for (let j = 0; j < this.items[i].condition.length; j++) {
									if (this.items[i].condition[j].conditionName != this.titleName) {
										updatedConditions.push(this.items[i].condition[j]);
									}
								}
							} else if (selected_channel == 'provider') {
								for (let j = 0; j < this.items[i].provider.length; j++) {
									if (this.items[i].provider[j].providerName != this.titleName) {
										updatedProviders.push(this.items[i].provider[j]);
									}
								}
							} else {
								for (let j = 0; j < this.items[i].tag.length; j++) {
									if (this.items[i].tag[j].tagName != this.titleName) {
										updatedTags.push(this.items[i].tag[j]);
									}
								}
							}

							delete this.items[i]['openFlag'];
							delete this.items[i]['id'];
							// removing from total Storage databse
							for (let k = 0; k < this.docData.length; k++) {
								delete this.docData[k]['openFlag'];
								delete this.docData[k]['id'];
								if (JSON.stringify(this.docData[k]) == JSON.stringify(this.items[i])) {
									//remove the items in the total storage 
									this.docData.splice(k, 1);
								}
							}

							// removing from current selected item(view)
							for (let l = 0; l < this.newDocData.length; l++) {
								delete this.newDocData[l]['openFlag'];
								delete this.newDocData[l]['id'];
								if (JSON.stringify(this.newDocData[l]) == JSON.stringify(this.items[i])) {
									//remove the items in the current selected list 
									this.newDocData.splice(l, 1);
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

							this.tempDoc.docTitle = this.items[i].docTitle;
							this.tempDoc.addedDate = this.items[i].addedDate;
							this.tempDoc.id = itemId;

							if (selected_channel == 'condition') {
								this.tempDoc.condition = updatedConditions;
								this.tempDoc.provider = this.items[i].provider;
								this.tempDoc.tag = this.items[i].tag;
							} else if (selected_channel == 'provider') {
								this.tempDoc.condition = this.items[i].condition;
								this.tempDoc.provider = updatedProviders;
								this.tempDoc.tag = this.items[i].tag;
							} else {
								this.tempDoc.condition = this.items[i].condition;
								this.tempDoc.provider = this.items[i].provider;
								this.tempDoc.tag = updatedTags;
							}

							this.docData.push(this.tempDoc);
							this.newDocData.push(this.tempDoc);

							this.setItems();
							const callback = function () {
								console.log('callback')
							}
							this.saveDocument(callback);
						}
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

	// for condition edit
	public conditionClick(condition_item, item) {
		console.log("item: ", item);
		console.log("condition item: ", condition_item);
		this.itemEdit('condition', condition_item, item);
	}

	// for provider
	public providerClick(provider_item, item) {
		this.itemEdit('provider', provider_item, item);
	}

	// for rename tag, delete tag
	public tagClick(tag_item, item) {
		this.itemEdit('tag', tag_item, item);
	}

	public conditionPencilClick(item) {
		let temps = item.condition;
		if (temps.length == 1) {
			this.itemEdit('condition', temps[0], item);
		} else {
			let alert = this.alertCtrl.create();
			alert.setTitle('Select Condition Item');
			alert.addInput({
				type: 'radio',
				label: temps[0].conditionName,
				value: temps[0],
				checked: true
			})
			for (let i = 1; i < temps.length; i++) {
				alert.addInput({
					type: 'radio',
					label: temps[i].conditionName,
					value: temps[i],
					checked: false
				});
			}
			alert.addButton('Cancel');
			alert.addButton({
				text: 'OK',
				handler: data => {
					this.itemEdit('condition', data, item);
				}
			});
			alert.present();
		}
	}

	public providerPencilClick(item) {
		let temps = item.provider;
		if (temps.length == 1) {
			this.itemEdit('provider', temps[0], item);
		} else {
			let alert = this.alertCtrl.create();
			alert.setTitle('Select Provider Item');
			alert.addInput({
				type: 'radio',
				label: temps[0].providerName,
				value: temps[0],
				checked: true
			})
			for (let i = 1; i < temps.length; i++) {
				alert.addInput({
					type: 'radio',
					label: temps[i].providerName,
					value: temps[i],
					checked: false
				});
			}
			alert.addButton('Cancel');
			alert.addButton({
				text: 'OK',
				handler: data => {
					this.itemEdit('provider', data, item);
				}
			});
			alert.present();
		}
	}

	public tagPencilClick(item) {
		let temps = item.tag;
		if (temps.length == 1) {
			this.itemEdit('tag', temps[0], item);
		} else {
			let alert = this.alertCtrl.create();
			alert.setTitle('Select Tag Item');
			alert.addInput({
				type: 'radio',
				label: temps[0].tagName,
				value: temps[0],
				checked: true
			});
			for (let i = 1; i < temps.length; i++) {
				alert.addInput({
					type: 'radio',
					label: temps[i].tagName,
					value: temps[i],
					checked: false
				});
			}
			alert.addButton('Cancel');
			alert.addButton({
				text: 'OK',
				handler: data => {
					this.itemEdit('tag', data, item);
				}
			});
			alert.present();
		}
	}

	public itemEdit(type, selectedItem, cardItem) {
		let itemId = cardItem.id;
		let title = "";
		if (type == 'condition') {
			title = selectedItem.conditionName;
		} else if (type == 'provider') {
			title = selectedItem.providerName;
		} else {
			title = selectedItem.tagName;
		}
		let actionSheet = this.actionSheetCtrl.create({
			title: 'Edit ' + title,
			buttons: [
				{
					text: 'Rename',
					handler: () => {
						if (type == 'condition') {
							this.navCtrl.setRoot('RenameConditionPage', { selectedCondition: selectedItem, selectedItem: cardItem });
						} else if (type == 'provider') {
							this.navCtrl.setRoot('RenameProviderPage', { selectedProvider: selectedItem, selectedItem: cardItem });
						} else {
							this.navCtrl.setRoot('RenameTagPage', { selectedTag: selectedItem, selectedItem: cardItem });
						}
					}
				},
				{
					text: 'Delete',
					role: 'destructive',
					handler: () => {
						let updatedConditions = [{ conditionName: "" }];
						let updatedProviders = [{ providerName: "" }];
						let updatedTags = [{ tagName: "", isChecked: true }];

						if (type == "condition") {
							for (let j = 0; j < cardItem.condition.length; j++) {
								if (cardItem.condition[j] != selectedItem) {
									updatedConditions.push(cardItem.condition[j]);
								}
							}
						} else if (type == "provider") {
							for (let j = 0; j < cardItem.provider.length; j++) {
								if (cardItem.provider[j] != selectedItem) {
									updatedProviders.push(cardItem.provider[j]);
								}
							}
						} else {
							for (let j = 0; j < cardItem.tag.length; j++) {
								if (cardItem.tag[j] != selectedItem) {
									updatedTags.push(cardItem.tag[j]);
								}
							}
						}
						delete cardItem['openFlag'];
						delete cardItem['id'];
						// removing from total Storage databse
						for (let k = 0; k < this.docData.length; k++) {
							delete this.docData[k]['openFlag'];
							delete this.docData[k]['id'];
							if (JSON.stringify(this.docData[k]) == JSON.stringify(cardItem)) {
								//remove the items in the total storage 
								this.docData.splice(k, 1);
							}
						}
						// removing from current selected item(view)
						for (let i = 0; i < this.newDocData.length; i++) {
							delete this.newDocData[i]['openFlag'];
							delete this.newDocData[i]['id'];
							if (JSON.stringify(this.newDocData[i]) == JSON.stringify(cardItem)) {
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
						this.tempDoc.docTitle = cardItem.docTitle;
						this.tempDoc.addedDate = cardItem.addedDate;
						this.tempDoc.id = itemId;
						if (type == "condition") {
							this.tempDoc.condition = updatedConditions;
							this.tempDoc.provider = cardItem.provider;
							this.tempDoc.tag = cardItem.tag;
						} else if (type == "provider") {
							this.tempDoc.condition = cardItem.condition;
							this.tempDoc.provider = updatedProviders;
							this.tempDoc.tag = cardItem.tag;
						} else {
							this.tempDoc.condition = cardItem.condition;
							this.tempDoc.provider = cardItem.provider;
							this.tempDoc.tag = updatedTags;
						}
						cardItem = this.tempDoc;
						this.docData.push(this.tempDoc);
						this.newDocData.push(this.tempDoc);
						this.setItems();
						const callback = function () {
							console.log('callback')
						}
						this.saveDocument(callback);
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

	// second bottom icon ( for select of all items )
	public listEvent($event) {
		this.listAllFlag = !this.listAllFlag;
		console.log("all flag: ", this.listAllFlag);
		if (this.listAllFlag) {
			for (let i = 0; i < this.newDocData.length; i++) {
				if (!this.newDocData[i].openFlag) {
					this.totalNumber += 1;
					this.newDocData[i].openFlag = true;
					this.selectedItem.push(this.newDocData[i]);
				}
			}
		} else {
			for (let i = 0; i < this.newDocData.length; i++) {
				if (this.newDocData[i].openFlag) {
					this.newDocData[i].openFlag = false;
					this.selectedItem = [];
				}
			}
			this.totalNumber = 0;
		}
		this.setItems();
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
					// Read the real file content in the externalDataDirectory of Android
					this.file.readAsDataURL(this.file.externalDataDirectory, docTitle)
						.then(result => {
							let extension = docTitle.split('.')[1];
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
															this.navCtrl.setRoot('ZipDirectoryPage', { zipFolder: entries });
														})
														.catch((err) => {
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
										this.navCtrl.setRoot('XmlViewerPage', { headerAddedXmlString: result });
									})
									.catch(err => {
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
					let extension = docTitle.split('.')[1];
					if (extension == 'pdf' || extension == 'PDF') {
						// this.navCtrl.setRoot('PdfViewerPage', {fileTitle: docTitle, fileContent: result});
						const options: DocumentViewerOptions = {
							print: { enabled: true },
							bookmarks: { enabled: true },
							email: { enabled: true },
							title: document.title
						}
						this.document.viewDocument(this.file.documentsDirectory + docTitle, 'application/pdf', options);
						if (this.loader) { this.loader.dismiss(); this.loader = null; }
					} else if (extension == 'zip' || extension == 'ZIP') {
						var pathToFileInString = this.file.documentsDirectory + docTitle;
						var zipFolder = "zipFolder";
						var pathToResultZip = this.file.documentsDirectory + zipFolder;
						this.zip.unzip(pathToFileInString, pathToResultZip, (progress) => console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%'))
							.then((result) => {
								if (this.loader) { this.loader.dismiss(); this.loader = null; }
								if (result === 0) {
									this.file.checkDir(this.file.documentsDirectory, zipFolder)
										.then((result) => {
											this.file.listDir(this.file.documentsDirectory, zipFolder)
												.then((entries) => {
													this.navCtrl.setRoot('ZipDirectoryPage', { zipFolder: entries });
												})
												.catch((err) => {
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
								this.navCtrl.setRoot('XmlViewerPage', { headerAddedXmlString: result });
							})
							.catch(err => {
								if (this.loader) { this.loader.dismiss(); this.loader = null; }
							});
					} else {
						// Read the real file content in the documentsDirectory of iPhone
						this.file.readAsDataURL(this.file.documentsDirectory, docTitle)
							.then(result => {
								if (this.loader) { this.loader.dismiss(); this.loader = null; }
								const options: InAppBrowserOptions = {
									zoom: 'yes',
									location: 'no',
									toolbar: 'yes',
									enableviewportscale: 'yes'
								}
								// Opening a URL and returning an InAppBrowserObject
								const browser = this.iab.create(result, '_blank', options);
							})
							.catch(err => {
								if (this.loader) { this.loader.dismiss(); this.loader = null; }
							});
					}
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
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									})
									.catch(err => {
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									});
							} else {
								this.file.removeFile(this.file.documentsDirectory, this.selectedItem[ii].docTitle)
									.then(success => {
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									})
									.catch(err => {
										if (this.loader) { this.loader.dismiss(); this.loader = null; }
									});
							}
						}

						// removing from current selected database(view)
						for (let i = 0; i < this.newDocData.length; i++) {
							for (let j = 0; j < this.selectedItem.length; j++) {
								if (JSON.stringify(this.newDocData[i]) == JSON.stringify(this.selectedItem[j])) {
									//remove the items in the current selected list 
									this.newDocData.splice(i, 1);
									this.setItems();
								}
							}
						}

						// removing from total Storage databse
						for (let k = 0; k < this.docData.length; k++) {
							for (let j = 0; j < this.selectedItem.length; j++) {
								if (JSON.stringify(this.docData[k]) == JSON.stringify(this.selectedItem[j])) {
									//remove the items in the total storage 
									this.docData.splice(k, 1);
								}
							}
						}

						const callback = function () {
							console.log('callback')
						}
						this.saveDocument(callback);

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

						if (this.newDocData.length == 0) {
							if (this.docData.length == 0) {
								this.navCtrl.setRoot('InitialMedRecordsPage');
							} else {
								this.navCtrl.setRoot('MyMedRecordsPage');
							}
						}
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
	saveDocument(callback) {
		this.storage.ready().then(() => {
			// this.storage.remove('doc_data');
			this.storage.set('doc_data', this.docData)
				.then(
					() => {
						callback();
						console.log('Stored documents data!');
					},
					error => {
						console.error('Error storing documents data', error);
					}
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
