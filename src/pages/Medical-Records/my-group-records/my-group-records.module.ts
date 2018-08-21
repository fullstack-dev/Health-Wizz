import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyGroupRecordsPage } from './my-group-records';

@NgModule({
  declarations: [
    MyGroupRecordsPage,
  ],
  imports: [
    IonicPageModule.forChild(MyGroupRecordsPage),
  ],
})
export class MyGroupRecordsPageModule {}
