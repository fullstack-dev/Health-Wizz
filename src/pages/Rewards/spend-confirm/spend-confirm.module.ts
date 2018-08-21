import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SpendConfirmPage } from './spend-confirm';

@NgModule({
  declarations: [
    SpendConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(SpendConfirmPage),
  ],
})
export class SpendConfirmPageModule {}
