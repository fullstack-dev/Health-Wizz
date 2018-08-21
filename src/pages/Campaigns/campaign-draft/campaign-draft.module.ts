import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignDraftPage } from './campaign-draft';

@NgModule({
  declarations: [
    CampaignDraftPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignDraftPage),
  ],
})
export class CampaignDraftPageModule {}
