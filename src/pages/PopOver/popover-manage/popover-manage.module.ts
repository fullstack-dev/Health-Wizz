import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopoverManagePage } from './popover-manage';

@NgModule({
  declarations: [
    PopoverManagePage,
  ],
  imports: [
    IonicPageModule.forChild(PopoverManagePage),
  ],
})
export class PopoverManagePageModule {}
