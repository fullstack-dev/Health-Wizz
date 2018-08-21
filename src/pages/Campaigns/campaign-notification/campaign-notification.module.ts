import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignNotificationPage } from './campaign-notification';

@NgModule({
  declarations: [
    CampaignNotificationPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignNotificationPage),
  ],
})
export class CampaignNotificationPageModule {}
