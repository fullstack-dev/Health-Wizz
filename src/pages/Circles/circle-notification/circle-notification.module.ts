import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CircleNotificationPage } from './circle-notification';

@NgModule({
  declarations: [
    CircleNotificationPage,
  ],
  imports: [
    IonicPageModule.forChild(CircleNotificationPage),
  ],
})
export class CircleNotificationPageModule {}
