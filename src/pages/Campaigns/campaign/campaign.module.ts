import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignPage } from './campaign';
import { CampaignNewPageModule } from '../campaign-new/campaign-new.module';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    CampaignPage
  ],
  imports: [
    CampaignNewPageModule,
    IonicPageModule.forChild(CampaignPage),
    PipesModule
  ],
})
export class CampaignPageModule { }
