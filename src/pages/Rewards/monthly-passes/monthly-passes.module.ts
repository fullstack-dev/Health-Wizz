import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MonthlyPassesPage } from './monthly-passes';

@NgModule({
  declarations: [
    MonthlyPassesPage,
  ],
  imports: [
    IonicPageModule.forChild(MonthlyPassesPage),
  ],
})
export class MonthlyPassesPageModule {}
