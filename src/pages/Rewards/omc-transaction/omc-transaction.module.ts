import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OmcTransactionPage } from './omc-transaction';

@NgModule({
  declarations: [
    OmcTransactionPage,
  ],
  imports: [
    IonicPageModule.forChild(OmcTransactionPage),
  ],
})
export class OmcTransactionPageModule {}
