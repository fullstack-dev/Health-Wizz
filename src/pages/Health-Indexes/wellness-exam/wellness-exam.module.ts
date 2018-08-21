import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WellnessExamPage } from './wellness-exam';

@NgModule({
  declarations: [
    WellnessExamPage,
  ],
  imports: [
    IonicPageModule.forChild(WellnessExamPage),
  ],
})
export class WellnessExamPageModule {}
