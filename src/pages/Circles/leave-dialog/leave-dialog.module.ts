import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeaveDialogPage } from './leave-dialog';

@NgModule({
  declarations: [
    LeaveDialogPage,
  ],
  imports: [
    IonicPageModule.forChild(LeaveDialogPage),
  ],
})
export class LeaveDialogPageModule {}
