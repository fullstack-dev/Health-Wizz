import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RenameTagPage } from './rename-tag';

@NgModule({
  declarations: [
    RenameTagPage,
  ],
  imports: [
    IonicPageModule.forChild(RenameTagPage),
  ],
})
export class RenameTagPageModule {}
