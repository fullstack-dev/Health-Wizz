import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CircleNotificationDetailPage } from './circle-notification-detail';

@NgModule({
  declarations: [
    CircleNotificationDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(CircleNotificationDetailPage),
  ],
})
export class CircleNotificationDetailPageModule {}
