import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, Platform, NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

/**
 * Generated class for the AddingMedRecordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-adding-med-record',
	templateUrl: 'adding-med-record.html',
})
export class AddingMedRecordPage {
	medRecordInfo: any;
	docTitle: string;
	fileType: string;
	addedDate: string;
	// created_date: string;
	docData: any[] = [];
	tempDoc: any;
	conditionDatas: any;
	providerDatas: any;
	tagDatas: any;
	data = {
		docTitle: "",
		addedDate: "",
		condition: "",
		provider: "",
		tag: ""
	}
	flag1: boolean = false;
	flag2: boolean = false;
	flag3: boolean = false;

	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		private storage: Storage,
		private sqlite: SQLite,
		private toast: Toast,
		private ref: ChangeDetectorRef,
		private alertCtrl: AlertController
	) {
		this.conditionDatas = [{ input: '', focus: false }];
		this.providerDatas = [{ input: '', focus: false }];
		this.tagDatas = [{ input: '#', focus: false }];
		this.flag1 = false;
		this.flag2 = false;
		this.flag3 = false;
	}

	ionViewDidLoad() {
		this.medRecordInfo = this.navParams.get('med_record_info');
		if (this.medRecordInfo) {
			this.docTitle = decodeURIComponent(this.medRecordInfo.fileName);
			this.fileType = this.medRecordInfo.fileType;
		} else {
			this.docTitle = "Unknown";
			this.fileType = "document";
		}
		this.addedDate = new Date().toISOString();
		// this.created_date = new Date().toISOString();
	}

	public before = () => {
		this.navCtrl.setRoot('AddMedRecordsPage');
	}

	// when user enter any condition datas to the input-box
	// if user select and input any condition data, next input-box will appear from the bottom at that time.
	public conditionInputChanged(ev, index) {
		if (this.conditionDatas[index].input) {
			this.conditionDatas[index].focus = false;
		} else if (this.conditionDatas.length > 1) {
			this.conditionDatas.splice(index, 1);
		}
		this.ref.detectChanges();
	}

	public deleteCondition = (index) => {
		if (this.conditionDatas.length > 1) {
			this.conditionDatas.splice(index, 1);
		} else {
			this.conditionDatas = [{ input: '', focus: false }];
		}
		this.ref.detectChanges();
	}

	public addMoreCondition() {
		this.conditionDatas.push({ input: '', focus: false });
		this.ref.detectChanges();
	}

	checkFocus(item) {
		item.focus = true;
		this.ref.detectChanges();
	}

	public providerInputChanged(ev, index) {
		if (this.providerDatas[index].input) {
			this.providerDatas[index].focus = false;
		} else if (this.providerDatas.length > 1) {
			this.providerDatas.splice(index, 1);
		}
		this.ref.detectChanges();
	}

	public deleteProvider = (index) => {
		if (this.providerDatas.length > 1) {
			this.providerDatas.splice(index, 1);
		} else {
			this.providerDatas = [{ input: '', focus: false }];
		}
		this.ref.detectChanges();
	}

	public addMoreProvider() {
		this.providerDatas.push({ input: '', focus: false });
		this.ref.detectChanges();
	}

	public tagInputChanged(ev, index) {
		if (this.tagDatas[index].input) {
			this.tagDatas[index].focus = false;
		} else if (this.tagDatas.length > 1) {
			this.tagDatas.splice(index, 1);
		}
		this.ref.detectChanges();
	}

	public deleteTag = (index) => {
		if (this.tagDatas.length > 1) {
			this.tagDatas.splice(index, 1);
		} else {
			this.tagDatas = [{ input: '#', focus: false }];
		}
		this.ref.detectChanges();
	}

	public addMoreTag() {
		this.tagDatas.push({ input: '#', focus: false });
		this.ref.detectChanges();
	}

	// when user click "Done" button, all of information for document are stored to the local storage with the name "doc_data".
	public done = () => {
		let conditionArray = [];
		let providerArray = [];
		let tagArray = [];
		if (this.conditionDatas.length == 1 && !this.conditionDatas[0].input) {
			let data = { conditionName: "" };
			// adding "Unknown" to the condition array, if user didn't input any condition
			conditionArray.push(data);
		} else {
			for (let i = 0; i < this.conditionDatas.length; i++) {
				if (this.conditionDatas[i].input) {
					let data = { conditionName: this.conditionDatas[i].input };
					// adding all of condition to the condition array
					conditionArray.push(data);
				}
			}
		}
		if (this.providerDatas.length == 1 && !this.providerDatas[0].input) {
			let data = { providerName: "" };
			// adding "Unknown" to the provider array, if user didn't input any provider
			providerArray.push(data);
		} else {
			for (let i = 0; i < this.providerDatas.length; i++) {
				if (this.providerDatas[i].input) {
					let data = { providerName: this.providerDatas[i].input };
					// adding all of provider to the provider array
					providerArray.push(data);
				}
			}
		}
		if (this.tagDatas.length == 1 && this.tagDatas[0].input == '#') {
			let data = { tagName: "", isChecked: true };
			// adding "Unknown" to the tag array, if user didn't input any tag
			tagArray.push(data);
		} else {
			for (let i = 0; i < this.tagDatas.length; i++) {
				if (this.tagDatas[i].input != '#' && this.tagDatas[i].input) {
					let data = { tagName: this.tagDatas[i].input, isChecked: true };
					// adding all of tag to the tag array
					tagArray.push(data);
				}
			}
		}
		// 1 document variable initialize
		this.tempDoc = {
			docTitle: "",
			addedDate: "",
			condition: "",
			provider: "",
			tag: ""
		};
		this.tempDoc.docTitle = this.docTitle;
		this.tempDoc.addedDate = this.addedDate;
		this.tempDoc.condition = conditionArray;
		this.tempDoc.provider = providerArray;
		this.tempDoc.tag = tagArray;
		this.docData = [];
		this.storage.ready().then(() => {
			this.storage.get("doc_data").then((result) => {
				this.docData = result;
				if (this.docData == null) {
					this.docData = [];
				}
				//adding all of documents to the docData array
				this.docData.push(this.tempDoc);
				this.saveDocument();
			});
		});
	}

	// saving the document data to the Storage
	saveDocument() {
		this.storage.ready().then(() => {
			this.storage.set('doc_data', this.docData)
				.then(
					() => {
						console.log('Stored documents data!');
						this.navCtrl.setRoot('MyMedRecordsPage');
					},
					error => {
						console.error('Error storing documents data', error);
					}
				);
		});
	}

	setWidth(str) {
		let styles = {};
		if (str) {
			styles = {
				'width': str.length * 8 + 15 + 'px'
			};
		} else {
			styles = {
				'width': '86vw !important'
			};
		}
		return styles;
	}
}
