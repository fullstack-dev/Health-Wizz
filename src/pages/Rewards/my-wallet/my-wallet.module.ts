import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyWalletPage } from './my-wallet';

@NgModule({
  declarations: [
    MyWalletPage,
  ],
  imports: [
    IonicPageModule.forChild(MyWalletPage),
  ],
})
export class MyWalletPageModule {}
