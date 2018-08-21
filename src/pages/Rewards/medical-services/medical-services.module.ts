import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MedicalServicesPage } from './medical-services';

@NgModule({
  declarations: [
    MedicalServicesPage,
  ],
  imports: [
    IonicPageModule.forChild(MedicalServicesPage),
  ],
})
export class MedicalServicesPageModule {}
