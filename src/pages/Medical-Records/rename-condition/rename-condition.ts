import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the RenameConditionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rename-condition',
  templateUrl: 'rename-condition.html',
})
export class RenameConditionPage {

	conditionInput: any;
	selectedCondition: any;
  selectedItem: any;

  // total storage database data
  docData: any[] = [];
  // temp modified data
  tempDoc: any;
  // recently viewed doc data
  tempDocData: any = [];

  // updated condition
  updatedConditions: any[] = [];

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
    public storage: Storage) {
  	this.updatedConditions = [];
  }

  ionViewDidLoad() {
    this.selectedCondition = this.navParams.get('selectedCondition');
    this.selectedItem = this.navParams.get('selectedItem');

    if(this.selectedCondition){
      this.conditionInput = this.selectedCondition.conditionName;
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

  public conditionInputChanged($event) {
	}

	public before() {
		this.navCtrl.setRoot('MyMedRecordsPage');
	}

	public done() {

    // when a user select each item and rename it,...
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

      for (let j = 0; j < this.selectedItem.condition.length; j ++) {
        if(this.selectedItem.condition[j]!= this.selectedCondition) {
          this.updatedConditions.push(this.selectedItem.condition[j]);
        }
      }

      if(this.conditionInput) {
        this.updatedConditions.push({conditionName: this.conditionInput});
      } else {
        this.updatedConditions.push({conditionName: ""});
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
      this.tempDoc.condition = this.updatedConditions;
      this.tempDoc.provider = this.selectedItem.provider;
      this.tempDoc.tag = this.selectedItem.tag;

      this.docData.push(this.tempDoc);
      this.tempDocData.push(this.tempDoc);

      this.saveDocument();
    }// when a user select title and rename it,... 
    else {
      for (let k = 0; k < this.selectedItem.length; k ++) {
        this.updatedConditions = [];

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
          if(JSON.stringify(this.selectedItem[k].condition[j])!= JSON.stringify(this.selectedCondition)) {
            this.updatedConditions.push(this.selectedItem[k].condition[j]);
          }
        }

        if(this.conditionInput) {
          this.updatedConditions.push({conditionName: this.conditionInput});
        } else {
          this.updatedConditions.push({conditionName: ""});
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
        this.tempDoc.condition = this.updatedConditions;
        this.tempDoc.provider = this.selectedItem[k].provider;
        this.tempDoc.tag = this.selectedItem[k].tag;

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
}
