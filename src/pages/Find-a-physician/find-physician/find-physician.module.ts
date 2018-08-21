import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FindPhysicianPage } from './find-physician';

@NgModule({
  declarations: [
    FindPhysicianPage,
  ],
  imports: [
    IonicPageModule.forChild(FindPhysicianPage),
  ],
})
export class FindPhysicianPageModule {}
