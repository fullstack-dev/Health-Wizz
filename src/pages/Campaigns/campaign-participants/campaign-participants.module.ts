import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignParticipantsPage } from './campaign-participants';

@NgModule({
  declarations: [
    CampaignParticipantsPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignParticipantsPage),
  ],
})
export class CampaignParticipantsPageModule {}
