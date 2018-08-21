import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CernerPatientCcdPage } from './cerner-patient-ccd';

@NgModule({
  declarations: [
    CernerPatientCcdPage,
  ],
  imports: [
    IonicPageModule.forChild(CernerPatientCcdPage),
  ],
})
export class CernerPatientCcdPageModule {}
