import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SponsorFindPage } from './sponsor-find';

@NgModule({
  declarations: [
    SponsorFindPage,
  ],
  imports: [
    IonicPageModule.forChild(SponsorFindPage),
  ],
  exports: [
    SponsorFindPage
  ]
})
export class SponsorFindPageModule {}
