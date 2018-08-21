import { NgModule } from '@angular/core';
import { Calendar } from '@ionic-native/calendar';
import { IonicPageModule } from 'ionic-angular';
import { DetailBPage } from './detail-b';

@NgModule({
  declarations: [
    DetailBPage,
  ],
  imports: [
    IonicPageModule.forChild(DetailBPage),
  ],
  providers: [
  	Calendar
  ],
})
export class DetailBPageModule {}
