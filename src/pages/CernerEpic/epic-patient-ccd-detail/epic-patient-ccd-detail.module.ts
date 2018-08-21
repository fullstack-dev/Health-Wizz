import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EpicPatientCcdDetailPage } from './epic-patient-ccd-detail';

@NgModule({
  declarations: [
    EpicPatientCcdDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(EpicPatientCcdDetailPage),
  ],
})
export class EpicPatientCcdDetailPageModule {}
