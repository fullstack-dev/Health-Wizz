import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the AddTagPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-tag',
  templateUrl: 'add-tag.html',
})
export class AddTagPage {

	selectedItem: any;

  docTitle: string;
  addedDate: string;
  // created_date: string;

  // total storage database data
  docData: any[] = [];
  // temp modified data
  tempDoc: any;
  // recently viewed doc data
  tempDocData: any = [];

  tagDatas = [{input: '#'}];

  tagInput: string = '#';
  // updated tag
  originalTags: any[] = [];

	constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private storage: Storage
    ) {
    
	}

	ionViewDidLoad() {
  	this.selectedItem = this.navParams.get('selectedItem');

    if(this.selectedItem){
      for (let i = 0; i < this.selectedItem.length; i ++) {
        this.originalTags.push(this.selectedItem[i].tag);
      }
      console.log("original tags: ", this.originalTags);
    }

    this.docData = [];
    this.storage.ready().then(() => {
      this.storage.get("doc_data").then((result) => {
        this.docData = result;
        if(this.docData == null){
          this.docData = [];
        }

        if(this.selectedItem) {
          for (let i = 0; i < this.docData.length; i ++) {
            delete this.docData[i]['openFlag'];
            delete this.docData[i]['id'];
            for (let j = 0; j < this.selectedItem.length; j ++) {
              delete this.selectedItem[j]['openFlag'];
              delete this.selectedItem[j]['id'];
              if(JSON.stringify(this.docData[i]) == JSON.stringify(this.selectedItem[j])) {
                this.docData.splice(i, 1);
              }
            }
          }
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

        if(this.selectedItem) {
          for (let i = 0; i < this.tempDocData.length; i ++) {
            delete this.tempDocData[i]['openFlag'];
            delete this.tempDocData[i]['id'];
            for (let j = 0; j < this.selectedItem.length; j ++) {
              delete this.selectedItem[j]['openFlag'];
              delete this.selectedItem[j]['id'];
              if(JSON.stringify(this.tempDocData[i]) == JSON.stringify(this.selectedItem[j])) {
                this.tempDocData.splice(i, 1);
              }
            }
          }
        }
      });
    });        
	}

	public before = () => {
  	// this.navCtrl.setRoot('MedRecordsListPage');
    this.navCtrl.setRoot('MyMedRecordsPage');	
	}

	public done = () => {

    for (let i = 0; i < this.originalTags.length; i ++) {
      this.tempDoc = {
        docTitle: "",
        addedDate: "",
        condition: "",
        provider: "",
        tag: ""
      };

      this.tempDoc.docTitle = this.selectedItem[i].docTitle;
      this.tempDoc.addedDate = this.selectedItem[i].addedDate;
      this.tempDoc.condition = this.selectedItem[i].condition;
      this.tempDoc.provider = this.selectedItem[i].provider;
      this.tempDoc.tag = this.originalTags[i];

      this.docData.push(this.tempDoc);
      this.tempDocData.push(this.tempDoc);
    }

    this.saveDocument();
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
        error => console.error('Error storing documents data', error)
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

  public addNewTag = () => {
    if(this.tagInput){
      let newTag = {tagName: this.tagInput, isChecked: true};
      for (let i = 0; i < this.originalTags.length; i ++) {
        this.originalTags[i].push(newTag); 
      }

      this.tagInput = '#';
    }
  }

}