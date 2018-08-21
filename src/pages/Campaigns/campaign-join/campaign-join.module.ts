import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignJoinPage } from './campaign-join';

@NgModule({
  declarations: [
    CampaignJoinPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignJoinPage),
  ],
})
export class CampaignJoinPageModule {}
