import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CancerDetailPage } from './cancer-detail';

@NgModule({
  declarations: [
    CancerDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(CancerDetailPage),
  ],
})
export class CancerDetailPageModule {}
