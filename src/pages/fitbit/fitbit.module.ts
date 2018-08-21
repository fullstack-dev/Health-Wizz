import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FitbitPage } from './fitbit';

@NgModule({
  declarations: [
    FitbitPage,
  ],
  imports: [
    IonicPageModule.forChild(FitbitPage),
  ],
})
export class FitbitPageModule {}
