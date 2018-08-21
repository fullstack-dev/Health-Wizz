import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyHealthIndexPage } from './my-health-index';

@NgModule({
  declarations: [
    MyHealthIndexPage,
  ],
  imports: [
    IonicPageModule.forChild(MyHealthIndexPage),
  ],
})
export class MyHealthIndexPageModule {}
