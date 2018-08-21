import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CirclePage } from './circle';
import { SwiperModule } from 'angular2-useful-swiper';

@NgModule({
  declarations: [
    CirclePage,
  ],
  imports: [
    IonicPageModule.forChild(CirclePage),
    SwiperModule
  ],
})
export class CirclePageModule {}
