import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyCirclesPage } from './my-circles';
import { PipesModule } from '../../../pipes/pipes.module';
import { WelcomeCirclePageModule } from '../welcome-circle/welcome-circle.module';

@NgModule({
  declarations: [
    MyCirclesPage
  ],
  imports: [
    WelcomeCirclePageModule,
    IonicPageModule.forChild(MyCirclesPage),
    PipesModule
  ],
})
export class MyCirclesPageModule { }
