import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EpicPatientDataPage } from './epic-patient-data';

@NgModule({
  declarations: [
    EpicPatientDataPage,
  ],
  imports: [
    IonicPageModule.forChild(EpicPatientDataPage),
  ],
})
export class EpicPatientDataPageModule {}
