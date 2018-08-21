import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the RenameTagPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rename-tag',
  templateUrl: 'rename-tag.html',
})
export class RenameTagPage {

	tagInput: any;
	selectedTag: any;
  selectedItem: any;

  // total storage database data
  docData: any[] = [];
  // temp modified data
  tempDoc: any;
  // recently viewed doc data
  tempDocData: any = [];

  // updated tag
  updatedTags: any[] = [];

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
    public storage: Storage,
    private alertCtrl: AlertController) {
    this.updatedTags = [];
	}

	ionViewDidLoad() {
  	this.selectedTag = this.navParams.get('selectedTag');
    this.selectedItem = this.navParams.get('selectedItem');
    if(this.selectedTag){
      this.tagInput = this.selectedTag.tagName;
    }

    this.docData = [];
    this.storage.ready().then(() => {
      this.storage.get("doc_data").then((result) => {
        this.docData = result;
        if(this.docData == null){
          this.docData = [];
        } 
      });
    });

    this.tempDocData = [];
    this.storage.ready().then(() => {
      this.storage.get("recent_doc_data").then((result) => {
        this.tempDocData = result;
        if(this.tempDocData == null) {
          this.tempDocData = [];
        }
      });
    });
	}

	public tagInputChanged($event) {
	}

	public before() {
		this.navCtrl.setRoot('MyMedRecordsPage');
	}

	public done() {

    if (this.selectedItem.length == null) {
      delete this.selectedItem['id'];
      delete this.selectedItem['openFlag'];

      for (let i = 0; i < this.docData.length; i ++) {
        delete this.docData[i]['id'];
        delete this.docData[i]['openFlag'];
        if(JSON.stringify(this.docData[i]) == JSON.stringify(this.selectedItem)) {
          this.docData.splice(i, 1);
        }
      }

      for (let i = 0; i < this.tempDocData.length; i ++) {
        delete this.tempDocData[i]['id'];
        delete this.tempDocData[i]['openFlag'];
        if(JSON.stringify(this.tempDocData[i]) == JSON.stringify(this.selectedItem)) {
          this.tempDocData.splice(i, 1);
        }
      }

      for (let j = 0; j < this.selectedItem.tag.length; j ++) {
        if(this.selectedItem.tag[j]!= this.selectedTag) {
          this.updatedTags.push(this.selectedItem.tag[j]);
        }
      }

      if(this.tagInput) {
        this.updatedTags.push({tagName: this.tagInput, isChecked: true});
      } else {
        this.updatedTags.push({tagName: "", isChecked: true});
      }

      this.tempDoc = {
        docTitle: "",
        addedDate: "",
        condition: "",
        provider: "",
        tag: ""
      };

      this.tempDoc.docTitle = this.selectedItem.docTitle;
      this.tempDoc.addedDate = this.selectedItem.addedDate;
      this.tempDoc.condition = this.selectedItem.condition;
      this.tempDoc.provider = this.selectedItem.provider;
      this.tempDoc.tag = this.updatedTags;

      this.docData.push(this.tempDoc);
      this.tempDocData.push(this.tempDoc);

      this.saveDocument();
    } else {
      for (let k = 0; k < this.selectedItem.length; k ++) {
        this.updatedTags = [];

        for (let i = 0; i < this.docData.length; i ++) {
          delete this.docData[i]['id'];
          delete this.docData[i]['openFlag'];
          if(JSON.stringify(this.docData[i]) == JSON.stringify(this.selectedItem[k])) {
            this.docData.splice(i, 1);
          }
        }

        for (let i = 0; i < this.tempDocData.length; i ++) {
          delete this.tempDocData[i]['id'];
          delete this.tempDocData[i]['openFlag'];
          if(JSON.stringify(this.tempDocData[i]) == JSON.stringify(this.selectedItem[k])) {
            this.tempDocData.splice(i, 1);
          }
        }

        for (let j = 0; j < this.selectedItem[k].condition.length; j ++) {
          if(JSON.stringify(this.selectedItem[k].condition[j])!= JSON.stringify(this.selectedTag)) {
            this.updatedTags.push(this.selectedItem[k].condition[j]);
          }
        }

        if(this.tagInput) {
          this.updatedTags.push({tagName: this.tagInput, isChecked: true});
        } else {
          this.updatedTags.push({tagName: "", isChecked: true});
        }

        this.tempDoc = {
          docTitle: "",
          addedDate: "",
          condition: "",
          provider: "",
          tag: ""
        };

        this.tempDoc.docTitle = this.selectedItem[k].docTitle;
        this.tempDoc.addedDate = this.selectedItem[k].addedDate;
        this.tempDoc.condition = this.selectedItem[k].condition;
        this.tempDoc.provider = this.selectedItem[k].provider;
        this.tempDoc.tag = this.updatedTags;

        this.docData.push(this.tempDoc);
        this.tempDocData.push(this.tempDoc);

        this.saveDocument();
      }
    }
    
	}

  // updated the document data to the Storage
  public saveDocument() {
    this.storage.ready().then(() => {
      this.storage.set('doc_data', this.docData)
      .then(
        () => {
          // this.navCtrl.setRoot('MyMedRecordsPage');
          this.SaveRecentDoc();
        },
        error => {
        }
        );
    });
  }

  public SaveRecentDoc() {
    this.storage.ready().then(() => {
      this.storage.remove('recent_doc_data');
      this.storage.set('recent_doc_data', this.tempDocData)
      .then(
        () => {
          this.navCtrl.setRoot('MyMedRecordsPage');
        },
        error => {
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
