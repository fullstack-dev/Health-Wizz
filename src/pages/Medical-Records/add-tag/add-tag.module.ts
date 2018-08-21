import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddTagPage } from './add-tag';

@NgModule({
  declarations: [
    AddTagPage,
  ],
  imports: [
    IonicPageModule.forChild(AddTagPage),
  ],
})
export class AddTagPageModule {}
