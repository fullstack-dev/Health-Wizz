import { NgModule } from '@angular/core';
import { Calendar } from '@ionic-native/calendar';
import { IonicPageModule } from 'ionic-angular';
import { DetailPage } from './detail';

@NgModule({
  declarations: [
    DetailPage,
  ],
  imports: [
    IonicPageModule.forChild(DetailPage),
  ],
  providers: [
  	Calendar
  ],
})
export class DetailPageModule {}
