import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WelcomeCirclePage } from './welcome-circle';

@NgModule({
  declarations: [
    WelcomeCirclePage,
  ],
  imports: [
    IonicPageModule.forChild(WelcomeCirclePage),
  ],
  exports: [
    WelcomeCirclePage
  ]
})
export class WelcomeCirclePageModule { }
