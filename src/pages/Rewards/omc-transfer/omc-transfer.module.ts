import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OmcTransferPage } from './omc-transfer';

@NgModule({
  declarations: [
    OmcTransferPage,
  ],
  imports: [
    IonicPageModule.forChild(OmcTransferPage),
  ],
})
export class OmcTransferPageModule {}
