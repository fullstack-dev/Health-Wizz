import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignDuplicatePage } from './campaign-duplicate';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    CampaignDuplicatePage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignDuplicatePage),
    PipesModule
  ],
})
export class CampaignDuplicatePageModule { }
