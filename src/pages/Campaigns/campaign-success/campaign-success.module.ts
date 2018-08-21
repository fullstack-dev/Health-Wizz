import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignSuccessPage } from './campaign-success';

@NgModule({
  declarations: [
    CampaignSuccessPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignSuccessPage),
  ],
})
export class CampaignSuccessPageModule {}
