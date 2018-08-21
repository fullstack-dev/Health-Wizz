import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CernerPatientDataPage } from './cerner-patient-data';

@NgModule({
  declarations: [
    CernerPatientDataPage,
  ],
  imports: [
    IonicPageModule.forChild(CernerPatientDataPage),
  ],
})
export class CernerPatientDataPageModule {}
