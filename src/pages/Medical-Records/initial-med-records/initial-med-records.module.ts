import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InitialMedRecordsPage } from './initial-med-records';

@NgModule({
  declarations: [
    InitialMedRecordsPage,
  ],
  imports: [
    IonicPageModule.forChild(InitialMedRecordsPage),
  ],
})
export class InitialMedRecordsPageModule {}
