import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

@Injectable()
export class Localstorage {
  constructor(
    public http: Http,
    private storage: Storage) {
    console.log('Hello Localstorage Provider');
  }

  //store the email address
  setValue(val) {
    this.storage.set('val', val);
  }

  //get the stored email
  getValue() {
    this.storage.get('val').then(val => {
      console.log('Local Value: ' + val);
    });
  }

  //delete the email address
  removeValue() {
    this.storage.remove('val').then(() => {
      console.log('Local Value is removed');
    });
  }

  //clear the whole local storage
  clearStorage() {
    this.storage.clear().then(() => {
      console.log('all keys are cleared');
    });
  }

}