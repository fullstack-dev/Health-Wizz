import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignDeletePage } from './campaign-delete';

@NgModule({
  declarations: [
    CampaignDeletePage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignDeletePage),
  ],
})
export class CampaignDeletePageModule {}
