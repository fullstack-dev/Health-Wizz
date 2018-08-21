import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignBudgetPage } from './campaign-budget';

@NgModule({
  declarations: [
    CampaignBudgetPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignBudgetPage),
  ],
})
export class CampaignBudgetPageModule {}
