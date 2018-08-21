import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignNotificationDetailPage } from './campaign-notification-detail';
import { SwiperModule } from 'angular2-useful-swiper';

@NgModule({
  declarations: [
    CampaignNotificationDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignNotificationDetailPage),
    SwiperModule
  ],
})
export class CampaignNotificationDetailPageModule {}
