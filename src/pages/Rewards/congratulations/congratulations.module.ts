import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CongratulationsPage } from './congratulations';

@NgModule({
  declarations: [
    CongratulationsPage,
  ],
  imports: [
    IonicPageModule.forChild(CongratulationsPage),
  ],
})
export class CongratulationsPageModule {}
