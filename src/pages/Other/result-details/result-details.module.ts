import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultDetailsPage } from './result-details';

@NgModule({
  declarations: [
    ResultDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ResultDetailsPage),
  ],
})
export class ResultDetailsPageModule {}
