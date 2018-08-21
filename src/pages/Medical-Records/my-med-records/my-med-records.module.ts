import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyMedRecordsPage } from './my-med-records';

@NgModule({
  declarations: [
    MyMedRecordsPage,
  ],
  imports: [
    IonicPageModule.forChild(MyMedRecordsPage),
  ],
})
export class MyMedRecordsPageModule {}
