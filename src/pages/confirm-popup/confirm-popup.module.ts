import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmPopupPage } from './confirm-popup';

@NgModule({
  declarations: [
    ConfirmPopupPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfirmPopupPage),
  ],
})
export class ConfirmPopupPageModule {}
