import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignStartPage } from './campaign-start';

@NgModule({
  declarations: [
    CampaignStartPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignStartPage),
  ],
})
export class CampaignStartPageModule {}
