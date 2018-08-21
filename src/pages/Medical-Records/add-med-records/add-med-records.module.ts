import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddMedRecordsPage } from './add-med-records';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@NgModule({
  	declarations: [
    	AddMedRecordsPage,
  	],
  	imports: [
    	IonicPageModule.forChild(AddMedRecordsPage),
  	],
  	providers: [
    	InAppBrowser,
	]
})
export class AddMedRecordsPageModule {}
