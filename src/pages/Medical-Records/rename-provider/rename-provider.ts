import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the RenameProviderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rename-provider',
  templateUrl: 'rename-provider.html',
})
export class RenameProviderPage {

	providerInput: any;
	selectedProvider: any;
  selectedItem: any;

  // total storage database data
  docData: any[] = [];
  // temp modified data
  tempDoc: any;
  // recently viewed doc data
  tempDocData: any = [];

  // updated provider
  updatedProviders: any[] = [];

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
    public storage: Storage) {
  	this.updatedProviders = [];
  }

  ionViewDidLoad() {
    this.selectedProvider = this.navParams.get('selectedProvider');
    this.selectedItem = this.navParams.get('selectedItem');
    if(this.selectedProvider){
      this.providerInput = this.selectedProvider.providerName;
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

  public providerInputChanged($event) {
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

      for (let j = 0; j < this.selectedItem.provider.length; j ++) {
        if(this.selectedItem.provider[j]!= this.selectedProvider) {
          this.updatedProviders.push(this.selectedItem.provider[j]);
        }
      }

      if(this.providerInput) {
        this.updatedProviders.push({providerName: this.providerInput});
      } else {
        this.updatedProviders.push({providerName: ""});
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
      this.tempDoc.provider = this.updatedProviders;
      this.tempDoc.tag = this.selectedItem.tag;

      this.docData.push(this.tempDoc);
      this.tempDocData.push(this.tempDoc);

      this.saveDocument();
    } else {
      for (let k = 0; k < this.selectedItem.length; k ++) {
        this.updatedProviders = [];

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

        for (let j = 0; j < this.selectedItem[k].provider.length; j ++) {
          if(JSON.stringify(this.selectedItem[k].provider[j])!= JSON.stringify(this.selectedProvider)) {
            this.updatedProviders.push(this.selectedItem[k].provider[j]);
          }
        }

        if(this.providerInput) {
          this.updatedProviders.push({providerName: this.providerInput});
        } else {
          this.updatedProviders.push({providerName: ""});
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
        this.tempDoc.provider = this.updatedProviders;
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
          console.log('Stored documents data!', this.docData);
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
}
