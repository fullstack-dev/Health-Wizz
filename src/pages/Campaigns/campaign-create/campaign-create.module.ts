import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignCreatePage } from './campaign-create';

@NgModule({
  declarations: [
    CampaignCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignCreatePage),
  ],
})
export class CampaignCreatePageModule { }
