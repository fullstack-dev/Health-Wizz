import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignTemplatePage } from './campaign-template';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    CampaignTemplatePage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignTemplatePage),
    PipesModule
  ],
})
export class CampaignTemplatePageModule { }
