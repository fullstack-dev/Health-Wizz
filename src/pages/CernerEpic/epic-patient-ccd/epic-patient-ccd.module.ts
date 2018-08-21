import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EpicPatientCcdPage } from './epic-patient-ccd';

@NgModule({
  declarations: [
    EpicPatientCcdPage,
  ],
  imports: [
    IonicPageModule.forChild(EpicPatientCcdPage),
  ],
})
export class EpicPatientCcdPageModule {}
