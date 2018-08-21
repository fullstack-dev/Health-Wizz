import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChfCampaignDetailPage } from './chf-campaign-detail';
import { SwiperModule } from 'angular2-useful-swiper';
@NgModule({
  declarations: [
    ChfCampaignDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(ChfCampaignDetailPage),
    SwiperModule
  ],
})
export class ChfCampaignDetailPageModule { }
