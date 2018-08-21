import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChfCampaignPage } from './chf-campaign';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    ChfCampaignPage
  ],
  imports: [
    IonicPageModule.forChild(ChfCampaignPage),
    PipesModule
  ],
})
export class ChfCampaignPageModule { }
