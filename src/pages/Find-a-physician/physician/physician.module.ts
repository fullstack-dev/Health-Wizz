import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PhysicianPage } from './physician';

@NgModule({
  declarations: [
    PhysicianPage,
  ],
  imports: [
    IonicPageModule.forChild(PhysicianPage),
  ],
})
export class PhysicianPageModule {}
