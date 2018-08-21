import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeleteDialogPage } from './delete-dialog';

@NgModule({
  declarations: [
    DeleteDialogPage,
  ],
  imports: [
    IonicPageModule.forChild(DeleteDialogPage),
  ],
})
export class DeleteDialogPageModule {}
