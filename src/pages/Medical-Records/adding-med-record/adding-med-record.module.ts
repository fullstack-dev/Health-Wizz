import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddingMedRecordPage } from './adding-med-record';

@NgModule({
  declarations: [
    AddingMedRecordPage,
  ],
  imports: [
    IonicPageModule.forChild(AddingMedRecordPage),
  ],
})
export class AddingMedRecordPageModule {}
