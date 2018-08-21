import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvitePeoplePage } from './invite-people';
import { SwiperModule } from 'angular2-useful-swiper';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  declarations: [
    InvitePeoplePage,
  ],
  imports: [
    IonicPageModule.forChild(InvitePeoplePage),
    PipesModule,
    SwiperModule
  ],
})
export class InvitePeoplePageModule { }
