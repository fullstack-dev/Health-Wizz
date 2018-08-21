import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CernerPatientCcdDetailPage } from './cerner-patient-ccd-detail';

@NgModule({
  declarations: [
    CernerPatientCcdDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(CernerPatientCcdDetailPage),
  ],
})
export class CernerPatientCcdDetailPageModule {}
