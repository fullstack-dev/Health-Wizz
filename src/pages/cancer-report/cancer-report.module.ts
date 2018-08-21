import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CancerReportPage } from './cancer-report';

@NgModule({
  declarations: [
    CancerReportPage,
  ],
  imports: [
    IonicPageModule.forChild(CancerReportPage),
  ],
})
export class CancerReportPageModule {}
