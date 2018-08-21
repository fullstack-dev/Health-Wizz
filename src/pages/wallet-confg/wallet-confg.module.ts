import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WalletConfgPage } from './wallet-confg';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    WalletConfgPage,
  ],
  imports: [
    IonicPageModule.forChild(WalletConfgPage),
    PipesModule
  ],
})
export class WalletConfgPageModule { }
