import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SomeTipsPage } from './some-tips';

@NgModule({
  declarations: [
    SomeTipsPage,
  ],
  imports: [
    IonicPageModule.forChild(SomeTipsPage),
  ],
})
export class SomeTipsPageModule {}
