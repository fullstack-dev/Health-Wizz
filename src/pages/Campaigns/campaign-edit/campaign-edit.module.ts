import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignEditPage } from './campaign-edit';

@NgModule({
  declarations: [
    CampaignEditPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignEditPage),
  ],
})
export class CampaignEditPageModule {}
